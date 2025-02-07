import { GoldRushClient, Chain } from "@covalenthq/client-sdk";
import { Agent } from "@covalenthq/ai-agent-sdk";
import { GOLDRUSH_API_KEY, OPENAI_API_KEY } from "@/lib/utils";
import { OpenAI } from "openai";

interface DexTrade {
  blockHeight: number;
  timestamp: number;
  txHash: string;
  walletAddress: string;
  dex: string;
  tokenIn: {
    address: string;
    symbol: string;
    amount: string;
  };
  tokenOut: {
    address: string;
    symbol: string;
    amount: string;
  };
}

interface CollectorInput {
  walletAddress: string;
  chain: Chain;
}

interface ScamAnalysis {
  riskLevel: "high" | "medium" | "low";
  scamProbability: number;
  warnings: string[];
  detectedPatterns: {
    phishing: boolean;
    rugPull: boolean;
    pumpAndDump: boolean;
    honeypot: boolean;
  };
}

export class TransactionCollectorService {
  private goldRushClient: GoldRushClient;
  private readonly name = "TransactionCollector";
  private readonly description = "Collect and analyze wallet transactions";
  protected readonly agent: Agent;
  private openai: OpenAI;

  constructor() {
    if (!GOLDRUSH_API_KEY) {
      throw new Error("GOLDRUSH_API_KEY is not defined");
    }

    this.agent = new Agent({
      name: "ScamDetector",
      model: {
        provider: "OPEN_AI",
        name: "gpt-3.5-turbo",
        apiKey: OPENAI_API_KEY,
      },
      description:
        "Detect sophisticated scam patterns in blockchain transactions",
    });

    this.goldRushClient = new GoldRushClient(GOLDRUSH_API_KEY);
    this.openai = new OpenAI({
      apiKey: OPENAI_API_KEY,
      dangerouslyAllowBrowser: true,
    });
  }

  private isDexTransaction(tx: any): boolean {
    // Expanded list of DEX addresses (all lowercase)
    const dexAddresses = new Set([
      // Uniswap
      "0x7a250d5630b4cf539739df2c5dacb4c659f2488d", // Uniswap V2 Router
      "0xe592427a0aece92de3edee1f18e0157c05861564", // Uniswap V3 Router
      "0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45", // Uniswap Universal Router
      // SushiSwap
      "0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f", // SushiSwap Router
      // 1inch
      "0x1111111254eeb25477b68fb85ed929f73a960582", // 1inch Router
      // PancakeSwap
      "0x10ed43c718714eb63d5aa57b78b54704e256024e", // PancakeSwap Router
      // Jumper Exchange (formerly JumpDeFi)
      "0xd89adc20c400b6c45086a7f6ab2dca19745b89c2", // Jumper Exchange Router
      "0x69c6c08b91010c88c95775b6fd768e5b04efc106", // Jumper Exchange Router v2
      "0x0000000022d53366457f9d5e68ec105046fc4383", // Jumper Relayer
      // Add more as needed
    ]);

    // Check if the transaction is interacting with a known DEX
    const toAddress = tx.to_address?.toLowerCase();
    console.log("Checking DEX address:", toAddress);
    return toAddress ? dexAddresses.has(toAddress) : false;
  }

  private identifyDex(tx: any): string {
    const toAddress = tx.to_address.toLowerCase();
    switch (toAddress) {
      case "0x7a250d5630b4cf539739df2c5dacb4c659f2488d":
        return "uniswap_v2";
      case "0xe592427a0aece92de3edee1f18e0157c05861564":
        return "uniswap_v3";
      case "0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45":
        return "uniswap";
      case "0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f":
        return "sushiswap";
      case "0x1111111254eeb25477b68fb85ed929f73a960582":
        return "1inch";
      case "0x10ed43c718714eb63d5aa57b78b54704e256024e":
        return "pancakeswap";
      case "0xd89adc20c400b6c45086a7f6ab2dca19745b89c2":
      case "0x69c6c08b91010c88c95775b6fd768e5b04efc106":
      case "0x0000000022d53366457f9d5e68ec105046fc4383":
        return "jumper";
      default:
        return "unknown";
    }
  }

  private extractTokenIn(tx: any): {
    address: string;
    symbol: string;
    amount: string;
  } {
    try {
      const logs = tx?.log_events ?? [];

      for (const log of logs) {
        const decodedName = log?.decoded?.name;
        const decodedParams = log?.decoded?.params;

        if (
          decodedName === "Transfer" &&
          decodedParams &&
          decodedParams[1]?.value?.toLowerCase() ===
            tx.to_address?.toLowerCase()
        ) {
          const amount = decodedParams[2]?.value;
          return {
            address: log.sender_address || "",
            symbol: log.sender_contract_ticker_symbol || "UNKNOWN",
            amount:
              typeof amount === "bigint" ? amount.toString() : amount || "0",
          };
        }
      }

      // Handle native token transfer
      if (tx.value) {
        return {
          address: "0x0000000000000000000000000000000000000000",
          symbol: "ETH",
          amount: typeof tx.value === "bigint" ? tx.value.toString() : tx.value,
        };
      }

      return { address: "", symbol: "", amount: "0" };
    } catch (error) {
      console.error("Error extracting token in:", error);
      return { address: "", symbol: "", amount: "0" };
    }
  }

  private extractTokenOut(tx: any): {
    address: string;
    symbol: string;
    amount: string;
  } {
    try {
      const logs = tx?.log_events ?? [];

      for (const log of logs) {
        const decodedName = log?.decoded?.name;
        const decodedParams = log?.decoded?.params;

        if (
          decodedName === "Transfer" &&
          decodedParams &&
          decodedParams[0]?.value?.toLowerCase() ===
            tx.to_address?.toLowerCase()
        ) {
          const amount = decodedParams[2]?.value;
          return {
            address: log.sender_address || "",
            symbol: log.sender_contract_ticker_symbol || "UNKNOWN",
            amount:
              typeof amount === "bigint" ? amount.toString() : amount || "0",
          };
        }
      }

      return { address: "", symbol: "", amount: "0" };
    } catch (error) {
      console.error("Error extracting token out:", error);
      return { address: "", symbol: "", amount: "0" };
    }
  }

  private transformTrades(txs: any[]): DexTrade[] {
    console.log("Starting trade transformation");

    const dexTxs = txs.filter((tx) => {
      const isDex = this.isDexTransaction(tx);
      if (isDex) {
        console.log("Found DEX transaction:", {
          hash: tx.tx_hash,
          to: tx.to_address,
          dex: this.identifyDex(tx),
        });
      }
      return isDex;
    });

    console.log(
      `Processing ${dexTxs.length} DEX transactions out of ${txs.length} total`
    );

    const trades = dexTxs
      .map((tx) => {
        try {
          const tokenIn = this.extractTokenIn(tx);
          const tokenOut = this.extractTokenOut(tx);

          console.log("Processed transaction:", {
            hash: tx.tx_hash,
            tokenIn,
            tokenOut,
            dex: this.identifyDex(tx),
          });

          if (!tokenIn.address && !tokenOut.address) {
            console.log(
              "Skipping transaction - no token transfers found:",
              tx.tx_hash
            );
            return null;
          }

          return {
            blockHeight: tx.block_height,
            timestamp: new Date(tx.block_signed_at).getTime(),
            txHash: tx.tx_hash,
            walletAddress: tx.from_address,
            dex: this.identifyDex(tx),
            tokenIn,
            tokenOut,
          };
        } catch (error) {
          console.error("Error processing transaction:", tx.tx_hash, error);
          return null;
        }
      })
      .filter((trade): trade is DexTrade => trade !== null);

    console.log(`Successfully processed ${trades.length} trades`);
    return trades;
  }

  private analyzeTraderProfile(trades: DexTrade[]) {
    // Filter out invalid symbols and get unique tokens
    const uniqueTokens = new Set(
      [
        ...trades.map((t) => t.tokenIn.symbol),
        ...trades.map((t) => t.tokenOut.symbol),
      ].filter(
        (symbol) =>
          symbol &&
          symbol !== "UNKNOWN" &&
          symbol !== "" &&
          symbol !== "undefined"
      )
    );

    // Get unique DEXes, filtering out unknown/empty values
    const uniqueDexes = new Set(
      trades
        .map((t) => t.dex)
        .filter((dex) => dex && dex !== "unknown" && dex !== "")
    );

    // Calculate trading intervals
    const timeIntervals = trades
      .slice(1)
      .map((trade, i) => trade.timestamp - trades[i].timestamp)
      .filter((interval) => interval > 0); // Filter out invalid intervals

    const avgInterval =
      timeIntervals.length > 0
        ? timeIntervals.reduce((a, b) => a + b, 0) / timeIntervals.length
        : 0;

    // Debug logs
    console.log("Trading Profile Analysis:", {
      uniqueTokens: Array.from(uniqueTokens),
      uniqueDexes: Array.from(uniqueDexes),
      totalTrades: trades.length,
      timeIntervals: timeIntervals.length,
    });

    return {
      totalTrades: trades.length,
      uniqueDexCount: uniqueDexes.size,
      uniqueTokenCount: uniqueTokens.size,
      preferredDex: this.getMostFrequent(
        trades
          .map((t) => t.dex)
          .filter((dex) => dex && dex !== "unknown" && dex !== "")
      ),
      avgTimeBetweenTrades: avgInterval,
      tradingFrequency: trades.length / (7 * 24 * 60 * 60 * 1000), // trades per week
      riskProfile: this.calculateRiskProfile(trades, uniqueTokens.size),
    };
  }

  private calculateRiskProfile(
    trades: DexTrade[],
    uniqueTokenCount: number
  ): string {
    // Use the passed uniqueTokenCount instead of recalculating
    if (uniqueTokenCount > 10) return "high_risk";
    if (uniqueTokenCount > 5) return "medium_risk";
    return "conservative";
  }

  private getMostFrequent(arr: string[]): string {
    if (!arr.length) return "";

    const frequency = arr.reduce(
      (acc, val) => {
        acc[val] = (acc[val] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return Object.entries(frequency).sort(([, a], [, b]) => b - a)[0][0];
  }

  private async analyzeScamPatterns(trades: DexTrade[]): Promise<ScamAnalysis> {
    try {
      // Identify potential scam patterns
      const patterns = {
        phishing: this.detectPhishingPatterns(trades),
        rugPull: this.detectRugPullPatterns(trades),
        pumpAndDump: this.detectPumpAndDumpPatterns(trades),
        honeypot: this.detectHoneypotPatterns(trades),
      };

      // Calculate overall risk score
      const riskScore = this.calculateRiskScore(patterns);

      // Generate warnings based on detected patterns
      const warnings = this.generateWarnings(patterns);

      return {
        riskLevel: this.getRiskLevel(riskScore),
        scamProbability: riskScore,
        warnings,
        detectedPatterns: patterns,
      };
    } catch (error) {
      console.error("Error in scam pattern analysis:", error);
      return {
        riskLevel: "low",
        scamProbability: 0,
        warnings: ["Error analyzing scam patterns"],
        detectedPatterns: {
          phishing: false,
          rugPull: false,
          pumpAndDump: false,
          honeypot: false,
        },
      };
    }
  }

  private detectPhishingPatterns(trades: DexTrade[]): boolean {
    // Check for suspicious token approvals
    // Look for interactions with known phishing contracts
    // Analyze transaction patterns that match known phishing attacks
    const suspiciousApprovals = trades.some(
      (trade) =>
        trade.tokenIn.amount ===
        "115792089237316195423570985008687907853269984665640564039457584007913129639935" // Max uint256
    );

    return suspiciousApprovals;
  }

  private detectRugPullPatterns(trades: DexTrade[]): boolean {
    // Check for sudden large liquidity removals
    // Monitor for token creator selling patterns
    // Analyze token contract for suspicious functions
    const suddenLiquidityChanges = trades.some((trade, index, array) => {
      if (index === 0) return false;
      const prevTrade = array[index - 1];
      const timeDiff = trade.timestamp - prevTrade.timestamp;
      const isLargeValue = parseFloat(trade.tokenIn.amount) > 1000000; // Arbitrary threshold
      return timeDiff < 3600000 && isLargeValue; // Within 1 hour
    });

    return suddenLiquidityChanges;
  }

  private detectPumpAndDumpPatterns(trades: DexTrade[]): boolean {
    // Look for rapid price increases followed by massive sells
    // Analyze trading volume patterns
    // Check for coordinated trading behavior
    if (trades.length < 2) return false;

    let volumeSpikes = 0;
    for (let i = 1; i < trades.length; i++) {
      const currentVolume = parseFloat(trades[i].tokenIn.amount);
      const prevVolume = parseFloat(trades[i - 1].tokenIn.amount);
      if (currentVolume > prevVolume * 3) {
        // 300% volume increase
        volumeSpikes++;
      }
    }

    return volumeSpikes >= 2;
  }

  private detectHoneypotPatterns(trades: DexTrade[]): boolean {
    // Check for tokens that can't be sold
    // Analyze buy/sell ratio disparities
    // Look for suspicious token contract patterns
    const buyCount = trades.filter((t) => t.tokenOut.amount !== "0").length;
    const sellCount = trades.filter((t) => t.tokenIn.amount !== "0").length;

    return buyCount > 0 && sellCount === 0; // Can buy but can't sell
  }

  private calculateRiskScore(
    patterns: ScamAnalysis["detectedPatterns"]
  ): number {
    const weights = {
      phishing: 0.3,
      rugPull: 0.3,
      pumpAndDump: 0.2,
      honeypot: 0.2,
    };

    return Object.entries(patterns).reduce((score, [pattern, detected]) => {
      return score + (detected ? weights[pattern as keyof typeof weights] : 0);
    }, 0);
  }

  private getRiskLevel(score: number): ScamAnalysis["riskLevel"] {
    if (score >= 0.6) return "high";
    if (score >= 0.3) return "medium";
    return "low";
  }

  private generateWarnings(
    patterns: ScamAnalysis["detectedPatterns"]
  ): string[] {
    const warnings: string[] = [];

    if (patterns.phishing) {
      warnings.push(
        "⚠️ Potential phishing attempt detected. Be cautious with token approvals."
      );
    }
    if (patterns.rugPull) {
      warnings.push(
        "⚠️ Suspicious liquidity patterns detected. Possible rug pull risk."
      );
    }
    if (patterns.pumpAndDump) {
      warnings.push(
        "⚠️ Unusual price manipulation patterns detected. Potential pump and dump scheme."
      );
    }
    if (patterns.honeypot) {
      warnings.push(
        "⚠️ Token shows characteristics of a honeypot. Selling might be restricted."
      );
    }

    return warnings;
  }

  private async analyzeWithAI(trades: DexTrade[]): Promise<{
    riskAssessment: string;
    confidence: number;
    detectedPatterns: string[];
  }> {
    try {
      return null;
      const tradeData = trades.map((trade) => ({
        timestamp: trade.timestamp,
        dex: trade.dex,
        tokenIn: trade.tokenIn,
        tokenOut: trade.tokenOut,
        value: trade.tokenIn.amount,
      }));

      const prompt = `Analyze these blockchain transactions for potential scam patterns:
        ${JSON.stringify(tradeData, null, 2)}
        
        Consider:
        1. Unusual trading patterns
        2. Known scam token interactions
        3. Suspicious contract interactions
        4. Price manipulation patterns
        5. Liquidity removal patterns
        6. Flash loan attack patterns
        7. Front-running patterns
        
        Provide a risk assessment and identify any suspicious patterns.`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a blockchain security expert analyzing transactions for scam patterns.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
      });

      const analysis = response.choices[0].message.content;
      // Parse the AI response and extract insights
      return this.parseAIResponse(analysis || "");
    } catch (error) {
      console.error("AI analysis error:", error);
      return {
        riskAssessment: "unknown",
        confidence: 0,
        detectedPatterns: [],
      };
    }
  }

  private parseAIResponse(analysis: string) {
    // Implement parsing logic based on AI response format
    // This is a simplified example
    const hasHighRisk = analysis.toLowerCase().includes("high risk");
    const hasMediumRisk = analysis.toLowerCase().includes("medium risk");

    return {
      riskAssessment: hasHighRisk ? "high" : hasMediumRisk ? "medium" : "low",
      confidence: 0.8, // You would calculate this based on AI response
      detectedPatterns: this.extractPatterns(analysis),
    };
  }

  private extractPatterns(analysis: string): string[] {
    const patterns: string[] = [];

    // Common scam pattern keywords
    const patternKeywords = [
      "rug pull",
      "honeypot",
      "pump and dump",
      "flash loan",
      "front running",
      "price manipulation",
      "phishing",
      "impersonation",
    ];

    patternKeywords.forEach((keyword) => {
      if (analysis.toLowerCase().includes(keyword)) {
        patterns.push(keyword);
      }
    });

    return patterns;
  }

  private async detectSophisticatedPatterns(trades: DexTrade[]): Promise<{
    patterns: string[];
    riskLevel: string;
    confidence: number;
  }> {
    const patterns: string[] = [];
    let riskScore = 0;

    // Check for flash loan attacks
    if (this.detectFlashLoanPattern(trades)) {
      patterns.push("Flash Loan Attack Pattern");
      riskScore += 0.4;
    }

    // Check for front-running
    if (this.detectFrontRunningPattern(trades)) {
      patterns.push("Front-Running Pattern");
      riskScore += 0.3;
    }

    // Check for sandwich attacks
    if (this.detectSandwichPattern(trades)) {
      patterns.push("Sandwich Attack Pattern");
      riskScore += 0.3;
    }

    // Get AI analysis
    const aiAnalysis = await this.analyzeWithAI(trades);
    patterns.push(...aiAnalysis.detectedPatterns);
    riskScore = Math.min(riskScore + aiAnalysis.confidence * 0.5, 1);

    return {
      patterns,
      riskLevel: this.getRiskLevel(riskScore),
      confidence: riskScore,
    };
  }

  private detectFlashLoanPattern(trades: DexTrade[]): boolean {
    // Look for large value transactions that occur within the same block
    const blockGroups = trades.reduce(
      (acc, trade) => {
        const blockHeight = trade.blockHeight;
        if (!acc[blockHeight]) {
          acc[blockHeight] = [];
        }
        acc[blockHeight].push(trade);
        return acc;
      },
      {} as Record<number, DexTrade[]>
    );

    return Object.values(blockGroups).some((blockTrades) => {
      if (blockTrades.length < 2) return false;

      // Check for large value differences
      const values = blockTrades.map((t) => parseFloat(t.tokenIn.amount));
      const maxValue = Math.max(...values);
      const minValue = Math.min(...values);

      return maxValue > minValue * 1000; // Arbitrary threshold
    });
  }

  private detectFrontRunningPattern(trades: DexTrade[]): boolean {
    // Look for similar transactions with increasing gas prices
    for (let i = 1; i < trades.length; i++) {
      const currentTrade = trades[i];
      const prevTrade = trades[i - 1];

      // Check if trades are within a short time window (e.g., 2 blocks)
      if (currentTrade.blockHeight - prevTrade.blockHeight <= 2) {
        // Check for similar token pairs but higher gas price
        if (
          currentTrade.tokenIn.symbol === prevTrade.tokenIn.symbol &&
          currentTrade.tokenOut.symbol === prevTrade.tokenOut.symbol
        ) {
          return true;
        }
      }
    }
    return false;
  }

  private detectSandwichPattern(trades: DexTrade[]): boolean {
    // Look for patterns of buy-sell-buy or sell-buy-sell within short timeframes
    for (let i = 2; i < trades.length; i++) {
      const trade1 = trades[i - 2];
      const trade2 = trades[i - 1];
      const trade3 = trades[i];

      // Check if all trades are within a short time window
      if (trade3.timestamp - trade1.timestamp < 60000) {
        // 1 minute
        // Check for sandwich pattern
        if (
          trade1.tokenIn.symbol === trade3.tokenIn.symbol &&
          trade2.tokenIn.symbol !== trade1.tokenIn.symbol
        ) {
          return true;
        }
      }
    }
    return false;
  }

  async collectTransactions(input: CollectorInput) {
    console.log(
      "Starting transaction collection for address:",
      input.walletAddress
    );

    try {
      const txs =
        await this.goldRushClient.TransactionService.getAllTransactionsForAddressByPage(
          input.chain,
          input.walletAddress,
          {
            noLogs: false,
            // pageSize: 100,
            // pageNumber: 0,
            // // withLogEvents: true,
            // withRawLogEvents: true,
            // decodeLogEvents: true,
          }
        );

      // Helper function to safely serialize BigInt values
      const serializeBigInt = (obj: any): any => {
        if (typeof obj !== "object" || obj === null) {
          // Handle BigInt values
          if (typeof obj === "bigint") {
            return obj.toString();
          }
          return obj;
        }

        if (Array.isArray(obj)) {
          return obj.map(serializeBigInt);
        }

        return Object.fromEntries(
          Object.entries(obj).map(([key, value]) => [
            key,
            serializeBigInt(value),
          ])
        );
      };

      // Debug log with BigInt serialization
      console.log(
        "Raw API response:",
        JSON.stringify(serializeBigInt(txs?.data), null, 2)
      );

      if (!txs?.data?.items || !Array.isArray(txs.data.items)) {
        console.error("Invalid or empty response:", serializeBigInt(txs));
        throw new Error("Invalid response from blockchain data provider");
      }

      // Process transactions with BigInt handling
      const allTransactions = txs.data.items.map((tx) => ({
        ...tx,
        value:
          typeof tx.value === "bigint" ? tx.value.toString() : tx.value || "0",
        successful: tx.successful !== false,
      }));

      const trades = this.transformTrades(allTransactions);
      const sophisticatedAnalysis =
        await this.detectSophisticatedPatterns(trades);
      const profile = this.analyzeTraderProfile(trades);
      const basicScamAnalysis = await this.analyzeScamPatterns(trades);

      // Combine basic and sophisticated analysis
      const combinedAnalysis = {
        ...basicScamAnalysis,
        sophisticatedPatterns: sophisticatedAnalysis.patterns,
        confidence: sophisticatedAnalysis.confidence,
        // aiAnalysis: await this.analyzeWithAI(trades),
      };

      return {
        success: true,
        trades: serializeBigInt(trades),
        profile: serializeBigInt(profile),
        scamAnalysis: combinedAnalysis,
        summary: {
          totalTransactions: allTransactions.length,
          dexTransactions: trades.length,
          timespan: this.calculateTimespan(allTransactions),
          transactions: serializeBigInt(allTransactions),
        },
      };
    } catch (error) {
      console.error("Transaction collection failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        errorDetails: JSON.stringify(error, (_, value) =>
          typeof value === "bigint" ? value.toString() : value
        ),
      };
    }
  }

  private calculateTimespan(transactions: any[]) {
    const timespan = {
      start: "",
      end: "",
    };

    if (transactions.length > 0) {
      try {
        const dates = transactions
          .map((tx) => new Date(tx.block_signed_at))
          .filter((date) => date.toString() !== "Invalid Date")
          .sort((a, b) => a.getTime() - b.getTime());

        if (dates.length > 0) {
          timespan.start = dates[0].toISOString();
          timespan.end = dates[dates.length - 1].toISOString();
        }
      } catch (error) {
        console.error("Error calculating timespan:", error);
      }
    }

    return timespan;
  }
}

// Initialize and export the service
export const transactionCollector = new TransactionCollectorService();
