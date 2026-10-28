// impeccable-disable side-tab -- intentional red margin line per docs/design.md and counter wireframe
import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Amount } from "@/components/shared/Amount";

export interface DebtorCustomer {
  id: string;
  name: string;
  balance: number;
  last_activity_at: string | null;
}

interface WhoOwesCreditCardProps {
  customers: DebtorCustomer[];
  totalStoreUtang: number;
  className?: string;
}

/**
 * WhoOwesCreditCard
 *
 * Implements the "Who owes credit" (Sino ang may utang) counter card.
 * Styled as an authentic lined counter notepad slip with the signature left red margin line
 * (2px solid #C8302F) and running debtor balances. Entire row navigates to customer profile.
 */
export function WhoOwesCreditCard({
  customers,
  totalStoreUtang,
  className = "",
}: WhoOwesCreditCardProps) {
  // Only display customers who currently owe credit, sorted highest balance first
  const debtors = customers
    .filter((c) => c.balance > 0)
    .sort((a, b) => b.balance - a.balance);

  return (
    <div
      className={`relative rounded-row border border-[#D5DEC6] bg-[#FFFEF8] border-l-4 border-l-margin shadow-paper overflow-hidden select-none transform rotate-[0.5deg] hover:rotate-0 transition-transform duration-300 ${className}`}
    >
      {/* Header Strip with Customer Count and Notebook Binder Punches */}
      <div className="px-5 py-3.5 border-b border-rule flex items-center justify-between bg-[#FBFDF6]/80">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1" aria-hidden="true">
            <span className="w-2 h-2 rounded-full bg-paper border border-[#C5D0B4]" />
            <span className="w-2 h-2 rounded-full bg-paper border border-[#C5D0B4]" />
            <span className="w-2 h-2 rounded-full bg-paper border border-[#C5D0B4]" />
          </div>
          <h2 className="font-display font-bold text-base sm:text-lg text-pencil tracking-tight">
            Who owes credit
          </h2>
        </div>
        <span className="text-xs font-semibold text-muted font-sans">
          {debtors.length === 1 ? "1 customer" : `${debtors.length} customers`}
        </span>
      </div>

      {/* Customer List: Clicking any row opens that customer's profile */}
      {debtors.length === 0 ? (
        <div className="p-6 text-center text-sm text-muted font-sans">
          No outstanding customer credit recorded.
        </div>
      ) : (
        <div className="divide-y divide-[#E6ECE0]">
          {debtors.map((cust) => {
            let formattedDate = "Recent";
            if (cust.last_activity_at) {
              try {
                formattedDate = new Intl.DateTimeFormat("en-US", {
                  month: "short",
                  day: "numeric",
                }).format(new Date(cust.last_activity_at));
              } catch {
                formattedDate = "Recent";
              }
            }

            return (
              <Link
                key={cust.id}
                href={`/customers/${cust.id}`}
                className="px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-paper/40 transition-colors group cursor-pointer"
              >
                <div className="min-w-0">
                  <p className="font-bold text-sm sm:text-base text-pencil truncate font-sans group-hover:text-ink transition-colors">
                    {cust.name}
                  </p>
                  <p className="text-xs text-muted font-sans">
                    Last active: {formattedDate}
                  </p>
                </div>

                <div className="flex flex-col items-end justify-center text-right flex-shrink-0 gap-0.5">
                  <Amount
                    amount={cust.balance}
                    size="base"
                    className="font-extrabold text-pencil tabular-nums group-hover:text-ink transition-colors"
                  />
                  <span className="text-xs font-bold text-ink group-hover:underline inline-flex items-center gap-1">
                    <span>Draft reminder</span>
                    <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Card Footer: Total Balance */}
      <div className="px-5 py-3.5 bg-[#F6F9EF]/80 border-t-2 border-rule flex items-center justify-between">
        <span className="font-bold text-sm sm:text-base text-pencil font-sans">
          Total
        </span>
        <Amount
          amount={totalStoreUtang}
          size="base"
          className="font-black text-pencil tabular-nums"
        />
      </div>
    </div>
  );
}
