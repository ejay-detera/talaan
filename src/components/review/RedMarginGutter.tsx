import React from "react";
import { Check, AlertTriangle, X } from "lucide-react";

interface RedMarginGutterProps {
  lineDiscrepancy: boolean;
  needsReview: boolean;
  limitExceeded?: boolean;
  duplicateWarning?: boolean;
  className?: string;
}

/**
 * Signature verification gutter element per docs/design.md.
 * 2px solid #C8302F margin rule with explicit icon + text pairing.
 */
export function RedMarginGutter({
  lineDiscrepancy,
  needsReview,
  limitExceeded,
  duplicateWarning,
  className = "",
}: RedMarginGutterProps) {
  if (lineDiscrepancy) {
    return (
      <div
        className={`flex items-center gap-1 text-xs font-bold text-margin border-l-2 border-l-margin pl-2 font-sans ${className}`}
        title="Arithmetic mismatch in this row"
      >
        <X className="w-3.5 h-3.5 text-margin flex-shrink-0" aria-hidden="true" />
        <span className="hidden sm:inline">Mismatch</span>
      </div>
    );
  }

  if (duplicateWarning) {
    return (
      <div
        className={`flex items-center gap-1 text-xs font-bold text-[#B45309] border-l-2 border-l-[#B45309] pl-2 font-sans ${className}`}
        title="Recent counter payment recorded within 24h: verify if duplicate"
      >
        <AlertTriangle className="w-3.5 h-3.5 text-[#B45309] flex-shrink-0" aria-hidden="true" />
        <span className="hidden sm:inline">Duplicate?</span>
      </div>
    );
  }

  if (limitExceeded) {
    return (
      <div
        className={`flex items-center gap-1 text-xs font-bold text-[#B45309] border-l-2 border-l-[#B45309] pl-2 font-sans ${className}`}
        title="Credit limit exceeded for this customer"
      >
        <AlertTriangle className="w-3.5 h-3.5 text-[#B45309] flex-shrink-0" aria-hidden="true" />
        <span className="hidden sm:inline">Over Limit</span>
      </div>
    );
  }

  if (needsReview) {
    return (
      <div
        className={`flex items-center gap-1 text-xs font-bold text-pencil border-l-2 border-l-rule pl-2 font-sans ${className}`}
        title="Low confidence: verify reading"
      >
        <AlertTriangle className="w-3.5 h-3.5 text-pencil flex-shrink-0" aria-hidden="true" />
        <span className="hidden sm:inline">Review</span>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-1 text-xs font-semibold text-paid border-l-2 border-l-paid/30 pl-2 font-sans ${className}`}
      title="Verified row"
    >
      <Check className="w-3.5 h-3.5 text-paid flex-shrink-0" aria-hidden="true" />
      <span className="hidden sm:inline">Verified</span>
    </div>
  );
}
