import type { CustomerLedgerEntry } from "@/types/ledger";
import type { RestockItemSummary } from "./summary";
import { toCentavos, toPesos } from "./math";

interface FormatResiboParams {
  storeName: string;
  customerName: string;
  balance: number;
  entries: CustomerLedgerEntry[];
  maxEntries?: number;
}

/**
 * Deterministically formats an itemized text receipt for SMS, Messenger, or Viber.
 */
export function formatResiboText({
  storeName,
  customerName,
  balance,
  entries,
  maxEntries = 15,
}: FormatResiboParams): string {
  const isSettled = balance <= 0;
  const header = `[${storeName.trim()}] E-Resibo\nCustomer: ${customerName.trim()}\nTotal Balance: ₱${balance.toFixed(2)}${isSettled ? " (SETTLED)" : ""}\n--------------------------------`;

  if (entries.length === 0) {
    return `${header}\nNo outstanding balance.\nMaraming salamat po!`;
  }

  const creditEntries = entries.filter((e) => e.entry_type === "credit");
  const paymentEntries = entries.filter((e) => e.entry_type === "payment");

  const lines: string[] = [];

  const displayCredits = creditEntries.slice(0, maxEntries);
  for (const entry of displayCredits) {
    const qtyPrefix = entry.quantity ? `${entry.quantity}x ` : "";
    lines.push(`• ${qtyPrefix}${entry.item} - ₱${Number(entry.amount).toFixed(2)}`);
  }

  if (creditEntries.length > maxEntries) {
    const remainingCount = creditEntries.length - maxEntries;
    lines.push(`• ... +${remainingCount} more recorded items`);
  }

  if (paymentEntries.length > 0) {
    const totalPaymentsCentavos = paymentEntries.reduce(
      (acc, p) => acc + toCentavos(Number(p.amount)),
      0
    );
    lines.push(`--------------------------------`);
    lines.push(`Bayad / Payment - (₱${toPesos(totalPaymentsCentavos).toFixed(2)})`);
  }

  lines.push(`--------------------------------`);
  lines.push(`Net Utang Balance: ₱${balance.toFixed(2)}`);
  lines.push(`================================`);
  lines.push(`RECEIVED BY:`);
  lines.push(`Signature: _________________`);
  lines.push(`Print Name: _________________`);
  lines.push(`--------------------------------`);
  lines.push(`Maraming salamat po!`);

  return `${header}\n${lines.join("\n")}`;
}

function formatCurrency(val: number): string {
  return val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

interface FormatPamalengkeParams {
  storeName: string;
  items: RestockItemSummary[];
  periodLabel: string;
}

/**
 * Deterministically formats an actionable wholesale shopping list for Puregold/wet market trips.
 */
export function formatPamalengkeListText({
  storeName,
  items,
  periodLabel,
}: FormatPamalengkeParams): string {
  const header = `[${storeName.trim()}] Pamalengke Restock List (${periodLabel})\n--------------------------------`;

  if (items.length === 0) {
    return `${header}\nNo fast-moving items recorded for this period.`;
  }

  let totalCapitalCentavos = 0;
  const lines: string[] = [];

  for (const item of items) {
    totalCapitalCentavos += toCentavos(item.totalAmount);
    lines.push(
      `[ ] ${item.totalQuantity} pcs - ${item.item} (est. ₱${formatCurrency(Number(item.totalAmount))})`
    );
  }

  lines.push(`--------------------------------`);
  lines.push(
    `Estimated Capital Needed: ₱${formatCurrency(toPesos(totalCapitalCentavos))}`
  );

  return `${header}\n${lines.join("\n")}`;
}
