"use client";

import React, { useState, useMemo } from "react";
import { ShieldCheck, ShieldAlert, AlertTriangle, TrendingUp } from "lucide-react";
import {
  computeLiquidityHealth,
  type LiquidityEntry,
  type LiquidityPeriod,
} from "@/lib/ledger/liquidity";

interface LiquidityHealthCardProps {
  entries: LiquidityEntry[];
  className?: string;
}

export function LiquidityHealthCard({
  entries,
  className = "",
}: LiquidityHealthCardProps) {
  const [period, setPeriod] = useState<LiquidityPeriod>("7d");

  const health = useMemo(
    () => computeLiquidityHealth(entries, period),
    [entries, period]
  );

  const isHealthy = health.status === "healthy";
  const isModerate = health.status === "moderate";

  return (
    <div
      className={`rounded-sheet border border-rule bg-sheet p-5 sm:p-6 shadow-paper space-y-4 select-none ${className}`}
    >
      {/* Top Header: Title & Timeframe Toggle */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-ink" />
          <h3 className="font-display font-bold text-sm sm:text-base text-pencil tracking-tight">
            Liquidity Health
          </h3>
        </div>

        {/* 7d vs Today Toggle Pills */}
        <div className="inline-flex items-center gap-1 bg-paper/70 p-0.5 rounded-pill border border-rule/80">
          <button
            type="button"
            onClick={() => setPeriod("7d")}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-pill transition-all cursor-pointer ${
              period === "7d"
                ? "bg-ink text-sheet shadow-xs"
                : "text-muted hover:text-pencil"
            }`}
          >
            7 Days
          </button>
          <button
            type="button"
            onClick={() => setPeriod("today")}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-pill transition-all cursor-pointer ${
              period === "today"
                ? "bg-ink text-sheet shadow-xs"
                : "text-muted hover:text-pencil"
            }`}
          >
            Today
          </button>
        </div>
      </div>

      {/* Main Dial / Ratio Metric */}
      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold text-muted uppercase tracking-wider block font-sans">
              Cash vs. Credit Sales
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-display font-black text-3xl sm:text-4xl text-pencil tabular-nums">
                {health.cashRatioPercent}%
              </span>
              <span className="text-xs font-bold text-paid font-sans">
                Cash Sales
              </span>
            </div>
          </div>

          {/* Status Badge */}
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-pill border text-xs font-bold ${
              isHealthy
                ? "bg-[#EAF5EE] text-paid border-paid/30"
                : isModerate
                ? "bg-[#EEF2FC] text-ink border-ink/30"
                : "bg-[#FDF2F2] text-margin border-margin/40"
            }`}
          >
            {isHealthy ? (
              <ShieldCheck className="w-3.5 h-3.5" />
            ) : isModerate ? (
              <AlertTriangle className="w-3.5 h-3.5" />
            ) : (
              <ShieldAlert className="w-3.5 h-3.5" />
            )}
            <span>
              {isHealthy ? "Healthy Flow" : isModerate ? "Moderate" : "High Utang"}
            </span>
          </div>
        </div>

        {/* Two-Tone Ratio Progress Bar */}
        <div className="space-y-1.5">
          <div className="h-2.5 w-full rounded-pill bg-[#F2F5EC] border border-rule/60 overflow-hidden flex">
            <div
              style={{ width: `${health.cashRatioPercent}%` }}
              className={`h-full transition-all duration-300 ${
                isHealthy ? "bg-paid" : isModerate ? "bg-ink" : "bg-[#E8A020]"
              }`}
            />
            <div
              style={{ width: `${health.creditRatioPercent}%` }}
              className="h-full bg-margin/80 transition-all duration-300"
            />
          </div>

          {/* Ratio Breakdown Labels */}
          <div className="flex items-center justify-between text-[11px] font-sans font-medium text-muted">
            <span>
              Cash: <strong className="text-pencil font-bold">₱{health.totalCash.toFixed(2)}</strong> ({health.cashRatioPercent}%)
            </span>
            <span>
              Credit: <strong className="text-margin font-bold">₱{health.totalCredit.toFixed(2)}</strong> ({health.creditRatioPercent}%)
            </span>
          </div>
        </div>
      </div>

      {/* Advisory Bottom Nudge */}
      <div className="pt-2 border-t border-rule/60 text-xs font-sans text-muted">
        <p
          className={`${
            isHealthy
              ? "text-pencil"
              : isModerate
              ? "text-ink font-medium"
              : "text-margin font-bold"
          }`}
          dangerouslySetInnerHTML={{ __html: health.statusMessage }}
        />
      </div>
    </div>
  );
}

