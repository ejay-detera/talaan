/**
 * Exact integer-centavo arithmetic utilities.
 * All arithmetic in Talaan runs in deterministic TypeScript, never in the LLM.
 */

export function toCentavos(pesos: number): number {
  if (isNaN(pesos) || !isFinite(pesos)) {
    return 0;
  }
  return Math.round(pesos * 100);
}

export function toPesos(centavos: number): number {
  return Number((centavos / 100).toFixed(2));
}

/**
 * Checks whether row-level multiplication matches: quantity * unit_price === amount
 */
export function checkRowDiscrepancy(
  quantity?: number,
  unitPrice?: number,
  amount = 0
): boolean {
  if (quantity === undefined || quantity === null || unitPrice === undefined || unitPrice === null) {
    return false;
  }
  const expectedCentavos = Math.round(quantity * toCentavos(unitPrice));
  const actualCentavos = toCentavos(amount);
  return expectedCentavos !== actualCentavos;
}

export interface PageTotalComputation {
  computedTotal: number;
  hasPageDiscrepancy: boolean;
  discrepancyDiff: number;
}

/**
 * Recomputes the total from rows and checks against written_total.
 */
export function computePageTotals(
  rows: Array<{ amount: number; entry_type: "credit" | "payment" | "cash_sale" }>,
  writtenTotal?: number
): PageTotalComputation {
  let computedCentavos = 0;
  for (const row of rows) {
    if (row.entry_type === "payment") {
      computedCentavos -= toCentavos(row.amount);
    } else {
      computedCentavos += toCentavos(row.amount);
    }
  }

  const computedTotal = toPesos(computedCentavos);

  if (writtenTotal === undefined || writtenTotal === null) {
    return {
      computedTotal,
      hasPageDiscrepancy: false,
      discrepancyDiff: 0,
    };
  }

  const writtenCentavos = toCentavos(writtenTotal);
  const diffCentavos = computedCentavos - writtenCentavos;
  const hasPageDiscrepancy = diffCentavos !== 0;

  return {
    computedTotal,
    hasPageDiscrepancy,
    discrepancyDiff: toPesos(diffCentavos),
  };
}
