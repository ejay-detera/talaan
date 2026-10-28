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
      ? "Nakaraang 7 Araw"
      : period === "30d"
      ? "Nakaraang 30 Araw"
      : "Lahat ng Panahon";

  return (
    <div className="space-y-5 select-none">
      {/* Period Filter & Export Controls */}
      <div className="p-4 sm:p-5 rounded-sheet border border-rule bg-sheet space-y-4 print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-display font-bold text-base sm:text-lg text-pencil">
              Ulat ng Tindahan at Paninda
            </h2>
            <p className="text-sm text-muted">
              Kompyut mula sa {summary.transactionCount} kumpirmadong transaksyon ({periodLabel})
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-row bg-paper border border-rule text-sm font-semibold text-paid">
            <ShieldCheck className="w-4 h-4" />
            <span>Zero LLM Math</span>
          </div>
        </div>

        {/* Period Switcher */}
        <div className="flex gap-2" role="group" aria-label="Piliin ang saklaw ng petsa">
          {(
            [
              { id: "7d", label: "7 Araw (Lingguhan)" },
              { id: "30d", label: "30 Araw (Buwanan)" },
              { id: "all", label: "Lahat" },
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
            <span>I-download ang CSV (Excel)</span>
          </a>

          <button
            type="button"
            onClick={() => window.print()}
            className="min-h-[48px] px-4 py-2.5 rounded-row bg-paper border border-rule hover:bg-paper/80 active:scale-[0.99] text-sm font-bold text-pencil flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-ink" />
            <span>I-print / PDF</span>
          </button>
        </div>
      </div>

      {/* Print-Only Header */}
      <div className="hidden print:block p-4 border-b border-rule">
        <h1 className="font-display font-bold text-xl text-pencil">
          {storeName} — Ulat ng Talaan ({periodLabel})
        </h1>
        <p className="text-sm text-muted">
          Deterministic Store Ledger Summary &bull; {summary.transactionCount} confirmed rows
        </p>
      </div>

      {/* Store Financial Summary Grid */}
      <section aria-label="Buod ng Pananalapi" className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="p-4 rounded-sheet border border-rule bg-sheet space-y-1.5">
          <div className="flex items-center justify-between text-sm font-bold text-muted">
            <span>Kabuuang Pautang (Credit)</span>
            <AlertCircle className="w-4 h-4 text-margin" />
          </div>
          <Amount
            amount={summary.totalCredit}
            size="lg"
            className="text-2xl font-extrabold text-margin"
          />
          <p className="text-sm text-muted">Lahat ng inutang na paninda sa panahong ito</p>
        </div>

        <div className="p-4 rounded-sheet border border-rule bg-sheet space-y-1.5">
          <div className="flex items-center justify-between text-sm font-bold text-muted">
            <span>Kabuuang Koleksyon (Bayad)</span>
            <CheckCircle2 className="w-4 h-4 text-paid" />
          </div>
          <Amount
            amount={summary.totalPayment}
            size="lg"
            className="text-2xl font-extrabold text-paid"
          />
          <p className="text-sm text-muted">Binayad ng mga suki sa kanilang utang</p>
        </div>

        <div className="p-4 rounded-sheet border border-rule bg-sheet space-y-1.5">
          <div className="flex items-center justify-between text-sm font-bold text-muted">
            <span>Natitirang Singilin (Net Utang)</span>
            <AlertCircle className="w-4 h-4 text-pencil" />
          </div>
          <Amount
            amount={summary.netUncollectedUtang}
            size="lg"
            className="text-2xl font-extrabold text-pencil"
          />
          <p className="text-sm text-muted">Pautang bawas ang nakolektang bayad</p>
        </div>

        <div className="p-4 rounded-sheet border border-rule bg-sheet space-y-1.5">
          <div className="flex items-center justify-between text-sm font-bold text-muted">
            <span>Tinatayang Kita (~10% Margin)</span>
            <TrendingUp className="w-4 h-4 text-ink" />
          </div>
          <Amount
            amount={summary.estimatedMarginEarnings}
            size="lg"
            className="text-2xl font-extrabold text-ink"
          />
          <p className="text-sm text-muted">
            Mula sa ₱{summary.grossGoodsVolume.toFixed(2)} kabuuang labas ng paninda
          </p>
        </div>
      </section>

      {/* Top Fast-Moving Items for Restock (Pamimili Guide) */}
      <section
        aria-label="Mabentang Paninda para sa Pamimili"
        className="rounded-sheet border border-rule bg-sheet overflow-hidden"
      >
        <div className="p-4 border-b border-rule flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <PackageCheck className="w-4 h-4 text-ink" />
            <h3 className="text-sm font-bold text-pencil uppercase tracking-wider">
              Listahan sa Pamimili (Mabentang Paninda)
            </h3>
          </div>
          <span className="text-sm text-muted">Batay sa dami ng benta</span>
        </div>

        {summary.topItems.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-sm font-semibold text-muted">
              Wala pang naitalang paninda sa panahong ito.
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
                      {item.totalQuantity} piraso/yunit &bull; {item.occurrenceCount} transaksyon
                    </p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <Amount
                    amount={item.totalAmount}
                    size="base"
                    className="font-bold text-pencil"
                  />
                  <span className="block text-sm text-muted">Kabuuang halaga</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

