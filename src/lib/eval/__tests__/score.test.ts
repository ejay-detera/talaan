import { describe, expect, it } from "vitest";
import {
  scorePageExtraction,
  aggregateEvalReport,
  type EvalGroundTruthPage,
  type EvalCandidateExtraction,
} from "../score";

describe("scorePageExtraction (T-008)", () => {
  const baseTruth: EvalGroundTruthPage = {
    page_id: "page-01",
    category: "clean",
    unreadable: false,
    written_total: 112.0,
    expected_computed_total: 112.0,
    has_page_discrepancy: false,
    entries: [
      {
        customer_name: "Mang Jose",
        item: "corned beef",
        quantity: 2,
        unit_price: 38.0,
        amount: 76.0,
        entry_type: "credit",
        line_discrepancy: false,
      },
      {
        customer_name: "Ate Baby",
        item: "pancit canton",
        quantity: 3,
        unit_price: 12.0,
        amount: 36.0,
        entry_type: "credit",
        line_discrepancy: false,
      },
    ],
  };

  it("scores 100% accuracy on exact match with normalized names and centavo-exact amounts", () => {
    const candidate: EvalCandidateExtraction = {
      unreadable: false,
      written_total: 112.0,
      computed_total: 112.0,
      has_page_discrepancy: false,
      entries: [
        {
          customer_name: "mang jose ",
          item: "2x Corned Beef",
          quantity: 2,
          unit_price: 38.0,
          amount: 76.0,
          entry_type: "credit",
          confidence: 0.95,
          line_discrepancy: false,
          needs_review: false,
        },
        {
          customer_name: "ATE BABY",
          item: "Pancit Canton",
          quantity: 3,
          unit_price: 12.0,
          amount: 36.0,
          entry_type: "credit",
          confidence: 0.92,
          line_discrepancy: false,
          needs_review: false,
        },
      ],
    };

    const score = scorePageExtraction(baseTruth, candidate, 1450);

    expect(score.page_id).toBe("page-01");
    expect(score.unreadableCorrect).toBe(true);
    expect(score.expectedEntryCount).toBe(2);
    expect(score.extractedEntryCount).toBe(2);
    expect(score.matchedCustomerCount).toBe(2);
    expect(score.matchedItemCount).toBe(2);
    expect(score.matchedAmountCount).toBe(2);
    expect(score.exactRowMatchCount).toBe(2);
    expect(score.writtenTotalMatched).toBe(true);
    expect(score.computedTotalMatched).toBe(true);
    expect(score.discrepancyConfusion).toEqual({ tp: 0, fp: 0, fn: 0, tn: 3 });
    expect(score.flaggedForReviewCount).toBe(0);
    expect(score.latencyMs).toBe(1450);
  });

  it("detects true-positive row and page discrepancies and counts review flags", () => {
    const truthWithDiscrepancy: EvalGroundTruthPage = {
      page_id: "page-16",
      category: "discrepancy",
      unreadable: false,
      written_total: 120.0,
      expected_computed_total: 110.0,
      has_page_discrepancy: true,
      entries: [
        {
          customer_name: "Nanay Cora",
          item: "bigas 2kg",
          quantity: 2,
          unit_price: 55.0,
          amount: 120.0,
          entry_type: "credit",
          line_discrepancy: true,
        },
      ],
    };

    const candidate: EvalCandidateExtraction = {
      unreadable: false,
      written_total: 120.0,
      computed_total: 110.0,
      has_page_discrepancy: true,
      entries: [
        {
          customer_name: "Nanay Cora",
          item: "Bigas 2kg",
          quantity: 2,
          unit_price: 55.0,
          amount: 120.0,
          entry_type: "credit",
          confidence: 0.65,
          line_discrepancy: true,
          needs_review: true,
        },
      ],
    };

    const score = scorePageExtraction(truthWithDiscrepancy, candidate, 2100);
    expect(score.discrepancyConfusion).toEqual({ tp: 2, fp: 0, fn: 0, tn: 0 });
    expect(score.flaggedForReviewCount).toBe(1);
    expect(score.exactRowMatchCount).toBe(1);
  });

  it("scores unreadable pages accurately without penalizing empty entries", () => {
    const unreadableTruth: EvalGroundTruthPage = {
      page_id: "page-28",
      category: "unreadable",
      unreadable: true,
      written_total: null,
      expected_computed_total: 0,
      has_page_discrepancy: false,
      entries: [],
    };

    const candidate: EvalCandidateExtraction = {
      unreadable: true,
      written_total: null,
      computed_total: 0,
      has_page_discrepancy: false,
      entries: [],
    };

    const score = scorePageExtraction(unreadableTruth, candidate, 890);
    expect(score.unreadableCorrect).toBe(true);
    expect(score.expectedEntryCount).toBe(0);
    expect(score.writtenTotalMatched).toBe(true);
  });
});

describe("aggregateEvalReport (T-008)", () => {
  it("computes aggregate accuracy rates, discrepancy recall/precision, and latency percentiles", () => {
    const page1 = scorePageExtraction(
      {
        page_id: "page-01",
        category: "clean",
        unreadable: false,
        written_total: 50,
        expected_computed_total: 50,
        has_page_discrepancy: false,
        entries: [
          {
            customer_name: "Mang Jose",
            item: "kape",
            quantity: 5,
            unit_price: 10,
            amount: 50,
            entry_type: "credit",
            line_discrepancy: false,
          },
        ],
      },
      {
        unreadable: false,
        written_total: 50,
        computed_total: 50,
        has_page_discrepancy: false,
        entries: [
          {
            customer_name: "Mang Jose",
            item: "kape",
            quantity: 5,
            unit_price: 10,
            amount: 50,
            entry_type: "credit",
            confidence: 0.95,
            line_discrepancy: false,
            needs_review: false,
          },
        ],
      },
      1000
    );

    const page2 = scorePageExtraction(
      {
        page_id: "page-02",
        category: "discrepancy",
        unreadable: false,
        written_total: 90,
        expected_computed_total: 80,
        has_page_discrepancy: true,
        entries: [
          {
            customer_name: "Ate Baby",
            item: "mantika",
            quantity: 2,
            unit_price: 40,
            amount: 90,
            entry_type: "credit",
            line_discrepancy: true,
          },
        ],
      },
      {
        unreadable: false,
        written_total: 90,
        computed_total: 80,
        has_page_discrepancy: true,
        entries: [
          {
            customer_name: "Ate Baby",
            item: "mantika",
            quantity: 2,
            unit_price: 40,
            amount: 90,
            entry_type: "credit",
            confidence: 0.7,
            line_discrepancy: true,
            needs_review: true,
          },
        ],
      },
      3000
    );

    const report = aggregateEvalReport([page1, page2], {
      model: "muse-glimmer",
      provider: "glimmer",
      isOfficialMuseGlimmer: true,
      datasetDir: "eval/pages-30",
    });

    expect(report.totalPages).toBe(2);
    expect(report.isOfficialMuseGlimmer).toBe(true);
    expect(report.watermark).toBe("OFFICIAL META MUSE GLIMMER 30B EVALUATION");
    expect(report.metrics.customerNameAccuracy).toBe(1);
    expect(report.metrics.itemAccuracy).toBe(1);
    expect(report.metrics.amountAccuracy).toBe(1);
    expect(report.metrics.exactRowMatchRate).toBe(1);
    expect(report.metrics.discrepancyRecall).toBe(1);
    expect(report.metrics.discrepancyPrecision).toBe(1);
    expect(report.metrics.reviewFlagRate).toBe(0.5);
    expect(report.latency.meanMs).toBe(2000);
    expect(report.latency.p50Ms).toBe(1000);
    expect(report.latency.p95Ms).toBe(3000);
  });

  it("watermarks non-Glimmer runs as DRY RUN — AUXILIARY DEV BACKUP", () => {
    const report = aggregateEvalReport([], {
      model: "gemini-2.5-flash",
      provider: "gemini",
      isOfficialMuseGlimmer: false,
      datasetDir: "eval/pages-30",
    });

    expect(report.isOfficialMuseGlimmer).toBe(false);
    expect(report.watermark).toContain("DRY RUN — AUXILIARY DEV BACKUP (NOT MUSE GLIMMER)");
  });
});

