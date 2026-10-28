import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const isSupabaseConfigured =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("dummy");

  if (!isSupabaseConfigured) {
    // Fail-soft offline demo mode when credentials are not yet entered in .env.local
    const response = NextResponse.json({
      success: true,
      mode: "local_mock",
      store: { name: "Aling Nena's Sari-Sari Store" },
    });
    response.cookies.set("talaan_demo_user", "aling-nena", {
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      httpOnly: false,
    });
    return response;
  }

  try {
    const supabase = await createClient();

    // 1. Check if caller already has an active session
    let currentUser = (await supabase.auth.getUser()).data?.user ?? null;

    // 2. If not signed in, create a dedicated anonymous user session
    if (!currentUser) {
      const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously({
        options: { data: { full_name: "Aling Nena" } },
      });

      if (anonError || !anonData?.user) {
        return NextResponse.json(
          { error: anonError?.message || "Failed to sign in anonymously" },
          { status: 500 }
        );
      }

      currentUser = anonData.user;
    }

    const userId = currentUser.id;

    // 3. Ensure store exists under the visitor's isolated tenant
    const { data: existingStore } = await supabase
      .from("stores")
      .select("id, name")
      .eq("owner_id", userId)
      .maybeSingle();

    if (!existingStore) {
      const { data: newStore, error: storeError } = await supabase
        .from("stores")
        .insert({ owner_id: userId, name: "Aling Nena's Sari-Sari Store" })
        .select("id, name")
        .single();

      if (storeError || !newStore) {
        return NextResponse.json(
          { error: storeError?.message || "Failed to seed demo store" },
          { status: 500 }
        );
      }

      // Seed standard demo customers (including Ate Baby for landing proof parity)
      const { error: customerError } = await supabase.from("customers").insert([
        { store_id: newStore.id, name: "Mang Jose", normalized_name: "mang jose", phone_optional: "09171234567" },
        { store_id: newStore.id, name: "Kuya Jun", normalized_name: "kuya jun", phone_optional: "09187654321" },
        { store_id: newStore.id, name: "Nanay Cora", normalized_name: "nanay cora", phone_optional: null },
        { store_id: newStore.id, name: "Ate Baby", normalized_name: "ate baby", phone_optional: "09223334444" },
      ]);

      if (customerError) {
        return NextResponse.json(
          { error: customerError.message || "Failed to seed demo customers" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true, user: currentUser });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to sign into demo store";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
