"use client";

import React, { useState, useMemo } from "react";
import { ShieldCheck, ShieldAlert, AlertTriangle, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
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

  const isNoData = health.status === "no_data" || health.totalVolume === 0;
  const isHealthy = !isNoData && health.status === "healthy";
  const isModerate = !isNoData && health.status === "moderate";

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

        {/* 7d vs Today Toggle */}
        <div className="relative inline-flex items-center gap-1 bg-paper/70 p-0.5 rounded-sm border border-rule/80">
          <button
            type="button"
            onClick={() => setPeriod("7d")}
            className={`relative z-10 px-3 py-1 text-[11px] font-bold rounded-xs transition-colors cursor-pointer ${
              period === "7d"
                ? "text-sheet"
                : "text-muted hover:text-pencil"
            }`}
          >
            {period === "7d" && (
              <motion.span
                layoutId="liquidity-active-tab"
                className="absolute inset-0 bg-ink rounded-xs shadow-xs -z-10"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}
            7 Days
          </button>
          <button
            type="button"
            onClick={() => setPeriod("today")}
            className={`relative z-10 px-3 py-1 text-[11px] font-bold rounded-xs transition-colors cursor-pointer ${
              period === "today"
                ? "text-sheet"
                : "text-muted hover:text-pencil"
            }`}
          >
            {period === "today" && (
              <motion.span
                layoutId="liquidity-active-tab"
                className="absolute inset-0 bg-ink rounded-xs shadow-xs -z-10"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}
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
              <span
                className={`font-display font-black text-3xl sm:text-4xl tabular-nums ${
                  isNoData ? "text-muted/70" : "text-pencil"
                }`}
              >
                {isNoData ? "—" : `${health.cashRatioPercent}%`}
              </span>
              <span
                className={`text-xs font-bold font-sans ${
                  isNoData ? "text-muted" : "text-paid"
                }`}
              >
                {isNoData ? "No Sales Yet" : "Cash Sales"}
              </span>
            </div>
          </div>

          {/* Status Badge: Physical Stamp */}
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs border text-xs font-bold tracking-tight uppercase ${
              isNoData
                ? "bg-[#F4F6EE] text-muted border-rule"
                : isHealthy
                ? "bg-[#EAF5EE] text-paid border-paid/40"
                : isModerate
                ? "bg-[#EEF2FC] text-ink border-ink/40"
                : "bg-[#FDF2F2] text-margin border-margin/50"
            }`}
          >
            {isNoData ? (
              <span className="w-1.5 h-1.5 rounded-full bg-muted/60" aria-hidden="true" />
            ) : isHealthy ? (
              <ShieldCheck className="w-3.5 h-3.5" />
            ) : isModerate ? (
              <AlertTriangle className="w-3.5 h-3.5" />
            ) : (
              <ShieldAlert className="w-3.5 h-3.5" />
            )}
            <span>
              {isNoData
                ? "Awaiting Sales"
                : isHealthy
                ? "Healthy Flow"
                : isModerate
                ? "Moderate"
                : "High Utang"}
            </span>
          </div>
        </div>

        {/* Two-Tone Ratio Progress Bar */}
        <div className="space-y-1.5">
          <div className="h-2.5 w-full rounded-xs bg-[#E8EDE0]/70 border border-rule/60 overflow-hidden flex">
            {!isNoData ? (
              <>
                <motion.div
                  initial={false}
                  animate={{ width: `${health.cashRatioPercent}%` }}
                  transition={{ type: "spring", stiffness: 180, damping: 24 }}
                  className={`h-full ${
                    isHealthy ? "bg-paid" : isModerate ? "bg-ink" : "bg-[#E8A020]"
                  }`}
                />
                <motion.div
                  initial={false}
                  animate={{ width: `${health.creditRatioPercent}%` }}
                  transition={{ type: "spring", stiffness: 180, damping: 24 }}
                  className="h-full bg-margin/80"
                />
              </>
            ) : (
              <div className="h-full w-full bg-[#E4EAD9]/50" />
            )}
          </div>

          {/* Ratio Breakdown Labels */}
          <div className="flex items-center justify-between text-[11px] font-sans font-medium text-muted">
            <span>
              Cash: <strong className={isNoData ? "text-muted font-bold" : "text-pencil font-bold"}>₱{health.totalCash.toFixed(2)}</strong>
              {!isNoData && ` (${health.cashRatioPercent}%)`}
            </span>
            <span>
              Credit: <strong className={isNoData ? "text-muted font-bold" : "text-margin font-bold"}>₱{health.totalCredit.toFixed(2)}</strong>
              {!isNoData && ` (${health.creditRatioPercent}%)`}
            </span>
          </div>
        </div>
      </div>

      {/* Advisory Bottom Nudge */}
      <div className="pt-2 border-t border-rule/60 text-xs font-sans text-muted">
        <p
          className={`${
            isNoData
              ? "text-muted font-normal"
              : isHealthy
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

