import { describe, it, expect } from "vitest";
import { computeLiquidityHealth, type LiquidityEntry } from "../liquidity";

describe("computeLiquidityHealth", () => {
  const referenceDate = new Date("2026-11-01T12:00:00Z");

  const mockEntries: LiquidityEntry[] = [
    {
      id: "1",
      amount: 100,
      entry_type: "cash_sale",
      confirmed_by_user: true,
      created_at: "2026-11-01T08:00:00Z",
    },
    {
      id: "2",
      amount: 50,
      entry_type: "credit",
      confirmed_by_user: true,
      created_at: "2026-11-01T09:00:00Z",
    },
    {
      id: "3",
      amount: 200,
      entry_type: "credit",
      confirmed_by_user: true,
      created_at: "2026-10-26T10:00:00Z", // 6 days ago
    },
    {
      id: "4",
      amount: 300,
      entry_type: "credit",
      confirmed_by_user: false, // unconfirmed, should be skipped
      created_at: "2026-11-01T10:00:00Z",
    },
  ];

  it("computes 7-day rolling liquidity ratio correctly", () => {
    const health = computeLiquidityHealth(mockEntries, "7d", referenceDate);

    // In 7d: 100 cash (entry 1), 50 credit (entry 2), 200 credit (entry 3)
    // Total Volume = 100 + 250 = 350
    // Cash Ratio = 100 / 350 = 28.57% -> 29%
    expect(health.totalCash).toBe(100);
    expect(health.totalCredit).toBe(250);
    expect(health.cashRatioPercent).toBe(29);
    expect(health.creditRatioPercent).toBe(71);
    expect(health.status).toBe("high_risk");
  });

  it("computes today ratio correctly", () => {
    const health = computeLiquidityHealth(mockEntries, "today", referenceDate);

    // In today (2026-11-01): 100 cash, 50 credit
    // Total Volume = 150
    // Cash Ratio = 100 / 150 = 66.67% -> 67%
    expect(health.totalCash).toBe(100);
    expect(health.totalCredit).toBe(50);
    expect(health.cashRatioPercent).toBe(67);
    expect(health.creditRatioPercent).toBe(33);
    expect(health.status).toBe("healthy");
  });

  it("handles zero volume gracefully as 100% healthy", () => {
    const health = computeLiquidityHealth([], "7d", referenceDate);
    expect(health.totalCash).toBe(0);
    expect(health.totalCredit).toBe(0);
    expect(health.cashRatioPercent).toBe(100);
    expect(health.creditRatioPercent).toBe(0);
    expect(health.status).toBe("healthy");
  });
});
