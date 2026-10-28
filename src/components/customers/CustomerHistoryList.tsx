// impeccable-disable side-tab -- intentional red margin line per docs/design.md
import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { CustomerLedgerEntry } from "@/types/ledger";
import { Amount } from "@/components/shared/Amount";

interface CustomerHistoryListProps {
  entries: CustomerLedgerEntry[];
  currentBalance?: number;
}

/**
 * CustomerHistoryList
 *
 * Implements the Customer Transaction History Notebook Pad.
 * Styled with the signature red margin line (border-l-4 border-l-margin),
 * ruled transaction rows, source notebook page links, and bottom balance proof.
 */
export function CustomerHistoryList({ entries, currentBalance }: CustomerHistoryListProps) {
  if (entries.length === 0) {
    return (
      <div className="relative rounded-row border border-[#D5DEC6] bg-[#FFFEF8] border-l-4 border-l-margin/60 shadow-paper p-6 text-center select-none">
        <p className="font-display font-bold text-base text-pencil">
          No confirmed transactions yet
        </p>
        <p className="text-xs text-muted font-sans mt-1">
          Transactions will appear here once you scan and confirm counter notebook pages.
        </p>
      </div>
    );
  }

  // Calculate balance if not explicitly provided
  const computedBalance =
    currentBalance ??
    entries.reduce((acc, e) => {
      const centavos = Math.round(Number(e.amount) * 100);
      return acc + (e.entry_type === "payment" ? -centavos : centavos);
    }, 0) / 100;

  return (
    <div className="relative rounded-row border border-[#D5DEC6] bg-[#FFFEF8] border-l-4 border-l-margin shadow-paper overflow-hidden select-none">
      {/* Header Pad Strip */}
      <div className="px-5 py-3.5 border-b border-rule bg-[#FBFDF6]/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1" aria-hidden="true">
            <span className="w-2 h-2 rounded-full bg-paper border border-[#C5D0B4]" />
            <span className="w-2 h-2 rounded-full bg-paper border border-[#C5D0B4]" />
            <span className="w-2 h-2 rounded-full bg-paper border border-[#C5D0B4]" />
          </div>
          <h2 className="font-display font-bold text-base sm:text-lg text-pencil tracking-tight">
            Transaction History
          </h2>
        </div>
        <span className="text-xs font-semibold text-muted font-sans">
          From confirmed pages ({entries.length})
        </span>
      </div>

      {/* Ruled Transaction Rows */}
      <div className="divide-y divide-[#E6ECE0]">
        {entries.map((entry) => {
          const isPayment = entry.entry_type === "payment";

          let formattedDate = entry.page_date || "Notebook page";
          if (entry.page_date) {
            try {
              const parts = entry.page_date.split("-");
              if (parts.length === 3) {
                const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
                formattedDate = new Intl.DateTimeFormat("en-US", {
                  month: "short",
                  day: "numeric",
                }).format(d);
              }
            } catch {
              formattedDate = entry.page_date;
            }
          }

          return (
            <div
              key={entry.id}
              className="px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-paper/40 transition-colors group"
            >
              {/* Left Column: Date & Item Details */}
              <div className="flex items-start gap-3 min-w-0">
                <span className="text-xs font-bold text-pencil font-sans min-w-[50px] pt-0.5">
                  {formattedDate}
                </span>

                <div className="space-y-0.5 min-w-0">
                  <p className="font-bold text-sm text-pencil truncate font-sans">
                    {entry.item}
                  </p>
                  <p className="text-xs text-muted font-sans flex items-center gap-1">
                    {entry.quantity && entry.unit_price ? (
                      <span>
                        {entry.quantity} &times; ₱{Number(entry.unit_price).toFixed(2)}, {isPayment ? "payment" : "credit"}
                      </span>
                    ) : (
                      <span>{isPayment ? "Payment applied" : "Credit added"}</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Right Column: Amount & Source Link */}
              <div className="flex flex-col items-end justify-center text-right flex-shrink-0 gap-0.5">
                <Amount
                  amount={entry.amount}
                  size="base"
                  className={`font-black tabular-nums ${
                    isPayment ? "text-paid" : "text-pencil"
                  }`}
                />
                <Link
                  href={`/pages/${entry.page_id}/review`}
                  className="text-xs font-bold text-ink hover:underline inline-flex items-center gap-0.5 group/link"
                >
                  <span>View page</span>
                  <ArrowRight className="w-3 h-3 transition-transform group-hover/link:translate-x-0.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Proof Bar: Balance */}
      <div className="px-5 py-3.5 bg-[#F6F9EF]/80 border-t-2 border-rule flex items-center justify-between">
        <span className="font-display font-bold text-sm sm:text-base text-pencil">
          Balance
        </span>
        <Amount
          amount={Math.abs(computedBalance)}
          size="base"
          className={`font-black tabular-nums ${
            computedBalance > 0
              ? "text-margin"
              : computedBalance === 0
              ? "text-paid"
              : "text-ink"
          }`}
        />
      </div>
    </div>
  );
}
