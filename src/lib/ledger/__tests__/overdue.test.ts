import { describe, it, expect } from "vitest";
import { findOverdueCustomers, type OverdueCustomerCandidate } from "../overdue";

describe("findOverdueCustomers", () => {
  const referenceDate = new Date("2026-11-02T00:00:00Z");

  const candidates: OverdueCustomerCandidate[] = [
    {
      id: "cust-1",
      name: "Nanay Cora",
      balance: 45.0,
      credit_limit: 500,
      last_activity_at: "2026-10-24T00:00:00Z", // 9 days ago
    },
    {
      id: "cust-2",
      name: "Kuya Jun",
      balance: 550.0,
      credit_limit: 500,
      last_activity_at: "2026-11-01T00:00:00Z", // 1 day ago, but over limit!
    },
    {
      id: "cust-3",
      name: "Aling Nena",
      balance: 120.0,
      credit_limit: 500,
      last_activity_at: "2026-11-01T00:00:00Z", // 1 day ago, under limit -> NOT overdue
    },
    {
      id: "cust-4",
      name: "Mang Jose",
      balance: 0.0, // Zero balance -> NOT overdue
      credit_limit: 500,
      last_activity_at: "2026-10-20T00:00:00Z",
    },
  ];

  it("identifies customers overdue by inactivity or credit limit breach", () => {
    const result = findOverdueCustomers(candidates, {
      minDays: 7,
      referenceDate,
    });

    expect(result.overdue_count).toBe(2);
    // Kuya Jun (550) should be first, then Nanay Cora (45)
    expect(result.overdue_customers[0].name).toBe("Kuya Jun");
    expect(result.overdue_customers[0].balance).toBe(550.0);
    expect(result.overdue_customers[0].reason).toContain("credit limit");

    expect(result.overdue_customers[1].name).toBe("Nanay Cora");
    expect(result.overdue_customers[1].balance).toBe(45.0);
    expect(result.overdue_customers[1].days_inactive).toBe(9);
    expect(result.overdue_customers[1].reason).toContain("inactive");
  });

  it("calculates exact total overdue in centavos and formatted string", () => {
    const result = findOverdueCustomers(candidates, {
      minDays: 7,
      referenceDate,
    });

    expect(result.total_overdue).toBe(595.0);
    expect(result.total_overdue_centavos).toBe(59500);
    expect(result.total_overdue_formatted).toBe("₱595.00");
  });

  it("respects limit argument", () => {
    const result = findOverdueCustomers(candidates, {
      minDays: 7,
      limit: 1,
      referenceDate,
    });

    expect(result.overdue_customers.length).toBe(1);
    expect(result.overdue_customers[0].name).toBe("Kuya Jun");
  });

  it("handles empty or zero-balance candidates safely", () => {
    const result = findOverdueCustomers([], { referenceDate });
    expect(result.overdue_count).toBe(0);
    expect(result.total_overdue).toBe(0);
    expect(result.total_overdue_centavos).toBe(0);
    expect(result.total_overdue_formatted).toBe("₱0.00");
  });
});

