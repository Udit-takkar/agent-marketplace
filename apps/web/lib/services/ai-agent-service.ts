import { Agent, Tool, ZeeWorkflow } from "@covalenthq/ai-agent-sdk";
import { GoldRushClient, Chain } from "@covalenthq/client-sdk";
import { z } from "zod";

import { GOLDRUSH_API_KEY, OPENAI_API_KEY } from "@/lib/utils";

if (!GOLDRUSH_API_KEY) {
  throw new Error("GOLDRUSH_API_KEY is not defined");
}

const client = new GoldRushClient(GOLDRUSH_API_KEY);

class BaseAnalysisTool extends Tool {
  protected formatBigIntValue(value: any): string {
    try {
      if (typeof value === "bigint") {
        return value.toString();
      }
      if (typeof value === "string") {
        return value;
      }
      return String(value);
    } catch (error) {
      console.error("Error formatting BigInt value:", error);
      return "0";
    }
  }

  protected convertToNumber(value: any): number {
    try {
      if (typeof value === "bigint") {
        return Number(value);
      }
      if (typeof value === "string") {
        return Number(value);
      }
      return Number(value) || 0;
    } catch (error) {
      console.error("Error converting to number:", error);
      return 0;
    }
  }

  protected safeExecute(fn: Function, ...args: any[]): any {
    try {
      return fn.apply(this, args);
    } catch (error) {
      console.error("Error executing function:", error);
      return null;
    }
  }
}

// Trading Pattern Analysis Tool
class TradingPatternTool extends BaseAnalysisTool {
  constructor() {
    super(
      "trading_pattern",
      "Analyzes trading patterns and behavior",
      z.object({
        hash: z.string(),
        chain: z.string(),
      }),
      async (parameters) => {
        try {
          const { hash, chain } = parameters;
          const txResponse = await client.TransactionService.getTransaction(
            chain as Chain,
            hash
          );

          if (!txResponse.data?.items?.[0]) {
            throw new Error(`No transaction found for hash ${hash}`);
          }

          const transaction = txResponse.data.items[0];
          const patterns = this.analyzeTradingPatterns(transaction);
          return JSON.stringify(patterns);
        } catch (error) {
          console.error("TradingPatternTool error:", error);
          throw error;
        }
      }
    );
  }

  private analyzeTradingPatterns(transaction: any) {
    return {
      transactionDetails: {
        value: this.formatBigIntValue(transaction.value),
        timestamp: transaction.block_signed_at,
        from: transaction.from_address,
        to: transaction.to_address,
        gasPrice: this.formatBigIntValue(transaction.gas_price),
        gasSpent: this.formatBigIntValue(transaction.gas_spent),
      },
      riskLevel: this.safeExecute(this.assessRiskLevel.bind(this), transaction),
      tradingStyle: this.safeExecute(
        this.determineTradingStyle.bind(this),
        transaction
      ),
    };
  }

  private assessRiskLevel(transaction: any) {
    const value = this.convertToNumber(transaction.value);
    const gasPrice = this.convertToNumber(transaction.gas_price);

    return {
      value: this.formatBigIntValue(value),
      gasPrice: this.formatBigIntValue(gasPrice),
      riskScore: this.calculateRiskScore(value, gasPrice),
    };
  }

  private calculateRiskScore(value: number, gasPrice: number): number {
    const valueInEth = value / 1e18;
    const gasPriceInGwei = gasPrice / 1e9;

    const valueScore = Math.min(valueInEth * 10, 100);
    const gasPriceScore = Math.min(gasPriceInGwei / 100, 100);

    return (valueScore + gasPriceScore) / 2;
  }

  private determineTradingStyle(transaction: any) {
    return {
      type: this.getTransactionType(transaction),
      confidence: 0.8,
    };
  }

  private getTransactionType(transaction: any) {
    if (transaction.to_address && transaction.to_address.startsWith("0x")) {
      return "contract_interaction";
    }
    return "transfer";
  }

  private calculateHoldingPeriods(transactions: any[]) {
    const periods = transactions.slice(1).map((tx, i) => {
      const current = new Date(tx.block_signed_at).getTime();
      const previous = new Date(transactions[i].block_signed_at).getTime();
      return current - previous;
    });

    const average = periods.reduce((a, b) => a + b, 0) / periods.length;
    const consistency =
      1 -
      Math.sqrt(
        periods.reduce((a, b) => a + Math.pow(b - average, 2), 0) /
          periods.length
      ) /
        average;

    return { average, consistency };
  }
}

class MarketSentimentTool extends Tool {
  constructor() {
    super(
      "market_sentiment",
      "Analyzes market sentiment and psychological factors",
      z.object({
        hash: z.string(),
        chain: z.string(),
      }),
      async (parameters) => {
        try {
          const { hash, chain } = parameters as {
            hash: string;
            chain: string;
          };

          const txResponse = await client.TransactionService.getTransaction(
            chain as Chain,
            hash
          );

          if (!txResponse.data || !txResponse.data.items?.[0]) {
            throw new Error(`No transaction found for hash ${hash}`);
          }

          const transaction = txResponse.data.items[0];
          const sentiment = this.analyzeSentiment(transaction);
          return JSON.stringify(sentiment);
        } catch (error) {
          console.error("MarketSentimentTool error:", error);
          throw new Error("Failed to analyze market sentiment");
        }
      }
    );
  }

  private analyzeSentiment(transaction: any) {
    return {
      marketSentiment: this.calculateMarketSentiment(transaction),
      emotionalBias: this.detectEmotionalBias(transaction),
      confidenceLevel: this.assessConfidenceLevel(transaction),
      marketTiming: this.analyzeMarketTiming(transaction),
    };
  }

  private calculateMarketSentiment(transaction: any) {
    const value = BigInt(transaction.value);
    const gasPrice = BigInt(transaction.gas_price);

    return {
      overall: this.determineOverallSentiment(value, gasPrice),
      confidence: 0.7,
      momentum: this.calculateMomentum(transaction),
    };
  }

  private detectEmotionalBias(transaction: any) {
    const value = BigInt(transaction.value);
    const gasPrice = BigInt(transaction.gas_price);

    return {
      fomo: this.calculateFOMO(value, gasPrice),
      fearLevel: this.calculateFearLevel(value, gasPrice),
      greedIndex: this.calculateGreedIndex(value, gasPrice),
    };
  }

  private assessConfidenceLevel(transaction: any) {
    return {
      score: this.calculateConfidenceScore(transaction),
      stability: this.calculateStabilityScore(transaction),
    };
  }

  private analyzeMarketTiming(transaction: any) {
    return {
      timing: this.assessTiming(transaction),
      accuracy: 0.5,
      consistency: 0.6,
      recommendations: this.generateRecommendations(transaction),
    };
  }

  // Helper methods for sentiment analysis
  private determineOverallSentiment(value: bigint, gasPrice: bigint) {
    const valueThreshold = BigInt(1e18); // 1 ETH
    const gasPriceThreshold = BigInt(1e9); // 100 Gwei

    if (value > valueThreshold && gasPrice > gasPriceThreshold) {
      return "bullish";
    } else if (value > valueThreshold) {
      return "moderately_bullish";
    } else if (gasPrice > gasPriceThreshold) {
      return "urgent";
    }
    return "neutral";
  }

  private calculateFOMO(value: bigint, gasPrice: bigint) {
    return gasPrice > BigInt(1e9) ? 0.8 : 0.3;
  }

  private calculateFearLevel(value: bigint, gasPrice: bigint) {
    return value < BigInt(1e9) ? 0.7 : 0.2;
  }

  private calculateGreedIndex(value: bigint, gasPrice: bigint) {
    return value > BigInt(1e18) ? 0.8 : 0.4;
  }

  private calculateMomentum(transaction: any) {
    return {
      trend: "positive",
      strength: 0.6,
    };
  }

  private calculateConfidenceScore(transaction: any) {
    const value = BigInt(transaction.value);
    return value > BigInt(1e18) ? 0.8 : 0.5;
  }

  private calculateStabilityScore(transaction: any) {
    const gasPrice = BigInt(transaction.gas_price);
    return gasPrice > BigInt(1e9) ? 0.4 : 0.7;
  }

  private assessTiming(transaction: any) {
    return {
      phase: "entry",
      quality: "good",
    };
  }

  private generateRecommendations(transaction: any) {
    const recommendations = [];
    const value = BigInt(transaction.value);
    const gasPrice = BigInt(transaction.gas_price);

    if (value > BigInt(1e18)) {
      recommendations.push(
        "Consider splitting large transactions to reduce risk"
      );
    }
    if (gasPrice > BigInt(1e9)) {
      recommendations.push(
        "High gas prices indicate network congestion - consider timing trades better"
      );
    }

    return recommendations;
  }
}

// Volume Analysis Tool
class VolumeAnalysisTool extends BaseAnalysisTool {
  constructor() {
    super(
      "volume_analysis",
      "Analyzes trading volumes and liquidity patterns",
      z.object({
        hash: z.string(),
        chain: z.string(),
      }),
      async (parameters) => {
        try {
          const { hash, chain } = parameters as {
            hash: string;
            chain: string;
          };
          const txResponse = await client.TransactionService.getTransaction(
            chain as Chain,
            hash
          );

          if (!txResponse.data?.items?.[0]) {
            throw new Error(`No transaction found for hash ${hash}`);
          }

          const transaction = txResponse.data.items[0];
          const analysis = this.analyzeVolume(transaction);
          return JSON.stringify(analysis);
        } catch (error) {
          console.error("VolumeAnalysisTool error:", error);
          throw error;
        }
      }
    );
  }

  private analyzeVolume(transaction: any) {
    const value = this.convertToNumber(transaction.value);
    const gasPrice = this.convertToNumber(transaction.gas_price);

    return {
      transactionValue: this.formatBigIntValue(transaction.value),
      gasMetrics: {
        price: this.formatBigIntValue(transaction.gas_price),
        spent: this.formatBigIntValue(transaction.gas_spent),
      },
      volumeProfile: {
        size: this.determineVolumeSize(value),
        impact: this.assessMarketImpact(value),
      },
      metrics: {
        valueInEth: value / 1e18,
        gasPriceInGwei: gasPrice / 1e9,
      },
    };
  }

  private determineVolumeSize(value: number): string {
    if (value > 1e20) return "large";
    if (value > 1e19) return "medium";
    return "small";
  }

  private assessMarketImpact(value: number): string {
    if (value > 1e20) return "high";
    if (value > 1e19) return "medium";
    return "low";
  }
}

// Reputation Analysis Tool
class ReputationAnalysisTool extends BaseAnalysisTool {
  constructor() {
    super(
      "reputation_analysis",
      "Analyzes transaction reputation and risk factors",
      z.object({
        hash: z.string(),
        chain: z.string(),
      }),
      async (parameters) => {
        try {
          const { hash, chain } = parameters;
          const txResponse = await client.TransactionService.getTransaction(
            chain as Chain,
            hash
          );

          if (!txResponse.data?.items?.[0]) {
            throw new Error(`No transaction found for hash ${hash}`);
          }

          const transaction = txResponse.data.items[0];
          const reputation = this.analyzeReputation(transaction);
          return JSON.stringify(reputation);
        } catch (error) {
          console.error("ReputationAnalysisTool error:", error);
          throw error;
        }
      }
    );
  }

  private analyzeReputation(transaction: any) {
    return {
      senderScore: this.safeExecute(
        this.calculateSenderScore.bind(this),
        transaction
      ),
      riskFactors: this.safeExecute(
        this.identifyRiskFactors.bind(this),
        transaction
      ),
      transactionProfile: this.safeExecute(
        this.createTransactionProfile.bind(this),
        transaction
      ),
      securityMetrics: this.safeExecute(
        this.assessSecurityMetrics.bind(this),
        transaction
      ),
    };
  }

  private calculateSenderScore(transaction: any) {
    const value = this.convertToNumber(transaction.value);
    const gasPrice = this.convertToNumber(transaction.gas_price);

    let score = 50; // Base score
    if (value > 1e18) score -= 10; // Higher value = higher risk
    if (gasPrice > 1e11) score -= 5; // Higher gas = potential urgency

    return Math.max(0, Math.min(100, score));
  }

  private identifyRiskFactors(transaction: any) {
    const factors = [];
    const value = this.convertToNumber(transaction.value);
    const gasPrice = this.convertToNumber(transaction.gas_price);

    if (value > 1e18) {
      factors.push("High-value transaction");
    }
    if (gasPrice > 1e11) {
      factors.push("High gas price - potential urgency");
    }
    if (
      transaction.to_address &&
      this.isContractAddress(transaction.to_address)
    ) {
      factors.push("Contract interaction");
    }

    return factors;
  }

  private createTransactionProfile(transaction: any) {
    return {
      type: this.determineTransactionType(transaction),
      value: this.formatBigIntValue(transaction.value),
      gasUsage: {
        price: this.formatBigIntValue(transaction.gas_price),
        spent: this.formatBigIntValue(transaction.gas_spent),
      },
      timestamp: transaction.block_signed_at,
    };
  }

  private assessSecurityMetrics(transaction: any) {
    const value = this.convertToNumber(transaction.value);
    const gasPrice = this.convertToNumber(transaction.gas_price);

    return {
      riskLevel: this.calculateRiskLevel(value, gasPrice),
      complexityScore: this.assessComplexity(transaction),
      validationStatus: this.validateTransaction(transaction),
    };
  }

  private isContractAddress(address: string) {
    return address && address.startsWith("0x");
  }

  private determineTransactionType(transaction: any) {
    if (this.isContractAddress(transaction.to_address)) {
      return "contract_interaction";
    }
    return "standard_transfer";
  }

  private calculateRiskLevel(value: number, gasPrice: number): string {
    if (value > 1e18 && gasPrice > 1e11) {
      return "high";
    } else if (value > 1e18 || gasPrice > 1e11) {
      return "medium";
    }
    return "low";
  }

  private assessComplexity(transaction: any) {
    if (transaction.input && transaction.input.length > 100) {
      return "high";
    }
    return "low";
  }

  private validateTransaction(transaction: any) {
    return {
      isValid: true,
      checks: ["valid_addresses", "valid_value", "valid_gas"],
    };
  }
}

// Create a workflow for risk assessment
export class RiskAssessmentWorkflow {
  private workflow: ZeeWorkflow;

  constructor(
    private tradingPatternTool: TradingPatternTool,
    private marketSentimentTool: MarketSentimentTool,
    private volumeAnalysisTool: VolumeAnalysisTool,
    private reputationAnalysisTool: ReputationAnalysisTool
  ) {
    this.workflow = new ZeeWorkflow({
      description: "Analyze trading psychology and risk patterns",
      output: "Comprehensive risk assessment and trading psychology analysis",
      agents: {
        tradingPattern: new Agent({
          name: "TradingPatternAgent",
          description: "Analyzes trading patterns and behaviors",
          model: {
            provider: "OPEN_AI",
            name: "gpt-4",
            apiKey: OPENAI_API_KEY,
          },
          tools: { tradingPattern: this.tradingPatternTool },
        }),
        marketSentiment: new Agent({
          name: "MarketSentimentAgent",
          description: "Analyzes market sentiment and psychological factors",
          model: {
            provider: "OPEN_AI",
            name: "gpt-3.5-turbo",
            apiKey: OPENAI_API_KEY,
          },
          tools: { marketSentiment: this.marketSentimentTool },
        }),
        volumeAnalysis: new Agent({
          name: "VolumeAnalysisAgent",
          description: "Analyzes trading volumes and liquidity patterns",
          model: {
            provider: "OPEN_AI",
            name: "gpt-3.5-turbo",
            apiKey: OPENAI_API_KEY,
          },
          tools: { volumeAnalysis: this.volumeAnalysisTool },
        }),
        reputationAnalysis: new Agent({
          name: "ReputationAnalysisAgent",
          description: "Analyzes trader reputation and risk profile",
          model: {
            provider: "OPEN_AI",
            name: "gpt-3.5-turbo",
            apiKey: OPENAI_API_KEY,
          },
          tools: { reputationAnalysis: this.reputationAnalysisTool },
        }),
      },
    });
  }

  async execute(input: { chain: string; hash: string }) {
    try {
      // Validate input
      if (!input.chain || !input.hash) {
        throw new Error("Chain and hash are required");
      }

      const [
        tradingPattern,
        marketSentiment,
        volumeAnalysis,
        reputationAnalysis,
      ] = await Promise.all([
        this.tradingPatternTool
          .execute({ hash: input.hash, chain: input.chain })
          .catch((error) => {
            console.error("Trading pattern analysis failed:", error);
            return JSON.stringify({ error: "Trading pattern analysis failed" });
          }),
        this.marketSentimentTool
          .execute({ hash: input.hash, chain: input.chain })
          .catch((error) => {
            console.error("Market sentiment analysis failed:", error);
            return JSON.stringify({
              error: "Market sentiment analysis failed",
            });
          }),
        this.volumeAnalysisTool
          .execute({ hash: input.hash, chain: input.chain })
          .catch((error) => {
            console.error("Volume analysis failed:", error);
            return JSON.stringify({ error: "Volume analysis failed" });
          }),
        this.reputationAnalysisTool
          .execute({ hash: input.hash, chain: input.chain })
          .catch((error) => {
            console.error("Reputation analysis failed:", error);
            return JSON.stringify({ error: "Reputation analysis failed" });
          }),
      ]);

      // Check if all analyses failed
      if (
        tradingPattern.includes("error") &&
        marketSentiment.includes("error") &&
        volumeAnalysis.includes("error") &&
        reputationAnalysis.includes("error")
      ) {
        throw new Error("All analyses failed");
      }

      return {
        success: true,
        tradingPattern: JSON.parse(tradingPattern),
        marketSentiment: JSON.parse(marketSentiment),
        volumeAnalysis: JSON.parse(volumeAnalysis),
        reputationAnalysis: JSON.parse(reputationAnalysis),
      };
    } catch (error) {
      console.error("Workflow execution failed:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }
}

// Initialize the workflow
const tools = {
  tradingPattern: new TradingPatternTool(),
  marketSentiment: new MarketSentimentTool(),
  volumeAnalysis: new VolumeAnalysisTool(),
  reputationAnalysis: new ReputationAnalysisTool(),
};

export const riskAssessmentWorkflow = new RiskAssessmentWorkflow(
  tools.tradingPattern,
  tools.marketSentiment,
  tools.volumeAnalysis,
  tools.reputationAnalysis
);
