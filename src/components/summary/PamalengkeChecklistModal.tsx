"use client";

import React, { useState } from "react";
import { X, Copy, Share2, Printer, Check, ShoppingBag, CheckSquare, RotateCcw } from "lucide-react";
import type { RestockItemSummary } from "@/lib/ledger/summary";
import { formatPamalengkeListText } from "@/lib/ledger/formatters";
import { Amount } from "@/components/shared/Amount";

interface PamalengkeChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeName: string;
  items: RestockItemSummary[];
  periodLabel: string;
}

export function PamalengkeChecklistModal({
  isOpen,
  onClose,
  storeName,
  items,
  periodLabel,
}: PamalengkeChecklistModalProps) {
  const storageKey = `talaan_pamalengke_checked_${storeName.toLowerCase().replace(/\s+/g, "_")}`;

  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Ignore
    }
    return {};
  });

  const [copied, setCopied] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  function toggleItem(itemKey: string) {
    setCheckedItems((prev) => {
      const next = { ...prev, [itemKey]: !prev[itemKey] };
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // Ignore
      }
      return next;
    });
  }

  function handleSelectAll() {
    const allChecked: Record<string, boolean> = {};
    for (const it of items) {
      allChecked[it.item] = true;
    }
    setCheckedItems(allChecked);
    try {
      localStorage.setItem(storageKey, JSON.stringify(allChecked));
    } catch {
      // Ignore
    }
  }

  function handleReset() {
    setCheckedItems({});
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // Ignore
    }
  }

  if (!isOpen) return null;

  const totalCapital = items.reduce((acc, it) => acc + it.totalAmount, 0);
  const checkedCount = items.filter((it) => checkedItems[it.item]).length;

  const listText = formatPamalengkeListText({
    storeName,
    items,
    periodLabel,
  });

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(listText);
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
          title: `${storeName} - Pamalengke List`,
          text: listText,
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
      aria-labelledby="pamalengke-modal-title"
      className="fixed inset-0 z-50 bg-pencil/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-lg my-auto space-y-4">
        {/* Main Paper Sheet Card */}
        <div className="bg-sheet rounded-sheet border border-rule shadow-paper-lg overflow-hidden text-pencil font-sans">
          {/* Top Control Bar (Hidden when printing) */}
          <div className="print:hidden px-4 py-3 bg-paper border-b border-rule flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-ink" />
              <span id="pamalengke-modal-title" className="text-xs sm:text-sm font-bold font-sans">
                Pamalengke Restock Checklist
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close pamalengke dialog"
              className="w-8 h-8 rounded-full hover:bg-sheet flex items-center justify-center text-muted hover:text-pencil transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Main Paper Content Area */}
          <div className="p-4 sm:p-6 space-y-4 select-none print:p-0">
            {/* Header: Store Name, Subtitle, and Fixed Single-Line Progress Pill */}
            <div className="flex items-center justify-between gap-3 border-b border-rule/70 pb-3">
              <div className="min-w-0">
                <h2 className="font-display font-bold text-lg sm:text-xl text-pencil tracking-tight truncate">
                  Wholesale Restock List
                </h2>
                <p className="text-xs text-muted font-sans truncate">
                  {storeName} &bull; Sales velocity ({periodLabel})
                </p>
              </div>

              {/* Progress Count Badge: strictly whitespace-nowrap & shrink-0 */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-paper border border-rule text-xs font-bold font-sans whitespace-nowrap shrink-0 shadow-xs">
                <span className="text-ink tabular-nums">{checkedCount}</span>
                <span className="text-muted">of {items.length} bought</span>
              </div>
            </div>

            {/* Quick Actions Sub-bar */}
            <div className="print:hidden flex items-center justify-between text-xs font-sans text-muted">
              <span>Tap an item to cross it off:</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="font-bold text-ink hover:underline cursor-pointer flex items-center gap-1"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Check all</span>
                </button>
                <span>&bull;</span>
                <button
                  type="button"
                  onClick={handleReset}
                  className="font-bold text-muted hover:text-pencil cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* Authentic Paper Notebook Pad ("The Notebook, Kept") */}
            <div className="relative rounded-row border border-[#D5DEC6] bg-[#FFFDF5] shadow-paper overflow-hidden">
              {/* Top Perforated Binder Binding Strip */}
              <div className="h-7 bg-[#E8EDE0] border-b border-[#D5DEC6] flex items-center justify-between px-3 sm:px-4 select-none">
                <div className="flex items-center gap-2" aria-hidden="true">
                  <span className="w-2.5 h-2.5 rounded-full bg-paper border border-[#BAC6AB] shadow-inner" />
                  <span className="w-2.5 h-2.5 rounded-full bg-paper border border-[#BAC6AB] shadow-inner" />
                  <span className="w-2.5 h-2.5 rounded-full bg-paper border border-[#BAC6AB] shadow-inner" />
                </div>
                <span className="font-hand font-bold text-base text-[#465A30] tracking-wide">
                  Listahan sa Pamilihan
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted/70">
                  Restock Pad
                </span>
              </div>

              {/* Lined Paper Body with Red Margin Line */}
              <div className="relative bg-[#FFFDF5]">
                {/* Signature Red Margin Vertical Rule */}
                <div
                  className="absolute top-0 bottom-0 left-12 sm:left-14 w-[2px] bg-margin pointer-events-none z-10 opacity-80"
                  aria-hidden="true"
                />

                {/* Ruled Notebook Rows */}
                <div className="divide-y divide-[#E2E9D8] min-h-[220px] max-h-[360px] overflow-y-auto">
                  {items.length === 0 ? (
                    <div className="py-12 text-center text-xs text-muted font-sans pl-14">
                      No confirmed sales transactions in this period.
                    </div>
                  ) : (
                    items.map((item, idx) => {
                      const isChecked = !!checkedItems[item.item];
                      return (
                        <button
                          key={item.item}
                          type="button"
                          onClick={() => toggleItem(item.item)}
                          className={`w-full min-h-[50px] flex items-center transition-colors cursor-pointer text-left group ${
                            isChecked
                              ? "bg-paper/30"
                              : "hover:bg-white/60"
                          }`}
                        >
                          {/* Left Gutter (Left of Red Margin): Index / Checkbox */}
                          <div className="w-12 sm:w-14 flex items-center justify-center shrink-0 pr-1">
                            <div
                              className={`w-5 h-5 rounded-xs border-2 flex items-center justify-center transition-all ${
                                isChecked
                                  ? "border-ink bg-ink text-sheet shadow-xs"
                                  : "border-[#6E7B67] bg-white group-hover:border-ink"
                              }`}
                            >
                              {isChecked ? (
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              ) : (
                                <span className="text-[11px] font-bold text-muted font-sans">
                                  {idx + 1}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Content Area (Right of Red Margin) */}
                          <div className="flex-1 pl-3 sm:pl-4 pr-3 sm:pr-4 py-2.5 flex items-center justify-between gap-3 min-w-0">
                            <div className="min-w-0">
                              <p
                                className={`font-bold text-xs sm:text-sm truncate transition-all ${
                                  isChecked
                                    ? "text-muted line-through decoration-ink decoration-2"
                                    : "text-pencil"
                                }`}
                              >
                                {item.item}
                              </p>
                              <p className="text-[11px] text-muted font-sans">
                                Need: <strong className="font-bold text-pencil">{item.totalQuantity} pcs</strong> &bull; {item.occurrenceCount} transactions
                              </p>
                            </div>

                            {/* Right: Estimated Capital Needed */}
                            <div className="text-right flex-shrink-0">
                              <Amount
                                amount={item.totalAmount}
                                size="sm"
                                className={`font-bold block tabular-nums ${
                                  isChecked ? "text-muted line-through" : "text-pencil"
                                }`}
                              />
                              <span className="text-[10px] text-muted block">estimated</span>
                            </div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Capital Requirement Total Box (Accounting Underline) */}
            <div className="p-3.5 rounded-row bg-[#FFFDF5] border border-rule border-b-2 border-b-pencil flex items-center justify-between text-xs sm:text-sm font-sans shadow-xs">
              <span className="font-bold text-pencil uppercase tracking-wider text-xs">
                Est. Capital Needed to Restock:
              </span>
              <Amount
                amount={totalCapital}
                size="base"
                className="font-black text-ink text-base sm:text-lg tabular-nums"
              />
            </div>
          </div>

          {/* Action Footer (Hidden on print) */}
          <div className="print:hidden p-4 bg-paper/80 border-t border-rule grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="min-h-[48px] rounded-row bg-sheet hover:bg-paper border border-rule text-pencil font-sans font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-[0.98]"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-paid" />
                  <span className="text-paid">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-muted" />
                  <span>Copy List</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="min-h-[48px] rounded-row bg-ink hover:bg-ink/90 text-sheet font-sans font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-paper active:scale-[0.98]"
            >
              <Share2 className="w-4 h-4" />
              <span>{shareFeedback || "Share"}</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="min-h-[48px] rounded-row bg-sheet hover:bg-paper border border-ink text-ink font-sans font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-[0.98]"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
