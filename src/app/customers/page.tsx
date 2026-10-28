import { connection } from "next/server";
import { redirect } from "next/navigation";
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

  const storeName = storeRes.data?.name || "Aking Tindahan";

  return (
    <div className="min-h-screen bg-paper text-pencil font-sans selection:bg-marker selection:text-pencil pb-16">
      {/* Sticky App Header Nav */}
      <AppHeaderNav storeName={storeName} activeTab="customers" />

      {/* Main Content Area */}
      <main className="max-w-xl mx-auto px-4 pt-5 space-y-6">
        {/* Total Utang Summary Sheet */}
        <section aria-label="Kabuuang Pautang">
          <TotalUtangCard
            totalStoreUtang={customersResult.totalStoreUtang}
            activeDebtorCount={customersResult.activeDebtorCount}
          />
        </section>

        {/* Customer Balances List */}
        <section aria-label="Listahan ng mga Suki">
          <CustomerList customers={customersResult.customers} />
        </section>
      </main>
    </div>
  );
}

