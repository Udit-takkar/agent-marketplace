"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useNetwork } from "wagmi";
import { formatDistanceToNow } from "date-fns";
import { RiskMeter } from "@/components/risk/risk-meter";
import { TransactionMonitor } from "@/components/risk/transaction-monitor";
import { RecentAlerts } from "@/components/risk/recent-alerts";
import { Card } from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import { Progress } from "@workspace/ui/components/progress";
import { ChainSelector } from "@/components/chain/chain-selector";
import { useToast } from "@workspace/ui/hooks/use-toast";
import { Chain } from "@covalenthq/client-sdk";
import { transactionCollector } from "@/lib/services/transaction-collector-service";
import {
  Brain,
  AlertTriangle,
  Activity,
  TrendingUp,
  Wallet,
  BarChart3,
  Shield,
  ShieldAlert,
} from "lucide-react";
import { RecentTransactions } from "@/components/transactions/recent-transactions";

const formatDate = (dateString: string | number | undefined): string => {
  if (!dateString) return "Unknown date";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid date";
  }
};

export default function DashboardPage() {
  const [txHash, setTxHash] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [trades, setTrades] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [scamAnalysis, setScamAnalysis] = useState<any>(null);

  const router = useRouter();
  const { toast } = useToast();
  const { address, isConnected, chain: walletChain } = useAccount();

  const getCovalentChain = (chainId?: number): Chain => {
    switch (chainId) {
      case 1:
        return "eth-mainnet";
      case 137:
        return "matic-mainnet";
      case 56:
        return "bsc-mainnet";
      case 43114:
        return "avalanche-mainnet";
      case 42161:
        return "arbitrum-mainnet";
      case 10:
        return "optimism-mainnet";
      case 250:
        return "fantom-mainnet";
      case 42220:
        return "celo-mainnet";
      default:
        return "eth-mainnet";
    }
  };

  useEffect(() => {
    const fetchTransactionHistory = async () => {
      if (!isConnected || !address || !walletChain) return;

      try {
        setIsLoading(true);
        const result = await transactionCollector.collectTransactions({
          chain: getCovalentChain(walletChain.id),
          walletAddress: address,
        });

        if (result.success) {
          const formattedTrades = result.trades.map((trade) => ({
            ...trade,
            timestamp: new Date(trade.timestamp).toISOString(),
          }));

          setTrades(formattedTrades);
          setProfile(result.profile);
          setScamAnalysis(result.scamAnalysis);
          setSummary({
            ...result.summary,
            transactions: result.summary.transactions.map((tx: any) => ({
              ...tx,
              block_signed_at: tx.block_signed_at || new Date().toISOString(),
            })),
          });
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        console.error("Error fetching transactions:", error);
        toast({
          title: "Error",
          description: "Failed to fetch transaction history",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactionHistory();
  }, [address, isConnected, walletChain]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!txHash) {
        throw new Error("Please enter a transaction hash");
      }

      router.push(`/tx/${getCovalentChain(walletChain?.id)}/${txHash}`);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Transaction Risk Monitor</h1>
      </div>

      {/* Transaction Analysis Form */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Analyze Transaction</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Current Chain</label>
            <div className="p-2 border rounded-md">
              <p className="text-sm">{walletChain?.name || "Not Connected"}</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Transaction Hash</label>
            <Input
              placeholder="Enter transaction hash"
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <Button type="submit" disabled={isLoading || !txHash}>
            {isLoading ? "Analyzing..." : "Analyze Transaction"}
          </Button>
        </form>
      </Card>

      {/* Wallet Connection Status */}
      {!isConnected && (
        <Card className="p-6 mb-6 bg-yellow-50 dark:bg-yellow-900/20">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="text-yellow-600" />
            <p>
              Connect your wallet to view your transaction history and trading
              profile.
            </p>
          </div>
        </Card>
      )}

      {/* Trading Profile */}
      {isConnected && profile && (
        <Card className="p-6 mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <Brain className="h-6 w-6" />
            <h2 className="text-xl font-semibold">Your Trading Profile</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Risk Profile</p>
              <p className="text-lg font-medium capitalize">
                {profile.riskProfile}
              </p>
              <Progress
                value={
                  profile.riskProfile === "high_risk"
                    ? 90
                    : profile.riskProfile === "medium_risk"
                      ? 50
                      : 20
                }
                className="mt-2"
              />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Trading Frequency</p>
              <p className="text-lg font-medium">
                {profile.tradingFrequency.toFixed(2)} trades/week
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Preferred DEX</p>
              <p className="text-lg font-medium">
                {profile.preferredDex || "None"}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Trading Statistics */}
      {isConnected && summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="p-6">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-500" />
              <h3 className="font-medium">Total Transactions</h3>
            </div>
            <p className="text-2xl font-bold mt-2">
              {summary.totalTransactions}
            </p>
          </Card>
          <Card className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <h3 className="font-medium">DEX Transactions</h3>
            </div>
            <p className="text-2xl font-bold mt-2">{summary.dexTransactions}</p>
          </Card>
          <Card className="p-6">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-purple-500" />
              <h3 className="font-medium">Unique Tokens</h3>
            </div>
            <p className="text-2xl font-bold mt-2">
              {profile?.uniqueTokenCount || 0}
            </p>
          </Card>
        </div>
      )}

      {/* Recent DEX Trades */}
      {isConnected && trades.length > 0 && (
        <Card className="p-6 mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <Wallet className="h-6 w-6" />
            <h2 className="text-xl font-semibold">Recent DEX Trades</h2>
          </div>
          <div className="space-y-4">
            {trades.slice(0, 5).map((trade) => (
              <div
                key={trade.txHash}
                className="p-4 rounded-lg border hover:bg-accent cursor-pointer"
                onClick={() =>
                  router.push(
                    `/tx/${getCovalentChain(walletChain?.id)}/${trade.txHash}`
                  )
                }
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">
                      {trade.tokenIn.symbol} → {trade.tokenOut.symbol}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(trade.timestamp)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium capitalize">{trade.dex}</p>
                    <p className="text-sm text-muted-foreground">
                      {trade.tokenIn.amount} {trade.tokenIn.symbol}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="col-span-1">
          <RiskMeter profile={profile} />
        </div>
        <div className="col-span-1">
          <RecentAlerts trades={trades} />
        </div>
        <div className="col-span-1">
          <TransactionMonitor trades={trades} summary={summary} />
        </div>
      </div>

      {/* Recent Transactions - Full Width */}
      <div className="mt-6">
        <RecentTransactions
          transactions={summary?.transactions}
          chain={getCovalentChain(walletChain?.id)}
          formatDate={formatDate}
          scamAnalysis={scamAnalysis}
        />
      </div>

      {scamAnalysis && (
        <Card className="p-6 mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <ShieldAlert className="h-6 w-6 text-red-500" />
            <h2 className="text-xl font-semibold">Risk Analysis</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">Detected Patterns</h3>
              <div className="space-y-2">
                {Object.entries(scamAnalysis.detectedPatterns).map(
                  ([pattern, detected]) => (
                    <div key={pattern} className="flex items-center space-x-2">
                      {detected ? (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      ) : (
                        <Shield className="h-4 w-4 text-green-500" />
                      )}
                      <span className="capitalize">
                        {pattern.replace(/([A-Z])/g, " $1").trim()}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-2">Risk Level</h3>
              <div className="flex items-center space-x-2">
                <Progress
                  value={scamAnalysis.scamProbability * 100}
                  className="flex-1"
                  indicatorClassName={
                    scamAnalysis.riskLevel === "high"
                      ? "bg-red-500"
                      : scamAnalysis.riskLevel === "medium"
                        ? "bg-yellow-500"
                        : "bg-green-500"
                  }
                />
                <span className="text-sm font-medium capitalize">
                  {scamAnalysis.riskLevel}
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
