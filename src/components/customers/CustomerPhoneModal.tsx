"use client";

import React, { useState } from "react";
import { X, Phone, Loader2, AlertCircle, Check } from "lucide-react";

interface CustomerPhoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
  customerName: string;
  initialPhone?: string | null;
  onSuccess: (savedPhone: string) => void;
  title?: string;
  description?: string;
}


export function CustomerPhoneModal(props: CustomerPhoneModalProps) {
  if (!props.isOpen) return null;
  return <CustomerPhoneModalDialog {...props} />;
}

function CustomerPhoneModalDialog({
  onClose,
  customerId,
  customerName,
  initialPhone,
  onSuccess,
  title = "Add Phone Number",
  description = "Save a Philippine mobile number to send direct SMS reminders.",
}: CustomerPhoneModalProps) {
  const [phone, setPhone] = useState(initialPhone || "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const cleaned = phone.trim();

    if (!cleaned) {
      setError("Please enter a valid mobile number.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`/api/customers/${customerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleaned }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.error?.message || "Failed to update phone number.");
        return;
      }

      onSuccess(data.customer.phone_optional);
      onClose();
    } catch {
      setError("Network error updating phone number. Please retry.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="phone-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pencil/40 backdrop-blur-xs animate-in fade-in duration-150 select-none"
    >
      <div className="relative w-full max-w-md bg-[#FFFEF8] rounded-row border border-rule border-l-4 border-l-margin shadow-paper-lg overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header Strip with Binder Holes */}
        <div className="px-5 py-4 border-b border-rule bg-[#FBFDF6]/90 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1" aria-hidden="true">
              <span className="w-2 h-2 rounded-full bg-paper border border-[#C5D0B4]" />
              <span className="w-2 h-2 rounded-full bg-paper border border-[#C5D0B4]" />
              <span className="w-2 h-2 rounded-full bg-paper border border-[#C5D0B4]" />
            </div>
            <h2
              id="phone-modal-title"
              className="font-display font-bold text-base sm:text-lg text-pencil tracking-tight"
            >
              {title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-paper text-muted hover:text-pencil flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          <div>
            <p className="text-xs text-muted font-sans leading-relaxed">
              {description} Customer:{" "}
              <strong className="text-pencil font-semibold">{customerName}</strong>
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="p-3 rounded-row bg-[#FDF2F2] border border-margin text-margin text-xs flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label
              htmlFor="customer-phone-input"
              className="block text-xs font-semibold text-pencil font-sans"
            >
              Mobile Phone Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="customer-phone-input"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="09171234567"
                autoFocus
                required
                className="w-full min-h-[48px] pl-10 pr-3.5 py-2.5 bg-sheet border border-rule rounded-row text-sm text-pencil font-sans placeholder:text-muted focus:border-ink focus:ring-1 focus:ring-ink outline-none transition-all tabular-nums"
              />
            </div>
            <p className="text-[11px] text-muted font-sans">
              Accepted format: <code className="text-pencil font-semibold">09171234567</code> or{" "}
              <code className="text-pencil font-semibold">+639171234567</code>
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="min-h-[44px] px-4 rounded-row border border-rule bg-sheet hover:bg-paper text-xs font-bold text-pencil cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="min-h-[44px] px-5 rounded-row bg-ink hover:bg-ink/90 active:scale-[0.98] text-xs font-bold text-sheet flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save Phone</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
