// impeccable-disable side-tab -- intentional red margin line per docs/design.md
"use client";

import React, { useMemo, useState } from "react";
import { Download, Printer } from "lucide-react";
import { Amount } from "@/components/shared/Amount";
import {
  computeStoreSummary,
  type SummaryLedgerRow,
  type SummaryPeriod,
} from "@/lib/ledger/summary";

interface StoreSummarySheetProps {
  storeName: string;
  rows: SummaryLedgerRow[];
}

export function StoreSummarySheet({ storeName, rows }: StoreSummarySheetProps) {
  const [period, setPeriod] = useState<SummaryPeriod>("7d");

  const summary = useMemo(() => computeStoreSummary(rows, period), [rows, period]);

  const periodLabel =
    period === "7d"
      ? "last 7 days"
      : period === "30d"
      ? "last 30 days"
      : "all time";

  // Calculate total sold pieces and max item quantity for relative progress bar scaling
  const totalPieces = useMemo(() => {
    return summary.topItems.reduce((acc, it) => acc + it.totalQuantity, 0);
  }, [summary.topItems]);

  const maxItemQty = useMemo(() => {
    if (summary.topItems.length === 0) return 1;
    return Math.max(1, ...summary.topItems.map((it) => it.totalQuantity));
  }, [summary.topItems]);

  // Collection percentages safely rounded
  const totalCreditCents = Math.round(summary.totalCredit * 100);
  const totalPaymentCents = Math.round(summary.totalPayment * 100);
  const paidPercent =
    totalCreditCents > 0
      ? Math.min(100, Math.round((totalPaymentCents / totalCreditCents) * 100))
      : 100;
  const remainingPercent = Math.max(0, 100 - paidPercent);

  return (
    <div className="space-y-6 select-none">
      {/* Top Header: Store Title, Summary Meta & Period Filter Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div className="space-y-1">
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-pencil tracking-tight">
            Store Summary
          </h1>
          <p className="text-xs sm:text-sm text-muted font-sans font-medium">
            Computed from {summary.transactionCount} confirmed{" "}
            {summary.transactionCount === 1 ? "transaction" : "transactions"},{" "}
            {periodLabel}
          </p>
        </div>

        {/* Period Filter Pills */}
        <div className="inline-flex items-center gap-1.5 bg-paper/60 p-1 rounded-pill border border-rule self-start sm:self-center">
          {(
            [
              { id: "7d", label: "7 days" },
              { id: "30d", label: "30 days" },
              { id: "all", label: "30 days" === "30 days" ? "30 days" : "30 days" },
            ] as const
          ).map((tab) => {
            const actualId = tab.id;
            const actualLabel =
              actualId === "7d" ? "7 days" : actualId === "30d" ? "30 days" : "All";
            return (
              <button
                key={actualId}
                type="button"
                onClick={() => setPeriod(actualId)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-pill transition-all cursor-pointer ${
                  period === actualId
                    ? "bg-ink text-sheet shadow-xs"
                    : "bg-sheet text-pencil hover:bg-paper border border-rule/60"
                }`}
              >
                {actualLabel}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Left Yellow Sticky Memo + Right Open 2-Page Ledger Pad */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start paper-stagger">
        {/* Left Column: Yellow Pinned Memo Note */}
        <div className="lg:col-span-4 print:hidden">
          <div
            className="slip paper-settle relative rounded-row border border-[#EADB85] bg-[#FFF9D2] p-5 sm:p-6 shadow-paper space-y-4"
            style={{ ["--tilt" as string]: "-1deg" }}
          >
            {/* 3D Red Pushpin */}
            <div
              className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
              aria-hidden="true"
            >
              <div className="relative flex items-center justify-center">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#E84846] via-[#C8302F] to-[#8C1D1C] shadow-[0_4px_8px_rgba(0,0,0,0.35),inset_0_2px_3px_rgba(255,255,255,0.45)] border border-[#7A1615]/40" />
                <div className="absolute top-1 left-1.5 w-1.5 h-1.5 rounded-full bg-white/70 blur-[0.4px]" />
              </div>
            </div>

            {/* Memo Title & Subtitle */}
            <div className="space-y-1 pt-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#6E5D1E] font-sans block">
                Summary Memo
              </span>
              <span className="text-xs font-semibold text-[#8C7624] block">
                Outstanding Credit
              </span>
            </div>

            {/* Big Outstanding Balance Amount */}
            <div>
              <Amount
                amount={summary.netUncollectedUtang}
                size="lg"
                className="font-display font-black text-3xl sm:text-4xl text-[#23262B] block tracking-tight"
              />
            </div>

            {/* Handwritten Caveat Note */}
            <div className="border-t border-[#EADB85]/80 pt-3">
              <p className="font-hand text-xl sm:text-2xl text-[#2A2510] leading-snug">
                Credit ₱{summary.totalCredit.toFixed(2)}, collected ₱
                {summary.totalPayment.toFixed(2)}. Deterministic code counted, zero
                AI math.
              </p>
            </div>

            {/* Action Buttons Pinned at Bottom of Sticky Note */}
            <div className="pt-2 space-y-2 border-t border-[#EADB85]/80">
              {/* Primary Action: Download CSV */}
              <a
                href="/api/ledger/export"
                download
                className="w-full h-[46px] rounded-row bg-ink hover:bg-ink/90 active:scale-[0.99] text-xs sm:text-sm font-bold text-sheet flex items-center justify-center gap-2 shadow-paper transition-all cursor-pointer select-none font-sans paper-press"
              >
                <Download className="w-4 h-4" />
                <span>Download CSV (Excel)</span>
              </a>

              {/* Secondary Action: Print / PDF */}
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full h-[46px] rounded-row border border-ink text-ink bg-sheet hover:bg-paper active:scale-[0.99] text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer select-none font-sans paper-press"
              >
                <Printer className="w-4 h-4" />
                <span>Print / PDF</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Open 2-Page Ledger Pad ("The Notebook, Kept") */}
        <div className="lg:col-span-8">
          <div className="rounded-sheet border border-rule bg-sheet shadow-paper-lg overflow-hidden grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-rule">
            {/* Page 1 (Left Page): Credit & Collections */}
            <div className="relative border-l-4 border-l-margin flex flex-col justify-between p-4 sm:p-5 bg-sheet">
              <div className="space-y-4">
                {/* Page 1 Header */}
                <div className="pb-2 border-b border-rule/70">
                  <h2 className="font-display font-bold text-base sm:text-lg text-pencil tracking-tight">
                    Credit &amp; Collections
                  </h2>
                  <p className="text-xs text-muted font-sans font-medium">
                    {periodLabel}
                  </p>
                </div>

                {/* 4 Financial Accounting Rows */}
                <div className="divide-y divide-rule/60">
                  {/* Row 1: Total Credit Extended */}
                  <div className="py-2.5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="font-bold text-xs sm:text-sm text-pencil block">
                        Total Credit
                      </span>
                      <span className="text-xs text-muted block truncate">
                        All merchandise taken on credit
                      </span>
                    </div>
                    <Amount
                      amount={summary.totalCredit}
                      size="base"
                      className="font-black text-pencil flex-shrink-0"
                    />
                  </div>

                  {/* Row 2: Total Collections */}
                  <div className="py-2.5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="font-bold text-xs sm:text-sm text-pencil block">
                        Total Collections
                      </span>
                      <span className="text-xs text-muted block truncate">
                        Payments received from customers
                      </span>
                    </div>
                    <Amount
                      amount={summary.totalPayment}
                      size="base"
                      className="font-black text-paid flex-shrink-0"
                    />
                  </div>

                  {/* Row 3: Remaining Credit */}
                  <div className="py-2.5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="font-bold text-xs sm:text-sm text-pencil block">
                        Remaining Credit
                      </span>
                      <span className="text-xs text-muted block truncate">
                        Credit minus collected
                      </span>
                    </div>
                    <Amount
                      amount={summary.netUncollectedUtang}
                      size="base"
                      className="font-black text-pencil flex-shrink-0"
                    />
                  </div>

                  {/* Row 4: Estimated Profit (~10%) */}
                  <div className="py-2.5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="font-bold text-xs sm:text-sm text-pencil block">
                        Estimated Margin (~10%)
                      </span>
                      <span className="text-xs text-muted block truncate">
                        10% of ₱{summary.grossGoodsVolume.toFixed(2)} merchandise
                      </span>
                    </div>
                    <Amount
                      amount={summary.estimatedMarginEarnings}
                      size="base"
                      className="font-black text-pencil flex-shrink-0"
                    />
                  </div>
                </div>
              </div>

              {/* Page 1 Bottom: Collection Progress Bar & Page Number */}
              <div className="pt-4 mt-4 border-t border-rule/70 space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold font-sans">
                    <span className="text-paid">Collected: {paidPercent}%</span>
                    <span className="text-muted">Remaining: {remainingPercent}%</span>
                  </div>
                  {/* Two-tone Progress Bar */}
                  <div className="h-2 w-full rounded-pill bg-[#E2E8D5] overflow-hidden flex">
                    <div
                      style={{ width: `${paidPercent}%` }}
                      className="h-full bg-paid rounded-pill transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Page Number 1 */}
                <div className="text-center pt-1 text-xs font-bold text-muted/70 font-sans">
                  1
                </div>
              </div>
            </div>

            {/* Page 2 (Right Page): Restock Guide */}
            <div className="relative border-l-4 border-l-margin flex flex-col justify-between p-4 sm:p-5 bg-sheet">
              <div className="space-y-4">
                {/* Page 2 Header */}
                <div className="pb-2 border-b border-rule/70">
                  <h2 className="font-display font-bold text-base sm:text-lg text-pencil tracking-tight">
                    Restock Guide
                  </h2>
                  <p className="text-xs text-muted font-sans font-medium">
                    Fastest moving items, by sales quantity
                  </p>
                </div>

                {/* Item List Ranked */}
                {summary.topItems.length === 0 ? (
                  <div className="py-12 text-center text-xs text-muted font-sans">
                    No items recorded in this period.
                  </div>
                ) : (
                  <div className="divide-y divide-rule/60">
                    {summary.topItems.slice(0, 4).map((item, idx) => {
                      const sharePercent = Math.min(
                        100,
                        Math.max(12, Math.round((item.totalQuantity / maxItemQty) * 100))
                      );
                      return (
                        <div
                          key={item.item}
                          className="py-2.5 flex items-center justify-between gap-3"
                        >
                          {/* Col 1 & 2: Rank, Name, Pieces & Mini Blue Progress Bar */}
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="w-5 text-center font-display font-bold text-sm sm:text-base text-pencil flex-shrink-0">
                              {idx + 1}
                            </span>
                            <div className="min-w-0 space-y-0.5">
                              <span className="font-bold text-xs sm:text-sm text-pencil truncate block">
                                {item.item}
                              </span>
                              <span className="text-xs text-muted block">
                                {item.totalQuantity}{" "}
                                {item.totalQuantity === 1 ? "pc" : "pcs"},{" "}
                                {item.occurrenceCount}{" "}
                                {item.occurrenceCount === 1
                                  ? "transaction"
                                  : "transactions"}
                              </span>
                              {/* Blue Volume Share Bar */}
                              <div className="h-1.5 w-24 sm:w-28 rounded-pill bg-[#E2E8D5] overflow-hidden">
                                <div
                                  style={{ width: `${sharePercent}%` }}
                                  className="h-full bg-ink rounded-pill"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Col 3: Right Amount & Total Label */}
                          <div className="text-right flex-shrink-0">
                            <Amount
                              amount={item.totalAmount}
                              size="base"
                              className="font-black text-pencil block"
                            />
                            <span className="text-xs text-muted font-sans block">
                              Total
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Page 2 Bottom: Total Pieces & Page Number */}
              <div className="pt-3 mt-4 border-t-2 border-rule space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs sm:text-sm text-pencil font-sans">
                    Total Pieces
                  </span>
                  <span className="font-display font-black text-base sm:text-lg text-pencil">
                    {totalPieces}
                  </span>
                </div>

                {/* Page Number 2 */}
                <div className="text-center pt-1 text-xs font-bold text-muted/70 font-sans">
                  2
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Printable Ledger Representation */}
      <div className="hidden print:block p-6 border-2 border-pencil bg-sheet space-y-4">
        <div className="border-b-2 border-pencil pb-3 flex justify-between items-baseline">
          <div>
            <h1 className="font-display font-bold text-xl text-pencil uppercase">
              {storeName} &bull; Ledger Summary
            </h1>
            <p className="text-xs text-muted font-sans">
              Period: {periodLabel} &bull; Generated from confirmed notebook pages
            </p>
          </div>
          <div className="text-right text-xs font-bold">
            Total Pieces Sold: {totalPieces}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <p>Total Credit: ₱{summary.totalCredit.toFixed(2)}</p>
            <p>Total Collections: ₱{summary.totalPayment.toFixed(2)}</p>
            <p className="font-bold">Remaining Credit: ₱{summary.netUncollectedUtang.toFixed(2)}</p>
          </div>
          <div className="space-y-1 text-right">
            <p>Transactions: {summary.transactionCount}</p>
            <p>Collection Rate: {paidPercent}%</p>
            <p className="font-bold">Est. Margin: ₱{summary.estimatedMarginEarnings.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
