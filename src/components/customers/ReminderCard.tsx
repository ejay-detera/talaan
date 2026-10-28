"use client";

import React, { useState } from "react";
import { Sparkles, Copy, Share2, MessageSquare, Check, RefreshCw } from "lucide-react";
import type { ReminderDraft, ReminderTone } from "@/types/ledger";

interface ReminderCardProps {
  customerId: string;
  customerName: string;
  phoneOptional: string | null;
  balance: number;
  initialDraft: ReminderDraft | null;
}

export function ReminderCard({
  customerId,
  customerName,
  phoneOptional,
  balance,
  initialDraft,
}: ReminderCardProps) {
  const [tone, setTone] = useState<ReminderTone>(initialDraft?.tone || "friendly");
  const [message, setMessage] = useState<string>(initialDraft?.message || "");
  const [modelName, setModelName] = useState<string>(initialDraft?.model || "Meta Muse Glimmer 30B");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasDebt = balance > 0;

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
        throw new Error(data.error?.message || "Hindi nagawang bumuo ng paalala.");
      }

      setMessage(data.reminder.message);
      setModelName(data.reminder.model);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "May naganap na error.");
    } finally {
      setIsGenerating(false);
    }
  }

  function handleToneChange(newTone: ReminderTone) {
    setTone(newTone);
    // If user changes tone and already generated once, generate fresh draft
    if (message) {
      handleGenerate(newTone);
    }
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
          title: `Talaan: Paalala para kay ${customerName}`,
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

  return (
    <div className="rounded-sheet border border-rule bg-sheet p-4 sm:p-5 space-y-4 select-none">
      {/* Header & Model Provenance Stamp */}
      <div className="flex items-center justify-between gap-3 border-b border-rule/60 pb-3">
        <div>
          <h3 className="text-xs font-bold text-pencil uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-ink" />
            <span>Taglish Payment Reminder</span>
          </h3>
          <p className="text-sm text-muted">
            Kultura at magalang na paalala sa utang
          </p>
        </div>

        {/* Model Provenance Stamp */}
        <span className="px-2 py-0.5 rounded-row border border-rule bg-paper text-sm font-bold text-muted uppercase tracking-wider">
          {modelName}
        </span>
      </div>

      {!hasDebt ? (
        <div className="p-4 rounded-row bg-paper/60 text-center border border-rule/50">
          <p className="text-xs text-paid font-bold">
            Bayad na ang suking ito. Walang kailangang ipaalala.
          </p>
        </div>
      ) : (
        <>
          {/* Tone Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-pencil">Tono:</span>
            <div className="flex gap-1.5 flex-1 max-w-xs">
              <button
                type="button"
                onClick={() => handleToneChange("friendly")}
                className={`flex-1 py-1.5 px-3 rounded-row text-xs font-bold transition-all min-h-[40px] cursor-pointer ${
                  tone === "friendly"
                    ? "bg-ink text-sheet"
                    : "bg-paper text-pencil hover:bg-paper/80 border border-rule"
                }`}
              >
                Malumanay (Friendly)
              </button>

              <button
                type="button"
                onClick={() => handleToneChange("firm")}
                className={`flex-1 py-1.5 px-3 rounded-row text-xs font-bold transition-all min-h-[40px] cursor-pointer ${
                  tone === "firm"
                    ? "bg-ink text-sheet"
                    : "bg-paper text-pencil hover:bg-paper/80 border border-rule"
                }`}
              >
                Pormal (Firm)
              </button>
            </div>
          </div>

          {/* Generate / Regenerate Button (if empty) */}
          {!message && (
            <button
              type="button"
              disabled={isGenerating}
              onClick={() => handleGenerate()}
              className="w-full h-[52px] rounded-row bg-ink text-sheet font-bold text-sm shadow-paper hover:bg-ink/90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Binubuo ang Paalala...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Bumuo ng Taglish Draft</span>
                </>
              )}
            </button>
          )}

          {error && (
            <p className="text-xs text-margin font-semibold">{error}</p>
          )}

          {/* Drafted Message Textarea */}
          {message && (
            <div className="space-y-3">
              <div className="relative">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="w-full p-3 rounded-row border border-rule bg-paper/40 text-[17px] text-pencil font-sans leading-relaxed focus:bg-sheet focus:border-ink focus:outline-none transition-all resize-y select-text"
                  placeholder="I-type o i-edit ang paalala..."
                />
              </div>

              {/* Action Buttons: Kopyahin, SMS, I-share */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex-1 min-w-[120px] h-[48px] px-4 rounded-row bg-paper border border-rule hover:bg-paper/80 active:scale-[0.98] text-xs font-bold text-pencil flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-paid" />
                      <span className="text-paid">Nakopya na!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-ink" />
                      <span>Kopyahin</span>
                    </>
                  )}
                </button>

                {smsHref && (
                  <a
                    href={smsHref}
                    className="flex-1 min-w-[120px] h-[48px] px-4 rounded-row bg-ink text-sheet hover:bg-ink/90 active:scale-[0.98] text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Ipadala sa SMS</span>
                  </a>
                )}

                <button
                  type="button"
                  onClick={handleShare}
                  className="h-[48px] px-4 rounded-row bg-paper border border-rule hover:bg-paper/80 active:scale-[0.98] text-xs font-bold text-pencil flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  title="I-share sa Messenger o ibang app"
                >
                  <Share2 className="w-4 h-4 text-ink" />
                  <span className="hidden sm:inline">I-share</span>
                </button>

                <button
                  type="button"
                  disabled={isGenerating}
                  onClick={() => handleGenerate()}
                  title="Bumuo muli"
                  className="h-[48px] px-3 rounded-row bg-paper border border-rule hover:bg-paper/80 active:scale-[0.98] text-muted hover:text-pencil flex items-center justify-center transition-all cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isGenerating ? "animate-spin" : ""}`} />
                </button>
              </div>

              {/* Mandatory Footer per docs/design.md line 346 */}
              <p className="text-sm text-muted text-center italic">
                Draft lang. Ikaw ang magpapadala.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

