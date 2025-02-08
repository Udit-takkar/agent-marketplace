"use client";

import { Card } from "@workspace/ui/components/card";
import {
  History,
  ExternalLink,
  AlertTriangle,
  Shield,
  ShieldAlert,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@workspace/ui/components/badge";

interface RecentTransactionsProps {
  transactions?: any[];
  chain?: string;
  formatDate: (date: string | number | undefined) => string;
  scamAnalysis?: {
    riskLevel: "high" | "medium" | "low";
    warnings: string[];
    detectedPatterns: {
      phishing: boolean;
      rugPull: boolean;
      pumpAndDump: boolean;
      honeypot: boolean;
    };
  };
}

export function RecentTransactions({
  transactions,
  chain,
  formatDate,
  scamAnalysis,
}: RecentTransactionsProps) {
  const formatValue = (value: string) => {
    const eth = Number(value) / 1e18;
    const symbol = chain === "matic-mainnet" ? "MATIC" : "ETH";
    return `${eth.toFixed(eth >= 1 ? 4 : 6)} ${symbol}`;
  };

  const getExplorerUrl = (hash: string) => {
    switch (chain) {
      case "eth-mainnet":
        return `https://etherscan.io/tx/${hash}`;
      case "matic-mainnet":
        return `https://polygonscan.com/tx/${hash}`;
      // Add more chains as needed
      default:
        return `https://etherscan.io/tx/${hash}`;
    }
  };

  const getRiskBadge = (tx: any) => {
    if (!scamAnalysis) return null;

    const riskColors = {
      high: "bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-400 border-red-600/20",
      medium:
        "bg-yellow-500/10 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400 border-yellow-600/20",
      low: "bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400 border-green-600/20",
    };

    return (
      <Badge
        variant="outline"
        className={`${riskColors[scamAnalysis.riskLevel]} font-medium`}
      >
        {scamAnalysis.riskLevel === "high" && (
          <ShieldAlert className="h-3 w-3 mr-1" />
        )}
        {scamAnalysis.riskLevel === "medium" && (
          <AlertTriangle className="h-3 w-3 mr-1" />
        )}
        {scamAnalysis.riskLevel === "low" && (
          <Shield className="h-3 w-3 mr-1" />
        )}
        {scamAnalysis.riskLevel.toUpperCase()}
      </Badge>
    );
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <History className="h-6 w-6 text-purple-500" />
          <h2 className="text-xl font-semibold">Recent Transactions</h2>
        </div>
      </div>

      {scamAnalysis?.warnings && scamAnalysis.warnings.length > 0 && (
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <h3 className="font-medium mb-2">Security Warnings</h3>
          <ul className="list-disc list-inside space-y-1">
            {scamAnalysis.warnings.map((warning, index) => (
              <li
                key={index}
                className="text-sm text-yellow-800 dark:text-yellow-200"
              >
                {warning}
              </li>
            ))}
          </ul>
        </div>
      )}

      {transactions && transactions.length > 0 ? (
        <div className="space-y-4">
          {transactions.slice(0, 5).map((tx: any) => (
            <div
              key={tx.tx_hash}
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium truncate w-32 sm:w-auto">
                    {tx.from_address.slice(0, 6)}...{tx.from_address.slice(-4)}{" "}
                    → {tx.to_address.slice(0, 6)}...{tx.to_address.slice(-4)}
                  </span>
                  {getRiskBadge(tx)}
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatDate(tx.block_signed_at)}
                </p>
              </div>

              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <p className="font-medium">{formatValue(tx.value)}</p>
                  <a
                    href={getExplorerUrl(tx.tx_hash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-600"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
                <p className="text-sm text-muted-foreground">
                  {tx.successful ? "Success" : "Failed"}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No recent transactions</p>
      )}
    </Card>
  );
}
