"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, CheckCircle2, AlertTriangle } from "lucide-react";
import { NotebookStrip } from "./NotebookStrip";
import { ExcelReviewRow } from "./ExcelReviewRow";
import { TwoPlyProofBar } from "./TwoPlyProofBar";
import { useReviewDraft } from "@/hooks/useReviewDraft";
import { computePageTotals, checkRowDiscrepancy } from "@/lib/ledger/math";
import type { ReviewEntry } from "@/types/ledger";

interface ReviewSheetProps {
  page: {
    id: string;
    page_date: string | null;
    written_total: number | null;
    status: string;
    model: string;
  };
  initialEntries: ReviewEntry[];
  customerCandidates: Array<{ id: string; name: string }>;
  imageUrl?: string | null;
}

/**
 * ReviewSheet
 *
 * Implements the interactive spreadsheet review ledger interface.
 * Features a live formula bar, Excel coordinate columns (A-G),
 * auto-recalculating cells, inline mismatch resolution, and atomic ledger commit.
 */
export function ReviewSheet({
  page,
  initialEntries,
  customerCandidates,
  imageUrl,
}: ReviewSheetProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number>(0);

  const {
    entries,
    writtenTotal,
    updateEntries,
    clearDraft,
  } = useReviewDraft(page.id, initialEntries, page.written_total);

  // Compute live deterministic totals
  const totals = computePageTotals(entries, writtenTotal ?? undefined);

  // Check validation conditions
  const hasUnresolvedMismatch = entries.some(
    (e) => checkRowDiscrepancy(e.quantity ?? undefined, e.unit_price ?? undefined, e.amount) && !e.accept_written
  );
  const hasMissingCustomer = entries.some(
    (e) => (e.entry_type === "credit" || e.entry_type === "payment") && !e.customer_id && !e.extracted_customer_name?.trim()
  );
  const hasNoEntries = entries.length === 0;

  let disabledReason: string | null = null;
  if (hasNoEntries) disabledReason = "At least one transaction row is required.";
  else if (hasUnresolvedMismatch) disabledReason = "Choose 'Use Computed' or 'Keep Written' for each math mismatch.";
  else if (hasMissingCustomer) disabledReason = "Select or enter a customer for each Credit or Payment row.";

  const isConfirmDisabled = hasNoEntries || hasUnresolvedMismatch || hasMissingCustomer;

  // Active entry formula derivation
  const activeEntry = entries[selectedIdx] ?? entries[0];
  const activeRowCoordinate = selectedIdx >= 0 ? `F${selectedIdx + 2}` : "F2";

  let formulaText = "= ₱0.00";
  let activeAmount = 0;
  if (activeEntry) {
    activeAmount = activeEntry.amount;
    if (activeEntry.entry_type === "payment") {
      formulaText = `= -₱${Number(activeEntry.amount).toFixed(2)} (payment deduction)`;
    } else if (activeEntry.quantity && activeEntry.unit_price) {
      formulaText = `= D${selectedIdx + 2} * E${selectedIdx + 2} (= ${activeEntry.quantity} × ₱${Number(activeEntry.unit_price).toFixed(2)})`;
    } else {
      formulaText = `= ₱${Number(activeEntry.amount).toFixed(2)}`;
    }
  }

  // Format page date tab
  let formattedDate = page.page_date || "Recent Page";
  if (page.page_date) {
    try {
      const parts = page.page_date.split("-");
      if (parts.length === 3) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        formattedDate = new Intl.DateTimeFormat("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }).format(d);
      }
    } catch {
      formattedDate = page.page_date;
    }
  }

  const handleConfirm = async () => {
    if (isConfirmDisabled || submitting) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const payload = {
        written_total: writtenTotal,
        entries: entries.map((e) => ({
          id: e.id,
          customer_id: e.customer_id,
          new_customer_name: e.customer_id ? null : e.extracted_customer_name,
          item: e.item,
          quantity: e.quantity,
          unit_price: e.unit_price,
          amount: e.amount,
          entry_type: e.entry_type,
          accept_written: e.accept_written,
        })),
      };

      const res = await fetch(`/api/pages/${page.id}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error?.message || "Failed to confirm page.");
        return;
      }

      clearDraft();
      router.push("/dashboard");
      router.refresh();
    } catch {
      setSubmitError("Network error while confirming. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddRow = () => {
    updateEntries((prev) => [
      ...prev,
      {
        customer_name: "",
        item: "",
        quantity: 1,
        unit_price: 0,
        amount: 0,
        entry_type: "credit",
        confidence: 1.0,
        needs_review: false,
        line_discrepancy: false,
      },
    ]);
    setSelectedIdx(entries.length);
  };

  return (
    <div className="relative space-y-4">
      {/* Collapsible Notebook Preview Strip */}
      <NotebookStrip imageUrl={imageUrl} />

      {submitError && (
        <div
          role="alert"
          className="p-3.5 rounded-row bg-[#FDF2F2] border border-margin text-margin text-xs font-bold"
        >
          {submitError}
        </div>
      )}

      {/* Spreadsheet Review Container */}
      <div className="rounded-sheet border border-rule bg-sheet shadow-paper overflow-hidden select-none">
        {/* Formula Bar */}
        <div className="border-b border-rule bg-paper/30 flex items-stretch divide-x divide-rule">
          {/* Cell Address Coordinate */}
          <div className="w-14 sm:w-16 h-10 flex items-center justify-center font-sans font-bold text-xs sm:text-sm text-pencil bg-sheet flex-shrink-0">
            {activeRowCoordinate}
          </div>

          {/* Function Symbol */}
          <div className="w-10 h-10 flex items-center justify-center text-sm font-serif italic text-muted flex-shrink-0 select-none">
            fx
          </div>

          {/* Formula Expression */}
          <div className="flex-1 h-10 px-3 flex items-center font-sans text-xs sm:text-sm text-pencil truncate">
            {formulaText}
          </div>

          {/* Evaluated Value */}
          <div className="px-4 h-10 flex items-center font-sans font-bold text-xs sm:text-sm text-pencil tabular-nums bg-sheet/80 flex-shrink-0">
            {activeEntry?.entry_type === "payment" ? "-" : ""}₱{activeAmount.toFixed(2)}
          </div>
        </div>

        {/* Scrollable Spreadsheet Table Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[760px] text-xs sm:text-sm font-sans">
            <thead>
              {/* Coordinate Row: Blank + A, B, C, D, E, F, G */}
              <tr className="bg-paper/50 border-b border-rule text-xs text-muted text-center font-semibold">
                <th scope="col" className="w-12 py-1.5 border-r border-rule bg-paper/80 font-normal">
                  {/* corner */}
                </th>
                <th scope="col" className="py-1.5 px-3 border-r border-rule font-normal">A</th>
                <th scope="col" className="py-1.5 px-3 border-r border-rule font-normal">B</th>
                <th scope="col" className="py-1.5 px-3 border-r border-rule font-normal">C</th>
                <th scope="col" className="py-1.5 px-3 border-r border-rule font-normal">D</th>
                <th scope="col" className="py-1.5 px-3 border-r border-rule font-normal">E</th>
                <th
                  scope="col"
                  className="py-1.5 px-3 border-r border-rule font-normal bg-[#E2E8D5] text-pencil font-bold"
                >
                  F
                </th>
                <th scope="col" className="py-1.5 px-3 font-normal">G</th>
              </tr>

              {/* Header Label Row: Row 1 */}
              <tr className="bg-sheet border-b border-rule font-bold text-xs text-pencil">
                <th
                  scope="row"
                  className="w-12 py-2.5 text-center border-r border-rule bg-paper/60 text-muted font-semibold"
                >
                  1
                </th>
                <th scope="col" className="py-2.5 px-3 border-r border-rule">Customer</th>
                <th scope="col" className="py-2.5 px-3 border-r border-rule">Type</th>
                <th scope="col" className="py-2.5 px-3 border-r border-rule">Item</th>
                <th scope="col" className="py-2.5 px-3 border-r border-rule text-right">Qty</th>
                <th scope="col" className="py-2.5 px-3 border-r border-rule text-right">Price</th>
                <th scope="col" className="py-2.5 px-3 border-r border-rule text-right bg-paper/20">
                  Amount
                </th>
                <th scope="col" className="py-2.5 px-3">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-rule/60 bg-sheet">
              {entries.map((entry, idx) => (
                <ExcelReviewRow
                  key={entry.id || `row-${idx}`}
                  index={idx}
                  entry={entry}
                  isSelected={selectedIdx === idx}
                  customerCandidates={customerCandidates}
                  onSelect={() => setSelectedIdx(idx)}
                  onUpdate={(updated) =>
                    updateEntries((prev) =>
                      prev.map((item, i) => (i === idx ? updated : item))
                    )
                  }
                  onRemove={() =>
                    updateEntries((prev) => prev.filter((_, i) => i !== idx))
                  }
                />
              ))}

              {/* Row N+2: Written total in notebook */}
              <tr className="bg-sheet border-t-2 border-rule">
                <td className="w-12 py-2.5 text-center border-r border-rule bg-paper/60 text-xs font-semibold text-muted">
                  {entries.length + 2}
                </td>
                <td
                  colSpan={5}
                  className="py-2.5 px-4 border-r border-rule text-right font-medium text-muted text-xs sm:text-sm"
                >
                  Written total in notebook
                </td>
                <td className="py-2.5 px-3 border-r border-rule text-right font-bold text-pencil tabular-nums bg-paper/10">
                  {writtenTotal !== null && writtenTotal !== undefined
                    ? `₱${Number(writtenTotal).toFixed(2)}`
                    : "—"}
                </td>
                <td className="py-2.5 px-3" />
              </tr>

              {/* Row N+3: Computed by code */}
              <tr className="bg-paper/20 border-b border-rule">
                <td className="w-12 py-2.5 text-center border-r border-rule bg-paper/60 text-xs font-semibold text-muted">
                  {entries.length + 3}
                </td>
                <td
                  colSpan={5}
                  className="py-2.5 px-4 border-r border-rule text-right font-bold text-pencil text-xs sm:text-sm"
                >
                  Computed by code
                </td>
                <td className="py-2.5 px-3 border-r border-rule text-right font-black text-pencil tabular-nums bg-sheet">
                  ₱{Number(totals.computedTotal).toFixed(2)}
                </td>
                <td className="py-2.5 px-3">
                  {!totals.hasPageDiscrepancy ? (
                    <span className="text-paid font-bold text-xs flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Match</span>
                    </span>
                  ) : (
                    <span className="text-margin font-bold text-xs flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Mismatch</span>
                    </span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Spreadsheet Sheet Tab Bar & Add Row Button */}
        <div className="border-t border-rule bg-paper/50 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center">
            {/* Sheet Tab */}
            <div className="px-4 py-2 bg-sheet border-r border-rule border-b-2 border-b-ink font-bold text-xs sm:text-sm text-pencil shadow-sm">
              {formattedDate}
            </div>

            {/* Insert Row Action */}
            <button
              type="button"
              onClick={handleAddRow}
              className="px-3.5 py-2 min-h-[44px] text-xs font-bold text-ink hover:bg-paper/80 flex items-center gap-1.5 transition-colors cursor-pointer border-r border-rule"
            >
              <Plus className="w-4 h-4" />
              <span>Insert Row</span>
            </button>
          </div>

          {/* Right Summary Info */}
          <div className="px-4 py-2 text-xs text-muted font-sans font-medium">
            {entries.length} {entries.length === 1 ? "row" : "rows"} &bull; Total: ₱
            {totals.computedTotal.toFixed(2)} &bull; Zero AI guesswork
          </div>
        </div>
      </div>

      {/* Sticky Bottom Two-Ply Proof Bar */}
      <TwoPlyProofBar
        writtenTotal={writtenTotal}
        computedTotal={totals.computedTotal}
        hasPageDiscrepancy={totals.hasPageDiscrepancy}
        discrepancyDiff={totals.discrepancyDiff}
        isConfirmDisabled={isConfirmDisabled}
        isSubmitting={submitting}
        disabledReason={disabledReason}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
