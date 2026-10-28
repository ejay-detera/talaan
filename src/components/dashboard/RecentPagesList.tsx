import React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, AlertTriangle, XCircle, Clock } from "lucide-react";
import { Amount } from "@/components/shared/Amount";

interface PageListItem {
  id: string;
  page_date: string | null;
  written_total: number | null;
  computed_total: number;
  has_page_discrepancy: boolean;
  status: string;
  retake_reason?: string | null;
  model: string;
  created_at: string;
}

interface RecentPagesListProps {
  pages: PageListItem[];
  className?: string;
}

export function RecentPagesList({ pages, className = "" }: RecentPagesListProps) {
  if (pages.length === 0) {
    return (
      <div className={`p-8 text-center rounded-sheet border border-dashed border-rule bg-sheet/60 space-y-2 ${className}`}>
        <p className="text-sm font-semibold text-pencil">Wala pang nakatalang pahina ng kuwaderno.</p>
        <p className="text-xs text-muted">
          Pindutin ang bilog na Scan button sa itaas para kumuha ng litrato ng inyong listahan.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <h2 className="text-sm font-bold text-pencil uppercase tracking-wider">
        Kamakailang mga Pahina ({pages.length})
      </h2>

      <div className="space-y-2.5">
        {pages.map((p) => {
          const isConfirmed = p.status === "confirmed";
          const isRetake = p.status === "retake_requested";
          const isNeedsReview = p.status === "needs_review";

          return (
            <Link
              key={p.id}
              href={`/pages/${p.id}/review`}
              className="block p-3.5 sm:p-4 rounded-sheet border border-rule bg-sheet hover:border-ink/40 transition-all select-none group"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-pencil">
                      {p.page_date || "Listahan"}
                    </span>
                    <span className="text-[10px] text-muted font-bold px-1.5 py-0.5 rounded-row border border-rule bg-paper">
                      {p.model}
                    </span>
                  </div>

                  {/* Status Indicator (Icon + Text pairing) */}
                  <div className="flex items-center gap-1.5 text-xs font-semibold">
                    {isConfirmed && (
                      <span className="inline-flex items-center gap-1 text-paid font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Kumpirmado sa Ledger</span>
                      </span>
                    )}
                    {isNeedsReview && (
                      <span className="inline-flex items-center gap-1 text-pencil font-bold">
                        <AlertTriangle className="w-3.5 h-3.5 text-margin" />
                        <span>Kailangan ng Pagsusuri</span>
                      </span>
                    )}
                    {isRetake && (
                      <span className="inline-flex items-center gap-1 text-margin font-bold">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Ulitin ang Litrato</span>
                      </span>
                    )}
                    {!isConfirmed && !isNeedsReview && !isRetake && (
                      <span className="inline-flex items-center gap-1 text-muted">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Pinoproseso</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <Amount amount={p.computed_total} size="base" />
                    {p.has_page_discrepancy && (
                      <span className="block text-[10px] font-bold text-margin">May pagkakaiba</span>
                    )}
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted group-hover:text-ink group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
