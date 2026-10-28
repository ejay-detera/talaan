import { connection } from "next/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Phone, AlertCircle, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCustomerBalanceDetail } from "@/services/customers";
import { Amount } from "@/components/shared/Amount";
import { ReminderCard } from "@/components/customers/ReminderCard";
import { CustomerHistoryList } from "@/components/customers/CustomerHistoryList";

interface CustomerDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerDetailPage({
  params,
}: CustomerDetailPageProps) {
  await connection();
  const { id } = await params;
  if (!id) notFound();

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData?.user) {
    redirect("/login");
  }

  const detail = await getCustomerBalanceDetail(supabase, id);
  if (!detail) {
    notFound();
  }

  const { customer, balance, total_credit, total_payment, entries, latest_reminder } = detail;
  const hasDebt = balance > 0;
  const isPaid = balance === 0;

  // Format last activity date from entries
  let lastActiveFormatted = "Recent";
  if (entries.length > 0) {
    const latestDate = entries[0].page_date || entries[0].created_at;
    try {
      lastActiveFormatted = new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
      }).format(new Date(latestDate));
    } catch {
      lastActiveFormatted = entries[0].page_date || "Recent";
    }
  }

  return (
    <div className="min-h-screen bg-transparent text-pencil font-sans selection:bg-marker selection:text-pencil pb-24">
      {/* Sticky Header matching Image 2 */}
      <header className="sticky top-0 z-20 bg-sheet/95 backdrop-blur-sm border-b border-rule px-4 sm:px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          {/* Back to Customers link */}
          <Link
            href="/customers"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-pencil hover:text-ink transition-colors p-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Customers</span>
          </Link>

          {/* Customer Title & Status Subtext */}
          <div className="text-center">
            <h1 className="font-display font-bold text-lg sm:text-2xl text-pencil leading-tight tracking-tight">
              {customer.name}
            </h1>
            <p className="text-xs text-muted font-sans flex items-center justify-center gap-1.5">
              <span>{hasDebt ? "Owing credit" : isPaid ? "Settled" : "Advance payment"}</span>
              <span>&bull;</span>
              <span>Last active: {lastActiveFormatted}</span>
              {customer.phone_optional && (
                <>
                  <span>&bull;</span>
                  <span className="inline-flex items-center gap-0.5">
                    <Phone className="w-2.5 h-2.5" />
                    <span>{customer.phone_optional}</span>
                  </span>
                </>
              )}
            </p>
          </div>

          {/* Status Badge */}
          <div className="w-28 text-right">
            <span
              className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-row border ${
                hasDebt
                  ? "bg-[#FDF2F2] text-margin border-margin/40"
                  : isPaid
                  ? "bg-[#EAF5EE] text-paid border-paid/40"
                  : "bg-[#EEF2FC] text-ink border-ink/40"
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
                  <span>Settled</span>
                </>
              )}
            </span>
          </div>
        </div>
      </header>

      {/* Main 2-Column Responsive Layout matching Image 2 */}
      <main className="paper-enter max-w-5xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Current Balance Card & Transaction History */}
          <div className="lg:col-span-6 space-y-6">
            {/* Current Balance Card (Matching Image 2) */}
            <section aria-label="Current Customer Balance">
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
                      ₱{total_credit.toFixed(2)}
                    </strong>
                  </div>
                  <div>
                    <span className="text-muted block">Total paid:</span>
                    <strong className="text-paid font-bold text-sm block mt-0.5">
                      ₱{total_payment.toFixed(2)}
                    </strong>
                  </div>
                </div>
              </div>
            </section>

            {/* Itemized Transaction History Pad */}
            <section aria-label="Transaction History">
              <CustomerHistoryList entries={entries} currentBalance={balance} />
            </section>
          </div>

          {/* Right Column: Pinned Yellow Memo Reminder Note (Matching Image 2) */}
          <div className="lg:col-span-6">
            <section aria-label="Payment Reminder Note">
              <ReminderCard
                customerId={customer.id}
                customerName={customer.name}
                phoneOptional={customer.phone_optional}
                balance={balance}
                initialDraft={latest_reminder}
              />
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
