// impeccable-disable side-tab -- intentional red margin line per docs/design.md
"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Phone,
  Clock,
  Users,
  Search,
  X,
} from "lucide-react";
import type { CustomerSummary } from "@/types/ledger";
import { Amount } from "@/components/shared/Amount";

interface CustomerListProps {
  customers: CustomerSummary[];
}

type FilterType = "all" | "owing" | "settled";

/**
 * CustomerList
 *
 * Implements the Counter Customer Directory Pad ("The Notebook, Kept").
 * Lined counter notepad layout with left red margin rule, binder holes,
 * real-time search, filter tabs, and direct reminder actions.
 */
export function CustomerList({ customers }: CustomerListProps) {
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Calculate totals and counts in integer centavos
  const { owingCount, settledCount, totalUtangCentavos } = useMemo(() => {
    let owing = 0;
    let settled = 0;
    let totalCentavos = 0;

    for (const c of customers) {
      if (c.balance > 0) {
        owing++;
        totalCentavos += Math.round(c.balance * 100);
      } else {
        settled++;
      }
    }

    return {
      owingCount: owing,
      settledCount: settled,
      totalUtangCentavos: totalCentavos / 100,
    };
  }, [customers]);

  // Filter and search: Debtors highest balance first, followed by settled
  const filteredCustomers = useMemo(() => {
    let list = [...customers];

    if (filter === "owing") {
      list = list.filter((c) => c.balance > 0);
    } else if (filter === "settled") {
      list = list.filter((c) => c.balance <= 0);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.phone_optional && c.phone_optional.includes(q))
      );
    }

    return list.sort((a, b) => {
      if (a.balance > 0 && b.balance > 0) return b.balance - a.balance;
      if (a.balance > 0) return -1;
      if (b.balance > 0) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [customers, filter, searchQuery]);

  if (customers.length === 0) {
    return (
      <div className="relative rounded-row border border-rule bg-[#FFFEF8] border-l-4 border-l-margin shadow-paper overflow-hidden select-none p-6 text-center space-y-3">
        {/* Binder Edge Holes */}
        <div className="flex items-center justify-center gap-2 pb-2 border-b border-rule/50" aria-hidden="true">
          <span className="w-2.5 h-2.5 rounded-full bg-paper border border-[#C5D0B4]" />
          <span className="w-2.5 h-2.5 rounded-full bg-paper border border-[#C5D0B4]" />
          <span className="w-2.5 h-2.5 rounded-full bg-paper border border-[#C5D0B4]" />
        </div>

        <div className="space-y-1.5 py-4">
          <div className="w-12 h-12 rounded-full bg-paper border border-rule flex items-center justify-center mx-auto text-muted">
            <Users className="w-6 h-6" />
          </div>
          <p className="font-display font-bold text-base text-pencil">
            No customers recorded yet
          </p>
          <p className="text-xs text-muted font-sans max-w-xs mx-auto leading-relaxed">
            Customers are automatically added when you scan and confirm your first counter notebook page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-row border border-rule bg-[#FFFEF8] border-l-4 border-l-margin shadow-paper-lg overflow-hidden select-none">
      {/* Header Pad Strip with Binder Holes & Controls */}
      <div className="px-4 sm:px-5 py-3.5 border-b border-rule bg-[#FBFDF6]/80 space-y-3">
        {/* Top Row: Title, Binder Holes, and Total Count */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1" aria-hidden="true">
              <span className="w-2 h-2 rounded-full bg-paper border border-[#C5D0B4]" />
              <span className="w-2 h-2 rounded-full bg-paper border border-[#C5D0B4]" />
              <span className="w-2 h-2 rounded-full bg-paper border border-[#C5D0B4]" />
            </div>
            <h2 className="font-display font-bold text-base sm:text-lg text-pencil tracking-tight">
              Customer Directory
            </h2>
          </div>

          <span className="text-xs font-semibold text-muted font-sans">
            {customers.length} total suki
          </span>
        </div>

        {/* Search Bar & Filter Tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-0.5">
          {/* Quick Search Input */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customer name or phone..."
              className="w-full text-xs font-sans pl-8 pr-7 py-1.5 rounded-pill bg-sheet border border-rule text-pencil placeholder:text-muted focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-pencil p-0.5"
                aria-label="Clear search"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="inline-flex items-center gap-1 bg-paper/80 p-0.5 rounded-pill border border-rule self-start sm:self-center flex-shrink-0">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`px-2.5 py-1 text-xs font-bold rounded-pill transition-all cursor-pointer ${
                filter === "all"
                  ? "bg-ink text-sheet shadow-xs"
                  : "text-muted hover:text-pencil"
              }`}
            >
              All ({customers.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("owing")}
              className={`px-2.5 py-1 text-xs font-bold rounded-pill transition-all cursor-pointer ${
                filter === "owing"
                  ? "bg-margin text-sheet shadow-xs"
                  : "text-muted hover:text-pencil"
              }`}
            >
              Owing ({owingCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter("settled")}
              className={`px-2.5 py-1 text-xs font-bold rounded-pill transition-all cursor-pointer ${
                filter === "settled"
                  ? "bg-paid text-sheet shadow-xs"
                  : "text-muted hover:text-pencil"
              }`}
            >
              Settled ({settledCount})
            </button>
          </div>
        </div>
      </div>

      {/* Ruled Horizontal Customer Rows */}
      {filteredCustomers.length === 0 ? (
        <div className="p-8 text-center text-sm text-muted font-sans">
          {searchQuery
            ? `No customers match "${searchQuery}".`
            : "No customers found in this category."}
        </div>
      ) : (
        <div className="divide-y divide-[#E6ECE0] paper-stagger">
          {filteredCustomers.map((c) => {
            const hasDebt = c.balance > 0;
            const isPaid = c.balance === 0;
            const isOverpaid = c.balance < 0;

            let formattedDate = "Recent";
            if (c.last_activity_at) {
              try {
                formattedDate = new Intl.DateTimeFormat("en-US", {
                  month: "short",
                  day: "numeric",
                }).format(new Date(c.last_activity_at));
              } catch {
                formattedDate = "Recent";
              }
            }

            return (
              <Link
                key={c.id}
                href={`/customers/${c.id}`}
                className="paper-row px-4 sm:px-5 py-3.5 flex items-center justify-between gap-4 transition-colors group cursor-pointer"
              >
                {/* Left: Customer Info & Status Meta */}
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-display font-bold text-base text-pencil group-hover:text-ink transition-colors truncate">
                      {c.name}
                    </span>

                    {c.phone_optional && (
                      <span className="inline-flex items-center gap-1 text-xs text-muted font-sans font-medium">
                        <Phone className="w-2.5 h-2.5" />
                        <span>{c.phone_optional}</span>
                      </span>
                    )}
                  </div>

                  {/* Status Indicator & Last Active Date */}
                  <div className="flex items-center gap-2 text-xs font-sans">
                    {hasDebt && (
                      <span className="inline-flex items-center gap-1 text-margin font-bold">
                        <AlertCircle className="w-3 h-3" />
                        <span>Payment Due</span>
                      </span>
                    )}
                    {isPaid && (
                      <span className="inline-flex items-center gap-1 text-paid font-bold">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Settled</span>
                      </span>
                    )}
                    {isOverpaid && (
                      <span className="inline-flex items-center gap-1 text-ink font-bold">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Advance Credit</span>
                      </span>
                    )}

                    <span className="text-muted inline-flex items-center gap-1">
                      &bull;
                      <Clock className="w-2.5 h-2.5" />
                      <span>{formattedDate}</span>
                    </span>
                  </div>
                </div>

                {/* Right: Tabular Balance Due & Direct Action with Generous Spacing */}
                <div className="flex items-center gap-3 sm:gap-6 flex-shrink-0 text-right">
                  <Amount
                    amount={Math.abs(c.balance)}
                    size="base"
                    className={`font-black tabular-nums text-right ${
                      hasDebt
                        ? "text-margin"
                        : isPaid
                        ? "text-paid"
                        : "text-ink"
                    }`}
                  />

                  <span
                    className={`text-xs font-bold inline-flex items-center gap-1 group-hover:underline min-w-[90px] justify-end ${
                      hasDebt ? "text-ink" : "text-muted group-hover:text-ink"
                    }`}
                  >
                    <span>{hasDebt ? "Draft reminder" : "Open ledger"}</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Pad Footer: Ledger Total Reconciliation */}
      <div className="px-4 sm:px-5 py-3.5 bg-[#F6F9EF]/90 border-t-2 border-rule flex items-center justify-between">
        <div>
          <span className="font-display font-bold text-sm sm:text-base text-pencil block leading-tight">
            Total Customer Credit
          </span>
          <span className="text-xs text-muted font-sans">
            {owingCount === 1 ? "1 active suki owes credit" : `${owingCount} active suki owe credit`}
          </span>
        </div>

        <Amount
          amount={totalUtangCentavos}
          size="lg"
          className="font-black text-pencil tabular-nums"
        />
      </div>
    </div>
  );
}