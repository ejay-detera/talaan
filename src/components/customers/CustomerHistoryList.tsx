import Link from "next/link";
import { ExternalLink, ShoppingBag, ArrowDownLeft } from "lucide-react";
import type { CustomerLedgerEntry } from "@/types/ledger";
import { Amount } from "@/components/shared/Amount";

interface CustomerHistoryListProps {
  entries: CustomerLedgerEntry[];
}

export function CustomerHistoryList({ entries }: CustomerHistoryListProps) {
  if (entries.length === 0) {
    return (
      <div className="p-6 text-center rounded-sheet border border-dashed border-rule bg-sheet/60 select-none">
        <p className="text-xs font-semibold text-muted">
          Wala pang kumpirmadong transaksyon para sa suking ito.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-sheet border border-rule bg-sheet overflow-hidden select-none">
      <div className="p-3.5 sm:p-4 border-b border-rule flex items-center justify-between">
        <h3 className="text-xs font-bold text-pencil uppercase tracking-wider">
          Kasaysayan ng Transaksyon ({entries.length})
        </h3>
        <span className="text-sm text-muted">Mula sa kumpirmadong kuwaderno</span>
      </div>

      <div className="divide-y divide-rule/60">
        {entries.map((entry) => {
          const isPayment = entry.entry_type === "payment";

          return (
            <div
              key={entry.id}
              className="p-3.5 flex items-center justify-between gap-3 hover:bg-paper/40 transition-colors"
            >
              {/* Left: Icon, Date, Item, Qty */}
              <div className="flex items-start gap-2.5 min-w-0">
                <div
                  className={`p-1.5 rounded-row border mt-0.5 flex-shrink-0 ${
                    isPayment
                      ? "bg-paid/10 text-paid border-paid/30"
                      : "bg-paper text-ink border-rule"
                  }`}
                >
                  {isPayment ? (
                    <ArrowDownLeft className="w-3.5 h-3.5" />
                  ) : (
                    <ShoppingBag className="w-3.5 h-3.5" />
                  )}
                </div>

                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-pencil truncate">
                      {entry.item}
                    </span>
                    <span
                      className={`text-sm font-bold px-1.5 py-0.2 rounded-row border ${
                        isPayment
                          ? "bg-paid/10 text-paid border-paid/30"
                          : "bg-paper text-pencil border-rule"
                      }`}
                    >
                      {isPayment ? "Bayad" : "Utang"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted">
                    <span>{entry.page_date || "Listahan"}</span>
                    {entry.quantity && entry.unit_price && (
                      <span>
                        &bull; {entry.quantity} &times; ₱{Number(entry.unit_price).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Amount & Source Page link */}
              <div className="text-right flex items-center gap-2 flex-shrink-0">
                <div>
                  <Amount
                    amount={entry.amount}
                    size="base"
                    className={`font-bold ${isPayment ? "text-paid" : "text-pencil"}`}
                  />
                  <span className="block text-sm text-muted">
                    {isPayment ? "- Bayad" : "+ Utang"}
                  </span>
                </div>

                <Link
                  href={`/pages/${entry.page_id}/review`}
                  title="Tingnan ang pinagmulang pahina"
                  className="p-2 text-muted hover:text-ink rounded-row hover:bg-paper transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

