import React from "react";
import Link from "next/link";
import { CheckCircle2, AlertTriangle, XCircle, Clock, BookOpen, ArrowRight } from "lucide-react";
import { Amount } from "@/components/shared/Amount";

export interface PreviewRow {
  customer_name: string;
  item: string;
  amount: number;
}

export interface PageListItem {
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
  previewRows?: PreviewRow[];
  className?: string;
}

const DEFAULT_SAMPLE_ROWS: PreviewRow[] = [
  { customer_name: "Kuya Jun", item: "2 pancit canton", amount: 30 },
  { customer_name: "Ate Lorna", item: "3 kape", amount: 21 },
  { customer_name: "Mang Berting", item: "Gardenia", amount: 20 },
];

/**
 * RecentPagesList
 *
 * Implements the "Notebook pages" (Mga pahina ng notebook) card.
 * Styled as a physical spiral-bound counter notebook pad with hole-punched binder strip,
 * realistic stacked paper preview with authentic cursive entries, and verified totals.
 */
export function RecentPagesList({
  pages,
  previewRows = DEFAULT_SAMPLE_ROWS,
  className = "",
}: RecentPagesListProps) {
  if (pages.length === 0) {
    return (
      <div
        className={`rounded-row border border-rule bg-[#FFFEFB] p-6 text-center space-y-3 shadow-paper select-none ${className}`}
      >
        <div className="flex items-center justify-center gap-1.5 pb-2 border-b border-rule/50" aria-hidden="true">
          <span className="w-2.5 h-2.5 rounded-full bg-paper border border-[#C5D0B4]" />
          <span className="w-2.5 h-2.5 rounded-full bg-paper border border-[#C5D0B4]" />
          <span className="w-2.5 h-2.5 rounded-full bg-paper border border-[#C5D0B4]" />
        </div>
        <div className="w-10 h-10 rounded-full bg-paper border border-rule flex items-center justify-center mx-auto text-ink/70">
          <BookOpen className="w-5 h-5" />
        </div>
        <p className="text-sm font-bold text-pencil font-sans">
          No notebook pages recorded yet
        </p>
        <p className="text-xs text-muted font-sans max-w-xs mx-auto">
          Tap the Scan Page button to photograph your store notebook at the counter.
        </p>
      </div>
    );
  }

  const featuredPage = pages[0];
  const isConfirmed = featuredPage.status === "confirmed";
  const isRetake = featuredPage.status === "retake_requested";
  const isNeedsReview = featuredPage.status === "needs_review";

  let formattedDate = featuredPage.page_date || "Recent";
  if (featuredPage.page_date) {
    try {
      const parts = featuredPage.page_date.split("-");
      if (parts.length === 3) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        formattedDate = new Intl.DateTimeFormat("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }).format(d);
      }
    } catch {
      formattedDate = featuredPage.page_date;
    }
  }

  const rowsToDisplay =
    previewRows && previewRows.length > 0 ? previewRows : DEFAULT_SAMPLE_ROWS;

  return (
    <div
      className={`rounded-row border border-rule bg-[#FFFEFB] overflow-hidden shadow-paper select-none ${className}`}
    >
      {/* Top Spiral Binder Header Strip */}
      <div className="h-9 px-4 bg-[#F2F6EC] border-b border-rule flex items-center justify-between select-none">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="w-2.5 h-2.5 rounded-full bg-paper border border-[#C5D0B4]" />
            <span className="w-2.5 h-2.5 rounded-full bg-paper border border-[#C5D0B4]" />
            <span className="w-2.5 h-2.5 rounded-full bg-paper border border-[#C5D0B4]" />
          </div>
          <span className="text-xs font-sans font-bold tracking-wider uppercase text-muted ml-1">
            Notebook Pages
          </span>
        </div>
        <span className="text-xs font-semibold text-muted font-sans">
          {pages.length === 1 ? "1 page" : `${pages.length} pages`}
        </span>
      </div>

      {/* Featured Notebook Paper Preview */}
      <div className="p-5 sm:p-6 space-y-4">
        {/* Layered Stack Paper Graphic */}
        <div className="relative mx-auto my-1 max-w-[320px] sm:max-w-[360px]">
          {/* Background Sheet Layer 2 (Bottom layer) */}
          <div
            className="absolute inset-0 translate-x-3 translate-y-3 bg-[#EAEFE2] rounded-sm border border-rule/70"
            aria-hidden="true"
          />
          {/* Background Sheet Layer 1 (Middle layer) */}
          <div
            className="absolute inset-0 translate-x-1.5 translate-y-1.5 bg-[#F5F8F0] rounded-sm border border-rule/80"
            aria-hidden="true"
          />

          {/* Foreground Notebook Sheet */}
          <div className="relative bg-[#FFFEFA] rounded-sm border border-rule shadow-[0_2px_8px_rgba(35,38,43,0.06)] p-4 sm:p-5 space-y-2.5 overflow-hidden">
            <div className="space-y-2 font-hand text-pencil text-base sm:text-lg leading-relaxed select-text">
              {rowsToDisplay.map((row, idx) => (
                <div
                  key={idx}
                  className="border-b border-[#E1E7D8] pb-1 flex items-baseline justify-between gap-3"
                >
                  <span className="truncate">
                    {row.customer_name} - {row.item}
                  </span>
                  <span className="tabular-nums flex-shrink-0 font-medium">
                    {row.amount > 0 ? row.amount.toFixed(0) : "—"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Page Metadata & Verified Totals */}
        <div className="pt-2 space-y-2">
          <p className="text-xs font-semibold text-muted font-sans">
            Page of {formattedDate}
          </p>

          <div>
            <Amount
              amount={featuredPage.computed_total}
              size="lg"
              className="text-3xl font-black text-pencil tracking-tight font-sans tabular-nums block"
            />
          </div>

          <p className="text-xs text-muted font-sans">
            Computed by code, {rowsToDisplay.length} rows
          </p>

          {/* Status Indicator */}
          <div className="pt-1">
            {isConfirmed && (
              <div className="flex items-center gap-1.5 text-sm font-bold text-paid">
                <CheckCircle2 className="w-4 h-4 text-paid" />
                <span>Confirmed in ledger</span>
              </div>
            )}
            {isNeedsReview && (
              <div className="flex items-center gap-1.5 text-sm font-bold text-margin">
                <AlertTriangle className="w-4 h-4 text-margin" />
                <span>Needs review</span>
              </div>
            )}
            {isRetake && (
              <div className="flex items-center gap-1.5 text-sm font-bold text-margin">
                <XCircle className="w-4 h-4 text-margin" />
                <span>Retake photo</span>
              </div>
            )}
            {!isConfirmed && !isNeedsReview && !isRetake && (
              <div className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                <Clock className="w-4 h-4 text-ink" />
                <span>Reading page...</span>
              </div>
            )}
          </div>

          {/* Action Button: Open Ledger */}
          <div className="pt-2">
            <Link
              href={`/pages/${featuredPage.id}/review`}
              className="inline-flex items-center justify-center px-4 py-2 rounded-row border border-rule bg-sheet text-pencil hover:bg-paper active:scale-[0.99] font-bold text-sm shadow-sm transition-all"
            >
              Open ledger
            </Link>
          </div>
        </div>
      </div>

      {/* Older Pages List (if > 1 page) */}
      {pages.length > 1 && (
        <div className="border-t border-rule divide-y divide-rule/60 bg-[#F6F9EF]/50">
          <div className="px-5 py-2.5 bg-[#EDF3E4]/70">
            <span className="text-xs font-bold text-muted uppercase tracking-wider font-sans">
              Older notebook pages
            </span>
          </div>
          {pages.slice(1, 5).map((p) => (
            <Link
              key={p.id}
              href={`/pages/${p.id}/review`}
              className="px-5 py-3 flex items-center justify-between gap-3 hover:bg-sheet transition-colors group"
            >
              <div>
                <p className="text-xs font-bold text-pencil font-sans">
                  {p.page_date || "Counter List"}
                </p>
                <p className="text-xs text-muted font-sans capitalize">
                  {p.status === "confirmed" ? "Confirmed" : p.status.replace("_", " ")}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Amount
                  amount={p.computed_total}
                  size="base"
                  className="font-bold text-pencil tabular-nums"
                />
                <ArrowRight className="w-3.5 h-3.5 text-muted group-hover:text-ink group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
