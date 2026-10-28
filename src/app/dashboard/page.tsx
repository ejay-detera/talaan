import { connection } from "next/server";
import { redirect } from "next/navigation";
import { Store } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { listRecentPages } from "@/services/pages";
import { ScanButton } from "@/components/dashboard/ScanButton";
import { RecentPagesList } from "@/components/dashboard/RecentPagesList";
import { SignOutButton } from "@/components/shared/SignOutButton";

export default async function DashboardPage() {
  await connection();
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData?.user) {
    redirect("/login");
  }

  // Fetch store associated with the user
  const { data: store } = await supabase
    .from("stores")
    .select("id, name")
    .eq("owner_id", authData.user.id)
    .maybeSingle();

  const storeName = store?.name || "Aking Tindahan";
  const recentPages = await listRecentPages(supabase, 20);

  return (
    <div className="min-h-screen bg-paper text-pencil font-sans selection:bg-marker selection:text-pencil pb-16">
      {/* Dashboard Sticky Header */}
      <header className="sticky top-0 z-20 bg-sheet/95 backdrop-blur-sm border-b border-rule px-4 py-3.5">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-row bg-paper border border-rule text-ink">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-display font-bold text-sm sm:text-base text-pencil leading-tight">
                {storeName}
              </h1>
              <p className="text-[11px] text-muted">Talaan &bull; Sari-Sari Store Ledger</p>
            </div>
          </div>

          <SignOutButton />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-xl mx-auto px-4 pt-6 space-y-6">
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
