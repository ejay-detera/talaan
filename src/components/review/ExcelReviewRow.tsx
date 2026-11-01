"use client";

import React from "react";
import { Trash2, AlertCircle, CheckCircle2, User, UserPlus } from "lucide-react";
import { checkRowDiscrepancy, toPesos, toCentavos, checkCreditLimitExceeded } from "@/lib/ledger/math";
import type { ReviewEntry, EntryType, ReviewCustomerCandidate } from "@/types/ledger";

interface ExcelReviewRowProps {
  index: number;
  entry: ReviewEntry;
  isSelected: boolean;
  customerCandidates: ReviewCustomerCandidate[];
  onSelect: () => void;
  onUpdate: (updated: ReviewEntry) => void;
  onRemove: () => void;
}

/**
 * ExcelReviewRow
 *
 * Implements an interactive spreadsheet row for the Page Review Excel sheet.
 * Supports inline editing, auto-calculation of Qty * Price, customer matching,
 * credit limit exceedance badges, 24h duplicate payment checks, and deterministic math mismatch resolution.
 */
export function ExcelReviewRow({
  index,
  entry,
  isSelected,
  customerCandidates,
  onSelect,
  onUpdate,
  onRemove,
}: ExcelReviewRowProps) {
  const rowNumber = index + 2;
  const qty = entry.quantity ?? undefined;
  const price = entry.unit_price ?? undefined;
  const isMismatch = checkRowDiscrepancy(qty, price, entry.amount);
  const isPayment = entry.entry_type === "payment";
  const isCredit = entry.entry_type === "credit";

  // Match customer candidate to evaluate credit limits and recent 24h counter payments
  const matchedCandidate = entry.customer_id
    ? customerCandidates.find((c) => c.id === entry.customer_id)
    : customerCandidates.find(
        (c) =>
          c.name.toLowerCase() ===
          (entry.extracted_customer_name || entry.customer_name || "").trim().toLowerCase()
      );

  const creditLimitCheck =
    isCredit && matchedCandidate
      ? checkCreditLimitExceeded(
          matchedCandidate.current_balance || 0,
          entry.amount,
          matchedCandidate.credit_limit
        )
      : null;
  const isLimitExceeded = creditLimitCheck?.isExceeded ?? false;

  const hasRecentPayment =
    isPayment &&
    Boolean(matchedCandidate?.recent_payments && matchedCandidate.recent_payments.length > 0);
  const recentPayment = hasRecentPayment ? matchedCandidate!.recent_payments![0] : null;

  const computedRowAmount =
    qty !== undefined && price !== undefined
      ? toPesos(Math.round(qty * toCentavos(price)))
      : entry.amount;

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

  const handleQtyChange = (valStr: string) => {
    const newQty = valStr === "" ? null : Number(valStr);
    if (newQty !== null && price !== undefined) {
      const newComputed = toPesos(Math.round(newQty * toCentavos(price)));
      onUpdate({
        ...entry,
        quantity: newQty,
        amount: newComputed,
        accept_written: false,
      });
    } else {
      onUpdate({ ...entry, quantity: newQty });
    }
  };

  const handlePriceChange = (valStr: string) => {
    const newPrice = valStr === "" ? null : Number(valStr);
    if (newPrice !== null && qty !== undefined) {
      const newComputed = toPesos(Math.round(qty * toCentavos(newPrice)));
      onUpdate({
        ...entry,
        unit_price: newPrice,
        amount: newComputed,
        accept_written: false,
      });
    } else {
      onUpdate({ ...entry, unit_price: newPrice });
    }
  };

  const handleAmountChange = (valStr: string) => {
    const newAmount = Number(valStr) || 0;
    onUpdate({
      ...entry,
      amount: newAmount,
      accept_written: false,
    });
  };

  return (
    <>
      <tr
        onClick={onSelect}
        className={`paper-row transition-colors cursor-pointer ${
          isSelected ? "bg-paper/40" : "hover:bg-paper/20"
        } ${isMismatch && !entry.accept_written ? "bg-[#FFF5F5]" : ""}`}
      >
        {/* Row Number Coordinate */}
        <td
          className={`w-12 py-2 text-center border-r border-rule text-xs font-bold select-none ${
            isSelected ? "bg-ink text-sheet" : "bg-paper/60 text-muted"
          }`}
        >
          {rowNumber}
        </td>

        {/* Column A: Customer */}
        <td className="py-1 px-2 border-r border-rule min-w-[170px]">
          <div className="flex items-center gap-1.5">
            {entry.customer_id ? (
              <User className="w-3.5 h-3.5 text-ink flex-shrink-0" />
            ) : (
              <UserPlus className="w-3.5 h-3.5 text-muted flex-shrink-0" />
            )}
            <input
              type="text"
              value={entry.extracted_customer_name || entry.customer_name || ""}
              onFocus={onSelect}
              onChange={(e) =>
                onUpdate({
                  ...entry,
                  customer_id: null,
                  extracted_customer_name: e.target.value,
                  customer_name: e.target.value,
                })
              }
              placeholder="Customer name..."
              className="w-full h-8 px-2 text-xs font-semibold rounded-none bg-transparent border-0 text-pencil focus:ring-1 focus:ring-ink focus:bg-sheet font-sans"
              aria-label={`Customer name row ${rowNumber}`}
            />
            {customerCandidates.length > 0 && (
              <select
                value={entry.customer_id || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val) {
                    const found = customerCandidates.find((c) => c.id === val);
                    onUpdate({
                      ...entry,
                      customer_id: val,
                      extracted_customer_name: found ? found.name : null,
                      customer_name: found ? found.name : entry.customer_name,
                    });
                  }
                }}
                className="w-5 h-8 opacity-40 hover:opacity-100 bg-transparent text-xs text-pencil border-0 cursor-pointer"
                title="Select existing customer"
                aria-label="Select from existing customers"
              >
                <option value="">-- Match --</option>
                {customerCandidates.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
            {isLimitExceeded && (
              <span
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-row text-[10px] font-bold bg-[#FFF2E5] text-[#9A4A00] border border-[#FFD8B3] shrink-0 whitespace-nowrap"
                title={`Projected debt ₱${creditLimitCheck?.projectedBalance.toFixed(2)} exceeds ₱${creditLimitCheck?.limit.toFixed(2)} limit`}
              >
                <AlertCircle className="w-3 h-3 text-[#9A4A00]" />
                <span>Limit Exceeded</span>
              </span>
            )}
          </div>
        </td>

        {/* Column B: Type */}
        <td className="py-1 px-2 border-r border-rule min-w-[110px]">
          <select
            value={entry.entry_type}
            onFocus={onSelect}
            onChange={(e) =>
              onUpdate({ ...entry, entry_type: e.target.value as EntryType })
            }
            className={`w-full h-8 px-1.5 text-xs font-bold rounded-none bg-transparent border-0 cursor-pointer focus:ring-1 focus:ring-ink focus:bg-sheet ${
              isPayment ? "text-paid" : "text-pencil"
            }`}
            aria-label={`Transaction type row ${rowNumber}`}
          >
            <option value="credit">Credit</option>
            <option value="payment">Payment</option>
            <option value="cash_sale">Cash Sale</option>
          </select>
        </td>

        {/* Column C: Item */}
        <td className="py-1 px-2 border-r border-rule min-w-[170px]">
          <input
            type="text"
            value={entry.item}
            onFocus={onSelect}
            onChange={(e) => onUpdate({ ...entry, item: e.target.value })}
            placeholder="Item description..."
            className="w-full h-8 px-2 text-xs font-semibold rounded-none bg-transparent border-0 text-pencil focus:ring-1 focus:ring-ink focus:bg-sheet font-sans"
            aria-label={`Item description row ${rowNumber}`}
          />
        </td>

        {/* Column D: Qty */}
        <td className="py-1 px-2 border-r border-rule min-w-[70px]">
          <input
            type="number"
            step="any"
            value={entry.quantity ?? ""}
            onFocus={onSelect}
            onChange={(e) => handleQtyChange(e.target.value)}
            placeholder="1"
            className="w-full h-8 px-2 text-xs font-bold text-right tabular-nums rounded-none bg-transparent border-0 text-pencil focus:ring-1 focus:ring-ink focus:bg-sheet"
            aria-label={`Quantity row ${rowNumber}`}
          />
        </td>

        {/* Column E: Price */}
        <td className="py-1 px-2 border-r border-rule min-w-[90px]">
          <input
            type="number"
            step="0.01"
            value={entry.unit_price ?? ""}
            onFocus={onSelect}
            onChange={(e) => handlePriceChange(e.target.value)}
            placeholder="0.00"
            className="w-full h-8 px-2 text-xs font-bold text-right tabular-nums rounded-none bg-transparent border-0 text-pencil focus:ring-1 focus:ring-ink focus:bg-sheet"
            aria-label={`Price row ${rowNumber}`}
          />
        </td>

        {/* Column F: Amount */}
        <td
          className={`py-1 px-2 border-r border-rule min-w-[110px] ${
            isSelected ? "ring-2 ring-ink ring-inset bg-sheet" : "bg-paper/10"
          } ${
            isMismatch && !entry.accept_written
              ? "bg-[#FFF0F0] border-margin"
              : ""
          }`}
        >
          <div className="flex items-center justify-end gap-1">
            <span className="text-xs font-bold text-muted font-sans select-none">
              {isPayment ? "-₱" : "₱"}
            </span>
            <input
              type="number"
              step="0.01"
              value={entry.amount}
              onFocus={onSelect}
              onChange={(e) => handleAmountChange(e.target.value)}
              className={`w-20 h-8 px-1 text-xs sm:text-sm font-extrabold text-right tabular-nums rounded-none bg-transparent border-0 focus:outline-none ${
                isPayment ? "text-paid" : "text-pencil"
              }`}
              aria-label={`Amount row ${rowNumber}`}
            />
          </div>
        </td>

        {/* Column G: Status & Remove */}
        <td className="py-1 px-3 min-w-[110px]">
          <div className="flex items-center justify-between gap-1">
            {isMismatch && !entry.accept_written ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-margin">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Mismatch</span>
              </span>
            ) : hasRecentPayment ? (
              <span
                className="inline-flex items-center gap-1 text-xs font-bold text-[#B45309]"
                title={`Advisory: ₱${recentPayment?.amount.toFixed(2)} counter payment recorded in last 24h`}
              >
                <AlertCircle className="w-3.5 h-3.5 text-[#B45309]" />
                <span className="hidden sm:inline">Paid in 24h?</span>
                <span className="sm:hidden">Duplicate?</span>
              </span>
            ) : isLimitExceeded ? (
              <span
                className="inline-flex items-center gap-1 text-xs font-bold text-[#B45309]"
                title={`Projected debt ₱${creditLimitCheck?.projectedBalance.toFixed(2)} exceeds ₱${creditLimitCheck?.limit.toFixed(2)} limit`}
              >
                <AlertCircle className="w-3.5 h-3.5 text-[#B45309]" />
                <span>Over Limit</span>
              </span>
            ) : entry.needs_review ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-pencil">
                <AlertCircle className="w-3.5 h-3.5 text-margin" />
                <span>Review</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-paid">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified</span>
              </span>
            )}

            <button
              type="button"
              onClick={onRemove}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-muted hover:text-margin p-1 rounded-row cursor-pointer transition-colors"
              title="Delete row"
              aria-label={`Delete row ${rowNumber}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </td>
      </tr>

      {/* Math Discrepancy Quick Resolution Sub-Row */}
      {isMismatch && !entry.accept_written && (
        <tr className="bg-[#FFF5F5] border-b border-margin/40">
          <td className="w-12 bg-margin/10 border-r border-rule text-center text-xs font-bold text-margin select-none">
            !
          </td>
          <td colSpan={7} className="p-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <p className="text-xs font-semibold text-margin font-sans">
                Math discrepancy: {qty} &times; ₱{price} = ₱
                {computedRowAmount.toFixed(2)}, but ₱{entry.amount.toFixed(2)} is
                written.
              </p>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={handleUseComputed}
                  className="px-3 py-1.5 rounded-row bg-ink text-sheet text-xs font-bold cursor-pointer hover:bg-ink/90 active:scale-[0.99] font-sans shadow-sm"
                >
                  Use Computed (₱{computedRowAmount.toFixed(2)})
                </button>
                <button
                  type="button"
                  onClick={handleKeepWritten}
                  className="px-3 py-1.5 rounded-row border border-margin text-margin bg-sheet text-xs font-bold cursor-pointer hover:bg-[#FFF0F0] active:scale-[0.99] font-sans"
                >
                  Keep Written (₱{entry.amount.toFixed(2)})
                </button>
              </div>
            </div>
          </td>
        </tr>
      )}

      {/* 24h Duplicate Counter Payment Advisory Sub-Row */}
      {hasRecentPayment && !isMismatch && (
        <tr className="bg-[#FFFDF5] border-b border-[#F6E05E]/60 text-xs">
          <td className="w-12 bg-[#FEFCBF]/30 border-r border-rule text-center select-none py-1.5">
            <AlertCircle className="w-4 h-4 mx-auto text-[#B45309]" />
          </td>
          <td colSpan={7} className="py-2 px-3 text-[#744210] font-sans">
            <span className="font-bold">Duplicate Payment Check:</span>{" "}
            {matchedCandidate?.name || "Customer"} recorded a direct counter payment of{" "}
            <strong className="tabular-nums font-bold">₱{recentPayment?.amount.toFixed(2)}</strong>{" "}
            within the last 24 hours. Verify if this handwritten entry was already settled.
          </td>
        </tr>
      )}

      {/* Credit Limit Exceeded Advisory Sub-Row */}
      {isLimitExceeded && !isMismatch && (
        <tr className="bg-[#FFFDF5] border-b border-[#F6E05E]/60 text-xs">
          <td className="w-12 bg-[#FEFCBF]/30 border-r border-rule text-center select-none py-1.5">
            <AlertCircle className="w-4 h-4 mx-auto text-[#B45309]" />
          </td>
          <td colSpan={7} className="py-2 px-3 text-[#744210] font-sans">
            <span className="font-bold">Credit Limit Notice:</span> Adding ₱{entry.amount.toFixed(2)}{" "}
            pushes {matchedCandidate?.name || "Customer"}&apos;s balance from ₱{creditLimitCheck?.currentBalance.toFixed(2)}{" "}
            to <strong className="tabular-nums font-bold">₱{creditLimitCheck?.projectedBalance.toFixed(2)}</strong>{" "}
            (exceeds ₱{creditLimitCheck?.limit.toFixed(2)} limit). Non-blocking advisory.
          </td>
        </tr>
      )}
    </>
  );
}

