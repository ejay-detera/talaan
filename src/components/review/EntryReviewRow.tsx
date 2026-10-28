"use client";

import React from "react";
import { Trash2 } from "lucide-react";
import { RedMarginGutter } from "./RedMarginGutter";
import { CustomerPicker } from "./CustomerPicker";
import { checkRowDiscrepancy, toPesos, toCentavos } from "@/lib/ledger/math";
import type { ReviewEntry, EntryType } from "@/types/ledger";

interface EntryReviewRowProps {
  entry: ReviewEntry;
  index: number;
  customerCandidates: Array<{ id: string; name: string }>;
  onUpdate: (updated: ReviewEntry) => void;
  onRemove: () => void;
}

export function EntryReviewRow({
  entry,
  index,
  customerCandidates,
  onUpdate,
  onRemove,
}: EntryReviewRowProps) {
  const qty = entry.quantity ?? undefined;
  const price = entry.unit_price ?? undefined;
  const isMismatch = checkRowDiscrepancy(qty, price, entry.amount);
  const computedRowAmount = qty !== undefined && price !== undefined ? toPesos(Math.round(qty * toCentavos(price))) : entry.amount;

  const handleUseComputed = () => {
    onUpdate({
      ...entry,
      amount: computedRowAmount,
      line_discrepancy: false,
      accept_written: false,
      needs_review: false,
    });
  };

  const handleKeepWritten = () => {
    onUpdate({
      ...entry,
      line_discrepancy: true,
      accept_written: true,
      needs_review: false,
    });
  };

  const isHighlighted = entry.needs_review && !isMismatch;

  return (
    <div
      className={`relative p-3.5 sm:p-4 rounded-row border transition-colors ${
        isMismatch
          ? "border-margin/60 bg-[#FFF5F5]"
          : isHighlighted
          ? "border-rule bg-marker/25"
          : "border-rule bg-sheet"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-rule/50">
        <RedMarginGutter lineDiscrepancy={isMismatch && !entry.accept_written} needsReview={isHighlighted} />
        <div className="flex items-center gap-2">
          <select
            value={entry.entry_type}
            onChange={(e) => onUpdate({ ...entry, entry_type: e.target.value as EntryType })}
            className="h-[36px] px-2 text-xs font-semibold rounded-row border border-rule bg-sheet text-pencil focus:ring-2 focus:ring-ink"
            aria-label="Uri ng transaksyon"
          >
            <option value="credit">Utang (Credit)</option>
            <option value="payment">Bayad (Payment)</option>
            <option value="cash_sale">Cash Sale</option>
          </select>
          <button
            type="button"
            onClick={onRemove}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-muted hover:text-margin p-1 rounded-row cursor-pointer transition-colors"
            title="Tanggalin ang linya"
            aria-label={`Tanggalin ang linya ${index + 1}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-2.5">
        <div className="sm:col-span-5">
          <CustomerPicker
            customerId={entry.customer_id}
            newCustomerName={entry.extracted_customer_name}
            customerCandidates={customerCandidates}
            onSelectCustomer={(cId, newName) =>
              onUpdate({
                ...entry,
                customer_id: cId,
                extracted_customer_name: newName,
              })
            }
          />
        </div>
        <div className="sm:col-span-7">
          <input
            type="text"
            value={entry.item}
            onChange={(e) => onUpdate({ ...entry, item: e.target.value })}
            placeholder="Paninda / Item..."
            className="h-[44px] px-2.5 text-xs font-semibold rounded-row border border-rule bg-sheet text-pencil w-full focus:ring-2 focus:ring-ink"
            aria-label="Pangalan ng paninda"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-2.5 items-center">
        <div>
          <label className="block text-[10px] text-muted font-bold uppercase tracking-wider mb-0.5">Dami (Qty)</label>
          <input
            type="number"
            step="any"
            value={entry.quantity ?? ""}
            onChange={(e) => {
              const val = e.target.value === "" ? null : Number(e.target.value);
              onUpdate({ ...entry, quantity: val });
            }}
            placeholder="1"
            className="h-[40px] px-2 text-xs font-bold tabular-nums rounded-row border border-rule bg-sheet text-pencil w-full focus:ring-2 focus:ring-ink"
          />
        </div>
        <div>
          <label className="block text-[10px] text-muted font-bold uppercase tracking-wider mb-0.5">Presyo (₱)</label>
          <input
            type="number"
            step="0.01"
            value={entry.unit_price ?? ""}
            onChange={(e) => {
              const val = e.target.value === "" ? null : Number(e.target.value);
              onUpdate({ ...entry, unit_price: val });
            }}
            placeholder="0.00"
            className="h-[40px] px-2 text-xs font-bold tabular-nums rounded-row border border-rule bg-sheet text-pencil w-full focus:ring-2 focus:ring-ink"
          />
        </div>
        <div>
          <label className="block text-[10px] text-muted font-bold uppercase tracking-wider mb-0.5">Halaga (₱)</label>
          <input
            type="number"
            step="0.01"
            value={entry.amount}
            onChange={(e) => {
              const val = Number(e.target.value) || 0;
              onUpdate({ ...entry, amount: val, accept_written: false });
            }}
            className="h-[40px] px-2 text-sm font-extrabold tabular-nums rounded-row border border-rule bg-sheet text-pencil w-full text-right focus:ring-2 focus:ring-ink"
          />
        </div>
      </div>

      {isMismatch && !entry.accept_written && (
        <div className="mt-3 p-2.5 rounded-row bg-[#FDF2F2] border border-margin text-xs space-y-2">
          <div className="font-semibold text-margin flex items-center justify-between">
            <span>May pagkakaiba sa kwenta: {qty} × ₱{price} = ₱{computedRowAmount.toFixed(2)}, pero ₱{entry.amount.toFixed(2)} ang nakasulat.</span>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={handleUseComputed}
              className="px-3 py-1.5 rounded-row bg-ink text-sheet text-xs font-bold cursor-pointer hover:bg-ink/90"
            >
              Gamitin ang Kompyut (₱{computedRowAmount.toFixed(2)})
            </button>
            <button
              type="button"
              onClick={handleKeepWritten}
              className="px-3 py-1.5 rounded-row border border-margin text-margin bg-sheet text-xs font-bold cursor-pointer hover:bg-[#FFF0F0]"
            >
              Panatilihin ang Nakasulat (₱{entry.amount.toFixed(2)})
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
