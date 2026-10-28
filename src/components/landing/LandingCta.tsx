import { connection } from "next/server";
import Link from "next/link";
import { ArrowRight, LayoutDashboard, LogIn } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export async function LandingCta() {
  await connection();
  let isAuthenticated = false;

  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    isAuthenticated = Boolean(data?.user);
  } catch {
    // Fail-safe offline/unconfigured
  }

  if (isAuthenticated) {
    return (
      <div className="flex justify-center w-full">
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2.5 w-full sm:w-auto min-w-[240px] h-[56px] px-8 rounded-row bg-ink text-sheet text-base font-semibold shadow-paper hover:bg-ink/90 active:scale-[0.99] transition-all cursor-pointer select-none group"
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Buksan ang Store App</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    );
  }

  return (
    <div className="flex justify-center w-full">
      <Link
        href="/login"
        className="inline-flex items-center justify-center gap-2.5 w-full sm:w-auto min-w-[240px] h-[56px] px-8 rounded-row bg-ink text-sheet text-base font-semibold shadow-paper hover:bg-ink/90 active:scale-[0.99] transition-all cursor-pointer select-none group"
      >
        <LogIn className="w-5 h-5" />
        <span>Mag-sign in sa Talaan</span>
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
  );
}
