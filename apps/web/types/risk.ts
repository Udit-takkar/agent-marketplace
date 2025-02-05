export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  riskScore: number;
  riskFactors: RiskFactors;
  metadata: TransactionMetadata;
  psychologicalProfile?: PsychologicalProfile;
}

export interface RiskFactors {
  knownScamAddress: boolean;
  unusualAmount: boolean;
  highFrequencyTrading: boolean;
  newWalletAddress: boolean;
  contractInteraction: boolean;
  rapidAssetMovement: boolean;
  phishingPattern: boolean;
  rugPullIndicators: boolean;
  pumpAndDumpPattern: boolean;
}

export interface TransactionMetadata {
  tokenTransfers: TokenTransfer[];
  contractCalls: ContractCall[];
  historicalVolume: number;
  addressReputation: AddressReputation;
}

export interface TokenTransfer {
  token: string;
  amount: string;
  value: string;
  direction: "in" | "out";
}

export interface ContractCall {
  contract: string;
  method: string;
  args: any[];
  isVerified: boolean;
}

export interface AddressReputation {
  score: number;
  age: number;
  totalTransactions: number;
  uniqueInteractions: number;
  riskFlags: string[];
}

export interface RiskAssessment {
  overallScore: number;
  confidence: number;
  factors: RiskFactors;
  analysis: {
    patternMatching: PatternAnalysis;
    volumeAnalysis: VolumeAnalysis;
    reputationAnalysis: ReputationAnalysis;
    psychologicalAnalysis: PsychologicalProfile;
  };
  recommendations: string[];
  metadata: TransactionMetadata;
}

export interface PatternAnalysis {
  matchedPatterns: string[];
  confidence: number;
  details: string[];
}

export interface VolumeAnalysis {
  historicalAverage: number;
  deviation: number;
  isUnusual: boolean;
}

export interface ReputationAnalysis {
  senderScore: number;
  receiverScore: number;
  riskFactors: string[];
}

export interface PsychologicalProfile {
  tradingPatterns: {
    fomo: number;
    panicSelling: number;
    overtrading: number;
    emotionalTrading: number;
  };
  riskTolerance: number;
  biases: {
    confirmationBias: number;
    lossAversion: number;
    overconfidence: number;
    anchoringBias: number;
  };
  recommendations: string[];
}

export interface TradingBehavior {
  pattern: string;
  confidence: number;
  timeframe: string;
  indicators: {
    frequency: number;
    intensity: number;
    consistency: number;
  };
  relatedTransactions: string[];
}

export interface BehavioralMetrics {
  riskAppetite: number;
  decisionSpeed: number;
  recoveryPattern: string;
  adaptability: number;
  emotionalStability: number;
}

export interface MarketContext {
  sentiment: "bullish" | "bearish" | "neutral";
  volatility: number;
  trendStrength: number;
  marketPhase: "accumulation" | "distribution" | "markup" | "markdown";
}

export interface Alert {
  id: string;
  type: "high-risk" | "suspicious" | "info";
  title: string;
  description: string;
  timestamp: number;
  transaction: Transaction;
}
