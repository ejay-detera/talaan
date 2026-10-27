import { describe, it, expect } from "vitest";
import {
  normalizeCustomerName,
  findMatchingCustomer,
  calculateCustomerBalance,
} from "../match";

describe("T-006: Customer Name Matching & Running Balances", () => {
  describe("normalizeCustomerName", () => {
    it("trims, lowercases, and collapses interior whitespace", () => {
      expect(normalizeCustomerName("  Aling   Nena  ")).toBe("aling nena");
      expect(normalizeCustomerName("KUYA JUN")).toBe("kuya jun");
      expect(normalizeCustomerName("Mang Jose.")).toBe("mang jose");
    });
  });

  describe("findMatchingCustomer", () => {
    const existing = [
      { id: "cust-1", name: "Aling Nena" },
      { id: "cust-2", name: "Mang Jose" },
      { id: "cust-3", name: "Kuya Jun" },
    ];

    it("matches exact name", () => {
      const match = findMatchingCustomer("Aling Nena", existing);
      expect(match?.id).toBe("cust-1");
    });

    it("matches case-insensitively and with varying spaces/punctuation", () => {
      const match = findMatchingCustomer("  aling nena. ", existing);
      expect(match?.id).toBe("cust-1");
    });

    it("matches familiar nickname without title when unique", () => {
      const match = findMatchingCustomer("Jun", existing);
      expect(match?.id).toBe("cust-3");
    });

    it("returns null when no candidate matches", () => {
      const match = findMatchingCustomer("Tindera Rosa", existing);
      expect(match).toBeNull();
    });

    it("returns null for empty or whitespace-only name", () => {
      expect(findMatchingCustomer("   ", existing)).toBeNull();
    });
  });

  describe("calculateCustomerBalance", () => {
    it("computes net balance as sum(credit) - sum(payment) using exact centavos", () => {
      const entries = [
        { amount: 150.5, entry_type: "credit" as const, confirmed_by_user: true },
        { amount: 49.5, entry_type: "credit" as const, confirmed_by_user: true },
        { amount: 100.0, entry_type: "payment" as const, confirmed_by_user: true },
      ];

      const balance = calculateCustomerBalance(entries);
      expect(balance.total_credit).toBe(200.0);
      expect(balance.total_paid).toBe(100.0);
      expect(balance.net_balance).toBe(100.0);
    });

    it("strictly excludes cash_sale transactions from utang debt balance", () => {
      const entries = [
        { amount: 100.0, entry_type: "credit" as const, confirmed_by_user: true },
        { amount: 50.0, entry_type: "cash_sale" as const, confirmed_by_user: true }, // Immediate cash paid
      ];

      const balance = calculateCustomerBalance(entries);
      expect(balance.total_credit).toBe(100.0);
      expect(balance.total_paid).toBe(0.0);
      expect(balance.net_balance).toBe(100.0);
    });

    it("strictly excludes unconfirmed entries (confirmed_by_user = false)", () => {
      const entries = [
        { amount: 120.0, entry_type: "credit" as const, confirmed_by_user: true },
        // Candidate row still in review, not yet confirmed:
        { amount: 500.0, entry_type: "credit" as const, confirmed_by_user: false },
      ];

      const balance = calculateCustomerBalance(entries);
      expect(balance.total_credit).toBe(120.0);
      expect(balance.net_balance).toBe(120.0);
    });
  });
});
