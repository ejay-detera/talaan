import { connection } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listRecentPages } from "@/services/pages";
import { listCustomersWithBalances } from "@/services/customers";
import { AppHeaderNav } from "@/components/shared/AppHeaderNav";
import { TotalUtangCard } from "@/components/dashboard/TotalUtangCard";
import { RecentPagesList, type PreviewRow } from "@/components/dashboard/RecentPagesList";
import { WhoOwesCreditCard } from "@/components/dashboard/WhoOwesCreditCard";
import { DeterministicTrustCard } from "@/components/dashboard/DeterministicTrustCard";
import { ScanButton } from "@/components/dashboard/ScanButton";

export default async function DashboardPage() {
  await connection();
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData?.user) {
    redirect("/login");
  }

  // Fetch store, recent pages, and customer debt balances in parallel
  const [storeRes, recentPages, customersResult] = await Promise.all([
    supabase
      .from("stores")
      .select("id, name")
      .eq("owner_id", authData.user.id)
      .maybeSingle(),
    listRecentPages(supabase, 20),
    listCustomersWithBalances(supabase),
  ]);

  const storeName = storeRes.data?.name || "My Store";

  // Format today's date (e.g. "Thursday, October 29, 2026")
  const todayFormatted = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  // Count confirmed pages
  const confirmedPages = recentPages.filter((p) => p.status === "confirmed");
  const confirmedPageCount = confirmedPages.length || (recentPages.length > 0 ? 1 : 0);

  // Fetch preview entries and row counts for all recent pages
  const pageIds = recentPages.map((p) => p.id);
  const previewRowsByPageId: Record<string, PreviewRow[]> = {};
  const pageEntryCounts: Record<string, number> = {};

  if (pageIds.length > 0) {
    const { data: entriesData } = await supabase
      .from("entries")
      .select("id, page_id, item, amount, extracted_customer_name, customer_id, created_at")
      .in("page_id", pageIds)
      .order("created_at", { ascending: true });

    if (entriesData && entriesData.length > 0) {
      const customerMap = new Map(customersResult.customers.map((c) => [c.id, c.name]));
      for (const entry of entriesData) {
        if (!previewRowsByPageId[entry.page_id]) {
          previewRowsByPageId[entry.page_id] = [];
        }
        pageEntryCounts[entry.page_id] = (pageEntryCounts[entry.page_id] || 0) + 1;
        if (previewRowsByPageId[entry.page_id].length < 3) {
          previewRowsByPageId[entry.page_id].push({
            customer_name:
              (entry.customer_id ? customerMap.get(entry.customer_id) : null) ||
              entry.extracted_customer_name ||
              "Suki",
            item: entry.item,
            amount: Number(entry.amount),
          });
        }
      }
    }
  }

  const previewRows: PreviewRow[] =
    recentPages.length > 0 && previewRowsByPageId[recentPages[0].id]
      ? previewRowsByPageId[recentPages[0].id]
      : [];

  return (
    <div className="min-h-screen bg-transparent text-pencil font-sans selection:bg-marker selection:text-pencil pb-28">
      {/* Floating Center Dock Navigation */}
      <AppHeaderNav storeName={storeName} activeTab="pages" />

      {/* Main Dashboard Layout */}
      <main className="paper-enter max-w-5xl mx-auto px-4 sm:px-6 pt-2 sm:pt-4 space-y-6">
        {/* Store Title & Date Header */}
        <header className="space-y-1 select-none">
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-pencil tracking-tight">
            {storeName}
          </h1>
          <p className="text-xs sm:text-sm text-muted font-sans font-medium">
            {todayFormatted}
          </p>
        </header>

        {/* 2-Column Responsive Dashboard Grid matching the wireframe */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Left Column: Total Store Credit & Notebook Pages */}
          <div className="space-y-6 paper-stagger">
            <section aria-label="Total Customer Credit">
              <TotalUtangCard
                totalStoreUtang={customersResult.totalStoreUtang}
                activeDebtorCount={customersResult.activeDebtorCount}
                confirmedPageCount={confirmedPageCount}
              />
            </section>

            <section aria-label="Notebook Pages">
              <RecentPagesList
                pages={recentPages}
                previewRows={previewRows}
                previewRowsByPageId={previewRowsByPageId}
                pageEntryCounts={pageEntryCounts}
              />
            </section>
          </div>

          {/* Right Column: Who Owes Credit & Trust Stamp Card */}
          <div className="space-y-6 paper-stagger">
            <section aria-label="Who Owes Credit">
              <WhoOwesCreditCard
                customers={customersResult.customers}
                totalStoreUtang={customersResult.totalStoreUtang}
              />
            </section>

            <section aria-label="Deterministic Engine Verification">
              <DeterministicTrustCard />
            </section>
          </div>
        </div>
      </main>

      {/* Persistent Scan Floating Action Button (FAB) anchored at bottom-right */}
      <ScanButton />
    </div>
  );
}