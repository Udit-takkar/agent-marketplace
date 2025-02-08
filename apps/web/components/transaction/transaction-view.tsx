"use client";

import { useEffect, useState } from "react";
import { GoldRushClient } from "@covalenthq/client-sdk";
import { Card } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { formatEther, formatUnits } from "viem";
import { ExternalLink, Clock, ArrowRightLeft } from "lucide-react";
import { GOLDRUSH_API_KEY } from "@/lib/utils";

interface TransactionViewProps {
  chain: string;
  txHash: string;
}

interface TransactionDetails {
  blockHeight: number;
  blockSignedAt: string;
  fromAddress: string;
  toAddress: string;
  value: string;
  gasSpent: string;
  gasPrice: string;
  successful: boolean;
  tokenTransfers?: {
    fromAddress: string;
    toAddress: string;
    tokenAddress: string;
    tokenName: string;
    tokenSymbol: string;
    tokenDecimals: number;
    amount: string;
  }[];
}

export function TransactionView({ chain, txHash }: TransactionViewProps) {
  const [transaction, setTransaction] = useState<TransactionDetails | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        if (!GOLDRUSH_API_KEY) {
          throw new Error("GOLDRUSH_API_KEY is not defined");
        }

        const client = new GoldRushClient(GOLDRUSH_API_KEY);
        const response = await client.TransactionService.getTransaction(
          chain,
          txHash
        );

        if (response.error) {
          throw new Error(
            response.error_message || "Failed to fetch transaction"
          );
        }

        const tx = response.data.items[0];
        setTransaction({
          blockHeight: tx.block_height,
          blockSignedAt: tx.block_signed_at,
          fromAddress: tx.from_address,
          toAddress: tx.to_address,
          value: tx.value,
          gasSpent: tx.gas_spent,
          gasPrice: tx.gas_price,
          successful: tx.successful,
          tokenTransfers: tx.token_transfers?.map((transfer) => ({
            fromAddress: transfer.from_address,
            toAddress: transfer.to_address,
            tokenAddress: transfer.token_address,
            tokenName: transfer.token_name,
            tokenSymbol: transfer.token_symbol,
            tokenDecimals: transfer.token_decimals,
            amount: transfer.delta,
          })),
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch transaction"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [chain, txHash]);

  if (loading) {
    return (
      <Card className="p-6 space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-16 w-full" />
      </Card>
    );
  }

  if (error || !transaction) {
    return (
      <Card className="p-6">
        <div className="text-destructive">
          Error loading transaction: {error}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Transaction Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Transaction Details</h2>
          <Badge variant={transaction.successful ? "success" : "destructive"}>
            {transaction.successful ? "Success" : "Failed"}
          </Badge>
        </div>

        {/* Transaction Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">From</p>
            <p className="font-mono">{transaction.fromAddress}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">To</p>
            <p className="font-mono">{transaction.toAddress}</p>
          </div>
        </div>

        {/* Value and Gas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Value</p>
            <p className="font-medium">
              {formatEther(BigInt(transaction.value))} ETH
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Gas Used</p>
            <p className="font-medium">{transaction.gasSpent}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Gas Price</p>
            <p className="font-medium">
              {formatUnits(BigInt(transaction.gasPrice), 9)} Gwei
            </p>
          </div>
        </div>

        {/* Token Transfers */}
        {transaction.tokenTransfers &&
          transaction.tokenTransfers.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Token Transfers</h3>
              <div className="space-y-3">
                {transaction.tokenTransfers.map((transfer, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-3 bg-muted rounded-lg"
                  >
                    <ArrowRightLeft className="w-5 h-5" />
                    <div className="flex-1">
                      <p className="font-medium">
                        {formatUnits(
                          BigInt(transfer.amount),
                          transfer.tokenDecimals
                        )}{" "}
                        {transfer.tokenSymbol}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {transfer.tokenName}
                      </p>
                    </div>
                    <div className="text-sm font-mono text-muted-foreground">
                      {transfer.fromAddress.slice(0, 6)}...
                      {transfer.fromAddress.slice(-4)} →{" "}
                      {transfer.toAddress.slice(0, 6)}...
                      {transfer.toAddress.slice(-4)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Block Info */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>Block #{transaction.blockHeight}</span>
          <span>•</span>
          <span>{new Date(transaction.blockSignedAt).toLocaleString()}</span>
          <a
            href={`https://etherscan.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto flex items-center gap-1 hover:text-foreground"
          >
            View on Etherscan
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </Card>
  );
}
