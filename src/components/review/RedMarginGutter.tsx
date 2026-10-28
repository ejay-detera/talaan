import React from "react";
import { Check, AlertTriangle, X } from "lucide-react";

interface RedMarginGutterProps {
  lineDiscrepancy: boolean;
  needsReview: boolean;
  className?: string;
}

/**
 * Signature verification gutter element per docs/design.md.
 * 2px solid #C8302F margin rule with explicit icon + text pairing.
 */
export function RedMarginGutter({
  lineDiscrepancy,
  needsReview,
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
