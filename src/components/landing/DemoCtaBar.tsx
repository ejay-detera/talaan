"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Loader2, Store } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button, buttonVariants } from "@/components/ui/button";

interface DemoCtaBarProps {
  isDemoActive?: boolean;
  storeName?: string;
}

export function DemoCtaBar({
  isDemoActive = false,
  storeName = "Aling Nena's Sari-Sari Store",
}: DemoCtaBarProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDemoSignIn = async () => {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/demo", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Could not launch demo store.");
      } else {
        router.refresh();
      }
    } catch {
      setError("Network connection issue. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      document.cookie = "talaan_demo_user=; path=/; max-age=0";
      router.refresh();
    } catch {
      // Ignore signOut errors
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="demo-zone" className="w-full space-y-3">
      {error && (
        <div
          role="alert"
          className="p-3 rounded-row bg-[#FDF2F2] border border-margin text-margin text-xs flex items-center gap-2"
        >
          <span className="font-bold select-none" aria-hidden="true">✕</span>
          <span>{error}</span>
        </div>
      )}

      {isDemoActive ? (
        <div className="p-4 sm:p-5 rounded-sheet bg-sheet border border-rule border-l-4 border-l-paid shadow-paper space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-paid" />
              <span className="text-sm font-bold text-pencil">{storeName}</span>
            </div>
            <span className="text-xs text-paid font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Demo Active
            </span>
          </div>
          <p className="text-xs text-muted leading-relaxed">
            Seeded customers: Mang Jose, Kuya Jun, Nanay Cora, Ate Baby. Ready for two-phase ledger verification.
          </p>
          <div className="flex items-center gap-4 pt-1">
            <Link
              href="/login"
              className="text-xs font-semibold text-ink hover:underline flex items-center gap-1"
            >
              Go to Store App <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={loading}
              className="text-xs text-muted hover:text-margin transition-colors cursor-pointer flex items-center gap-1.5"
            >
              {loading && <Loader2 className="w-3 h-3 animate-spin" />}
              <span>{loading ? "Signing out..." : "Sign out of demo"}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Primary 56px Thumb-zone CTA */}
          <Button
            type="button"
            size="lg"
            onClick={handleDemoSignIn}
            disabled={loading}
            className="flex-1 shadow-paper transition-all duration-200"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Opening Demo Store...</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span>Try Live Demo (Aling Nena)</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </span>
            )}
          </Button>

          {/* Secondary 48px Action */}
          <Link
            href="/login"
            className={buttonVariants({
              variant: "secondary",
              size: "default",
              className: "sm:w-auto text-center justify-center min-h-[56px]",
            })}
          >
            Sign In with Email
          </Link>
        </div>
      )}
    </div>
  );
}
