"use client";

import { Card } from "@workspace/ui/components/card";
import { AlertTriangle, AlertCircle } from "lucide-react";

interface RecentAlertsProps {
  trades?: any[];
}

export function RecentAlerts({ trades }: RecentAlertsProps) {
  const generateAlerts = () => {
    if (!trades?.length) return [];

    return trades
      .slice(0, 5)
      .map((trade) => ({
        type: trade.tokenIn.amount > 1e18 ? "high_value" : "normal",
        message: `${trade.dex} trade: ${trade.tokenIn.symbol} → ${trade.tokenOut.symbol}`,
        timestamp: new Date(trade.timestamp),
      }))
      .filter((alert) => alert.type === "high_value");
  };

  const alerts = generateAlerts();

  return (
    <Card className="p-6">
      <div className="flex items-center space-x-2 mb-4">
        <AlertCircle className="h-6 w-6 text-yellow-500" />
        <h2 className="text-xl font-semibold">Recent Alerts</h2>
      </div>
      {alerts.length > 0 ? (
        <div className="space-y-4">
          {alerts.map((alert, index) => (
            <div
              key={index}
              className="flex items-start space-x-2 p-3 rounded-lg border"
            >
              <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div>
                <p className="font-medium">{alert.message}</p>
                <p className="text-sm text-muted-foreground">
                  {alert.timestamp.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No recent alerts</p>
      )}
    </Card>
  );
}

export interface RiskAssessment {
  overallRisk: number;
  confidence: number;
  riskFactors: {
    realTimeAnalysis: {
      unusualAmount: boolean;
      knownScamAddress: boolean;
      suspiciousPattern: boolean;
    };
    historicalAnalysis: {
      addressReputation: number;
      similarScamPatterns: number;
      velocityChecks: boolean;
    };
  };
  recommendations: string[];
}

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  riskScore: number;
  timestamp: number;
}
