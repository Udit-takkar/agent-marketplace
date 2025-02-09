"use client";

import { useEffect, useState } from "react";
import { Card } from "@workspace/ui/components/card";
import { Progress } from "@workspace/ui/components/progress";
import { Gauge } from "lucide-react";

interface RiskMeterProps {
  profile?: any;
}

export function RiskMeter({ profile }: RiskMeterProps) {
  const getRiskScore = () => {
    if (!profile) return 0;

    switch (profile.riskProfile) {
      case "high_risk":
        return 90;
      case "medium_risk":
        return 50;
      case "conservative":
        return 20;
      default:
        return 0;
    }
  };

  const getRiskColor = () => {
    const score = getRiskScore();
    if (score >= 70) return "text-red-500";
    if (score >= 40) return "text-yellow-500";
    return "text-green-500";
  };

  return (
    <Card className="p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Gauge className={`h-6 w-6 ${getRiskColor()}`} />
        <h2 className="text-xl font-semibold">Risk Meter</h2>
      </div>
      <Progress value={getRiskScore()} className="mb-4" />
      <div className="text-sm text-muted-foreground">
        <p>
          Current Risk Level:{" "}
          <span className="font-medium capitalize">
            {profile?.riskProfile || "Not Available"}
          </span>
        </p>
        <p className="mt-2">
          Based on trading patterns and transaction history
        </p>
      </div>
    </Card>
  );
}
