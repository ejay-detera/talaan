import { checkRowDiscrepancy, computePageTotals, type PageTotalComputation } from "./math";
import type { ExtractedRow } from "@/types/ledger";

/**
 * Labeled synthetic sample notebook page for Talaan's landing page visual proof.
 * Grounding: synthetic demo data per docs/grounding.md and foundation.md §9.2.
 */

export const LANDING_SAMPLE_WRITTEN_TOTAL = 216.0;

export const LANDING_RAW_ROWS: ExtractedRow[] = [
  {
    customer: "Mang Jose",
    item: "2x Argentina Corned Beef 175g",
    quantity: 2,
    unit_price: 38.0,
    amount: 76.0,
    entry_type: "credit",
    confidence: 0.96,
    needs_review: false,
    line_discrepancy: checkRowDiscrepancy(2, 38.0, 76.0),
  },
  {
    customer: "Ate Baby",
    item: "3x Lucky Me Pancit Canton",
    quantity: 3,
    unit_price: 12.0,
    amount: 46.0, // Handwritten error: 3 * 12 is 36, written 46
    entry_type: "credit",
    confidence: 0.91,
    needs_review: true,
    line_discrepancy: checkRowDiscrepancy(3, 12.0, 46.0),
  },
  {
    customer: "Nanay Cora",
    item: "1x Silver Swan Soy Sauce + suka",
    quantity: 1,
    unit_price: 54.0,
    amount: 54.0,
    entry_type: "credit",
    confidence: 0.74, // Low confidence: needs review highlight
    needs_review: true,
    line_discrepancy: checkRowDiscrepancy(1, 54.0, 54.0),
  },
  {
    customer: "Kuya Jun",
    item: "2x Kopiko Brown Twin Pack",
    quantity: 2,
    unit_price: 20.0,
    amount: 40.0,
    entry_type: "credit",
    confidence: 0.95,
    needs_review: false,
    line_discrepancy: checkRowDiscrepancy(2, 20.0, 40.0),
  },
];

/**
 * Reconciled version of the rows where Ate Baby's row multiplication
 * error (3 * 12 = 46 -> 36) has been resolved by deterministic code.
 */
export const LANDING_RECONCILED_ROWS: ExtractedRow[] = LANDING_RAW_ROWS.map((row) => {
  if (row.customer === "Ate Baby" && row.quantity && row.unit_price) {
    return {
      ...row,
      amount: row.quantity * row.unit_price, // 36.00
      line_discrepancy: true, // preserves mark of caught error
    };
  }
  return row;
});

export function getLandingProofTotals(reconciled = true): PageTotalComputation {
  const rowsToSum = reconciled ? LANDING_RECONCILED_ROWS : LANDING_RAW_ROWS;
  return computePageTotals(rowsToSum, LANDING_SAMPLE_WRITTEN_TOTAL);
}
