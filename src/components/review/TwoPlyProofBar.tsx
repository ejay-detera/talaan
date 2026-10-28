// impeccable-disable side-tab -- intentional RedMarginGutter discrepancy border per docs/design.md
"use client";

import React from "react";
import { Loader2, ShieldCheck, AlertCircle } from "lucide-react";
import { Amount } from "@/components/shared/Amount";

interface TwoPlyProofBarProps {
  writtenTotal: number | null;
  computedTotal: number;
  hasPageDiscrepancy: boolean;
  discrepancyDiff: number;
  isConfirmDisabled: boolean;
  isSubmitting: boolean;
  disabledReason?: string | null;
  onConfirm: () => void;
  className?: string;
}

export function TwoPlyProofBar({
  writtenTotal,
  computedTotal,
  hasPageDiscrepancy,
  discrepancyDiff,
  isConfirmDisabled,
  isSubmitting,
  disabledReason,
  onConfirm,
  className = "",
}: TwoPlyProofBarProps) {
  return (
    <footer
      className={`sticky bottom-0 left-0 right-0 z-30 bg-sheet border-t border-rule shadow-[0_-4px_16px_rgba(35,38,43,0.08)] p-4 sm:p-5 ${
        hasPageDiscrepancy ? "border-l-4 border-l-margin" : ""
      } ${className}`}
    >
      <div className="max-w-2xl mx-auto space-y-3">
        <div className="flex items-center justify-between gap-4 text-xs">
          <div>
            <span className="block text-muted font-semibold">Written Total:</span>
            {writtenTotal !== null ? (
              <Amount amount={writtenTotal} size="base" />
            ) : (
              <span className="text-muted font-bold">Not written</span>
            )}
          </div>
          <div className="text-right">
            <span className="block text-muted font-semibold">Computed Total:</span>
            <Amount amount={computedTotal} size="base" />
          </div>
        </div>

        {hasPageDiscrepancy && (
          <div className="flex items-center gap-1.5 text-xs font-bold text-margin bg-[#FFF5F5] p-2 rounded-row border border-margin/40">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>
              Discrepancy: {discrepancyDiff > 0 ? "+" : ""}
              ₱{discrepancyDiff.toFixed(2)}. Computed total will be recorded in the ledger.
            </span>
          </div>
        )}

        {disabledReason && (
          <p className="text-sm text-margin font-semibold flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{disabledReason}</span>
          </p>
        )}

        <button
          type="button"
          onClick={onConfirm}
          disabled={isConfirmDisabled || isSubmitting}
          className="w-full h-[56px] rounded-row bg-ink hover:bg-ink/90 active:scale-[0.99] disabled:bg-rule disabled:text-muted disabled:cursor-not-allowed text-sheet text-base font-bold shadow-paper transition-all flex items-center justify-center gap-2 cursor-pointer select-none"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Saving to Ledger...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-5 h-5" />
              <span>Confirm & Save to Ledger</span>
            </>
          )}
        </button>
      </div>
    </footer>
  );
}
