"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { NotebookStrip } from "./NotebookStrip";
import { EntryReviewRow } from "./EntryReviewRow";
import { AddRowButton } from "./AddRowButton";
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

export function ReviewSheet({
  page,
  initialEntries,
  customerCandidates,
  imageUrl,
}: ReviewSheetProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    entries,
    writtenTotal,
    updateEntries,
    clearDraft,
  } = useReviewDraft(page.id, initialEntries, page.written_total);

  // Compute live deterministic totals during render (no useEffect)
  const totals = computePageTotals(entries, writtenTotal ?? undefined);

  // Check disabled conditions
  const hasUnresolvedMismatch = entries.some(
    (e) => checkRowDiscrepancy(e.quantity ?? undefined, e.unit_price ?? undefined, e.amount) && !e.accept_written
  );
  const hasMissingCustomer = entries.some(
    (e) => (e.entry_type === "credit" || e.entry_type === "payment") && !e.customer_id && !e.extracted_customer_name?.trim()
  );
  const hasNoEntries = entries.length === 0;

  let disabledReason: string | null = null;
  if (hasNoEntries) disabledReason = "Kailangan ng kahit isang linya ng transaksyon.";
  else if (hasUnresolvedMismatch) disabledReason = "Pumili ng 'Gamitin ang Kompyut' o 'Panatilihin' sa bawat maling kwenta.";
  else if (hasMissingCustomer) disabledReason = "Pumili ng customer para sa bawat Utang o Bayad na linya.";

  const isConfirmDisabled = hasNoEntries || hasUnresolvedMismatch || hasMissingCustomer;

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
        setSubmitError(data.error?.message || "Hindi nagtagumpay ang pagkumpirma.");
        return;
      }

      clearDraft();
      router.push("/dashboard");
      router.refresh();
    } catch {
      setSubmitError("Network error habang kinukumpirma. Pakisubukang muli.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddRow = () => {
    updateEntries((prev) => [
      ...prev,
      {
        customer_name: "Walang Pangalan",
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
  };

  return (
    <div className="relative pb-36 space-y-4">
      <NotebookStrip imageUrl={imageUrl} />

      {submitError && (
        <div role="alert" className="p-3.5 rounded-row bg-[#FDF2F2] border border-margin text-margin text-xs font-bold">
          {submitError}
        </div>
      )}

      <div className="space-y-3 relative before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[2px] before:bg-margin before:margin-draw">
        {entries.map((entry, idx) => (
          <EntryReviewRow
            key={entry.id || `temp-row-${idx}`}
            index={idx}
            entry={entry}
            customerCandidates={customerCandidates}
            onUpdate={(updated) => updateEntries((prev) => prev.map((item, i) => (i === idx ? updated : item)))}
            onRemove={() => updateEntries((prev) => prev.filter((_, i) => i !== idx))}
          />
        ))}

        <AddRowButton onAdd={handleAddRow} />
      </div>

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
