"use client";

import React, { useState, useMemo } from "react";
import { X, Copy, Share2, Printer, Check } from "lucide-react";
import type { CustomerLedgerEntry } from "@/types/ledger";
import { formatResiboText } from "@/lib/ledger/formatters";

interface CustomerReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeName: string;
  customerName: string;
  phoneOptional?: string | null;
  balance: number;
  totalCredit: number;
  totalPayment: number;
  entries: CustomerLedgerEntry[];
}

export function CustomerReceiptModal({
  isOpen,
  onClose,
  storeName,
  customerName,
  phoneOptional,
  balance,
  totalCredit,
  totalPayment,
  entries,
}: CustomerReceiptModalProps) {
  const [copied, setCopied] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  // Generate deterministic date, time, and trans # on client render
  const receiptMeta = useMemo(() => {
    const now = new Date();
    const dateStr = new Intl.DateTimeFormat("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    }).format(now);

    const timeStr = new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }).format(now);

    const dateDigits = dateStr.replace(/\D/g, "");
    const custHash = customerName
      .split("")
      .reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) % 100000, 0)
      .toString()
      .padStart(5, "0");

    const transNo = `${dateDigits.slice(0, 4)}${custHash}`;

    return { dateStr, timeStr, transNo };
  }, [customerName]);

  if (!isOpen) return null;

  const isSettled = balance <= 0;

  const resiboText = formatResiboText({
    storeName,
    customerName,
    balance,
    entries,
  });

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(resiboText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  }

  async function handleShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${storeName} - E-Resibo`,
          text: resiboText,
        });
        setShareFeedback("Shared!");
        setTimeout(() => setShareFeedback(null), 2000);
        return;
      } catch (err: unknown) {
        if ((err as Error)?.name === "AbortError") return;
      }
    }
    await handleCopy();
    setShareFeedback("Copied!");
    setTimeout(() => setShareFeedback(null), 2000);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="receipt-modal-title"
      className="fixed inset-0 z-50 bg-pencil/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-[330px] sm:max-w-[340px] my-auto flex flex-col items-center space-y-3">
        {/* Floating Close Button Top Right */}
        <div className="print:hidden w-full flex justify-end">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close receipt dialog"
            className="w-8 h-8 rounded-full bg-sheet/95 hover:bg-sheet text-pencil hover:text-ink flex items-center justify-center shadow-md transition-colors cursor-pointer border border-rule/50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Thermal Receipt Paper Roll Slip (Image 2 Replica) */}
        <div className="w-full bg-white text-zinc-900 font-mono text-xs shadow-[0_12px_40px_rgba(0,0,0,0.22)] border border-zinc-300 p-5 sm:p-6 space-y-3 select-none print:p-0 print:border-none print:shadow-none">
          {/* Header Title (Matching Image 2) */}
          <div className="text-center space-y-0.5">
            <h2
              id="receipt-modal-title"
              className="font-bold tracking-wider text-sm sm:text-base uppercase text-zinc-900"
            >
              {storeName}
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-600">
              Customer Receipt
            </p>
          </div>

          {/* Dashed Separator */}
          <div className="border-t border-dashed border-zinc-400" />

          {/* DATE, TIME, TRANS # (Matching Image 2) */}
          <div className="space-y-1 text-[11px] leading-tight">
            <div className="flex justify-between items-baseline">
              <span>DATE: {receiptMeta.dateStr}</span>
              <span>TIME: {receiptMeta.timeStr}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span>TRANS #</span>
              <span className="font-bold">{receiptMeta.transNo}</span>
            </div>
          </div>

          {/* Dashed Separator */}
          <div className="border-t border-dashed border-zinc-400" />

          {/* RECEIVED FROM & FOR (Matching Image 2) */}
          <div className="space-y-1.5 text-[11px] leading-snug">
            <div>
              <span className="text-[10px] text-zinc-500 font-bold uppercase block">
                RECEIVED FROM:
              </span>
              <strong className="font-bold text-xs uppercase block text-zinc-900">
                {customerName}
              </strong>
              {phoneOptional && (
                <span className="text-[10px] text-zinc-500 block">TEL: {phoneOptional}</span>
              )}
            </div>

            <div className="pt-0.5">
              <span className="text-[10px] text-zinc-500 font-bold uppercase block">
                FOR:
              </span>
              <span className="text-[11px] block">Store Credit / Utang Statement</span>
            </div>
          </div>

          {/* Dashed Separator */}
          <div className="border-t border-dashed border-zinc-400" />

          {/* Itemized Credit / Payment Entries */}
          <div className="space-y-1.5 text-[11px] max-h-44 overflow-y-auto pr-0.5">
            {entries.length === 0 ? (
              <div className="text-center text-zinc-500 py-2 text-[10px]">
                No outstanding ledger items.
              </div>
            ) : (
              entries.map((entry) => {
                const isPayment = entry.entry_type === "payment";
                return (
                  <div
                    key={entry.id}
                    className="flex items-start justify-between gap-2 leading-tight"
                  >
                    <div className="min-w-0 pr-1">
                      <span className="uppercase font-medium block truncate">
                        {entry.item}
                      </span>
                      {entry.quantity && entry.unit_price && (
                        <span className="text-[10px] text-zinc-500 block">
                          {entry.quantity} &times; ₱{Number(entry.unit_price).toFixed(2)}
                        </span>
                      )}
                    </div>
                    <span
                      className={`tabular-nums font-bold text-right flex-shrink-0 ${
                        isPayment ? "text-paid" : "text-zinc-900"
                      }`}
                    >
                      {isPayment ? "-₱" : "₱"}
                      {Number(entry.amount).toFixed(2)}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* Double Solid Line before TOTAL (Matching Image 2) */}
          <div className="border-t border-zinc-800 border-b border-zinc-800 py-[1px] my-1" />

          {/* Financial Totals Breakdown */}
          <div className="space-y-1 text-[11px] leading-tight">
            <div className="flex justify-between items-baseline">
              <span className="font-bold">TOTAL CREDIT</span>
              <span className="font-bold tabular-nums">₱{totalCredit.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-baseline text-zinc-600">
              <span>PAYMENTS RECORDED</span>
              <span className="font-bold tabular-nums text-paid">
                -₱{totalPayment.toFixed(2)}
              </span>
            </div>

            <div className="border-t border-dashed border-zinc-400 my-1" />

            <div className="flex justify-between items-baseline text-xs sm:text-sm font-black text-zinc-900">
              <span>NET TOTAL DUE</span>
              <span className="tabular-nums">₱{balance.toFixed(2)}</span>
            </div>
          </div>

          {/* Dashed Separator */}
          <div className="border-t border-dashed border-zinc-400" />

          {/* Status Stamp */}
          <div className="py-0.5 flex justify-center">
            <div
              className={`inline-flex items-center gap-1 px-3 py-1 border-2 font-black text-[11px] uppercase tracking-wider ${
                isSettled
                  ? "border-paid text-paid rotate-[-2deg] bg-[#EAF5EE]/60"
                  : "border-margin text-margin rotate-[2deg] bg-[#FDF2F2]/60"
              }`}
            >
              {isSettled ? "✓ FULLY SETTLED" : "▲ PAYMENT DUE"}
            </div>
          </div>

          {/* Signature Block (Exact match of Image 2) */}
          <div className="pt-1 text-[10px] space-y-3 leading-tight">
            <div className="text-center font-bold tracking-wider text-[11px] text-zinc-800">
              RECEIVED BY:
            </div>

            <div className="flex items-baseline gap-1.5 pt-1">
              <span className="font-bold text-[10px]">Signature:</span>
              <div className="flex-1 border-b border-zinc-800" />
            </div>

            <div className="flex items-baseline gap-1.5">
              <span className="font-bold text-[10px]">Print Name:</span>
              <div className="flex-1 border-b border-zinc-800" />
            </div>
          </div>

          {/* Bottom Dashed Separator & Thank You */}
          <div className="border-t border-dashed border-zinc-400 pt-2 text-center text-[9px] text-zinc-500 uppercase tracking-widest">
            * Maraming salamat po sa tiwala! *
          </div>
        </div>

        {/* 3 Compact Action Buttons (Hidden when printing) */}
        <div className="print:hidden w-full grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="min-h-[44px] rounded-row bg-sheet hover:bg-paper border border-rule text-pencil font-sans font-bold text-xs flex items-center justify-center gap-1 shadow-xs active:scale-[0.98] transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-paid" />
                <span className="text-paid">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-muted" />
                <span>Copy</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="min-h-[44px] rounded-row bg-ink hover:bg-ink/90 text-sheet font-sans font-bold text-xs flex items-center justify-center gap-1 shadow-paper active:scale-[0.98] transition-all cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{shareFeedback || "Share"}</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="min-h-[44px] rounded-row bg-sheet hover:bg-paper border border-ink text-ink font-sans font-bold text-xs flex items-center justify-center gap-1 shadow-xs active:scale-[0.98] transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </div>
      </div>
    </div>
  );
}
