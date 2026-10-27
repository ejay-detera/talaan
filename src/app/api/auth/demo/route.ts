import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

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
    const admin = createAdminClient();
    const demoEmail = "demo@talaan.ph";
    const demoPassword = "DemoStorePassword2026!";

    // 1. Try signing in with demo credentials
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: demoEmail,
      password: demoPassword,
    });

    if (!signInError && signInData?.user) {
      return NextResponse.json({ success: true, user: signInData.user });
    }

    // 2. If user doesn't exist, create demo user via admin client
    const { data: newUser, error: createError } = await admin.auth.admin.createUser({
      email: demoEmail,
      password: demoPassword,
      email_confirm: true,
      user_metadata: { full_name: "Aling Nena" },
    });

    if (createError || !newUser?.user) {
      return NextResponse.json(
        { error: createError?.message || "Failed to create demo user" },
        { status: 500 }
      );
    }

    const userId = newUser.user.id;

    // 3. Seed demo store and customers
    const { data: store } = await admin
      .from("stores")
      .insert({ owner_id: userId, name: "Aling Nena's Sari-Sari Store" })
      .select()
      .single();

    if (store) {
      await admin.from("customers").insert([
        { store_id: store.id, name: "Mang Jose", normalized_name: "mang jose", phone_optional: "09171234567" },
        { store_id: store.id, name: "Kuya Jun", normalized_name: "kuya jun", phone_optional: "09187654321" },
        { store_id: store.id, name: "Nanay Cora", normalized_name: "nanay cora", phone_optional: null },
      ]);
    }

    // 4. Authenticate session with newly created user
    const finalAuth = await supabase.auth.signInWithPassword({
      email: demoEmail,
      password: demoPassword,
    });

    return NextResponse.json({ success: true, user: finalAuth.data.user });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to sign into demo store";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
