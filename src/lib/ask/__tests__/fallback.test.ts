import { describe, it, expect } from "vitest";
import { generateFallbackAnswer } from "../fallback";

describe("generateFallbackAnswer", () => {
  it("formats list_overdue_customers with customers correctly", () => {
    const text = generateFallbackAnswer("list_overdue_customers", {
      count: 2,
      total_overdue: "₱565.00",
      overdue_customers: [
        {
          id: "c-1",
          name: "Nanay Cora",
          balance_formatted: "₱45.00",
          days_inactive: 8,
          reason: "inactive_7_days",
        },
        {
          id: "c-2",
          name: "Kuya Jun",
          balance_formatted: "₱520.00",
          days_inactive: 1,
          reason: "credit_limit_exceeded",
        },
      ],
    });

    expect(text).toContain("May 2 suki na dapat nang singilin");
    expect(text).toContain("Nanay Cora (₱45.00, 8 araw nang walang transaksyon)");
    expect(text).toContain("Kuya Jun (₱520.00, lumagpas sa credit limit)");
    expect(text).toContain("Kabuuang overdue: ₱565.00");
  });

  it("handles zero overdue customers in fallback", () => {
    const text = generateFallbackAnswer("list_overdue_customers", {
      count: 0,
      total_overdue: "₱0.00",
      overdue_customers: [],
    });
    expect(text).toBe("Wala pong overdue na customer sa talaan sa kasalukuyan.");
  });

  it("formats get_customer_balance for found customer", () => {
    const text = generateFallbackAnswer("get_customer_balance", {
      name: "Nanay Cora",
      balance: "₱45.00",
      total_credit: "₱100.00",
      total_payment: "₱55.00",
    });

    expect(text).toContain("Ang kasalukuyang balanse o utang ni Nanay Cora ay ₱45.00");
    expect(text).toContain("Kabuuang kinuha: ₱100.00");
  });

  it("handles not_found and ambiguous customer balance", () => {
    const notFound = generateFallbackAnswer("get_customer_balance", {
      not_found: true,
      searched_name: "Mang Pedro",
    });
    expect(notFound).toContain('Hindi po nahanap si "Mang Pedro"');

    const ambiguous = generateFallbackAnswer("get_customer_balance", {
      ambiguous: true,
      candidates: [{ name: "Maria Santos" }, { name: "Maria Clara" }],
    });
    expect(ambiguous).toContain("Maria Santos, Maria Clara");
  });

  it("formats check_page_discrepancies", () => {
    const clean = generateFallbackAnswer("check_page_discrepancies", {
      has_discrepancies: false,
      discrepancy_count: 0,
    });
    expect(clean).toContain("Maayos ang mga sinuring pahina");

    const withDiff = generateFallbackAnswer("check_page_discrepancies", {
      has_discrepancies: true,
      discrepancy_count: 1,
      pages: [
        {
          page_date: "2026-10-27",
          written_total: "₱71.00",
          computed_total: "₱121.00",
          diff: "₱50.00",
        },
      ],
    });
    expect(withDiff).toContain("May 1 pahina na may discrepancy");
    expect(withDiff).toContain("Nakasulat ay ₱71.00, pero ang kinalkula ay ₱121.00");
  });
});

