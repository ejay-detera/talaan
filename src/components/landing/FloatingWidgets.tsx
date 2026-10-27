import {
  CheckCircle2,
  Copy,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/**
 * PinnedStickyNote
 *
 * Floating yellow sticky note with a realistic pushpin graphic,
 * authentic handwriting, and math error notice.
 */
export function PinnedStickyNote() {
  return (
    <div className="relative w-64 bg-[#FFF9D2] border border-[#EADB85] rounded-row p-4 shadow-sticky animate-float-slow select-none transform rotate-[-2deg] hover:rotate-0 transition-transform duration-300">
      {/* Pushpin Graphic */}
      <div
        className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 flex items-center justify-center pointer-events-none"
        aria-hidden="true"
      >
        <span className="w-4 h-4 rounded-full bg-margin border border-[#9A1F1E] shadow-sm block relative">
          <span className="w-1.5 h-1.5 rounded-full bg-white/70 absolute top-0.5 left-0.5" />
        </span>
      </div>

      <div className="pt-1 space-y-2">
        <div className="flex items-center justify-between text-[11px] font-sans font-semibold text-[#6E5D1E] uppercase tracking-wider">
          <span>Counter Memo</span>
          <span>Ate Baby</span>
        </div>

        <p className="font-hand text-xl text-[#383318] leading-tight">
          3x pancit canton @ 12 = 46. Discrepancy caught by code!
        </p>

        <div className="pt-1 flex items-center justify-between text-xs font-sans border-t border-[#EADB85]/60">
          <span className="text-[#6E5D1E] text-[11px]">Corrected Total:</span>
          <span className="font-bold text-[#1F7A4D] tabular-nums">₱36.00</span>
        </div>
      </div>
    </div>
  );
}

/**
 * CustomerBalancesWidget
 *
 * Micro-card showing active customer credit ledger snippet.
 */
export function CustomerBalancesWidget() {
  return (
    <Card className="w-72 shadow-paper animate-float-delayed select-none">
      <CardHeader className="p-3.5 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-bold font-sans uppercase tracking-wider text-muted flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-ink" />
            Active Customer Balances
          </CardTitle>
          <span className="text-[10px] text-paid font-semibold">Synced</span>
        </div>
      </CardHeader>

      <CardContent className="p-3.5 pt-0 space-y-2">
        <div className="divide-y divide-rule text-xs font-sans">
          <div className="py-1.5 flex items-center justify-between">
            <span className="font-medium text-pencil">Mang Jose</span>
            <span className="font-bold text-pencil tabular-nums">₱76.00</span>
          </div>

          <div className="py-1.5 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-pencil">Nanay Cora</span>
              <span className="text-[10px] text-muted italic">(Review)</span>
            </div>
            <span className="font-bold text-pencil tabular-nums">₱54.00</span>
          </div>

          <div className="py-1.5 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-pencil">Ate Baby</span>
              <span className="text-[10px] text-paid font-semibold">(Verified)</span>
            </div>
            <span className="font-bold text-paid tabular-nums">₱36.00</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * PaymentReminderDraftWidget
 *
 * Micro-card displaying a generated respectful Taglish reminder.
 */
export function PaymentReminderDraftWidget() {
  return (
    <Card className="w-80 shadow-paper animate-float-delayed select-none">
      <CardHeader className="p-3.5 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-bold font-sans uppercase tracking-wider text-muted flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-ink" />
            Taglish Reminder Draft
          </CardTitle>
          <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
            One-Tap Share
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-3.5 pt-0 space-y-2.5">
        <div className="p-2.5 rounded-row bg-paper border border-rule/80 text-xs font-sans text-pencil leading-relaxed">
          &ldquo;Magandang araw po Ate Baby! Paalala lang po sa natitirang utang na{" "}
          <strong className="text-pencil font-bold">₱36.00</strong> sa tindahan ni
          Aling Nena. Maraming salamat po!&rdquo;
        </div>

        <div className="flex items-center justify-between text-[11px] font-sans text-muted">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-ink" /> Polite & respectful
          </span>
          <span className="text-ink font-semibold flex items-center gap-1 cursor-pointer hover:underline">
            <Copy className="w-3 h-3" /> Copy SMS
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * DeterministicShieldWidget
 *
 * Micro-card showing mathematical verification guarantees.
 */
export function DeterministicShieldWidget() {
  return (
    <Card className="w-72 shadow-paper animate-float-slow select-none">
      <CardHeader className="p-3.5 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-bold font-sans uppercase tracking-wider text-muted flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-paid" />
            Deterministic Engine
          </CardTitle>
          <span className="text-[10px] text-paid font-semibold">100% Math</span>
        </div>
      </CardHeader>

      <CardContent className="p-3.5 pt-0 space-y-2">
        <div className="space-y-1.5 text-xs font-sans text-muted">
          <div className="flex items-center gap-1.5 text-pencil">
            <CheckCircle2 className="w-3.5 h-3.5 text-paid flex-shrink-0" />
            <span className="text-[11px]">Zero LLM arithmetic</span>
          </div>
          <div className="flex items-center gap-1.5 text-pencil">
            <CheckCircle2 className="w-3.5 h-3.5 text-paid flex-shrink-0" />
            <span className="text-[11px]">Integer-centavo math in code</span>
          </div>
          <div className="flex items-center gap-1.5 text-pencil">
            <CheckCircle2 className="w-3.5 h-3.5 text-paid flex-shrink-0" />
            <span className="text-[11px]">Human confirms before DB write</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
