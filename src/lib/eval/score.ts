/**
 * Talaan Deterministic Evaluation Scoring Engine (T-008)
 *
 * Pure integer-centavo and normalized string scoring for notebook page extractions.
 * Zero LLM calls. Enforces official Meta Muse Glimmer 30B provenance watermarking.
 */

import { toCentavos } from "@/lib/ledger/math";

export interface EvalGroundTruthEntry {
  customer_name: string;
  item: string;
  quantity: number | null;
  unit_price: number | null;
  amount: number;
  entry_type: "credit" | "payment" | "cash";
  line_discrepancy: boolean;
}

export interface EvalGroundTruthPage {
  page_id: string;
  category: "clean" | "discrepancy" | "unreadable";
  unreadable: boolean;
  written_total: number | null;
  expected_computed_total: number;
  has_page_discrepancy: boolean;
  entries: EvalGroundTruthEntry[];
}

export interface EvalCandidateEntry {
  customer_name: string;
  item: string;
  quantity: number | null;
  unit_price: number | null;
  amount: number;
  entry_type: "credit" | "payment" | "cash";
  confidence: number;
  line_discrepancy: boolean;
  needs_review: boolean;
}

export interface EvalCandidateExtraction {
  unreadable: boolean;
  written_total: number | null;
  computed_total: number;
  has_page_discrepancy: boolean;
  entries: EvalCandidateEntry[];
}

export interface DiscrepancyConfusion {
  tp: number;
  fp: number;
  fn: number;
  tn: number;
}

export interface PageScoreResult {
  page_id: string;
  category: "clean" | "discrepancy" | "unreadable";
  unreadableCorrect: boolean;
  expectedEntryCount: number;
  extractedEntryCount: number;
  matchedCustomerCount: number;
  matchedItemCount: number;
  matchedAmountCount: number;
  exactRowMatchCount: number;
  writtenTotalMatched: boolean;
  computedTotalMatched: boolean;
  discrepancyConfusion: DiscrepancyConfusion;
  flaggedForReviewCount: number;
  latencyMs: number;
}

export interface EvalRunMetadata {
  model: string;
  provider: string;
  isOfficialMuseGlimmer: boolean;
  datasetDir: string;
}

export interface AggregateEvalReport {
  timestamp: string;
  model: string;
  provider: string;
  isOfficialMuseGlimmer: boolean;
  watermark: string;
  datasetDir: string;
  totalPages: number;
  metrics: {
    customerNameAccuracy: number;
    itemAccuracy: number;
    amountAccuracy: number;
    exactRowMatchRate: number;
    writtenTotalAccuracy: number;
    computedTotalAccuracy: number;
    unreadableDetectionAccuracy: number;
    discrepancyRecall: number;
    discrepancyPrecision: number;
    reviewFlagRate: number;
  };
  latency: {
    meanMs: number;
    p50Ms: number;
    p95Ms: number;
  };
  pages: PageScoreResult[];
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isCustomerMatch(expected: string, actual: string): boolean {
  const normExpected = normalizeText(expected);
  const normActual = normalizeText(actual);
  if (!normExpected || !normActual) return false;
  return (
    normExpected === normActual ||
    normActual.includes(normExpected) ||
    normExpected.includes(normActual)
  );
}

function isItemMatch(expected: string, actual: string): boolean {
  const normExpected = normalizeText(expected);
  const normActual = normalizeText(actual);
  if (!normExpected || !normActual) return false;
  if (normExpected === normActual || normActual.includes(normExpected) || normExpected.includes(normActual)) {
    return true;
  }
  const expectedTokens = normExpected.split(" ").filter((t) => t.length >= 3);
  if (expectedTokens.length === 0) return false;
  const matchedTokens = expectedTokens.filter((t) => normActual.includes(t));
  return matchedTokens.length / expectedTokens.length >= 0.6;
}

function isAmountMatch(expected: number | null, actual: number | null): boolean {
  if (expected === null && actual === null) return true;
  if (expected === null || actual === null) return false;
  return toCentavos(expected) === toCentavos(actual);
}

function updateConfusion(
  confusion: DiscrepancyConfusion,
  expectedPositive: boolean,
  actualPositive: boolean
): void {
  if (expectedPositive && actualPositive) confusion.tp += 1;
  else if (!expectedPositive && actualPositive) confusion.fp += 1;
  else if (expectedPositive && !actualPositive) confusion.fn += 1;
  else confusion.tn += 1;
}

/**
 * Scores a single candidate page extraction against ground truth.
 */
export function scorePageExtraction(
  truth: EvalGroundTruthPage,
  candidate: EvalCandidateExtraction,
  latencyMs: number
): PageScoreResult {
  const unreadableCorrect = truth.unreadable === candidate.unreadable;
  const writtenTotalMatched = isAmountMatch(truth.written_total, candidate.written_total);
  const computedTotalMatched = isAmountMatch(
    truth.expected_computed_total,
    candidate.computed_total
  );

  const confusion: DiscrepancyConfusion = { tp: 0, fp: 0, fn: 0, tn: 0 };

  if (!truth.unreadable) {
    updateConfusion(confusion, truth.has_page_discrepancy, candidate.has_page_discrepancy);
  }

  const usedCandidateIndices = new Set<number>();
  let matchedCustomerCount = 0;
  let matchedItemCount = 0;
  let matchedAmountCount = 0;
  let exactRowMatchCount = 0;

  for (const expectedRow of truth.entries) {
    let bestIdx = -1;
    let bestScore = -1;

    for (let i = 0; i < candidate.entries.length; i++) {
      if (usedCandidateIndices.has(i)) continue;
      const candRow = candidate.entries[i];
      let rowPoints = 0;
      if (isCustomerMatch(expectedRow.customer_name, candRow.customer_name)) rowPoints += 2;
      if (isItemMatch(expectedRow.item, candRow.item)) rowPoints += 2;
      if (isAmountMatch(expectedRow.amount, candRow.amount)) rowPoints += 3;
      if (expectedRow.entry_type === candRow.entry_type) rowPoints += 1;

      if (rowPoints > bestScore) {
        bestScore = rowPoints;
        bestIdx = i;
      }
    }

    if (bestIdx >= 0) {
      usedCandidateIndices.add(bestIdx);
      const candRow = candidate.entries[bestIdx];
      const custOk = isCustomerMatch(expectedRow.customer_name, candRow.customer_name);
      const itemOk = isItemMatch(expectedRow.item, candRow.item);
      const amtOk = isAmountMatch(expectedRow.amount, candRow.amount);

      if (custOk) matchedCustomerCount += 1;
      if (itemOk) matchedItemCount += 1;
      if (amtOk) matchedAmountCount += 1;
      if (custOk && itemOk && amtOk) exactRowMatchCount += 1;

      updateConfusion(confusion, expectedRow.line_discrepancy, candRow.line_discrepancy);
    } else {
      updateConfusion(confusion, expectedRow.line_discrepancy, false);
    }
  }

  const flaggedForReviewCount = candidate.entries.filter(
    (e) => e.needs_review || e.confidence < 0.75
  ).length;

  return {
    page_id: truth.page_id,
    category: truth.category,
    unreadableCorrect,
    expectedEntryCount: truth.entries.length,
    extractedEntryCount: candidate.entries.length,
    matchedCustomerCount,
    matchedItemCount,
    matchedAmountCount,
    exactRowMatchCount,
    writtenTotalMatched,
    computedTotalMatched,
    discrepancyConfusion: confusion,
    flaggedForReviewCount,
    latencyMs,
  };
}

function computePercentile(sortedValues: number[], percentile: number): number {
  if (sortedValues.length === 0) return 0;
  const idx = Math.max(
    0,
    Math.min(sortedValues.length - 1, Math.ceil((percentile / 100) * sortedValues.length) - 1)
  );
  return Math.round(sortedValues[idx]);
}

function safeRatio(numerator: number, denominator: number): number {
  if (denominator === 0) return 1;
  return Number((numerator / denominator).toFixed(4));
}

/**
 * Aggregates per-page scores into a single watermarked evaluation report.
 */
export function aggregateEvalReport(
  pages: PageScoreResult[],
  metadata: EvalRunMetadata
): AggregateEvalReport {
  const isOfficial =
    metadata.isOfficialMuseGlimmer &&
    metadata.provider === "glimmer" &&
    metadata.model === "muse-glimmer";

  const watermark = isOfficial
    ? "OFFICIAL META MUSE GLIMMER 30B EVALUATION"
    : `DRY RUN — AUXILIARY DEV BACKUP (NOT MUSE GLIMMER) [provider=${metadata.provider}, model=${metadata.model}]`;

  const totalPages = pages.length;
  let totalExpectedEntries = 0;
  let totalExtractedEntries = 0;
  let totalMatchedCustomer = 0;
  let totalMatchedItem = 0;
  let totalMatchedAmount = 0;
  let totalExactRows = 0;
  let totalWrittenMatched = 0;
  let totalComputedMatched = 0;
  let totalUnreadableCorrect = 0;
  let totalFlagged = 0;

  let tp = 0;
  let fp = 0;
  let fn = 0;

  for (const p of pages) {
    totalExpectedEntries += p.expectedEntryCount;
    totalExtractedEntries += p.extractedEntryCount;
    totalMatchedCustomer += p.matchedCustomerCount;
    totalMatchedItem += p.matchedItemCount;
    totalMatchedAmount += p.matchedAmountCount;
    totalExactRows += p.exactRowMatchCount;
    if (p.writtenTotalMatched) totalWrittenMatched += 1;
    if (p.computedTotalMatched) totalComputedMatched += 1;
    if (p.unreadableCorrect) totalUnreadableCorrect += 1;
    totalFlagged += p.flaggedForReviewCount;
    tp += p.discrepancyConfusion.tp;
    fp += p.discrepancyConfusion.fp;
    fn += p.discrepancyConfusion.fn;
  }

  const latencies = pages.map((p) => p.latencyMs).sort((a, b) => a - b);
  const meanMs =
    latencies.length > 0
      ? Math.round(latencies.reduce((acc, v) => acc + v, 0) / latencies.length)
      : 0;

  return {
    timestamp: new Date().toISOString(),
    model: metadata.model,
    provider: metadata.provider,
    isOfficialMuseGlimmer: isOfficial,
    watermark,
    datasetDir: metadata.datasetDir,
    totalPages,
    metrics: {
      customerNameAccuracy: safeRatio(totalMatchedCustomer, totalExpectedEntries),
      itemAccuracy: safeRatio(totalMatchedItem, totalExpectedEntries),
      amountAccuracy: safeRatio(totalMatchedAmount, totalExpectedEntries),
      exactRowMatchRate: safeRatio(totalExactRows, totalExpectedEntries),
      writtenTotalAccuracy: safeRatio(totalWrittenMatched, totalPages),
      computedTotalAccuracy: safeRatio(totalComputedMatched, totalPages),
      unreadableDetectionAccuracy: safeRatio(totalUnreadableCorrect, totalPages),
      discrepancyRecall: safeRatio(tp, tp + fn),
      discrepancyPrecision: safeRatio(tp, tp + fp),
      reviewFlagRate:
        totalExtractedEntries > 0
          ? Number((totalFlagged / totalExtractedEntries).toFixed(4))
          : 0,
    },
    latency: {
      meanMs,
      p50Ms: computePercentile(latencies, 50),
      p95Ms: computePercentile(latencies, 95),
    },
    pages,
  };
}
