"use client";

import React, { useState } from "react";
import { Copy, Share2, MessageSquare, Check, RefreshCw } from "lucide-react";
import type { ReminderDraft, ReminderTone } from "@/types/ledger";

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
 * authentic handwriting preview (Caveat font) in Taglish, and instant copy/SMS sharing.
 */
export function ReminderCard({
  customerId,
  customerName,
  phoneOptional,
  balance,
  initialDraft,
}: ReminderCardProps) {
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

  const smsHref = message
    ? `sms:${phoneOptional ?? ""}?body=${encodeURIComponent(message)}`
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
      <div className="relative w-full rounded-row bg-[#FFF9D2] border border-[#EADB85] shadow-[0_8px_24px_rgba(35,38,43,0.08)] p-5 sm:p-6 select-none space-y-4">
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
          <h2 className="font-display font-bold text-base sm:text-lg text-[#383318] tracking-tight">
            Reminder for {customerName}
          </h2>

          {/* Tone Selector Pills */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleToneChange("friendly")}
              className={`px-3.5 py-1.5 rounded-row text-xs font-bold transition-all cursor-pointer ${
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
              className={`px-3.5 py-1.5 rounded-row text-xs font-bold transition-all cursor-pointer ${
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
        </div>

        {/* Note Footer: Notice & Action Buttons */}
        <div className="pt-2 border-t border-[#EADB85]/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-xs text-[#6E5D1E] font-sans italic">
            Draft only. You send it.
          </p>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Copy Button */}
            <button
              type="button"
              onClick={handleCopy}
              className="flex-1 sm:flex-initial h-[42px] px-5 rounded-row bg-ink hover:bg-ink/90 active:scale-[0.98] text-xs font-bold text-sheet flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer font-sans"
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

            {/* Send via SMS Button (if phone recorded) */}
            {smsHref && (
              <a
                href={smsHref}
                className="flex-1 sm:flex-initial h-[42px] px-4 rounded-row bg-[#1F7A4D] hover:bg-[#1A6841] active:scale-[0.98] text-xs font-bold text-sheet flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer font-sans"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Send SMS</span>
              </a>
            )}

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

      {/* Helper Guidance Below Note */}
      <p className="text-xs text-muted font-sans px-1 leading-relaxed">
        {phoneOptional
          ? `Recorded phone: ${phoneOptional}. Tap Send SMS to open your text app or Copy to paste into Messenger.`
          : `No phone number on notebook for ${customerName}. Copy the reminder to send directly via SMS or Messenger.`}
      </p>
    </div>
  );
}
