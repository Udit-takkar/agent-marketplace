"use client";

import { Card } from "@workspace/ui/components/card";
import { Activity, ArrowRight } from "lucide-react";

interface TransactionMonitorProps {
  trades?: any[];
  summary?: any;
}

export function TransactionMonitor({
  trades,
  summary,
}: TransactionMonitorProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Activity className="h-6 w-6 text-blue-500" />
        <h2 className="text-xl font-semibold">Transaction Monitor</h2>
      </div>

      {trades?.length ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Monitoring Period</p>
              <p className="font-medium">
                {summary?.timespan?.start
                  ? `${new Date(summary.timespan.start).toLocaleDateString()} - ${new Date(summary.timespan.end).toLocaleDateString()}`
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Volume</p>
              <p className="font-medium">
                {trades
                  .reduce((sum, trade) => sum + Number(trade.tokenIn.amount), 0)
                  .toFixed(2)}{" "}
                transactions
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {trades.slice(0, 3).map((trade, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex items-center space-x-2">
                  <div className="font-medium">{trade.tokenIn.symbol}</div>
                  <ArrowRight className="h-4 w-4" />
                  <div className="font-medium">{trade.tokenOut.symbol}</div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {new Date(trade.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-muted-foreground">No transactions to monitor</p>
      )}
    </Card>
  );
}
