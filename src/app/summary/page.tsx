import { connection } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listConfirmedStoreLedgerRows } from "@/services/customers";
import { AppHeaderNav } from "@/components/shared/AppHeaderNav";
import { StoreSummarySheet } from "@/components/summary/StoreSummarySheet";

export default async function StoreSummaryPage() {
  await connection();
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData?.user) {
    redirect("/login");
  }

  const [storeRes, rows] = await Promise.all([
    supabase
      .from("stores")
      .select("id, name")
      .eq("owner_id", authData.user.id)
      .maybeSingle(),
    listConfirmedStoreLedgerRows(supabase),
  ]);

  const storeName = storeRes.data?.name || "Aking Tindahan";

  return (
    <div className="min-h-screen bg-paper text-pencil font-sans selection:bg-marker selection:text-pencil pb-16">
      <AppHeaderNav storeName={storeName} activeTab="summary" />
      <main className="max-w-xl mx-auto px-4 pt-5">
        <StoreSummarySheet storeName={storeName} rows={rows} />
      </main>
    </div>
  );
}

