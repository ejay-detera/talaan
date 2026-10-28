"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  BookOpen,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";
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
  previewRowsByPageId?: Record<string, PreviewRow[]>;
  pageEntryCounts?: Record<string, number>;
  className?: string;
}

const DEFAULT_SAMPLE_ROWS: PreviewRow[] = [
  { customer_name: "Aling Nena", item: "Lucky Me", amount: 36 },
  { customer_name: "Kuya Jun", item: "Coke Mismo", amount: 40 },
  { customer_name: "Mang Jose", item: "bayad", amount: 50 },
];

/**
 * RecentPagesList
 *
 * Implements the "Notebook pages" (Mga pahina ng notebook) card.
 * Styled as a physical spiral-bound counter notebook pad with hole-punched binder strip,
 * realistic stacked paper preview with authentic cursive entries, interactive page changing,
 * and verified totals.
 */
export function RecentPagesList({
  pages,
  previewRows = DEFAULT_SAMPLE_ROWS,
  previewRowsByPageId,
  pageEntryCounts,
  className = "",
}: RecentPagesListProps) {
  const [activePageIndex, setActivePageIndex] = useState(0);

  if (pages.length === 0) {
    return (
      <div
        className={`rounded-row border border-rule bg-[#FFFEFB] p-6 text-center space-y-3 shadow-paper select-none ${className}`}
      >
        <div
          className="flex items-center justify-center gap-1.5 pb-2 border-b border-rule/50"
          aria-hidden="true"
        >
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

  const safeIndex = Math.min(Math.max(0, activePageIndex), pages.length - 1);
  const currentPage = pages[safeIndex];

  const isConfirmed = currentPage.status === "confirmed";
  const isRetake = currentPage.status === "retake_requested";
  const isNeedsReview = currentPage.status === "needs_review";

  let formattedDate = currentPage.page_date || "Recent";
  if (currentPage.page_date) {
    try {
      const parts = currentPage.page_date.split("-");
      if (parts.length === 3) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        formattedDate = new Intl.DateTimeFormat("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }).format(d);
      }
    } catch {
      formattedDate = currentPage.page_date;
    }
  }

  // Determine preview entries for the active page
  const pageEntries = previewRowsByPageId?.[currentPage.id];
  const rowsToDisplay =
    pageEntries && pageEntries.length > 0
      ? pageEntries
      : safeIndex === 0 && previewRows && previewRows.length > 0
      ? previewRows
      : [];

  const rowCount =
    pageEntryCounts?.[currentPage.id] ||
    (rowsToDisplay.length > 0 ? rowsToDisplay.length : 3);

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

        {/* Quick Page Selector on Header */}
        {pages.length > 1 ? (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActivePageIndex((prev) => Math.max(0, prev - 1))}
              disabled={safeIndex === 0}
              className="p-1 rounded text-muted hover:text-pencil hover:bg-sheet active:scale-95 disabled:opacity-25 disabled:pointer-events-none transition-all"
              aria-label="Previous notebook page"
              title="Previous page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-bold text-pencil font-sans tabular-nums px-1">
              Page {safeIndex + 1} of {pages.length}
            </span>
            <button
              type="button"
              onClick={() => setActivePageIndex((prev) => Math.min(pages.length - 1, prev + 1))}
              disabled={safeIndex === pages.length - 1}
              className="p-1 rounded text-muted hover:text-pencil hover:bg-sheet active:scale-95 disabled:opacity-25 disabled:pointer-events-none transition-all"
              aria-label="Next notebook page"
              title="Next page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <span className="text-xs font-semibold text-muted font-sans">
            1 page
          </span>
        )}
      </div>

      {/* Featured Notebook Paper Preview */}
      <div className="p-5 sm:p-6 space-y-4">
        {/* Layered Stack Paper Graphic with Interactive Sheet Tabs */}
        <div className="relative mx-auto my-1 max-w-[320px] sm:max-w-[360px]">
          {/* Stack Edge Layers (interactive when next pages exist) */}
          {safeIndex < pages.length - 1 && (
            <>
              <button
                type="button"
                onClick={() =>
                  setActivePageIndex((prev) => Math.min(pages.length - 1, prev + 1))
                }
                className="absolute inset-0 translate-x-3 translate-y-3 bg-[#EAEFE2] rounded-sm border border-rule/70 hover:translate-x-3.5 hover:translate-y-3.5 transition-transform cursor-pointer focus:outline-none"
                title={`Turn to page ${safeIndex + 2}`}
                aria-label={`Turn to page ${safeIndex + 2}`}
              />
              <button
                type="button"
                onClick={() =>
                  setActivePageIndex((prev) => Math.min(pages.length - 1, prev + 1))
                }
                className="absolute inset-0 translate-x-1.5 translate-y-1.5 bg-[#F5F8F0] rounded-sm border border-rule/80 hover:translate-x-2 hover:translate-y-2 transition-transform cursor-pointer focus:outline-none"
                title={`Turn to page ${safeIndex + 2}`}
                aria-label={`Turn to page ${safeIndex + 2}`}
              />
            </>
          )}

          {/* Previous Stack Layer (interactive when prior pages exist) */}
          {safeIndex > 0 && (
            <button
              type="button"
              onClick={() => setActivePageIndex((prev) => Math.max(0, prev - 1))}
              className="absolute inset-0 -translate-x-1.5 -translate-y-1 bg-[#EEF3E6] rounded-sm border border-rule/80 hover:-translate-x-2 hover:-translate-y-1.5 transition-transform cursor-pointer focus:outline-none"
              title={`Turn back to page ${safeIndex}`}
              aria-label={`Turn back to page ${safeIndex}`}
            />
          )}

          {/* Foreground Notebook Sheet */}
          <div
            key={currentPage.id}
            className="relative paper-lift bg-[#FFFEFA] rounded-sm border border-rule shadow-[0_2px_8px_rgba(35,38,43,0.06)] p-4 sm:p-5 space-y-2.5 overflow-hidden animate-in fade-in-50 duration-200"
          >
            {/* Notebook Sheet Header */}
            <div className="flex items-center justify-between pb-1 border-b border-[#E1E7D8]/70 text-xs font-hand text-muted select-none">
              <span>Counter Journal</span>
              <span className="font-semibold text-pencil">
                Page {safeIndex + 1}
              </span>
            </div>

            {/* Handwritten cursive line entries */}
            <div className="space-y-2 font-hand text-pencil text-base sm:text-lg leading-relaxed select-text min-h-[100px]">
              {rowsToDisplay.length > 0 ? (
                rowsToDisplay.map((row, idx) => (
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
                ))
              ) : (
                <div className="py-6 text-center font-sans text-xs text-muted space-y-1">
                  <p className="font-bold text-pencil">Page recorded in ledger</p>
                  <p>Click Open ledger below to review full line items.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Paper Page Turn Controls Bar */}
        {pages.length > 1 && (
          <div className="flex items-center justify-between gap-2 pt-1 pb-1">
            <button
              type="button"
              onClick={() => setActivePageIndex((prev) => Math.max(0, prev - 1))}
              disabled={safeIndex === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-row border border-rule bg-sheet text-pencil hover:bg-paper active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all text-xs font-semibold shadow-xs"
            >
              <ChevronLeft className="w-3.5 h-3.5 text-muted" />
              <span>Previous page</span>
            </button>

            {/* Dot indicators */}
            <div className="flex items-center gap-1.5">
              {pages.map((p, idx) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setActivePageIndex(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === safeIndex
                      ? "w-6 bg-ink"
                      : "w-2 bg-rule/80 hover:bg-muted"
                  }`}
                  aria-label={`Go to page ${idx + 1}`}
                  title={`Page ${idx + 1} (${p.page_date || "Counter List"})`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() =>
                setActivePageIndex((prev) => Math.min(pages.length - 1, prev + 1))
              }
              disabled={safeIndex === pages.length - 1}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-row border border-rule bg-sheet text-pencil hover:bg-paper active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all text-xs font-semibold shadow-xs"
            >
              <span>Next page</span>
              <ChevronRight className="w-3.5 h-3.5 text-muted" />
            </button>
          </div>
        )}

        {/* Page Metadata & Verified Totals */}
        <div className="pt-2 space-y-2 border-t border-rule/60">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-muted font-sans">
              Page of {formattedDate}
            </p>
            <span className="text-xs font-bold text-muted font-sans">
              Page {safeIndex + 1} of {pages.length}
            </span>
          </div>

          <div>
            <Amount
              amount={currentPage.computed_total}
              size="lg"
              className="text-3xl font-black text-pencil tracking-tight font-sans tabular-nums block"
            />
          </div>

          <p className="text-xs text-muted font-sans">
            Computed by code, {rowCount} {rowCount === 1 ? "row" : "rows"}
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
              href={`/pages/${currentPage.id}/review`}
              className="inline-flex items-center justify-center px-4 py-2 rounded-row border border-rule bg-sheet text-pencil hover:bg-paper active:scale-[0.99] font-bold text-sm shadow-sm transition-all paper-press"
            >
              Open ledger
            </Link>
          </div>
        </div>
      </div>

      {/* Older Pages List (if > 1 page) */}
      {pages.length > 1 && (
        <div className="border-t border-rule divide-y divide-rule/60 bg-[#F6F9EF]/50">
          <div className="px-5 py-2.5 bg-[#EDF3E4]/70 flex items-center justify-between">
            <span className="text-xs font-bold text-muted uppercase tracking-wider font-sans">
              All notebook pages ({pages.length})
            </span>
            <span className="text-xs font-medium text-muted font-sans">
              Click row to view on paper
            </span>
          </div>
          {pages.map((p, idx) => {
            const isCurrent = idx === safeIndex;
            return (
              <div
                key={p.id}
                onClick={() => setActivePageIndex(idx)}
                className={`paper-row px-5 py-3 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                  isCurrent
                    ? "bg-sheet ring-1 ring-inset ring-ink/20 shadow-xs"
                    : "hover:bg-sheet/70"
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-pencil font-sans">
                      {p.page_date || `Counter List #${idx + 1}`}
                    </p>
                    {isCurrent && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-ink bg-ink/10 px-1.5 py-0.5 rounded">
                        <Eye className="w-3 h-3" />
                        <span>Active</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted font-sans capitalize">
                    {p.status === "confirmed"
                      ? "Confirmed"
                      : p.status.replace("_", " ")}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Amount
                    amount={p.computed_total}
                    size="base"
                    className="font-bold text-pencil tabular-nums"
                  />
                  <Link
                    href={`/pages/${p.id}/review`}
                    onClick={(e) => e.stopPropagation()}
                    className="p-1 rounded text-muted hover:text-ink hover:bg-paper transition-colors"
                    title="Open full ledger"
                    aria-label={`Open ledger for page ${p.page_date || idx + 1}`}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
