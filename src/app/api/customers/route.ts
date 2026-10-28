import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { listCustomersWithBalances } from "@/services/customers";

export async function GET() {
  try {
    const supabase = await createClient();

    // 1. Authenticate store owner
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    // 2. Fetch customers and deterministic balances
    const result = await listCustomersWithBalances(supabase);

    return NextResponse.json(
      {
        customers: result.customers,
        total_store_utang: result.totalStoreUtang,
        active_debtor_count: result.activeDebtorCount,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to list customers";
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: msg } },
      { status: 500 }
    );
  }
}

