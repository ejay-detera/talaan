import { describe, it, expect } from "vitest";
import {
  toCentavos,
  toPesos,
  checkRowDiscrepancy,
  computePageTotals,
  computeCustomerBalance,
} from "../math";

describe("T-003: Integer-Centavo Math & Row Discrepancy", () => {
  it("converts peso amounts to integer centavos without floating-point drift", () => {
    expect(toCentavos(12.5)).toBe(1250);
    expect(toCentavos(12.1)).toBe(1210);
    expect(toCentavos(0.1 + 0.2)).toBe(30); // Classical IEEE 754 float drift
    expect(toCentavos(0)).toBe(0);
    expect(toCentavos(NaN)).toBe(0);
    expect(toCentavos(Infinity)).toBe(0);
  });

  it("converts integer centavos back to exact decimal pesos", () => {
    expect(toPesos(1250)).toBe(12.5);
    expect(toPesos(30)).toBe(0.3);
    expect(toPesos(0)).toBe(0);
  });

  it("identifies row-level arithmetic: quantity * unit_price === amount", () => {
    // Exact match: 3 * 12.10 = 36.30
    expect(checkRowDiscrepancy(3, 12.1, 36.3)).toBe(false);

    // Exact match: 5 * 25.00 = 125.00
    expect(checkRowDiscrepancy(5, 25.0, 125.0)).toBe(false);

    // Arithmetic discrepancy: 3 * 12.00 != 40.00 (planted error)
    expect(checkRowDiscrepancy(3, 12.0, 40.0)).toBe(true);

    // Arithmetic discrepancy: 2 * 15.50 != 30.00
    expect(checkRowDiscrepancy(2, 15.5, 30.0)).toBe(true);
  });

  it("returns false for row discrepancy when unit price or quantity is unwritten", () => {
    expect(checkRowDiscrepancy(undefined, 12.0, 36.0)).toBe(false);
    expect(checkRowDiscrepancy(3, undefined, 36.0)).toBe(false);
    expect(checkRowDiscrepancy(undefined, undefined, 36.0)).toBe(false);
  });
});

describe("T-004: Page Totals and Discrepancy Detection", () => {
  it("sums rows to computed total when written_total matches", () => {
    const rows = [
      { amount: 12.1, entry_type: "credit" as const },
      { amount: 24.2, entry_type: "credit" as const },
      { amount: 36.3, entry_type: "credit" as const },
    ];

    const result = computePageTotals(rows, 72.6);
    expect(result.computedTotal).toBe(72.6);
    expect(result.hasPageDiscrepancy).toBe(false);
    expect(result.discrepancyDiff).toBe(0);
  });

  it("flags page discrepancy when computed total does not match written total", () => {
    const rows = [
      { amount: 50.0, entry_type: "credit" as const },
      { amount: 75.0, entry_type: "credit" as const },
      { amount: 60.0, entry_type: "credit" as const },
    ]; // sum = 185.00

    // Store owner wrote 150.00 by mistake on notebook
    const result = computePageTotals(rows, 150.0);
    expect(result.computedTotal).toBe(185.0);
    expect(result.hasPageDiscrepancy).toBe(true);
    expect(result.discrepancyDiff).toBe(35.0);
  });

  it("handles pages with no written total without flagging a discrepancy", () => {
    const rows = [
      { amount: 20.0, entry_type: "credit" as const },
      { amount: 30.0, entry_type: "credit" as const },
    ];

    const result = computePageTotals(rows, undefined);
    expect(result.computedTotal).toBe(50.0);
    expect(result.hasPageDiscrepancy).toBe(false);
    expect(result.discrepancyDiff).toBe(0);
  });

  it("accurately subtracts payment (bayad) rows from net page total", () => {
    // Matches sample notebook: 36 (credit) + 40 (credit) - 50 (payment) + 45 (credit) = 71
    const rows = [
      { amount: 36.0, entry_type: "credit" as const },
      { amount: 40.0, entry_type: "credit" as const },
      { amount: 50.0, entry_type: "payment" as const },
      { amount: 45.0, entry_type: "credit" as const },
    ];

    const result = computePageTotals(rows, 71.0);
    expect(result.computedTotal).toBe(71.0);
    expect(result.hasPageDiscrepancy).toBe(false);
    expect(result.discrepancyDiff).toBe(0);
  });
});

describe("T-006: Customer Balance Computation", () => {
  it("computes sum(credit) - sum(payment) for confirmed entries", () => {
    const entries = [
      { amount: 100.0, entry_type: "credit", confirmed_by_user: true },
      { amount: 50.0, entry_type: "credit", confirmed_by_user: true },
      { amount: 30.0, entry_type: "payment", confirmed_by_user: true },
    ];

    const result = computeCustomerBalance(entries);
    expect(result.balance).toBe(120.0);
    expect(result.totalCredit).toBe(150.0);
    expect(result.totalPayment).toBe(30.0);
  });

  it("ignores unconfirmed entries (confirmed_by_user = false)", () => {
    const entries = [
      { amount: 200.0, entry_type: "credit", confirmed_by_user: true },
      { amount: 500.0, entry_type: "credit", confirmed_by_user: false }, // staged, must be ignored
      { amount: 50.0, entry_type: "payment", confirmed_by_user: false },  // staged, must be ignored
    ];

    const result = computeCustomerBalance(entries);
    expect(result.balance).toBe(200.0);
    expect(result.totalCredit).toBe(200.0);
    expect(result.totalPayment).toBe(0);
  });

  it("ignores cash_sale entries completely", () => {
    const entries = [
      { amount: 80.0, entry_type: "credit", confirmed_by_user: true },
      { amount: 150.0, entry_type: "cash_sale", confirmed_by_user: true },
    ];

    const result = computeCustomerBalance(entries);
    expect(result.balance).toBe(80.0);
    expect(result.totalCredit).toBe(80.0);
    expect(result.totalPayment).toBe(0);
  });

  it("handles float drift and negative/zero balances correctly", () => {
    const entries = [
      { amount: 0.1, entry_type: "credit", confirmed_by_user: true },
      { amount: 0.2, entry_type: "credit", confirmed_by_user: true },
      { amount: 0.3, entry_type: "payment", confirmed_by_user: true },
    ];

    const result = computeCustomerBalance(entries);
    expect(result.balance).toBe(0);

    const overpaid = [
      { amount: 50.0, entry_type: "credit", confirmed_by_user: true },
      { amount: 70.0, entry_type: "payment", confirmed_by_user: true },
    ];
    const overpaidResult = computeCustomerBalance(overpaid);
    expect(overpaidResult.balance).toBe(-20.0);
  });

  it("returns zero balance for empty entries array", () => {
    const result = computeCustomerBalance([]);
    expect(result.balance).toBe(0);
    expect(result.totalCredit).toBe(0);
    expect(result.totalPayment).toBe(0);
  });
});
