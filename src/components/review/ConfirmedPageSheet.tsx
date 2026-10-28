"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight, User } from "lucide-react";
import type { ReviewEntry } from "@/types/ledger";
import { Amount } from "@/components/shared/Amount";
import { NotebookStrip } from "@/components/review/NotebookStrip";

interface ConfirmedPageSheetProps {
  page: {
    id: string;
    page_date: string | null;
    written_total: number | null;
    computed_total: number;
    has_page_discrepancy: boolean;
    model: string;
  };
  entries: ReviewEntry[];
  imageUrl: string | null;
}

export function ConfirmedPageSheet({
  page,
  entries,
  imageUrl,
}: ConfirmedPageSheetProps) {
  return (
    <div className="space-y-4 select-none pb-8">
      {/* Confirmed Banner Slip */}
      <div className="p-4 rounded-sheet border border-paid/40 bg-sheet flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-paid/10 text-paid flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-pencil leading-tight">
              Kumpirmado at Naitala sa Ledger
            </h2>
            <p className="text-sm text-muted">
              {entries.length} mga linya &bull; {page.page_date || "Listahan"}
            </p>
          </div>
        </div>

        <Link
          href="/customers"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-row bg-ink text-sheet text-xs font-bold hover:bg-ink/90 active:scale-[0.98] transition-all min-h-[44px]"
        >
          <span>Mga Suki</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Collapsible Notebook Preview Strip */}
      <NotebookStrip imageUrl={imageUrl} />

      {/* Confirmed Ledger Entries Sheet */}
      <div className="rounded-sheet border border-rule bg-sheet overflow-hidden">
        <div className="p-3.5 sm:p-4 border-b border-rule flex items-center justify-between">
          <h3 className="text-xs font-bold text-pencil uppercase tracking-wider">
            Mga Naitalang Transaksyon
          </h3>
          <span className="text-sm text-muted font-bold">
            {page.model}
          </span>
        </div>

        <div className="divide-y divide-rule/60">
          {entries.map((entry, idx) => {
            const isPayment = entry.entry_type === "payment";
            const isCredit = entry.entry_type === "credit";

            return (
              <div
                key={entry.id || idx}
                className="p-3 sm:p-3.5 flex items-center justify-between gap-3"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {entry.customer_id ? (
                      <Link
                        href={`/customers/${entry.customer_id}`}
                        className="text-xs font-bold text-ink hover:underline inline-flex items-center gap-1"
                      >
                        <User className="w-3 h-3 text-muted" />
                        <span className="truncate">{entry.customer_name}</span>
                      </Link>
                    ) : (
                      <span className="text-xs font-bold text-pencil truncate">
                        {entry.customer_name}
                      </span>
                    )}

                    <span
                      className={`text-sm font-bold px-1.5 py-0.5 rounded-row border ${
                        isPayment
                          ? "bg-paid/10 text-paid border-paid/30"
                          : isCredit
                          ? "bg-paper text-pencil border-rule"
                          : "bg-marker/20 text-pencil border-marker/40"
                      }`}
                    >
                      {isPayment ? "Bayad" : isCredit ? "Utang" : "Cash"}
                    </span>
                  </div>

                  <p className="text-xs text-muted truncate">
                    {entry.item}
                    {entry.quantity && entry.unit_price ? (
                      <span className="ml-1 text-sm text-muted/80">
                        ({entry.quantity} &times; ₱{Number(entry.unit_price).toFixed(2)})
                      </span>
                    ) : null}
                  </p>
                </div>

                <div className="text-right flex-shrink-0">
                  <Amount
                    amount={entry.amount}
                    size="base"
                    className={isPayment ? "text-paid font-bold" : "text-pencil font-bold"}
                  />
                  {isPayment && (
                    <span className="block text-sm text-paid font-semibold">
                      Bawas sa utang
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Total Summary Row */}
        <div className="p-4 bg-paper/60 border-t border-rule flex items-center justify-between">
          <div className="text-xs text-muted">
            {page.written_total !== null && (
              <p>Nakasulat na total: ₱{Number(page.written_total).toFixed(2)}</p>
            )}
            <p className="font-bold text-pencil">Netong Kwenta sa Ledger:</p>
          </div>

          <div className="text-right">
            <Amount amount={page.computed_total} size="lg" className="font-extrabold text-pencil" />
          </div>
        </div>
      </div>
    </div>
  );
}
