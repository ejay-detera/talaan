"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight, Image as ImageIcon, X } from "lucide-react";
import type { ReviewEntry } from "@/types/ledger";

interface ConfirmedPageSheetProps {
  page: {
    id: string;
    page_date: string | null;
    written_total: number | null;
    computed_total: number;
    has_page_discrepancy: boolean;
    model: string;
  };
  entries: ReviewEntry[];
  imageUrl: string | null;
}

/**
 * ConfirmedPageSheet
 *
 * Implements the spreadsheet ledger view from the design specification.
 * Features an interactive formula bar, lettered column headers (A-G),
 * row-level selection, deterministic reconciliation rows, and photo inspection.
 */
export function ConfirmedPageSheet({
  page,
  entries,
  imageUrl,
}: ConfirmedPageSheetProps) {
  // Default selection to row 1 (Row 3 in spreadsheet coordinates) or 0
  const [selectedIdx, setSelectedIdx] = useState<number>(() => {
    return entries.length > 1 ? 1 : 0;
  });
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  const activeEntry = entries[selectedIdx] ?? entries[0];
  const activeRowCoordinate = selectedIdx >= 0 ? `F${selectedIdx + 2}` : "F2";

  // Derive active formula bar expression
  let formulaText = "= ₱0.00";
  let activeAmount = 0;
  if (activeEntry) {
    activeAmount = activeEntry.amount;
    if (activeEntry.entry_type === "payment") {
      formulaText = `= -₱${Number(activeEntry.amount).toFixed(2)} (payment deduction)`;
    } else if (activeEntry.quantity && activeEntry.unit_price) {
      formulaText = `= ${activeEntry.quantity} × ₱${Number(activeEntry.unit_price).toFixed(2)}`;
    } else {
      formulaText = `= ₱${Number(activeEntry.amount).toFixed(2)}`;
    }
  }

  // Format page date
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

  const isMatch = !page.has_page_discrepancy;

  return (
    <div className="space-y-4 select-none pb-6">
      {/* Status & Action Banner */}
      <div className="p-4 sm:p-5 rounded-sheet border border-rule bg-sheet shadow-paper flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-paid/10 text-paid flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-paid font-sans leading-tight">
              Confirmed &amp; saved to ledger
            </h2>
            <p className="text-xs text-muted font-sans mt-0.5">
              {entries.length} {entries.length === 1 ? "row" : "rows"}, all computed by code
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {imageUrl && (
            <button
              type="button"
              onClick={() => setShowPhotoModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 min-h-[44px] rounded-row border border-rule bg-sheet text-ink hover:bg-paper active:scale-[0.99] text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-sm"
            >
              <ImageIcon className="w-4 h-4 text-ink" />
              <span>Original photo</span>
            </button>
          )}

          <Link
            href="/customers"
            className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[44px] rounded-row bg-ink text-sheet text-xs sm:text-sm font-bold shadow-paper hover:bg-ink/90 active:scale-[0.99] transition-all cursor-pointer"
          >
            <span>Customers</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Spreadsheet Ledger Card */}
      <div className="rounded-sheet border border-rule bg-sheet shadow-paper overflow-hidden">
        {/* Formula Bar */}
        <div className="border-b border-rule bg-paper/30 flex items-stretch divide-x divide-rule">
          {/* Cell Address Box */}
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
          <table className="w-full text-left border-collapse min-w-[720px] text-xs sm:text-sm font-sans">
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
              {/* Data Rows (2, 3, 4, 5...) */}
              {entries.map((entry, idx) => {
                const rowNum = idx + 2;
                const isSelected = selectedIdx === idx;
                const isPayment = entry.entry_type === "payment";

                return (
                  <tr
                    key={entry.id || idx}
                    onClick={() => setSelectedIdx(idx)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? "bg-paper/40" : "hover:bg-paper/20"
                    }`}
                  >
                    {/* Row Number */}
                    <td
                      className={`w-12 py-2.5 text-center border-r border-rule text-xs font-bold ${
                        isSelected
                          ? "bg-ink text-sheet"
                          : "bg-paper/60 text-muted"
                      }`}
                    >
                      {rowNum}
                    </td>

                    {/* Column A: Customer */}
                    <td className="py-2.5 px-3 border-r border-rule font-bold text-pencil truncate max-w-[140px]">
                      {entry.customer_name}
                    </td>

                    {/* Column B: Type */}
                    <td
                      className={`py-2.5 px-3 border-r border-rule font-bold ${
                        isPayment ? "text-paid" : "text-pencil"
                      }`}
                    >
                      {isPayment ? "Payment" : "Credit"}
                    </td>

                    {/* Column C: Item */}
                    <td className="py-2.5 px-3 border-r border-rule text-pencil truncate max-w-[180px]">
                      {entry.item}
                    </td>

                    {/* Column D: Qty */}
                    <td className="py-2.5 px-3 border-r border-rule text-right tabular-nums text-pencil">
                      {entry.quantity ?? ""}
                    </td>

                    {/* Column E: Price */}
                    <td className="py-2.5 px-3 border-r border-rule text-right tabular-nums text-pencil">
                      {entry.unit_price ? `₱${Number(entry.unit_price).toFixed(2)}` : ""}
                    </td>

                    {/* Column F: Amount */}
                    <td
                      className={`py-2.5 px-3 border-r border-rule text-right tabular-nums font-bold ${
                        isPayment ? "text-paid" : "text-pencil"
                      } ${isSelected ? "border-2 border-ink bg-sheet" : "bg-paper/10"}`}
                    >
                      {isPayment ? "-" : ""}₱{Number(entry.amount).toFixed(2)}
                    </td>

                    {/* Column G: Status */}
                    <td className="py-2.5 px-3 text-paid font-bold text-xs flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Confirmed</span>
                    </td>
                  </tr>
                );
              })}

              {/* Decorative Empty Grid Rows (Rows 6 & 7) for authentic ledger pad look */}
              <tr className="bg-sheet text-muted/30">
                <td className="w-12 py-2 text-center border-r border-rule bg-paper/40 text-xs font-semibold">
                  {entries.length + 2}
                </td>
                <td className="py-2 px-3 border-r border-rule" />
                <td className="py-2 px-3 border-r border-rule" />
                <td className="py-2 px-3 border-r border-rule" />
                <td className="py-2 px-3 border-r border-rule" />
                <td className="py-2 px-3 border-r border-rule" />
                <td className="py-2 px-3 border-r border-rule bg-paper/10" />
                <td className="py-2 px-3" />
              </tr>
              <tr className="bg-sheet text-muted/30">
                <td className="w-12 py-2 text-center border-r border-rule bg-paper/40 text-xs font-semibold">
                  {entries.length + 3}
                </td>
                <td className="py-2 px-3 border-r border-rule" />
                <td className="py-2 px-3 border-r border-rule" />
                <td className="py-2 px-3 border-r border-rule" />
                <td className="py-2 px-3 border-r border-rule" />
                <td className="py-2 px-3 border-r border-rule" />
                <td className="py-2 px-3 border-r border-rule bg-paper/10" />
                <td className="py-2 px-3" />
              </tr>

              {/* Row 8: Written total in notebook */}
              <tr className="bg-sheet border-t-2 border-rule">
                <td className="w-12 py-2.5 text-center border-r border-rule bg-paper/60 text-xs font-semibold text-muted">
                  {entries.length + 4}
                </td>
                <td
                  colSpan={5}
                  className="py-2.5 px-4 border-r border-rule text-right font-medium text-muted text-xs sm:text-sm"
                >
                  Written total in notebook
                </td>
                <td className="py-2.5 px-3 border-r border-rule text-right font-bold text-pencil tabular-nums bg-paper/10">
                  {page.written_total !== null
                    ? `₱${Number(page.written_total).toFixed(2)}`
                    : "—"}
                </td>
                <td className="py-2.5 px-3" />
              </tr>

              {/* Row 9: Computed by code */}
              <tr className="bg-paper/20 border-b border-rule">
                <td className="w-12 py-2.5 text-center border-r border-rule bg-paper/60 text-xs font-semibold text-muted">
                  {entries.length + 5}
                </td>
                <td
                  colSpan={5}
                  className="py-2.5 px-4 border-r border-rule text-right font-bold text-pencil text-xs sm:text-sm"
                >
                  Computed by code
                </td>
                <td className="py-2.5 px-3 border-r border-rule text-right font-black text-pencil tabular-nums bg-sheet">
                  ₱{Number(page.computed_total).toFixed(2)}
                </td>
                <td className="py-2.5 px-3">
                  {isMatch ? (
                    <span className="text-paid font-bold text-xs flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Match</span>
                    </span>
                  ) : (
                    <span className="text-margin font-bold text-xs">
                      Mismatch
                    </span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Spreadsheet Sheet Tab & Footer Status Bar */}
        <div className="border-t border-rule bg-paper/50 flex items-center justify-between">
          {/* Active Sheet Tab */}
          <div className="px-4 py-2 bg-sheet border-r border-rule border-b-2 border-b-ink font-bold text-xs sm:text-sm text-pencil shadow-sm">
            {formattedDate}
          </div>

          {/* Right Summary Info */}
          <div className="px-4 text-xs text-muted font-sans font-medium">
            {entries.length} {entries.length === 1 ? "row" : "rows"} &bull; Total: ₱
            {Number(page.computed_total).toFixed(2)}
          </div>
        </div>
      </div>

      {/* Original Photo Lightbox Modal */}
      {showPhotoModal && imageUrl && (
        <div className="fixed inset-0 z-50 bg-pencil/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-3xl w-full bg-sheet rounded-sheet border border-rule shadow-paper-lg overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-3.5 sm:p-4 border-b border-rule flex items-center justify-between bg-paper/50">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-ink" />
                <h3 className="text-sm font-bold text-pencil font-sans">
                  Original Notebook Photo ({formattedDate})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPhotoModal(false)}
                className="w-8 h-8 rounded-full hover:bg-paper flex items-center justify-center text-pencil transition-colors cursor-pointer"
                aria-label="Close photo preview"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body: High-Res Image */}
            <div className="p-4 overflow-auto flex items-center justify-center bg-paper/20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt="Original scanned notebook page"
                className="max-h-[70vh] w-auto object-contain rounded-sm border border-rule shadow-sm"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
