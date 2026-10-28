// impeccable-disable design-system-font-size -- decorative miniature paper mockup props
import { AlertTriangle, CheckCircle2, ShieldCheck } from "lucide-react";
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
    <div className="relative w-full mx-auto max-w-2xl bg-sheet rounded-sheet border border-rule shadow-paper-lg overflow-hidden transition-all duration-300 hover:shadow-[0_28px_56px_-12px_rgba(35,38,43,0.16)]">
      {/* Notebook Binder Header Strip */}
      <div className="h-10 px-4 bg-paper/80 border-b border-rule flex items-center justify-between select-none">
        <div className="flex items-center gap-2">
          {/* Notebook spiral ring punch holes */}
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="w-2.5 h-2.5 rounded-full bg-paper border border-rule" />
            <span className="w-2.5 h-2.5 rounded-full bg-paper border border-rule" />
            <span className="w-2.5 h-2.5 rounded-full bg-paper border border-rule" />
          </div>
          <span className="text-sm font-sans font-semibold tracking-wider uppercase text-muted ml-2">
            Counter Notebook &bull; Page 14
          </span>
        </div>

        <div className="flex items-center gap-1 text-sm font-sans text-muted">
          <span>Date:</span>
          <span className="font-semibold text-pencil">Oct 27</span>
        </div>
      </div>

      {/* Main Ruled Notebook Leaf */}
      <div className="relative p-5 sm:p-7 bg-sheet">
        {/* Notebook Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between pb-4 border-b border-rule gap-1 select-none">
          <div>
            <h3 className="font-display font-bold text-base sm:text-lg text-pencil tracking-tight">
              Aling Nena&apos;s Store — Talaan ng Utang
            </h3>
            <p className="text-xs text-muted font-sans">
              Handwritten counter entries verified by deterministic math
            </p>
          </div>
          <div className="text-right">
            <span className="text-sm uppercase tracking-wider text-muted font-sans block">
              Status
            </span>
            <span className="text-xs font-semibold text-paid font-sans inline-flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Ready for Review
            </span>
          </div>
        </div>

        {/* Ruled Notebook Ledger Area with Red Margin Gutter */}
        <div className="relative mt-4 pl-7 sm:pl-9 pr-2">
          {/* Authentic Left Red Margin Rule */}
          <div
            className="absolute left-4 sm:left-5 top-0 bottom-0 w-[2px] bg-margin select-none pointer-events-none"
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
                  className={`py-3 transition-colors ${
                    isCora
                      ? "bg-marker/25 -mx-2 px-2 rounded-row"
                      : isBaby
                      ? "bg-[#FDF6F6] -mx-2 px-2 rounded-row"
                      : ""
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    {/* Left: Customer & Raw Handwriting */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-sans font-semibold text-sm text-pencil">
                          {row.customer}
                        </span>

                        {isBaby && (
                          <span className="inline-flex items-center gap-1 text-sm font-sans font-semibold text-margin bg-sheet px-2 py-0.5 rounded border border-margin/40">
                            <AlertTriangle className="w-3 h-3" />
                            Multiplication Mismatch
                          </span>
                        )}

                        {isCora && (
                          <span className="inline-flex items-center gap-1 text-sm font-sans font-semibold text-pencil bg-sheet px-2 py-0.5 rounded border border-pencil/30">
                            <span>Unitemized</span>
                          </span>
                        )}
                      </div>

                      {/* Quarantined Handwriting in Caveat */}
                      <p className="font-hand text-lg text-pencil/80 leading-snug mt-0.5 select-none">
                        {isBaby && '3 pancit canton @ 12 = 46 (nakasulat)'}
                        {isCora && 'toyo at suka = 54 (nakasulat)'}
                        {row.customer === 'Mang Jose' && '2 corned beef @ 38 = 76'}
                        {row.customer === 'Kuya Jun' && '2 kopiko brown @ 20 = 40'}
                      </p>
                    </div>

                    {/* Right: Amounts & Verification Resolution */}
                    <div className="text-right flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-center gap-2 sm:gap-0">
                      <div className="flex items-baseline gap-2">
                        {isBaby ? (
                          <>
                            <span className="text-xs text-muted line-through font-sans tabular-nums">
                              ₱46.00
                            </span>
                            <span className="font-sans font-bold text-sm text-paid tabular-nums">
                              ₱36.00
                            </span>
                          </>
                        ) : (
                          <span className="font-sans font-bold text-sm text-pencil tabular-nums">
                            <Amount amount={row.amount} />
                          </span>
                        )}
                      </div>

                      {isBaby && (
                        <span className="text-sm font-sans text-margin font-semibold">
                          ₱10.00 overcharge caught
                        </span>
                      )}

                      {isCora && (
                        <span className="text-sm font-sans text-muted">
                          Needs storekeeper confirm
                        </span>
                      )}

                      {!isBaby && !isCora && (
                        <span className="text-sm font-sans text-muted">
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
      <div className="border-t-2 border-rule bg-paper/60 p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 select-none">
        <div className="flex items-center justify-between sm:justify-start gap-4 sm:gap-6 text-xs font-sans">
          <div>
            <span className="text-muted block text-sm">Written Total</span>
            <span className="font-bold text-pencil text-sm tabular-nums">
              <Amount amount={LANDING_SAMPLE_WRITTEN_TOTAL} />
            </span>
          </div>

          <div className="w-[1px] h-8 bg-rule" aria-hidden="true" />

          <div>
            <span className="text-muted block text-sm">Computed Total</span>
            <span className="font-bold text-paid text-sm tabular-nums">
              <Amount amount={totals.computedTotal} />
            </span>
          </div>
        </div>

        {/* Discrepancy Signal Pill */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-row bg-sheet border border-margin/40 text-xs text-margin font-sans font-semibold shadow-xs">
          <ShieldCheck className="w-4 h-4 text-paid flex-shrink-0" />
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-1.5">
            <span className="text-pencil font-bold">₱10.00 Overcharge Caught</span>
            <span className="text-muted text-sm font-normal">
              (Fixed before DB update)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
