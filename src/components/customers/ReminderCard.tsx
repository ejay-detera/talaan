"use client";

import React, { useState } from "react";
import { Copy, Share2, Check, RefreshCw, Send, Loader2, Phone, ExternalLink } from "lucide-react";
import type { ReminderDraft, ReminderTone } from "@/types/ledger";
import { CustomerPhoneModal } from "./CustomerPhoneModal";

interface ReminderCardProps {
  customerId: string;
  customerName: string;
  phoneOptional: string | null;
  balance: number;
  initialDraft: ReminderDraft | null;
}

function getDefaultDraft(name: string, bal: number, t: ReminderTone): string {
  if (t === "firm") {
    return `Magandang araw po, ${name}. Nais ko lang pong ipaalala ang natitirang balanse na ₱${bal.toFixed(
      2
    )} sa tindahan. Paki-settle na lang po sa lalong madaling panahon. Maraming salamat po!`;
  }
  return `Magandang araw po, ${name}! Paalala lang po na may balanse po kayo na ₱${bal.toFixed(
    2
  )} sa tindahan. Kung may pagkakataon po, pwede po kayong dumaan. Maraming salamat po!`;
}

/**
 * ReminderCard
 *
 * Implements the Pinned Yellow Sticky Note Reminder (matching Image 2).
 * Styled as a yellow counter memo with a 3D red pushpin, tone selectors,
 * authentic handwriting preview (Caveat font) in Taglish, and direct SMS API sending.
 */
export function ReminderCard({
  customerId,
  customerName,
  phoneOptional,
  balance,
  initialDraft,
}: ReminderCardProps) {
  const [phone, setPhone] = useState<string | null>(phoneOptional);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [pendingSendAfterPhone, setPendingSendAfterPhone] = useState(false);

  const [tone, setTone] = useState<ReminderTone>(initialDraft?.tone || "friendly");
  const hasDebt = balance > 0;

  const [message, setMessage] = useState<string>(() => {
    if (initialDraft?.message) return initialDraft.message;
    if (hasDebt) return getDefaultDraft(customerName, balance, tone);
    return "";
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isSendingSms, setIsSendingSms] = useState(false);
  const [smsSentSuccess, setSmsSentSuccess] = useState<string | null>(null);
  const [smsError, setSmsError] = useState<string | null>(null);

  async function handleGenerate(targetTone = tone) {
    if (!hasDebt) return;
    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/reminders/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: customerId,
          tone: targetTone,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        // Fallback to local deterministic draft template if backend error
        setMessage(getDefaultDraft(customerName, balance, targetTone));
        return;
      }

      setMessage(data.reminder.message);
    } catch {
      // Fallback cleanly without blocking user
      setMessage(getDefaultDraft(customerName, balance, targetTone));
    } finally {
      setIsGenerating(false);
    }
  }

  function handleToneChange(newTone: ReminderTone) {
    setTone(newTone);
    setMessage(getDefaultDraft(customerName, balance, newTone));
    handleGenerate(newTone);
  }

  async function handleCopy() {
    if (!message) return;
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  }

  async function handleShare() {
    if (!message) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Talaan Reminder for ${customerName}`,
          text: message,
        });
      } catch {
        // User canceled share
      }
    } else {
      handleCopy();
    }
  }

  async function triggerSmsSend(targetPhone: string) {
    if (!message) return;
    setIsSendingSms(true);
    setSmsError(null);
    setSmsSentSuccess(null);

    try {
      const res = await fetch("/api/reminders/send-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: customerId,
          message,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setSmsError(data?.error?.message || "Failed to dispatch SMS.");
        return;
      }

      setSmsSentSuccess(`SMS reminder sent successfully to ${targetPhone}!`);
      setTimeout(() => setSmsSentSuccess(null), 6000);
    } catch {
      setSmsError("Network issue dispatching SMS. You can open your phone text app below.");
    } finally {
      setIsSendingSms(false);
    }
  }

  function handleSendSmsClick() {
    if (!phone) {
      setPendingSendAfterPhone(true);
      setIsPhoneModalOpen(true);
    } else {
      triggerSmsSend(phone);
    }
  }

  function handlePhoneSaved(savedPhone: string) {
    setPhone(savedPhone);
    if (pendingSendAfterPhone) {
      setPendingSendAfterPhone(false);
      triggerSmsSend(savedPhone);
    }
  }

  const fallbackSmsHref = phone && message
    ? `sms:${phone}?body=${encodeURIComponent(message)}`
    : undefined;

  if (!hasDebt) {
    return (
      <div className="relative rounded-row border border-[#D5DEC6] bg-[#FFFEF8] shadow-paper p-6 text-center select-none space-y-2">
        <p className="font-display font-bold text-base text-paid">
          Account Settled
        </p>
        <p className="text-xs text-muted font-sans">
          {customerName} has no outstanding customer credit. No payment reminder needed!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Pinned Yellow Sticky Note (Matching Image 2) */}
      <div
        className="slip paper-settle relative w-full rounded-row bg-[#FFF9D2] border border-[#EADB85] shadow-[0_8px_24px_rgba(35,38,43,0.08)] p-5 sm:p-6 select-none space-y-4"
        style={{ ["--tilt" as string]: "0.5deg" }}
      >
        {/* 3D Red Pushpin Graphic at Top Center */}
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 flex items-center justify-center pointer-events-none z-20"
          aria-hidden="true"
        >
          <span className="w-4 h-4 rounded-full bg-margin border border-[#9A1F1E] shadow-[0_2px_4px_rgba(35,38,43,0.3)] block relative">
            <span className="w-1.5 h-1.5 rounded-full bg-white/70 absolute top-0.5 left-0.5" />
          </span>
        </div>

        {/* Note Header: Title & Tone Selector */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display font-bold text-base sm:text-lg text-[#383318] tracking-tight">
              Reminder for {customerName}
            </h2>
            {phone && (
              <span className="text-[11px] font-semibold text-[#6E5D1E] font-sans flex items-center gap-1">
                <Phone className="w-3 h-3" />
                <span>{phone}</span>
              </span>
            )}
          </div>

          {/* Tone Selector Pills */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleToneChange("friendly")}
              className={`px-3.5 py-1.5 rounded-row text-xs font-bold transition-all cursor-pointer paper-press ${
                tone === "friendly"
                  ? "bg-ink text-sheet shadow-xs"
                  : "bg-sheet/80 text-[#383318] border border-[#EADB85] hover:bg-sheet"
              }`}
            >
              Friendly
            </button>
            <button
              type="button"
              onClick={() => handleToneChange("firm")}
              className={`px-3.5 py-1.5 rounded-row text-xs font-bold transition-all cursor-pointer paper-press ${
                tone === "firm"
                  ? "bg-ink text-sheet shadow-xs"
                  : "bg-sheet/80 text-[#383318] border border-[#EADB85] hover:bg-sheet"
              }`}
            >
              Firm
            </button>
          </div>
        </div>

        {/* Note Instruction & Ruled Handwriting Textarea */}
        <div className="space-y-1.5">
          <label
            htmlFor="reminder-draft-text"
            className="block text-xs font-semibold text-[#6E5D1E] font-sans"
          >
            Click to edit message
          </label>

          <div className="relative">
            <textarea
              id="reminder-draft-text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className="w-full bg-transparent font-hand text-xl sm:text-2xl text-[#2A2510] leading-relaxed resize-y focus:outline-none select-text border-b border-[#EADB85]/70 pb-2 pr-2 placeholder:text-[#6E5D1E]/60"
              placeholder="Magandang araw po..."
            />
          </div>

          {error && (
            <p className="text-xs text-margin font-semibold font-sans">{error}</p>
          )}

          {/* SMS Status Banners */}
          {smsSentSuccess && (
            <div
              role="status"
              className="p-3 rounded-row bg-[#F0FDF4] border border-[#1F7A4D]/40 text-[#1F7A4D] text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200"
            >
              <Check className="w-4 h-4 flex-shrink-0" />
              <span>{smsSentSuccess}</span>
            </div>
          )}

          {smsError && (
            <div
              role="alert"
              className="p-3 rounded-row bg-[#FDF2F2] border border-margin/40 text-margin text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 animate-in fade-in duration-200"
            >
              <span>{smsError}</span>
              {fallbackSmsHref && (
                <a
                  href={fallbackSmsHref}
                  className="inline-flex items-center gap-1 font-bold underline text-margin hover:text-pencil flex-shrink-0"
                >
                  <span>Open Phone Text App</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Note Footer: Notice & Action Buttons */}
        <div className="pt-2 border-t border-[#EADB85]/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-xs text-[#6E5D1E] font-sans italic">
            Automated SMS via SMS API PH.
          </p>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Copy Button */}
            <button
              type="button"
              onClick={handleCopy}
              className="flex-1 sm:flex-initial h-[42px] px-4 rounded-row bg-ink hover:bg-ink/90 active:scale-[0.98] text-xs font-bold text-sheet flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer font-sans paper-press"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-sheet" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>

            {/* Direct Send SMS Button */}
            <button
              type="button"
              disabled={isSendingSms || !message}
              onClick={handleSendSmsClick}
              className="flex-1 sm:flex-initial h-[42px] px-4 rounded-row bg-[#1F7A4D] hover:bg-[#1A6841] active:scale-[0.98] text-xs font-bold text-sheet flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer font-sans disabled:opacity-50"
            >
              {isSendingSms ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send SMS</span>
                </>
              )}
            </button>

            {/* Share via native web share */}
            <button
              type="button"
              onClick={handleShare}
              title="Share draft"
              className="h-[42px] px-3 rounded-row bg-sheet/80 hover:bg-sheet border border-[#EADB85] text-[#383318] flex items-center justify-center transition-all cursor-pointer shadow-xs"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>

            {/* Refresh / Regenerate button */}
            <button
              type="button"
              disabled={isGenerating}
              onClick={() => handleGenerate()}
              title="Generate new draft"
              className="h-[42px] px-3 rounded-row bg-sheet/80 hover:bg-sheet border border-[#EADB85] text-[#383318] flex items-center justify-center transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Helper Guidance & Edit Phone Trigger Below Note */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-1 text-xs text-muted font-sans">
        <p className="leading-relaxed">
          {phone ? (
            <span>
              Recorded phone: <strong className="text-pencil font-semibold">{phone}</strong>. Tap Send SMS to dispatch directly.
            </span>
          ) : (
            <span>No phone number saved yet for {customerName}. Tap Send SMS or Add Phone to record one.</span>
          )}
        </p>

        <button
          type="button"
          onClick={() => {
            setPendingSendAfterPhone(false);
            setIsPhoneModalOpen(true);
          }}
          className="inline-flex items-center gap-1 text-xs font-bold text-ink hover:underline cursor-pointer flex-shrink-0"
        >
          <Phone className="w-3 h-3" />
          <span>{phone ? "Edit Phone" : "Add Phone"}</span>
        </button>
      </div>

      {/* Customer Phone Modal */}
      <CustomerPhoneModal
        isOpen={isPhoneModalOpen}
        onClose={() => {
          setIsPhoneModalOpen(false);
          setPendingSendAfterPhone(false);
        }}
        customerId={customerId}
        customerName={customerName}
        initialPhone={phone}
        onSuccess={handlePhoneSaved}
        title={phone ? "Update Phone Number" : "Add Phone Number"}
        description={
          pendingSendAfterPhone
            ? "Save customer's phone number to send this reminder immediately via SMS."
            : "Save a Philippine mobile number for direct SMS reminders."
        }
      />
    </div>
  );
}
