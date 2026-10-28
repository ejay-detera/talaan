/**
 * Talaan Weekly Store Summary, Restock Velocity & CSV Export (US-08)
 *
 * Pure integer-centavo calculations over confirmed ledger rows.
 * Zero LLM arithmetic.
 */

import { toCentavos, toPesos } from "./math";

export type SummaryPeriod = "7d" | "30d" | "all";

export interface SummaryLedgerRow {
  id: string;
  page_id: string;
  page_date: string | null;
  created_at?: string;
  customer_name: string;
  item: string;
  quantity: number | null;
  unit_price: number | null;
  amount: number;
  entry_type: "credit" | "payment" | "cash";
  confirmed_by_user: boolean;
}

export interface RestockItemSummary {
  item: string;
  totalQuantity: number;
  occurrenceCount: number;
  totalAmount: number;
}

export interface StoreSummaryResult {
  period: SummaryPeriod;
  transactionCount: number;
  totalCredit: number;
  totalPayment: number;
  totalCash: number;
  netUncollectedUtang: number;
  grossGoodsVolume: number;
  estimatedMarginEarnings: number;
  topItems: RestockItemSummary[];
}

function isWithinPeriod(
  rowDateStr: string | null | undefined,
  period: SummaryPeriod,
  referenceDate: Date
): boolean {
  if (period === "all") return true;
  if (!rowDateStr) return true;

  const parsed = new Date(rowDateStr);
  if (isNaN(parsed.getTime())) return true;

  const days = period === "7d" ? 7 : 30;
  const cutoffMs = referenceDate.getTime() - days * 24 * 60 * 60 * 1000;
  return parsed.getTime() >= cutoffMs;
}

/**
 * Computes centavo-exact store summary and top fast-moving items for restock.
 */
export function computeStoreSummary(
  rows: SummaryLedgerRow[],
  period: SummaryPeriod = "7d",
  referenceDate: Date = new Date()
): StoreSummaryResult {
  let creditCentavos = 0;
  let paymentCentavos = 0;
  let cashCentavos = 0;
  let transactionCount = 0;

  const itemMap = new Map<
    string,
    { displayItem: string; totalQuantity: number; occurrenceCount: number; totalCentavos: number }
  >();

  for (const row of rows) {
    if (!row.confirmed_by_user) continue;
    const effectiveDate = row.page_date ?? row.created_at ?? null;
    if (!isWithinPeriod(effectiveDate, period, referenceDate)) continue;

    transactionCount += 1;
    const amtCentavos = toCentavos(row.amount);

    if (row.entry_type === "credit") {
      creditCentavos += amtCentavos;
    } else if (row.entry_type === "payment") {
      paymentCentavos += amtCentavos;
    } else if (row.entry_type === "cash") {
      cashCentavos += amtCentavos;
    }

    if (row.entry_type !== "payment") {
      const key = row.item.trim().toLowerCase();
      if (key && key !== "bayad") {
        const existing = itemMap.get(key) ?? {
          displayItem: row.item.trim(),
          totalQuantity: 0,
          occurrenceCount: 0,
          totalCentavos: 0,
        };
        const qty = row.quantity && row.quantity > 0 ? row.quantity : 1;
        existing.totalQuantity += qty;
        existing.occurrenceCount += 1;
        existing.totalCentavos += amtCentavos;
        itemMap.set(key, existing);
      }
    }
  }

  const netUtangCentavos = Math.max(0, creditCentavos - paymentCentavos);
  const grossGoodsCentavos = creditCentavos + cashCentavos;
  // Standard ~10% sari-sari retail margin estimate (docs/evidence.md E-008)
  const marginCentavos = Math.round(grossGoodsCentavos * 0.1);

  const topItems: RestockItemSummary[] = Array.from(itemMap.values())
    .sort((a, b) => {
      if (b.totalQuantity !== a.totalQuantity) return b.totalQuantity - a.totalQuantity;
      return b.totalCentavos - a.totalCentavos;
    })
    .slice(0, 8)
    .map((entry) => ({
      item: entry.displayItem,
      totalQuantity: Number(entry.totalQuantity.toFixed(2)),
      occurrenceCount: entry.occurrenceCount,
      totalAmount: toPesos(entry.totalCentavos),
    }));

  return {
    period,
    transactionCount,
    totalCredit: toPesos(creditCentavos),
    totalPayment: toPesos(paymentCentavos),
    totalCash: toPesos(cashCentavos),
    netUncollectedUtang: toPesos(netUtangCentavos),
    grossGoodsVolume: toPesos(grossGoodsCentavos),
    estimatedMarginEarnings: toPesos(marginCentavos),
    topItems,
  };
}

function escapeCsvCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Formats confirmed ledger rows into a UTF-8 BOM CSV string for Excel/Google Sheets.
 */
export function formatLedgerCsv(rows: SummaryLedgerRow[]): string {
  const header = "\uFEFFDate,Customer,Item,Type,Quantity,Unit Price,Amount,Page ID\n";
  const confirmed = rows.filter((r) => r.confirmed_by_user);

  const lines = confirmed.map((r) => {
    const dateVal = r.page_date ?? (r.created_at ? r.created_at.slice(0, 10) : "");
    const qtyVal = r.quantity !== null && r.quantity !== undefined ? String(r.quantity) : "";
    const unitPriceVal =
      r.unit_price !== null && r.unit_price !== undefined
        ? Number(r.unit_price).toFixed(2)
        : "";
    const amountVal = Number(r.amount).toFixed(2);

    return [
      escapeCsvCell(dateVal),
      escapeCsvCell(r.customer_name),
      escapeCsvCell(r.item),
      escapeCsvCell(r.entry_type),
      escapeCsvCell(qtyVal),
      escapeCsvCell(unitPriceVal),
      escapeCsvCell(amountVal),
      escapeCsvCell(r.page_id),
    ].join(",");
  });

  return header + lines.join("\n") + (lines.length > 0 ? "\n" : "");
}

