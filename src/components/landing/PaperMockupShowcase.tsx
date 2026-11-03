// impeccable-disable design-system-font-size -- decorative miniature paper mockup props
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Amount } from "@/components/shared/Amount";
import {
  LANDING_SAMPLE_WRITTEN_TOTAL,
  LANDING_RECONCILED_ROWS,
  getLandingProofTotals,
} from "@/lib/ledger/sample-proof";

/**
 * PaperMockupShowcase
 *
 * Implements the Paper Sovereign Principle: paper as the hero medium.
 * Replaces the cartoon meditating figure with a realistic, tactile
 * handwritten sari-sari notebook page ("listahan") with ruled lines,
 * red margin gutter, Caveat handwriting, and deterministic reconciliation.
 */
export function PaperMockupShowcase() {
  const totals = getLandingProofTotals(true);

  return (
    <div className="relative w-full mx-auto max-w-xl lg:max-w-2xl bg-sheet rounded-sheet border border-rule shadow-paper-lg overflow-hidden transition-all duration-300 hover:shadow-[0_28px_56px_-12px_rgba(35,38,43,0.16)]">
      {/* Notebook Binder Header Strip */}
      <div className="h-8 px-3 bg-paper/80 border-b border-rule flex items-center justify-between select-none gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          {/* Notebook spiral ring punch holes */}
          <div className="flex items-center gap-1 flex-shrink-0" aria-hidden="true">
            <span className="w-2 h-2 rounded-full bg-paper border border-rule" />
            <span className="w-2 h-2 rounded-full bg-paper border border-rule" />
            <span className="w-2 h-2 rounded-full bg-paper border border-rule" />
          </div>
          <span className="text-[11px] sm:text-xs font-sans font-semibold tracking-wider uppercase text-muted ml-1.5 whitespace-nowrap truncate">
            Counter Notebook &bull; Page 14
          </span>
        </div>

        <div className="flex items-center gap-1 text-[11px] sm:text-xs font-sans text-muted whitespace-nowrap flex-shrink-0">
          <span>Date:</span>
          <span className="font-semibold text-pencil">Oct 27</span>
        </div>
      </div>

      {/* Main Ruled Notebook Leaf */}
      <div className="relative p-3.5 sm:p-4 bg-sheet">
        {/* Notebook Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between pb-2 border-b border-rule gap-1 select-none">
          <div>
            <h3 className="font-display font-bold text-sm sm:text-base text-pencil tracking-tight">
              Aling Nena&apos;s Store — Talaan ng Utang
            </h3>
            <p className="text-[11px] sm:text-xs text-muted font-sans">
              Handwritten counter entries verified by deterministic math
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider text-muted font-sans block">
              Status
            </span>
            <span className="text-[11px] sm:text-xs font-semibold text-paid font-sans inline-flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Ready for Review
            </span>
          </div>
        </div>

        {/* Ruled Notebook Ledger Area with Red Margin Gutter */}
        <div className="relative mt-2.5 pl-6 sm:pl-7 pr-1">
          {/* Authentic Left Red Margin Rule */}
          <div
            className="absolute left-3.5 sm:left-4 top-0 bottom-0 w-[2px] bg-margin select-none pointer-events-none"
            aria-hidden="true"
          />

          {/* Ledger Row Items */}
          <div className="divide-y divide-rule/70">
            {LANDING_RECONCILED_ROWS.map((row) => {
              const isBaby = row.customer === "Ate Baby";
              const isCora = row.customer === "Nanay Cora";

              return (
                <div
                  key={row.customer}
                  className={`py-1.5 sm:py-2 transition-colors ${isCora
                      ? "bg-marker/25 -mx-1.5 px-1.5 rounded-row"
                      : isBaby
                        ? "bg-[#FDF6F6] -mx-1.5 px-1.5 rounded-row"
                        : ""
                    }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    {/* Left: Customer & Raw Handwriting */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-sans font-semibold text-xs sm:text-sm text-pencil">
                          {row.customer}
                        </span>

                        {isBaby && (
                          <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-sans font-semibold text-margin bg-sheet px-1.5 py-0.25 rounded border border-margin/40">
                            <AlertTriangle className="w-3 h-3" />
                            Multiplication Mismatch
                          </span>
                        )}

                        {isCora && (
                          <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-sans font-semibold text-pencil bg-sheet px-1.5 py-0.25 rounded border border-pencil/30">
                            <span>Unitemized</span>
                          </span>
                        )}
                      </div>

                      {/* Quarantined Handwriting in Caveat */}
                      <p className="font-hand text-base sm:text-lg text-pencil/80 leading-tight mt-0.5 select-none">
                        {isBaby && '3 pancit canton @ 12 = 46 (nakasulat)'}
                        {isCora && 'toyo at suka = 54 (nakasulat)'}
                        {row.customer === 'Mang Jose' && '2 corned beef @ 38 = 76'}
                        {row.customer === 'Kuya Jun' && '2 kopiko brown @ 20 = 40'}
                      </p>
                    </div>

                    {/* Right: Amounts & Verification Resolution */}
                    <div className="text-right flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-center gap-2 sm:gap-0">
                      <div className="flex items-baseline gap-1.5">
                        {isBaby ? (
                          <>
                            <span className="text-[11px] text-muted line-through font-sans tabular-nums">
                              ₱46.00
                            </span>
                            <span className="font-sans font-bold text-xs sm:text-sm text-paid tabular-nums">
                              ₱36.00
                            </span>
                          </>
                        ) : (
                          <span className="font-sans font-bold text-xs sm:text-sm text-pencil tabular-nums">
                            <Amount amount={row.amount} />
                          </span>
                        )}
                      </div>

                      {isBaby && (
                        <span className="text-[11px] sm:text-xs font-sans text-margin font-semibold">
                          ₱10.00 overcharge caught
                        </span>
                      )}

                      {isCora && (
                        <span className="text-[11px] sm:text-xs font-sans text-muted">
                          Needs storekeeper confirm
                        </span>
                      )}

                      {!isBaby && !isCora && (
                        <span className="text-[11px] sm:text-xs font-sans text-muted">
                          Verified by math
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Proof Reconciliation Bar (The TwoPlyProofBar) */}
      <div className="border-t-2 border-rule bg-paper/60 px-3.5 py-2 sm:px-4 sm:py-2.5 flex items-center justify-between gap-3 select-none">
        <div className="flex items-center justify-between sm:justify-start gap-4 sm:gap-6 text-xs font-sans">
          <div>
            <span className="text-muted block text-[11px]">Written Total</span>
            <span className="font-bold text-pencil text-xs sm:text-sm tabular-nums">
              <Amount amount={LANDING_SAMPLE_WRITTEN_TOTAL} />
            </span>
          </div>

          <div className="w-[1px] h-6 bg-rule" aria-hidden="true" />

          <div>
            <span className="text-muted block text-[11px]">Computed Total</span>
            <span className="font-bold text-paid text-xs sm:text-sm tabular-nums">
              <Amount amount={totals.computedTotal} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
