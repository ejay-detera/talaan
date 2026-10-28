// impeccable-disable design-system-font-size, side-tab -- decorative miniature paper mockup and RedMarginGutter rule
import { Amount } from "@/components/shared/Amount";
import {
  LANDING_SAMPLE_WRITTEN_TOTAL,
  LANDING_RECONCILED_ROWS,
  getLandingProofTotals,
} from "@/lib/ledger/sample-proof";

interface NotebookLedgerProofProps {
  modelName: string;
}

/**
 * Visual proof artifact for Talaan landing page.
 * Compares raw handwritten notebook listahan against verified digital ledger.
 * Pure Server Component (zero client bundle cost).
 */
export function NotebookLedgerProof({ modelName }: NotebookLedgerProofProps) {
  const totals = getLandingProofTotals(true);

  return (
    <section
      aria-label="Notebook to digital ledger comparison proof"
      className="w-full bg-sheet rounded-sheet border border-rule overflow-hidden"
    >
      {/* Proof Header with Provenance Badge */}
      <div className="flex items-center justify-between px-4 py-3 bg-paper border-b border-rule">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-paid select-none" aria-hidden="true" />
          <span className="text-xs font-semibold text-pencil">
            Patunay: Notebook papuntang ledger
          </span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-row bg-sheet border border-rule text-xs text-muted">
          <span className="w-1.5 h-1.5 rounded-full bg-paid select-none" aria-hidden="true" />
          <span>{modelName}</span>
        </div>
      </div>

      {/* Top Section: Raw Handwritten Notebook Strip (Caveat quarantine) */}
      <div className="p-4 border-b border-rule bg-sheet">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted font-sans font-medium">
            Nakasulat sa notebook (listahan sa counter)
          </span>
          <span className="text-[11px] text-muted italic">Halimbawang sulat-kamay</span>
        </div>
        <div
          className="notebook rounded-row p-3 text-pencil text-lg leading-6 border border-rule/60 select-none"
          tabIndex={0}
          role="region"
          aria-label="Halimbawa ng sulat-kamay sa notebook"
        >
          <p>Mang Jose — 2 corned beef @ 38 = 76</p>
          <p>Ate Baby — 3 pancit canton @ 12 = 46</p>
          <p>Nanay Cora — toyo at suka = 54</p>
          <p>Kuya Jun — 2 kopiko brown @ 20 = 40</p>
          <p className="font-bold pt-1">Kabuuan = 216</p>
        </div>
      </div>

      {/* Bottom Section: Verified Ledger Table with RedMarginGutter */}
      <div className="p-4 bg-sheet">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-muted font-sans font-medium">
            Suri ng Talaan (code ang nag-kompyut, may gabay sa tao)
          </span>
          <span className="text-[11px] text-muted">2-phase verification</span>
        </div>

        {/* Ledger Sheet with Left Red Margin Rule */}
        <div className="border border-rule border-l-2 border-l-margin rounded-row divide-y divide-rule overflow-hidden">
          {LANDING_RECONCILED_ROWS.map((row) => {
            const isRowError = row.customer === "Ate Baby";
            const isReview = row.needs_review && !isRowError;

            return (
              <div
                key={row.customer}
                className={`flex items-center justify-between px-3 py-2.5 text-sm transition-colors ${
                  isReview
                    ? "bg-marker text-pencil"
                    : isRowError
                    ? "bg-[#FDF6F6] text-pencil"
                    : "bg-sheet text-pencil"
                }`}
              >
                <div className="flex flex-col min-w-0 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-pencil truncate">
                      {row.customer}
                    </span>
                    {/* Status Badge pairing icon and label */}
                    {isRowError && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-margin bg-sheet px-1.5 py-0.5 rounded border border-margin/40">
                        <span aria-hidden="true">✕</span>
                        <span>Mali ang kwenta (3 × ₱12)</span>
                      </span>
                    )}
                    {isReview && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-pencil bg-sheet px-1.5 py-0.5 rounded border border-pencil/30">
                        <span aria-hidden="true">▲</span>
                        <span>Basahin muli · 74%</span>
                      </span>
                    )}
                    {!isRowError && !isReview && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-paid font-medium">
                        <span aria-hidden="true">✓</span>
                        <span>Tugma</span>
                      </span>
                    )}
                  </div>
                  <span className={`text-xs truncate ${isReview ? "text-pencil/80" : "text-muted"}`}>
                    {row.item}
                  </span>
                </div>

                <div className="flex items-baseline gap-2 shrink-0">
                  {isRowError && (
                    <span className="text-xs line-through text-muted select-none">
                      ₱46.00
                    </span>
                  )}
                  <Amount
                    amount={row.amount}
                    type="credit"
                    size="base"
                    className={isRowError ? "text-margin" : undefined}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Two-Ply Proof Bar (Reconciliation Bar) */}
        <div
          role="status"
          aria-live="polite"
          className="mt-3 p-3 rounded-row bg-paper border border-rule border-l-4 border-l-margin flex flex-col sm:flex-row sm:items-center justify-between gap-2"
        >
          <div className="flex flex-col">
            <span className="text-xs text-muted">
              Nakasulat na total:{" "}
              <strong className="text-pencil font-semibold">
                ₱{LANDING_SAMPLE_WRITTEN_TOTAL.toFixed(2)}
              </strong>
            </span>
            <span className="text-xs text-margin font-semibold flex items-center gap-1">
              <span aria-hidden="true">✕</span>
              <span>Discrepancy: Sobra ng ₱10.00 sa notebook</span>
            </span>
          </div>

          <div className="flex items-baseline sm:justify-end gap-1.5">
            <span className="text-xs text-muted">Kompyut ng code:</span>
            <Amount amount={totals.computedTotal} type="credit" size="base" />
          </div>
        </div>
      </div>
    </section>
  );
}
