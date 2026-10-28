import { connection } from "next/server";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { listCustomersWithBalances } from "@/services/customers";
import { AppHeaderNav } from "@/components/shared/AppHeaderNav";
import { TotalUtangCard } from "@/components/dashboard/TotalUtangCard";
import { CustomerList } from "@/components/customers/CustomerList";

export default async function CustomersPage() {
  await connection();
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData?.user) {
    redirect("/login");
  }

  const [storeRes, customersResult] = await Promise.all([
    supabase
      .from("stores")
      .select("id, name")
      .eq("owner_id", authData.user.id)
      .maybeSingle(),
    listCustomersWithBalances(supabase),
  ]);

  const storeName = storeRes.data?.name || "My Store";

  const todayFormatted = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="min-h-screen bg-transparent text-pencil font-sans selection:bg-marker selection:text-pencil pb-24">
      {/* Floating Center Dock Navigation */}
      <AppHeaderNav storeName={storeName} activeTab="customers" />

      {/* Main Content Area: 2-Column Responsive Layout matching Dashboard max-w-5xl */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-2 sm:pt-4 space-y-6">
        {/* Store Title & Date Sub-Header */}
        <header className="space-y-1 select-none">
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-pencil tracking-tight">
            {storeName}
          </h1>
          <p className="text-xs sm:text-sm text-muted font-sans font-medium">
            Counter Ledger &bull; Customer Credit Directory &bull; {todayFormatted}
          </p>
        </header>

        {/* 2-Column Grid: Left Summary Sticky Memo & Guide, Right Customer Directory */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Side: Pinned Total Utang Memo & Suki Collection Guide */}
          <div className="lg:col-span-5 space-y-6">
            <section aria-label="Total Customer Credit">
              <TotalUtangCard
                totalStoreUtang={customersResult.totalStoreUtang}
                activeDebtorCount={customersResult.activeDebtorCount}
              />
            </section>

            {/* Suki Collection Notes Card */}
            <section aria-label="Suki Reminder Guide">
              <div className="p-4 sm:p-5 rounded-row border border-rule bg-sheet shadow-paper select-none space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-rule/60">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted font-sans">
                    Suki Credit Guide
                  </span>
                  <span className="text-xs font-bold text-paid inline-flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Polite & Respectful</span>
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-pencil/80 font-sans leading-relaxed">
                  Select any customer to open their ledger history. You can draft respectful Taglish reminder SMS messages ready to copy or share via your messaging app.
                </p>
                <div className="pt-2 border-t border-rule/50 flex items-center justify-between text-xs text-muted font-sans">
                  <span>Zero auto-blasts</span>
                  <span className="font-semibold text-pencil">Store owner confirmed</span>
                </div>
              </div>
            </section>
          </div>

          {/* Right Side: Customer Credit Directory Pad */}
          <div className="lg:col-span-7">
            <section aria-label="Customer Directory">
              <CustomerList customers={customersResult.customers} />
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
