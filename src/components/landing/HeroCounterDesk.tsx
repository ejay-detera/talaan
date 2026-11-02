import { CheckCircle2 } from "lucide-react";
import { PinnedStickyNote, CustomerBalancesWidget } from "@/components/landing/FloatingWidgets";

/**
 * DailyTallyPaperSlip
 *
 * Physical counter tally slip with ruled lines, red margin,
 * real sari-sari store transactions, and authentic stamped VERIFIED rubber seal.
 */
export function DailyTallyPaperSlip() {
  return (
    <div className="relative w-72 sm:w-80 lg:w-[350px] bg-sheet border border-rule rounded-sheet p-5 sm:p-6 shadow-paper-lg select-none transform -rotate-1 hover:rotate-0 transition-transform duration-300">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-rule">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-paper border border-rule" />
          <span className="font-display font-bold text-xs uppercase tracking-wider text-muted">
            Daily Counter Tally &bull; Sheet #14
          </span>
        </div>
        <span className="text-xs font-semibold text-muted font-sans tabular-nums">
          Oct 27, 2026
        </span>
      </div>

      {/* Lined Entries with Red Margin Line */}
      <div className="relative pl-4 py-3.5 space-y-2.5 border-b border-rule">
        <div className="absolute left-1.5 top-0 bottom-0 w-[1.5px] bg-margin" />

        <div className="flex items-center justify-between text-xs sm:text-sm font-sans">
          <span className="text-pencil font-medium">Mang Jose &bull; 2 corned beef</span>
          <span className="text-pencil font-bold tabular-nums">₱76.00</span>
        </div>

        <div className="flex items-center justify-between text-xs sm:text-sm font-sans">
          <div className="flex items-center gap-1.5">
            <span className="text-pencil font-medium">Ate Baby &bull; 3 pancit canton</span>
            <span className="text-[10px] text-paid font-bold px-1 bg-paid/10 rounded-xs">Corrected</span>
          </div>
          <span className="text-paid font-bold tabular-nums">₱36.00</span>
        </div>

        <div className="flex items-center justify-between text-xs sm:text-sm font-sans">
          <span className="text-pencil font-medium">Nanay Cora &bull; toyo at suka</span>
          <span className="text-pencil font-bold tabular-nums">₱54.00</span>
        </div>

        <div className="flex items-center justify-between text-xs sm:text-sm font-sans">
          <span className="text-pencil font-medium">Kuya Jojo &bull; 1 pack sigarilyo</span>
          <span className="text-pencil font-bold tabular-nums">₱165.00</span>
        </div>
      </div>

      {/* Bottom Proof Bar & Stamp */}
      <div className="pt-3.5 flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold text-muted tracking-wider block">
            Reconciled Total
          </span>
          <span className="font-display font-black text-2xl text-pencil tabular-nums">
            ₱331.00
          </span>
        </div>

        {/* Physical Rubber Stamp */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs border-2 border-paid text-paid font-display font-black text-xs tracking-wider uppercase transform -rotate-3 shadow-xs select-none">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Verified Centavos</span>
        </div>
      </div>
    </div>
  );
}

/**
 * HeroCounterDesk
 *
 * Rich multi-layered counter desk arrangement combining:
 * 1. CustomerBalancesWidget (active customer credit records)
 * 2. DailyTallyPaperSlip (reconciled tally sheet with red margin and rubber stamp)
 * 3. PinnedStickyNote (pinned yellow discrepancy memo with red pin)
 */
export function HeroCounterDesk() {
  return (
    <div className="relative w-full max-w-xl h-[460px] sm:h-[500px] flex items-center justify-center select-none">
      {/* Top-Right Background Layer: Active Customer Balances */}
      <div className="absolute top-0 right-0 sm:right-2 z-10 transform rotate-3 hover:rotate-0 transition-transform duration-300 hidden sm:block">
        <CustomerBalancesWidget />
      </div>

      {/* Center Main Layer: Daily Tally Paper Slip */}
      <div className="relative z-20 transform -translate-x-2 sm:-translate-x-6 translate-y-3">
        <DailyTallyPaperSlip />
      </div>

      {/* Bottom-Left Foreground Layer: Pinned Sticky Note */}
      <div className="absolute -bottom-2 sm:bottom-2 left-0 sm:left-2 z-30 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
        <PinnedStickyNote />
      </div>
    </div>
  );
}
