import { describe, it, expect } from "vitest";
import {
  formatResiboText,
  formatPamalengkeListText,
} from "../formatters";
import type { CustomerLedgerEntry } from "@/types/ledger";
import type { RestockItemSummary } from "../summary";

describe("formatResiboText", () => {
  const mockEntries: CustomerLedgerEntry[] = [
    {
      id: "entry-1",
      page_id: "page-1",
      page_date: "2026-10-28",
      item: "Lucky Me Pancit Canton",
      quantity: 3,
      unit_price: 12,
      amount: 36,
      entry_type: "credit",
      created_at: "2026-10-28T08:00:00Z",
    },
    {
      id: "entry-2",
      page_id: "page-1",
      page_date: "2026-10-28",
      item: "Coke 1.5L",
      quantity: 1,
      unit_price: 65,
      amount: 65,
      entry_type: "credit",
      created_at: "2026-10-28T08:05:00Z",
    },
    {
      id: "entry-3",
      page_id: "page-2",
      page_date: "2026-10-29",
      item: "Partial payment",
      quantity: null,
      unit_price: null,
      amount: 50,
      entry_type: "payment",
      created_at: "2026-10-29T10:00:00Z",
    },
  ];

  it("formats itemized resibo text correctly with store and customer details", () => {
    const text = formatResiboText({
      storeName: "Aling Nena's Store",
      customerName: "Pareng Boy",
      balance: 51,
      entries: mockEntries,
    });

    expect(text).toContain("[Aling Nena's Store] E-Resibo");
    expect(text).toContain("Customer: Pareng Boy");
    expect(text).toContain("Total Balance: ₱51.00");
    expect(text).toContain("3x Lucky Me Pancit Canton - ₱36.00");
    expect(text).toContain("1x Coke 1.5L - ₱65.00");
    expect(text).toContain("Bayad / Payment - (₱50.00)");
  });

  it("handles zero balance as settled", () => {
    const text = formatResiboText({
      storeName: "Aling Nena's Store",
      customerName: "Nanay Rosa",
      balance: 0,
      entries: [],
    });

    expect(text).toContain("Total Balance: ₱0.00 (SETTLED)");
    expect(text).toContain("No outstanding balance.");
  });
});

describe("formatPamalengkeListText", () => {
  const mockItems: RestockItemSummary[] = [
    {
      item: "Lucky Me Pancit Canton",
      totalQuantity: 24,
      occurrenceCount: 8,
      totalAmount: 288,
    },
    {
      item: "Coke 1.5L",
      totalQuantity: 12,
      occurrenceCount: 6,
      totalAmount: 780,
    },
  ];

  it("formats pamalengke shopping list correctly with checkboxes", () => {
    const text = formatPamalengkeListText({
      storeName: "Aling Nena's Store",
      items: mockItems,
      periodLabel: "last 7 days",
    });

    expect(text).toContain("[Aling Nena's Store] Pamalengke Restock List (last 7 days)");
    expect(text).toContain("[ ] 24 pcs - Lucky Me Pancit Canton (est. ₱288.00)");
    expect(text).toContain("[ ] 12 pcs - Coke 1.5L (est. ₱780.00)");
    expect(text).toContain("Estimated Capital Needed: ₱1,068.00");
  });

  it("handles empty items list", () => {
    const text = formatPamalengkeListText({
      storeName: "Aling Nena's Store",
      items: [],
      periodLabel: "last 7 days",
    });

    expect(text).toContain("No fast-moving items recorded for this period.");
  });
});
