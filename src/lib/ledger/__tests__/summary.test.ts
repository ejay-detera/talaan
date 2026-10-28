import { describe, expect, it } from "vitest";
import {
  computeStoreSummary,
  formatLedgerCsv,
  type SummaryLedgerRow,
} from "../summary";

describe("computeStoreSummary (US-08)", () => {
  const sampleRows: SummaryLedgerRow[] = [
    {
      id: "e1",
      page_id: "p1",
      page_date: "2026-10-27",
      customer_name: "Mang Jose",
      item: "Corned Beef",
      quantity: 2,
      unit_price: 38,
      amount: 76,
      entry_type: "credit",
      confirmed_by_user: true,
    },
    {
      id: "e2",
      page_id: "p1",
      page_date: "2026-10-27",
      customer_name: "Ate Baby",
      item: "Pancit Canton",
      quantity: 5,
      unit_price: 12,
      amount: 60,
      entry_type: "credit",
      confirmed_by_user: true,
    },
    {
      id: "e3",
      page_id: "p1",
      page_date: "2026-10-28",
      customer_name: "Mang Jose",
      item: "Bayad",
      quantity: null,
      unit_price: null,
      amount: 50,
      entry_type: "payment",
      confirmed_by_user: true,
    },
    {
      id: "e4",
      page_id: "p2",
      page_date: "2026-10-28",
      customer_name: "Kuya Jun",
      item: "Pancit Canton",
      quantity: 3,
      unit_price: 12,
      amount: 36,
      entry_type: "cash",
      confirmed_by_user: true,
    },
    {
      id: "e5",
      page_id: "p3",
      page_date: "2026-09-01",
      customer_name: "Nanay Cora",
      item: "Bigas 1kg",
      quantity: 2,
      unit_price: 55,
      amount: 110,
      entry_type: "credit",
      confirmed_by_user: true,
    },
    {
      id: "e6",
      page_id: "p4",
      page_date: "2026-10-28",
      customer_name: "Unconfirmed Customer",
      item: "Sardinas",
      quantity: 10,
      unit_price: 24,
      amount: 240,
      entry_type: "credit",
      confirmed_by_user: false,
    },
  ];

  it("computes centavo-exact weekly (7d) totals, 10% estimated margin, and restock velocity", () => {
    const refDate = new Date("2026-10-28T12:00:00Z");
    const summary = computeStoreSummary(sampleRows, "7d", refDate);

    // e1 (76 credit) + e2 (60 credit) = 136 credit; e5 is outside 7d; e6 is unconfirmed
    expect(summary.totalCredit).toBe(136);
    expect(summary.totalPayment).toBe(50);
    expect(summary.totalCash).toBe(36);
    expect(summary.netUncollectedUtang).toBe(86);
    // Gross goods sold = 136 credit + 36 cash = 172; 10% margin = 17.20
    expect(summary.grossGoodsVolume).toBe(172);
    expect(summary.estimatedMarginEarnings).toBe(17.2);
    expect(summary.transactionCount).toBe(4);

    // Top items for restock: Pancit Canton (5 + 3 = 8 units, 96.00 PHP) > Corned Beef (2 units, 76.00 PHP)
    expect(summary.topItems).toHaveLength(2);
    expect(summary.topItems[0]).toEqual({
      item: "Pancit Canton",
      totalQuantity: 8,
      occurrenceCount: 2,
      totalAmount: 96,
    });
    expect(summary.topItems[1]).toEqual({
      item: "Corned Beef",
      totalQuantity: 2,
      occurrenceCount: 1,
      totalAmount: 76,
    });
  });

  it("includes older confirmed entries when period is 'all'", () => {
    const refDate = new Date("2026-10-28T12:00:00Z");
    const summary = computeStoreSummary(sampleRows, "all", refDate);

    // 136 + 110 = 246 credit
    expect(summary.totalCredit).toBe(246);
    expect(summary.totalPayment).toBe(50);
    expect(summary.netUncollectedUtang).toBe(196);
    expect(summary.transactionCount).toBe(5);
  });
});

describe("formatLedgerCsv (US-08)", () => {
  it("formats confirmed ledger entries as UTF-8 BOM CSV with escaped quotes and 2-decimal amounts", () => {
    const rows: SummaryLedgerRow[] = [
      {
        id: "e1",
        page_id: "page-123",
        page_date: "2026-10-27",
        customer_name: 'Aling "Nena", Jr.',
        item: "Pancit Canton, Chilimansi",
        quantity: 3,
        unit_price: 12.5,
        amount: 37.5,
        entry_type: "credit",
        confirmed_by_user: true,
      },
    ];

    const csv = formatLedgerCsv(rows);
    expect(csv.startsWith("\uFEFFDate,Customer,Item,Type,Quantity,Unit Price,Amount,Page ID\n")).toBe(
      true
    );
    expect(csv).toContain(
      '2026-10-27,"Aling ""Nena"", Jr.","Pancit Canton, Chilimansi",credit,3,12.50,37.50,page-123'
    );
  });
});

