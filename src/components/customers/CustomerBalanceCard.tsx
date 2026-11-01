"use client";

import React, { useState } from "react";
import { AlertCircle, CheckCircle2, ReceiptText } from "lucide-react";
import { Amount } from "@/components/shared/Amount";
import { CustomerReceiptModal } from "./CustomerReceiptModal";
import type { CustomerLedgerEntry } from "@/types/ledger";

interface CustomerBalanceCardProps {
  storeName: string;
  customerName: string;
  phoneOptional?: string | null;
  balance: number;
  totalCredit: number;
  totalPayment: number;
  entries: CustomerLedgerEntry[];
}

export function CustomerBalanceCard({
  storeName,
  customerName,
  phoneOptional,
  balance,
  totalCredit,
  totalPayment,
  entries,
}: CustomerBalanceCardProps) {
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const hasDebt = balance > 0;
  const isPaid = balance === 0;

  return (
    <>
      <div className="p-5 sm:p-6 rounded-row border border-rule bg-sheet shadow-paper select-none space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-muted uppercase tracking-wider font-sans">
            Current balance
          </span>
          <span
            className={`text-xs font-bold inline-flex items-center gap-1 ${
              hasDebt ? "text-margin" : "text-paid"
            }`}
          >
            {hasDebt ? (
              <>
                <AlertCircle className="w-3 h-3" />
                <span>Payment Due</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3 h-3" />
                <span>Zero Balance</span>
              </>
            )}
          </span>
        </div>

        {/* Big Tabular Balance Amount */}
        <Amount
          amount={Math.abs(balance)}
          size="lg"
          className={`text-3xl sm:text-4xl font-black tracking-tight block ${
            hasDebt ? "text-margin" : isPaid ? "text-paid" : "text-ink"
          }`}
        />

        {/* Sub-totals Rule */}
        <div className="pt-3 border-t border-rule/60 grid grid-cols-2 gap-4 text-xs font-sans">
          <div>
            <span className="text-muted block">Total credit:</span>
            <strong className="text-pencil font-bold text-sm block mt-0.5">
              ₱{totalCredit.toFixed(2)}
            </strong>
          </div>
          <div>
            <span className="text-muted block">Total paid:</span>
            <strong className="text-paid font-bold text-sm block mt-0.5">
              ₱{totalPayment.toFixed(2)}
            </strong>
          </div>
        </div>

        {/* Action Button: E-Resibo Digital Slip */}
        <div className="pt-2 border-t border-rule/60">
          <button
            type="button"
            onClick={() => setIsReceiptOpen(true)}
            className="w-full min-h-[46px] rounded-row border border-ink text-ink bg-sheet hover:bg-paper active:scale-[0.99] text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer select-none font-sans shadow-xs"
          >
            <ReceiptText className="w-4 h-4 text-ink" />
            <span>View E-Resibo Slip</span>
          </button>
        </div>
      </div>

      <CustomerReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        storeName={storeName}
        customerName={customerName}
        phoneOptional={phoneOptional}
        balance={balance}
        totalCredit={totalCredit}
        totalPayment={totalPayment}
        entries={entries}
      />
    </>
  );
}

