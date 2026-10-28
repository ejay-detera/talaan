import React from "react";
import { Amount } from "@/components/shared/Amount";

interface TotalUtangCardProps {
  totalStoreUtang: number;
  activeDebtorCount: number;
  confirmedPageCount?: number;
  className?: string;
}

/**
 * TotalUtangCard
 *
 * Implements the pinned yellow counter memo sticky note (The Notebook, Kept).
 * Features an authentic 3D red pushpin graphic, warm paper tones,
 * handwritten Caveat notes, and verified tabular ledger numerals.
 */
export function TotalUtangCard({
  totalStoreUtang,
  activeDebtorCount,
  confirmedPageCount = 1,
  className = "",
}: TotalUtangCardProps) {
  return (
    <div
      className={`relative bg-[#FFF9D2] border border-[#EADB85] rounded-row p-5 sm:p-6 shadow-[0_8px_24px_rgba(35,38,43,0.09)] select-none transform rotate-[-1deg] hover:rotate-0 transition-transform duration-300 ${className}`}
    >
      {/* 3D Red Pushpin Graphic at Top Center */}
      <div
        className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-7 h-7 flex items-center justify-center pointer-events-none z-10"
        aria-hidden="true"
      >
        <span className="w-5 h-5 rounded-full bg-margin border-2 border-[#8E1E1D] shadow-[0_2px_5px_rgba(0,0,0,0.28)] block relative">
          <span className="w-1.5 h-1.5 rounded-full bg-white/80 absolute top-0.5 left-0.5" />
        </span>
      </div>

      <div className="space-y-3 pt-1">
        {/* Memo Header Strip */}
        <div className="flex items-center justify-between text-xs font-sans font-bold text-[#6E5D1E] uppercase tracking-wider">
          <span>Counter Memo</span>
          <span>
            {activeDebtorCount === 1 ? "1 Active Suki" : `${activeDebtorCount} Active Suki`}
          </span>
        </div>

        {/* Big Bold Total Amount */}
        <div>
          <span className="text-xs font-semibold text-[#6E5D1E] font-sans block mb-1">
            Total Customer Credit
          </span>
          <Amount
            amount={totalStoreUtang}
            size="lg"
            className="text-4xl sm:text-5xl font-black text-[#2B2613] tracking-tight font-sans tabular-nums block"
          />
        </div>

        {/* Authentic Handwritten Note in Caveat font */}
        <p className="font-hand text-xl sm:text-2xl text-[#383318] leading-snug">
          {activeDebtorCount > 0
            ? `${activeDebtorCount} ${activeDebtorCount === 1 ? "customer owes" : "customers owe"} credit. Computed by code from ${confirmedPageCount} confirmed ${confirmedPageCount === 1 ? "page" : "pages"}!`
            : "All notebook balances cleared. Zero outstanding credit recorded."}
        </p>

        {/* Bottom Verification Strip */}
        <div className="pt-2 flex items-center justify-between text-xs font-sans border-t border-[#EADB85]/80">
          <span className="text-[#6E5D1E] font-semibold">Verified Ledger Total:</span>
          <span className="font-bold text-[#1F7A4D] text-base sm:text-lg tabular-nums">
            ₱{totalStoreUtang.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
