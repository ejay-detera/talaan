import Link from "next/link";
import { ArrowRight, CheckCircle2, AlertCircle, Phone, Clock } from "lucide-react";
import type { CustomerSummary } from "@/types/ledger";
import { Amount } from "@/components/shared/Amount";

interface CustomerListProps {
  customers: CustomerSummary[];
}

export function CustomerList({ customers }: CustomerListProps) {
  if (customers.length === 0) {
    return (
      <div className="p-8 text-center rounded-sheet border border-dashed border-rule bg-sheet/60 space-y-2 select-none">
        <p className="text-sm font-semibold text-pencil">Wala pang nakatalang suki sa tindahan.</p>
        <p className="text-xs text-muted">
          Kusa itong malilikha kapag nag-scan at nagkumpirma kayo ng pahina ng kuwaderno.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 select-none">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xs font-bold text-muted uppercase tracking-wider">
          Listahan ng mga Suki ({customers.length})
        </h2>
        <span className="text-[11px] text-muted">Pindutin para sa buong kasaysayan</span>
      </div>

      <div className="space-y-2.5">
        {customers.map((c) => {
          const hasDebt = c.balance > 0;
          const isPaid = c.balance === 0;
          const isOverpaid = c.balance < 0;

          return (
            <Link
              key={c.id}
              href={`/customers/${c.id}`}
              className="block p-3.5 sm:p-4 rounded-sheet border border-rule bg-sheet hover:border-ink/40 active:scale-[0.99] transition-all group"
            >
              <div className="flex items-center justify-between gap-3">
                {/* Left: Customer Info & Status */}
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-pencil truncate group-hover:text-ink transition-colors">
                      {c.name}
                    </span>
                    {c.phone_optional && (
                      <span className="inline-flex items-center gap-0.5 text-[11px] text-muted">
                        <Phone className="w-2.5 h-2.5" />
                        <span>{c.phone_optional}</span>
                      </span>
                    )}
                  </div>

                  {/* Status Indicator (Icon + Label pair per docs/design.md) */}
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    {hasDebt && (
                      <span className="inline-flex items-center gap-1 text-margin font-bold">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>May Utang</span>
                      </span>
                    )}
                    {isPaid && (
                      <span className="inline-flex items-center gap-1 text-paid font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Bayad Na</span>
                      </span>
                    )}
                    {isOverpaid && (
                      <span className="inline-flex items-center gap-1 text-ink font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Sobra ang Bayad</span>
                      </span>
                    )}

                    {c.last_activity_at && (
                      <span className="text-[11px] text-muted font-normal inline-flex items-center gap-1">
                        &bull;
                        <Clock className="w-3 h-3" />
                        <span>{new Date(c.last_activity_at).toLocaleDateString("tl-PH")}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: Amount & Arrow */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <Amount
                      amount={Math.abs(c.balance)}
                      size="lg"
                      className={`font-extrabold ${
                        hasDebt ? "text-margin" : isPaid ? "text-paid" : "text-ink"
                      }`}
                    />
                    <span className="block text-[10px] text-muted font-medium">
                      {hasDebt ? "Kailangang singilin" : isPaid ? "Walang balanse" : "Advance payment"}
                    </span>
                  </div>

                  <ArrowRight className="w-4 h-4 text-muted group-hover:text-ink group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

