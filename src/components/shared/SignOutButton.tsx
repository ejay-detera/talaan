"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface SignOutButtonProps {
  className?: string;
}

export function SignOutButton({ className = "" }: SignOutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      document.cookie = "talaan_demo_user=; path=/; max-age=0";
      router.push("/");
      router.refresh();
    } catch {
      // Ignore signOut errors
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 text-xs text-muted hover:text-margin transition-colors cursor-pointer py-1.5 px-2 rounded-row focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink ${className}`}
      aria-label="Sign out"
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <LogOut className="w-3.5 h-3.5" />
      )}
      <span>{loading ? "Signing out..." : "Sign out"}</span>
    </button>
  );
}
