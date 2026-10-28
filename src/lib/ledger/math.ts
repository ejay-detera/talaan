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

export interface CustomerBalanceComputation {
  balance: number;
  totalCredit: number;
  totalPayment: number;
}

/**
 * Computes deterministic customer balance in integer centavos from confirmed entries only:
 * sum(credit) - sum(payment). Ignores cash_sale and unconfirmed rows.
 */
export function computeCustomerBalance(
  entries: Array<{ amount: number; entry_type: string; confirmed_by_user?: boolean }>
): CustomerBalanceComputation {
  let creditCentavos = 0;
  let paymentCentavos = 0;

  for (const entry of entries) {
    if (entry.confirmed_by_user !== true) {
      continue;
    }
    if (entry.entry_type === "credit") {
      creditCentavos += toCentavos(entry.amount);
    } else if (entry.entry_type === "payment") {
      paymentCentavos += toCentavos(entry.amount);
    }
  }

  const balanceCentavos = creditCentavos - paymentCentavos;

  return {
    balance: toPesos(balanceCentavos),
    totalCredit: toPesos(creditCentavos),
    totalPayment: toPesos(paymentCentavos),
  };
}
