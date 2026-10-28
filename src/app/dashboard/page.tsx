import { connection } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listRecentPages } from "@/services/pages";
import { listCustomersWithBalances } from "@/services/customers";
import { AppHeaderNav } from "@/components/shared/AppHeaderNav";
import { TotalUtangCard } from "@/components/dashboard/TotalUtangCard";
import { ScanButton } from "@/components/dashboard/ScanButton";
import { RecentPagesList } from "@/components/dashboard/RecentPagesList";

export default async function DashboardPage() {
  await connection();
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData?.user) {
    redirect("/login");
  }

  // Fetch store and summary data in parallel
  const [storeRes, recentPages, customersResult] = await Promise.all([
    supabase
      .from("stores")
      .select("id, name")
      .eq("owner_id", authData.user.id)
      .maybeSingle(),
    listRecentPages(supabase, 20),
    listCustomersWithBalances(supabase),
  ]);

  const storeName = storeRes.data?.name || "Aking Tindahan";

  return (
    <div className="min-h-screen bg-paper text-pencil font-sans selection:bg-marker selection:text-pencil pb-16">
      {/* Sticky App Header Nav */}
      <AppHeaderNav storeName={storeName} activeTab="pages" />

      {/* Main Content Area */}
      <main className="max-w-xl mx-auto px-4 pt-5 space-y-6">
        {/* Total Utang Summary Sheet */}
        <section aria-label="Kabuuang Pautang">
          <TotalUtangCard
            totalStoreUtang={customersResult.totalStoreUtang}
            activeDebtorCount={customersResult.activeDebtorCount}
          />
        </section>

        {/* Primary Scan Action */}
        <section aria-label="Kumuha ng litrato ng kuwaderno">
          <ScanButton />
        </section>

        {/* Recent Pages List */}
        <section aria-label="Kamakailang mga pahina">
          <RecentPagesList pages={recentPages} />
        </section>
      </main>
    </div>
  );
}
