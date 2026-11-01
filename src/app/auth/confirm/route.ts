import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/dashboard";

  if (token_hash && type) {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error) {
      // Auto-provision store row if missing for newly confirmed user
      if (type === "signup" || type === "email") {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data: existingStore } = await supabase
            .from("stores")
            .select("id")
            .eq("owner_id", user.id)
            .maybeSingle();

          if (!existingStore) {
            await supabase.from("stores").insert({
              owner_id: user.id,
              name: "Aling Nena's Sari-Sari Store",
            });
          }
        }
      }

      const safeNext = next.startsWith("/") ? next : "/dashboard";
      return NextResponse.redirect(new URL(safeNext, request.url));
    }
  }

  return NextResponse.redirect(
    new URL(
      "/login?error=" +
        encodeURIComponent("Invalid or expired verification link. Please request a new one."),
      request.url
    )
  );
}

