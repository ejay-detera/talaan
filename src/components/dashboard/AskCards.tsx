import React from "react";
import Link from "next/link";
import { ArrowRight, AlertTriangle, UserCheck, ShieldAlert, FileText, Wallet } from "lucide-react";
import type { AskResultCards } from "@/lib/ask/schemas";

interface AskCardsProps {
  cards: AskResultCards;
}

export function AskCards({ cards }: AskCardsProps) {
  const { overdue_customers, customer_balance, discrepancy_pages, store_summary, ambiguous_candidates } =
    cards;

  const hasAnyCard =
    (overdue_customers && overdue_customers.length > 0) ||
    customer_balance ||
    (discrepancy_pages && discrepancy_pages.length > 0) ||
    store_summary ||
    (ambiguous_candidates && ambiguous_candidates.length > 0);

  if (!hasAnyCard) return null;

  return (
    <div className="space-y-3.5 my-3">
      {/* 1. Overdue Customers Cards */}
      {overdue_customers && overdue_customers.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-muted uppercase tracking-wider">
            <span className="flex items-center gap-1.5 text-red-margin">
              <ShieldAlert className="w-3.5 h-3.5" />
              Suki na Dapat Singilin ({overdue_customers.length})
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {overdue_customers.map((c) => {
              const reasonText =
                c.reason === "credit_limit_exceeded"
                  ? "Lagpas sa credit limit"
                  : c.reason === "inactive_7_days"
                  ? `${c.days_inactive} araw nang walang transaksyon`
                  : `${c.days_inactive} araw inactive & lampas sa credit limit`;

              return (
                <div
                  key={c.id}
                  className="bg-white border border-[#D5DEC6] border-l-4 border-l-red-margin p-3.5 rounded-sm shadow-sm flex flex-col justify-between space-y-2 hover:border-pencil/40 transition-colors"
                >
                  <div>
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-display font-bold text-pencil text-sm truncate">
                        {c.name}
                      </span>
                      <span className="font-sans font-bold text-red-margin text-sm tabular-nums shrink-0">
                        {c.balance}
                      </span>
                    </div>
                    <p className="text-xs text-muted font-sans mt-0.5">{reasonText}</p>
                  </div>

                  <Link
                    href={`/customers/${c.id}`}
                    className="inline-flex items-center justify-between text-xs font-semibold text-ink hover:underline pt-1 border-t border-[#F0F2EB]"
                  >
                    <span>Mag-draft ng paalala</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Customer Balance Card */}
      {customer_balance && (
        <div className="bg-white border border-[#D5DEC6] border-l-4 border-l-ink p-4 rounded-sm shadow-sm space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted block">
                Balanse ng Suki
              </span>
              <h3 className="font-display font-bold text-base text-pencil">
                {customer_balance.name}
              </h3>
            </div>
            <div className="text-right">
              <span className="text-xs text-muted block">Kasalukuyang Utang</span>
              <span className="font-sans font-black text-lg text-pencil tabular-nums">
                {customer_balance.balance}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-muted bg-[#F8FAEF] p-2.5 rounded-sm border border-[#E6EAD8]">
            <div>
              <span>Kabuuang Kinuha: </span>
              <span className="font-semibold text-pencil tabular-nums">
                {customer_balance.total_credit}
              </span>
            </div>
            <div>
              <span>Kabuuang Bayad: </span>
              <span className="font-semibold text-pencil tabular-nums">
                {customer_balance.total_payment}
              </span>
            </div>
          </div>

          <Link
            href={`/customers/${customer_balance.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink hover:underline"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Buksan ang buong ledger record</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* 3. Discrepancy Pages Cards */}
      {discrepancy_pages && discrepancy_pages.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-red-margin uppercase tracking-wider">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Pahina na may Discrepancy ({discrepancy_pages.length})</span>
          </div>

          <div className="space-y-2">
            {discrepancy_pages.map((p) => (
              <div
                key={p.page_id}
                className="bg-white border border-[#D5DEC6] border-l-4 border-l-red-margin p-3 rounded-sm shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-muted" />
                    <span className="text-xs font-bold text-pencil">
                      Petsa: {p.page_date}
                    </span>
                  </div>
                  <div className="text-xs text-muted font-sans mt-1 space-x-3">
                    <span>Nakasulat: <strong className="text-pencil tabular-nums">{p.written_total}</strong></span>
                    <span>Kinalkula: <strong className="text-pencil tabular-nums">{p.computed_total}</strong></span>
                    <span className="text-red-margin font-semibold">Agwat: <strong className="tabular-nums">{p.diff}</strong></span>
                  </div>
                </div>

                <Link
                  href={`/review/${p.page_id}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-ink hover:underline shrink-0"
                >
                  <span>Suriin ang pahina</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Store Liquidity Summary */}
      {store_summary && (
        <div className="bg-white border border-[#D5DEC6] p-4 rounded-sm shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted uppercase tracking-wider flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-pencil" />
              Lagom ng Tindahan
            </span>
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 border border-pencil/30 rounded-sm bg-[#FFFDF5]">
              {store_summary.liquidity_status}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2 bg-[#F8FAEF] border border-[#E6EAD8] rounded-sm">
              <span className="text-muted block">Cash Benta</span>
              <span className="font-bold text-pencil tabular-nums">{store_summary.cash_sales}</span>
            </div>
            <div className="p-2 bg-[#F8FAEF] border border-[#E6EAD8] rounded-sm">
              <span className="text-muted block">Utang Benta</span>
              <span className="font-bold text-pencil tabular-nums">{store_summary.credit_sales}</span>
            </div>
            <div className="p-2 bg-[#F8FAEF] border border-[#E6EAD8] rounded-sm">
              <span className="text-muted block">Kabuuang Volume</span>
              <span className="font-bold text-pencil tabular-nums">{store_summary.total_volume}</span>
            </div>
            <div className="p-2 bg-[#F8FAEF] border border-[#E6EAD8] rounded-sm">
              <span className="text-muted block">Aktibong May Utang</span>
              <span className="font-bold text-pencil tabular-nums">{store_summary.debtor_count} suki</span>
            </div>
          </div>
        </div>
      )}

      {/* 5. Ambiguous Candidates */}
      {ambiguous_candidates && ambiguous_candidates.length > 0 && (
        <div className="bg-[#FFFDF5] border border-[#DDD3BC] p-3 rounded-sm text-xs space-y-1.5">
          <span className="font-bold text-pencil">Tumutugmang mga suki:</span>
          <div className="flex flex-wrap gap-2">
            {ambiguous_candidates.map((c) => (
              <Link
                key={c.id}
                href={`/customers/${c.id}`}
                className="px-2 py-1 bg-white border border-[#D5DEC6] rounded-sm font-semibold text-ink hover:border-ink"
              >
                {c.name} →
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

