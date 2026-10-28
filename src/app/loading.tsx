import Image from "next/image";
import { ShieldCheck } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-paper text-pencil font-sans selection:bg-marker">
      {/* Sovereign Notebook Loading Slip */}
      <div className="relative w-full max-w-sm bg-sheet border border-rule rounded-sheet shadow-paper-lg p-6 sm:p-7 select-none overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Binder Edge Holes */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-rule">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-paper border border-rule" />
            <span className="w-2.5 h-2.5 rounded-full bg-paper border border-rule" />
            <span className="w-2.5 h-2.5 rounded-full bg-paper border border-rule" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted font-sans">
            Talaan &bull; Counter Ledger
          </span>
        </div>

        {/* Lined Notebook Area with Red Margin Rule */}
        <div className="relative pl-6 space-y-4">
          {/* Vertical Red Margin Rule */}
          <div className="absolute left-2.5 top-0 bottom-0 w-[2px] bg-margin/60" />

          {/* Icon & Brand Header */}
          <div className="flex items-center gap-3">
            <Image
              src="/assets/talaan-icon.png"
              alt="Talaan logo"
              width={44}
              height={44}
              className="flex-shrink-0 object-contain"
            />
            <div>
              <h2 className="font-display font-black text-xl text-pencil leading-tight">
                Talaan
              </h2>
              <p className="text-[11px] text-muted font-sans font-medium">
                Two-Phase Store Bookkeeping
              </p>
            </div>
          </div>

          {/* Indeterminate Shimmer Progress Bar */}
          <div className="space-y-2 pt-1">
            <div className="h-1.5 w-full bg-rule/70 rounded-full overflow-hidden relative">
              <div className="absolute inset-y-0 w-1/2 bg-ink rounded-full animate-[pulse_1s_ease-in-out_infinite]" />
            </div>

            <div className="flex items-center justify-between text-[11px] font-sans">
              <span className="font-medium text-pencil">
                Loading counter ledger...
              </span>
              <span className="text-[10px] text-muted font-medium">
                Deterministic
              </span>
            </div>
          </div>

          {/* Micro Verification Guarantee Stamp */}
          <div className="pt-2 border-t border-rule/60 flex items-center justify-between text-[10px] text-muted font-sans">
            <div className="inline-flex items-center gap-1.5 font-semibold text-paid">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Zero LLM Arithmetic</span>
            </div>
            <span className="text-muted/80">Meta Muse Glimmer 30B</span>
          </div>
        </div>
      </div>
    </div>
  );
}
