"use client";

import React, { useMemo, useState } from "react";
import {
  Download,
  Printer,
  PackageCheck,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
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
      ? "Last 7 Days"
      : period === "30d"
      ? "Last 30 Days"
      : "All Time";

  return (
    <div className="space-y-5 select-none">
      {/* Period Filter & Export Controls */}
      <div className="p-4 sm:p-5 rounded-sheet border border-rule bg-sheet space-y-4 print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-display font-bold text-base sm:text-lg text-pencil">
              Store &amp; Inventory Summary
            </h2>
            <p className="text-sm text-muted">
              Computed from {summary.transactionCount} confirmed transactions ({periodLabel})
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-row bg-paper border border-rule text-sm font-semibold text-paid">
            <ShieldCheck className="w-4 h-4" />
            <span>Zero LLM Math</span>
          </div>
        </div>

        {/* Period Switcher */}
        <div className="flex gap-2" role="group" aria-label="Select date range">
          {(
            [
              { id: "7d", label: "7 Days (Weekly)" },
              { id: "30d", label: "30 Days (Monthly)" },
              { id: "all", label: "All Time" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setPeriod(tab.id)}
              className={`flex-1 min-h-[48px] px-3 py-2 rounded-row text-sm font-bold transition-all cursor-pointer ${
                period === tab.id
                  ? "bg-ink text-sheet shadow-paper"
                  : "bg-paper text-pencil hover:bg-paper/80 border border-rule"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 1-Tap Export & Print Bar */}
        <div className="flex flex-wrap gap-2.5 pt-2 border-t border-rule/60">
          <a
            href="/api/ledger/export"
            download
            className="flex-1 min-w-[180px] min-h-[48px] px-4 py-2.5 rounded-row bg-ink text-sheet hover:bg-ink/90 active:scale-[0.99] text-sm font-bold flex items-center justify-center gap-2 shadow-paper transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download CSV (Excel)</span>
          </a>

          <button
            type="button"
            onClick={() => window.print()}
            className="min-h-[48px] px-4 py-2.5 rounded-row bg-paper border border-rule hover:bg-paper/80 active:scale-[0.99] text-sm font-bold text-pencil flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-ink" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Print-Only Header */}
      <div className="hidden print:block p-4 border-b border-rule">
        <h1 className="font-display font-bold text-xl text-pencil">
          {storeName} — Store Summary ({periodLabel})
        </h1>
        <p className="text-sm text-muted">
          Deterministic Store Ledger Summary &bull; {summary.transactionCount} confirmed rows
        </p>
      </div>

      {/* Store Financial Summary Grid */}
      <section aria-label="Financial Summary" className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="p-4 rounded-sheet border border-rule bg-sheet space-y-1.5">
          <div className="flex items-center justify-between text-sm font-bold text-muted">
            <span>Total Credit Extended</span>
            <AlertCircle className="w-4 h-4 text-margin" />
          </div>
          <Amount
            amount={summary.totalCredit}
            size="lg"
            className="text-2xl font-extrabold text-margin"
          />
          <p className="text-sm text-muted">All credit goods released in this period</p>
        </div>

        <div className="p-4 rounded-sheet border border-rule bg-sheet space-y-1.5">
          <div className="flex items-center justify-between text-sm font-bold text-muted">
            <span>Total Collections (Payments)</span>
            <CheckCircle2 className="w-4 h-4 text-paid" />
          </div>
          <Amount
            amount={summary.totalPayment}
            size="lg"
            className="text-2xl font-extrabold text-paid"
          />
          <p className="text-sm text-muted">Payments received from customers</p>
        </div>

        <div className="p-4 rounded-sheet border border-rule bg-sheet space-y-1.5">
          <div className="flex items-center justify-between text-sm font-bold text-muted">
            <span>Net Outstanding Credit</span>
            <AlertCircle className="w-4 h-4 text-pencil" />
          </div>
          <Amount
            amount={summary.netUncollectedUtang}
            size="lg"
            className="text-2xl font-extrabold text-pencil"
          />
          <p className="text-sm text-muted">Credit minus collected payments</p>
        </div>

        <div className="p-4 rounded-sheet border border-rule bg-sheet space-y-1.5">
          <div className="flex items-center justify-between text-sm font-bold text-muted">
            <span>Estimated Margin (~10%)</span>
            <TrendingUp className="w-4 h-4 text-ink" />
          </div>
          <Amount
            amount={summary.estimatedMarginEarnings}
            size="lg"
            className="text-2xl font-extrabold text-ink"
          />
          <p className="text-sm text-muted">
            From ₱{summary.grossGoodsVolume.toFixed(2)} total goods volume
          </p>
        </div>
      </section>

      {/* Top Fast-Moving Items for Restock (Pamimili Guide) */}
      <section
        aria-label="Fast-Moving Items for Restock"
        className="rounded-sheet border border-rule bg-sheet overflow-hidden"
      >
        <div className="p-4 border-b border-rule flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <PackageCheck className="w-4 h-4 text-ink" />
            <h3 className="text-sm font-bold text-pencil uppercase tracking-wider">
              Restock Guide (Top Moving Items)
            </h3>
          </div>
          <span className="text-sm text-muted">Ranked by sales volume</span>
        </div>

        {summary.topItems.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-sm font-semibold text-muted">
              No items recorded in this period.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-rule/60">
            {summary.topItems.map((item, idx) => (
              <div
                key={item.item}
                className="p-3.5 sm:p-4 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-7 h-7 rounded-row bg-paper border border-rule flex items-center justify-center text-sm font-bold text-ink flex-shrink-0">
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-pencil truncate">{item.item}</p>
                    <p className="text-sm text-muted">
                      {item.totalQuantity} units &bull; {item.occurrenceCount} transactions
                    </p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <Amount
                    amount={item.totalAmount}
                    size="base"
                    className="font-bold text-pencil"
                  />
                  <span className="block text-sm text-muted">Total amount</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

