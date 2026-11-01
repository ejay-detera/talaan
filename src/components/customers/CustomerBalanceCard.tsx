"use client";

import React, { useState } from "react";
import { AlertCircle, CheckCircle2, ReceiptText, HandCoins, ShieldAlert } from "lucide-react";
import { Amount } from "@/components/shared/Amount";
import { CustomerReceiptModal } from "./CustomerReceiptModal";
import { RecordPaymentModal } from "./RecordPaymentModal";
import type { CustomerLedgerEntry } from "@/types/ledger";

interface CustomerBalanceCardProps {
  storeName: string;
  customerId: string;
  customerName: string;
  phoneOptional?: string | null;
  creditLimit?: number | null;
  balance: number;
  totalCredit: number;
  totalPayment: number;
  entries: CustomerLedgerEntry[];
}

export function CustomerBalanceCard({
  storeName,
  customerId,
  customerName,
  phoneOptional,
  creditLimit = 500,
  balance,
  totalCredit,
  totalPayment,
  entries,
}: CustomerBalanceCardProps) {
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [liveBalance, setLiveBalance] = useState(balance);

  const hasDebt = liveBalance > 0;
  const isPaid = liveBalance === 0;
  const effectiveLimit = creditLimit ?? 500;
  const isOverLimit = liveBalance > effectiveLimit;

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
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <Amount
            amount={Math.abs(liveBalance)}
            size="lg"
            className={`text-3xl sm:text-4xl font-black tracking-tight block ${
              hasDebt ? "text-margin" : isPaid ? "text-paid" : "text-ink"
            }`}
          />

          {/* Credit Limit Stamp */}
          <div
            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-xs border ${
              isOverLimit
                ? "bg-[#FDF2F2] text-margin border-margin/40"
                : "bg-paper text-muted border-rule"
            }`}
          >
            {isOverLimit && <ShieldAlert className="w-3 h-3 text-margin" />}
            <span>Limit: ₱{effectiveLimit.toFixed(2)}</span>
            {isOverLimit && <span className="text-[10px] text-margin">(Over limit)</span>}
          </div>
        </div>

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

        {/* Action Buttons: Record Pay & View E-Resibo */}
        <div className="pt-2 border-t border-rule/60 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setIsPaymentOpen(true)}
            className="w-full min-h-[48px] rounded-row bg-paid hover:bg-[#18623D] active:scale-[0.99] text-xs sm:text-sm font-bold text-sheet flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none font-sans shadow-xs"
          >
            <HandCoins className="w-4 h-4" />
            <span>Record Pay</span>
          </button>

          <button
            type="button"
            onClick={() => setIsReceiptOpen(true)}
            className="w-full min-h-[48px] rounded-row border border-ink text-ink bg-sheet hover:bg-paper active:scale-[0.99] text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none font-sans shadow-xs"
          >
            <ReceiptText className="w-4 h-4 text-ink" />
            <span>View E-Resibo</span>
          </button>
        </div>
      </div>

      <CustomerReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        storeName={storeName}
        customerName={customerName}
        phoneOptional={phoneOptional}
        balance={liveBalance}
        totalCredit={totalCredit}
        totalPayment={totalPayment}
        entries={entries}
      />

      <RecordPaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        customerId={customerId}
        customerName={customerName}
        currentBalance={liveBalance}
        onSuccess={(newBal) => setLiveBalance(newBal)}
      />
    </>
  );
}
