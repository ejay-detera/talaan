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

  it("handles zero volume gracefully as no_data (awaiting sales)", () => {
    const health = computeLiquidityHealth([], "7d", referenceDate);
    expect(health.totalCash).toBe(0);
    expect(health.totalCredit).toBe(0);
    expect(health.cashRatioPercent).toBe(0);
    expect(health.creditRatioPercent).toBe(0);
    expect(health.status).toBe("no_data");
    expect(health.statusMessage).toContain("No sales or payments recorded yet");
  });

  it("handles customer payment clearing debt in full (100% cash flow)", () => {
    const entries: LiquidityEntry[] = [
      {
        id: "c1",
        amount: 242,
        entry_type: "credit",
        confirmed_by_user: true,
        created_at: "2026-11-01T08:00:00Z",
      },
      {
        id: "p1",
        amount: 242,
        entry_type: "payment",
        confirmed_by_user: true,
        created_at: "2026-11-01T10:00:00Z",
      },
    ];

    const health = computeLiquidityHealth(entries, "7d", referenceDate);
    // ₱242 credit fully settled by ₱242 cash payment
    // totalCash = 242, netCredit = 0, totalVolume = 242
    // cashRatioPercent = 100%, creditRatioPercent = 0%
    expect(health.totalCash).toBe(242);
    expect(health.totalCredit).toBe(0);
    expect(health.cashRatioPercent).toBe(100);
    expect(health.creditRatioPercent).toBe(0);
    expect(health.status).toBe("healthy");
  });

  it("handles partial customer payment netting out credit risk", () => {
    const entries: LiquidityEntry[] = [
      {
        id: "c1",
        amount: 200,
        entry_type: "credit",
        confirmed_by_user: true,
        created_at: "2026-11-01T08:00:00Z",
      },
      {
        id: "p1",
        amount: 50,
        entry_type: "payment",
        confirmed_by_user: true,
        created_at: "2026-11-01T10:00:00Z",
      },
    ];

    const health = computeLiquidityHealth(entries, "7d", referenceDate);
    // ₱200 credit - ₱50 payment = ₱150 net credit
    // totalCash = 50, netCredit = 150, totalVolume = 200
    // cashRatioPercent = 25%, creditRatioPercent = 75%
    expect(health.totalCash).toBe(50);
    expect(health.totalCredit).toBe(150);
    expect(health.cashRatioPercent).toBe(25);
    expect(health.creditRatioPercent).toBe(75);
    expect(health.status).toBe("high_risk");
  });

  it("combines cash sales with customer debt payments", () => {
    const entries: LiquidityEntry[] = [
      {
        id: "cs1",
        amount: 100,
        entry_type: "cash_sale",
        confirmed_by_user: true,
        created_at: "2026-11-01T08:00:00Z",
      },
      {
        id: "c1",
        amount: 100,
        entry_type: "credit",
        confirmed_by_user: true,
        created_at: "2026-11-01T09:00:00Z",
      },
      {
        id: "p1",
        amount: 50,
        entry_type: "payment",
        confirmed_by_user: true,
        created_at: "2026-11-01T10:00:00Z",
      },
    ];

    const health = computeLiquidityHealth(entries, "7d", referenceDate);
    // cashSale: 100, payment: 50 -> totalCash = 150
    // credit: 100 - 50 payment = 50 netCredit
    // totalVolume = 150 + 50 = 200
    // cashRatioPercent = 75%, creditRatioPercent = 25%
    expect(health.totalCash).toBe(150);
    expect(health.totalCredit).toBe(50);
    expect(health.cashRatioPercent).toBe(75);
    expect(health.creditRatioPercent).toBe(25);
    expect(health.status).toBe("healthy");
  });
});

