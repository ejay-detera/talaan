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

  return (
    <div className="min-h-screen bg-transparent text-pencil font-sans selection:bg-marker selection:text-pencil pb-16">
      {/* Sticky Header */}
      <header className="sticky top-0 z-20 bg-sheet/95 backdrop-blur-sm border-b border-rule px-4 py-3">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
          <Link
            href="/customers"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-pencil hover:text-ink transition-colors p-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Customers</span>
          </Link>

          <div className="text-center">
            <h1 className="font-display font-bold text-base text-pencil leading-tight">
              {customer.name}
            </h1>
            {customer.phone_optional && (
              <p className="text-xs text-muted flex items-center justify-center gap-1 font-sans">
                <Phone className="w-2.5 h-2.5" />
                <span>{customer.phone_optional}</span>
              </p>
            )}
          </div>

          <div className="w-24 text-right">
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-[2px] border ${
                hasDebt
                  ? "bg-margin/10 text-margin border-margin/30"
                  : isPaid
                  ? "bg-paid/10 text-paid border-paid/30"
                  : "bg-ink/10 text-ink border-ink/30"
              }`}
            >
              {hasDebt ? "Payment Due" : isPaid ? "Settled" : "Advance"}
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-xl mx-auto px-4 pt-4 space-y-5">
        {/* Customer Balance Summary Card */}
        <section aria-label="Customer Credit Balance">
          <div className="p-4 sm:p-5 rounded-[2px] border border-rule bg-sheet shadow-paper space-y-3 select-none">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted uppercase tracking-wider font-sans">
                Current Balance
              </span>
              <span className="text-xs font-semibold text-muted flex items-center gap-1 font-sans">
                {hasDebt ? (
                  <span className="text-margin flex items-center gap-1 font-bold">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Payment Due</span>
                  </span>
                ) : (
                  <span className="text-paid flex items-center gap-1 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Zero Balance</span>
                  </span>
                )}
              </span>
            </div>

            <div>
              <Amount
                amount={Math.abs(balance)}
                size="lg"
                className={`text-2xl sm:text-3xl font-black ${hasDebt ? "text-margin" : isPaid ? "text-paid" : "text-ink"}`}
              />
              <div className="flex items-center gap-4 text-xs text-muted pt-2 border-t border-rule/50 mt-2 font-sans">
                <span>
                  Total Credit:{" "}
                  <strong className="text-pencil font-bold">₱{total_credit.toFixed(2)}</strong>
                </span>
                <span>&bull;</span>
                <span>
                  Total Paid:{" "}
                  <strong className="text-paid font-bold">₱{total_payment.toFixed(2)}</strong>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Taglish Reminder Generator Section */}
        <section aria-label="Taglish Payment Reminder">
          <ReminderCard
            customerId={customer.id}
            customerName={customer.name}
            phoneOptional={customer.phone_optional}
            balance={balance}
            initialDraft={latest_reminder}
          />
        </section>

        {/* Itemized Transaction History Section */}
        <section aria-label="Transaction History">
          <CustomerHistoryList entries={entries} />
        </section>
      </main>
    </div>
  );
}
