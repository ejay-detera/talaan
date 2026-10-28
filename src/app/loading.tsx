// impeccable-disable side-tab -- intentional red margin line per docs/design.md
import Image from "next/image";
import { ShieldCheck } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-paper/70 backdrop-blur-xs text-pencil font-sans selection:bg-marker">
      {/* Sovereign Notebook Loading Slip */}
      <div className="relative w-full max-w-[360px] bg-sheet border border-rule border-l-4 border-l-margin rounded-sheet shadow-paper-lg p-6 sm:p-7 select-none overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Binder Edge Holes */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-rule">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="w-2 h-2 rounded-full bg-paper border border-[#C5D0B4]" />
            <span className="w-2 h-2 rounded-full bg-paper border border-[#C5D0B4]" />
            <span className="w-2 h-2 rounded-full bg-paper border border-[#C5D0B4]" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-muted font-sans">
            Counter Ledger
          </span>
        </div>

        {/* Brand Header */}
        <div className="flex items-center gap-3 pb-4">
          <Image
            src="/assets/talaan-icon.png"
            alt="Talaan logo"
            width={40}
            height={40}
            className="flex-shrink-0 object-contain transition-transform duration-300"
          />
          <div>
            <h2 className="font-display font-black text-xl text-pencil leading-tight tracking-tight">
              Talaan
            </h2>
            <p className="text-xs text-muted font-sans font-medium">
              Two-Phase Store Bookkeeping
            </p>
          </div>
        </div>

        {/* Ruled Notebook Rows Shimmer */}
        <div className="space-y-3 py-3 border-t border-b border-rule/60">
          <div className="flex items-center justify-between gap-3">
            <div className="h-3 w-36 bg-rule/50 rounded-sm animate-pulse" />
            <div className="h-3 w-12 bg-rule/40 rounded-sm animate-pulse" />
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="h-3 w-28 bg-rule/40 rounded-sm animate-pulse" />
            <div className="h-3 w-14 bg-rule/35 rounded-sm animate-pulse" />
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="h-3 w-40 bg-rule/35 rounded-sm animate-pulse" />
            <div className="h-3 w-10 bg-rule/30 rounded-sm animate-pulse" />
          </div>
        </div>

        {/* Fluid Ink Travel Progress Beam */}
        <div className="space-y-2 pt-4">
          <div className="h-1.5 w-full bg-rule/60 rounded-full overflow-hidden relative">
            <div className="absolute inset-y-0 w-2/5 bg-gradient-to-r from-ink via-[#2550D8] to-ink rounded-full animate-shimmer-slide" />
          </div>

          <div className="flex items-center justify-between text-xs font-sans">
            <span className="font-semibold text-pencil">
              Loading counter ledger...
            </span>
            <span className="font-semibold text-muted">
              Deterministic
            </span>
          </div>
        </div>

        {/* Verification Guarantee Stamp */}
        <div className="pt-4 flex items-center justify-center">
          <div className="inline-flex items-center gap-1.5 font-bold text-xs text-paid bg-paid/10 border border-paid/30 rounded-row px-2.5 py-1 select-none">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Zero LLM Math &bull; Centavo Exact</span>
          </div>
        </div>
      </div>
    </div>
  );
}
