"use client";

import React, { useState } from "react";
import { X, Check, HandCoins, AlertCircle, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
  customerName: string;
  currentBalance: number;
  onSuccess?: (newBalance: number) => void;
}

export function RecordPaymentModal({
  isOpen,
  onClose,
  customerId,
  customerName,
  currentBalance,
  onSuccess,
}: RecordPaymentModalProps) {
  const router = useRouter();
  const [amount, setAmount] = useState<string>(
    currentBalance > 0 ? String(currentBalance) : ""
  );
  const [note, setNote] = useState<string>("Counter cash payment");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const parsedAmount = parseFloat(amount);
  const isValid = !isNaN(parsedAmount) && parsedAmount > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/customers/${customerId}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parsedAmount,
          note: note.trim() || "Counter cash payment",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to record payment");
      }

      onSuccess?.(data.balance);
      router.refresh();
      onClose();
    } catch (err: unknown) {
      setError((err as Error)?.message || "Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="record-payment-title"
      className="fixed inset-0 z-50 bg-pencil/60 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-sm my-auto bg-sheet rounded-sheet border border-rule shadow-paper-lg overflow-hidden text-pencil font-sans select-none"
      >
        {/* Header Strip */}
        <div className="px-4 py-3 bg-paper border-b border-rule flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HandCoins className="w-4 h-4 text-paid" />
            <span id="record-payment-title" className="text-xs sm:text-sm font-bold font-sans">
              Record Counter Payment
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close dialog"
            className="w-8 h-8 rounded-xs hover:bg-sheet flex items-center justify-center text-muted hover:text-pencil transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <span className="text-[11px] text-muted font-bold uppercase tracking-wider block">
              Customer:
            </span>
            <p className="font-display font-bold text-base text-pencil">
              {customerName}
            </p>
            <p className="text-xs text-muted font-sans mt-0.5">
              Current Utang: <strong className="font-bold text-margin">₱{currentBalance.toFixed(2)}</strong>
            </p>
          </div>

          {/* Amount Input */}
          <div className="space-y-1.5">
            <label htmlFor="payment-amount" className="text-xs font-bold text-pencil block">
              Payment Amount (₱)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-base text-muted">
                ₱
              </span>
              <input
                id="payment-amount"
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
                className="w-full h-11 pl-8 pr-3 bg-paper/60 border border-rule rounded-row font-bold text-base text-pencil focus:outline-none focus:ring-2 focus:ring-ink focus:border-transparent tabular-nums"
              />
            </div>

            {/* Quick Fill Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {[50, 100, 200].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(String(preset))}
                  className="px-2.5 py-1 text-xs font-bold rounded-xs bg-paper hover:bg-[#E8EDE0] border border-rule/70 text-pencil transition-colors cursor-pointer"
                >
                  +₱{preset}
                </button>
              ))}
              {currentBalance > 0 && (
                <button
                  type="button"
                  onClick={() => setAmount(String(currentBalance))}
                  className="px-2.5 py-1 text-xs font-bold rounded-xs bg-[#EAF5EE] hover:bg-[#D5EEDD] border border-paid/40 text-paid transition-colors cursor-pointer"
                >
                  Full (₱{currentBalance.toFixed(2)})
                </button>
              )}
            </div>
          </div>

          {/* Payment Method Note */}
          <div className="space-y-1">
            <label htmlFor="payment-note" className="text-xs font-bold text-pencil block">
              Payment Note / Method
            </label>
            <input
              id="payment-note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Cash at counter, GCash"
              className="w-full h-9 px-3 bg-paper/60 border border-rule rounded-row text-xs text-pencil focus:outline-none focus:ring-1 focus:ring-ink"
            />
          </div>

          {error && (
            <div className="p-2.5 rounded-row bg-[#FDF2F2] border border-margin/40 text-xs text-margin flex items-center gap-1.5 font-sans">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Confirmation Action Buttons */}
          <div className="pt-2 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="min-h-[48px] rounded-row border border-rule bg-sheet hover:bg-paper text-pencil font-sans font-bold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="min-h-[48px] rounded-row bg-paid hover:bg-[#18623D] text-sheet font-sans font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Recording...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Confirm Pay</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

