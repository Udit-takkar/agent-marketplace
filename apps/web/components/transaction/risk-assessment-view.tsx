"use client";

import { useEffect, useState } from "react";
import { Card } from "@workspace/ui/components/card";
import { Progress } from "@workspace/ui/components/progress";
import { Badge } from "@workspace/ui/components/badge";
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@workspace/ui/components/alert";
import { riskAssessmentWorkflow } from "@/lib/services/ai-agent-service";
import {
  AlertCircle,
  ShieldCheck,
  Brain,
  Gauge,
  TrendingUp,
  Shield,
  Activity,
  AlertTriangle,
} from "lucide-react";

interface RiskAssessmentViewProps {
  transactionHash: string;
  chain: string;
}

export function RiskAssessmentView({
  transactionHash,
  chain,
}: RiskAssessmentViewProps) {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const analyzeTransaction = async () => {
      try {
        setLoading(true);
        const analysisResult = await riskAssessmentWorkflow.execute({
          chain: chain,
          hash: transactionHash,
        });

        if (!analysisResult.success) {
          throw new Error(analysisResult.error || "Analysis failed");
        }

        setResult(analysisResult);
      } catch (error) {
        console.error("Error analyzing transaction:", error);
        setError(error instanceof Error ? error.message : "Analysis failed");
      } finally {
        setLoading(false);
      }
    };

    analyzeTransaction();
  }, [transactionHash, chain]);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center space-x-2">
          <Brain className="animate-pulse" />
          <span>Analyzing trading psychology and patterns...</span>
        </div>
      </Card>
    );
  }

  if (error || !result) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error ||
            "Unable to analyze trading behavior. Please try again later."}
        </AlertDescription>
      </Alert>
    );
  }

  const {
    tradingPattern,
    marketSentiment,
    volumeAnalysis,
    reputationAnalysis,
  } = result;

  return (
    <div className="space-y-4">
      {/* Trading Pattern Analysis */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Trading Psychology Analysis</h3>
          <Badge
            variant={
              tradingPattern.riskLevel.riskScore > 50
                ? "destructive"
                : "default"
            }
            className="text-sm"
          >
            {tradingPattern.riskLevel.riskScore > 50 ? (
              <AlertCircle className="w-4 h-4 mr-1" />
            ) : (
              <ShieldCheck className="w-4 h-4 mr-1" />
            )}
            Risk Score: {Math.round(tradingPattern.riskLevel.riskScore)}
          </Badge>
        </div>

        <Progress value={tradingPattern.riskLevel.riskScore} className="mb-4" />

        {/* Market Sentiment */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Market Sentiment</p>
            <div className="flex items-center space-x-2">
              <Gauge className="w-4 h-4" />
              <p className="font-medium capitalize">
                {marketSentiment.marketSentiment.overall}
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Trading Style</p>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <p className="font-medium capitalize">
                {tradingPattern.tradingStyle.type}
              </p>
            </div>
          </div>
        </div>

        {/* Emotional Metrics */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-sm text-muted-foreground">FOMO Level</p>
            <Progress
              value={marketSentiment.emotionalBias.fomo * 100}
              className="mt-2"
            />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Fear Level</p>
            <Progress
              value={marketSentiment.emotionalBias.fearLevel * 100}
              className="mt-2"
            />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Greed Index</p>
            <Progress
              value={marketSentiment.emotionalBias.greedIndex * 100}
              className="mt-2"
            />
          </div>
        </div>

        {/* Volume Analysis */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Volume Profile</p>
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4" />
              <p className="font-medium capitalize">
                {volumeAnalysis.volumeProfile.size} (
                {volumeAnalysis.volumeProfile.impact} impact)
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Security Level</p>
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <p className="font-medium capitalize">
                {reputationAnalysis.securityMetrics.riskLevel}
              </p>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {marketSentiment.marketTiming.recommendations.length > 0 && (
          <Alert className="mt-4">
            <Brain className="h-4 w-4" />
            <AlertTitle>Trading Psychology Insights</AlertTitle>
            <AlertDescription>
              <ul className="list-disc pl-4 mt-2">
                {marketSentiment.marketTiming.recommendations.map(
                  (rec: string, index: number) => (
                    <li key={index}>{rec}</li>
                  )
                )}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Risk Factors */}
        {reputationAnalysis.riskFactors.length > 0 && (
          <Alert variant="destructive" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle variant="default">Risk Factors</AlertTitle>
            <AlertDescription>
              <ul className="list-disc pl-4 mt-2">
                {reputationAnalysis.riskFactors.map(
                  (factor: string, index: number) => (
                    <li key={index}>{factor}</li>
                  )
                )}
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </Card>
    </div>
  );
}
