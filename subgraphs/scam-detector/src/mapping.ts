import {
  ScamReported,
  EvidenceSubmitted,
  PatternDetected,
} from "../generated/ScamDetector/ScamDetector";
import {
  ScamReport,
  Evidence,
  ScamPattern,
  DetectedPattern,
  ScammerAddress,
} from "../generated/schema";
import { BigInt, Bytes, store, BigDecimal } from "@graphprotocol/graph-ts";

export function handleScamReported(event: ScamReported): void {
  let report = new ScamReport(event.params.reportId.toHexString());
  report.timestamp = event.block.timestamp;
  report.reporter = event.params.reporter;
  report.scamType = event.params.scamType;
  report.severity = getSeverityString(event.params.severity);
  report.confidence = BigDecimal.fromString("0");
  report.address = event.params.scammerAddress;
  report.chain = event.params.chain;
  report.description = event.params.description;
  report.status = "Pending";
  report.votes = BigInt.fromI32(1);
  report.save();

  // Update or create scammer address entity
  let scammer = ScammerAddress.load(event.params.scammerAddress.toHexString());
  if (!scammer) {
    scammer = new ScammerAddress(event.params.scammerAddress.toHexString());
    scammer.address = event.params.scammerAddress;
    scammer.firstSeen = event.block.timestamp;
    scammer.totalScams = BigInt.fromI32(1);
    scammer.riskScore = BigDecimal.fromString("0.5");
  } else {
    scammer.totalScams = scammer.totalScams.plus(BigInt.fromI32(1));
    scammer.riskScore = calculateRiskScore(scammer.totalScams);
  }
  scammer.lastSeen = event.block.timestamp;
  scammer.save();
}

export function handleEvidenceSubmitted(event: EvidenceSubmitted): void {
  let evidence = new Evidence(event.transaction.hash.toHexString());
  evidence.scamReport = event.params.reportId.toHexString();
  evidence.evidenceType = event.params.evidenceType;
  evidence.data = event.params.data.toString();
  evidence.timestamp = event.block.timestamp;
  evidence.submitter = event.transaction.from;
  evidence.save();
}

export function handlePatternDetected(event: PatternDetected): void {
  let pattern = new DetectedPattern(event.transaction.hash.toHexString());
  pattern.timestamp = event.block.timestamp;
  pattern.pattern = event.params.patternId.toHexString();
  pattern.transaction = event.params.transaction;
  pattern.confidence = BigDecimal.fromString(
    event.params.confidence.toString()
  ).div(BigDecimal.fromString("100"));
  pattern.save();

  // Update pattern frequency
  let scamPattern = ScamPattern.load(event.params.patternId.toHexString());
  if (scamPattern) {
    scamPattern.frequency = scamPattern.frequency.plus(BigInt.fromI32(1));
    scamPattern.lastSeen = event.block.timestamp;
    scamPattern.save();
  }
}

function getSeverityString(severity: i32): string {
  switch (severity) {
    case 0:
      return "Low";
    case 1:
      return "Medium";
    case 2:
      return "High";
    default:
      return "Unknown";
  }
}

function calculateRiskScore(totalScams: BigInt): BigDecimal {
  let score = BigDecimal.fromString(totalScams.toString()).div(
    BigDecimal.fromString("10")
  );
  return score.gt(BigDecimal.fromString("1"))
    ? BigDecimal.fromString("1")
    : score;
}
