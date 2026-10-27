import { describe, it, expect } from "vitest";
import {
  LANDING_SAMPLE_WRITTEN_TOTAL,
  LANDING_RAW_ROWS,
  LANDING_RECONCILED_ROWS,
  getLandingProofTotals,
} from "../sample-proof";
import { checkRowDiscrepancy } from "../math";

describe("T-004: Landing Page Synthetic Proof Dataset", () => {
  it("detects the row multiplication error on Row 2 (Ate Baby)", () => {
    const row2 = LANDING_RAW_ROWS[1];
    expect(row2.customer).toBe("Ate Baby");
    expect(row2.quantity).toBe(3);
    expect(row2.unit_price).toBe(12);
    expect(row2.amount).toBe(46);

    const hasMismatch = checkRowDiscrepancy(row2.quantity, row2.unit_price, row2.amount);
    expect(hasMismatch).toBe(true);
  });

  it("identifies row 3 (Nanay Cora) as low confidence requiring review", () => {
    const row3 = LANDING_RAW_ROWS[2];
    expect(row3.customer).toBe("Nanay Cora");
    expect(row3.confidence).toBeLessThan(0.8);
    expect(row3.needs_review).toBe(true);
  });

  it("calculates page discrepancy against written total with raw vs reconciled amounts", () => {
    expect(LANDING_SAMPLE_WRITTEN_TOTAL).toBe(216);

    const rawTotals = getLandingProofTotals(false);
    expect(rawTotals.computedTotal).toBe(216);
    expect(rawTotals.hasPageDiscrepancy).toBe(false);

    const reconciledTotals = getLandingProofTotals(true);
    // 76 + 36 + 54 + 40 = 206
    expect(reconciledTotals.computedTotal).toBe(206);
    expect(reconciledTotals.hasPageDiscrepancy).toBe(true);
    expect(reconciledTotals.discrepancyDiff).toBe(-10);
  });

  it("maintains centavo precision on reconciled rows", () => {
    expect(LANDING_RECONCILED_ROWS[1].amount).toBe(36);
    expect(LANDING_RECONCILED_ROWS[1].line_discrepancy).toBe(true);
  });
});
