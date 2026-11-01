"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const supabase = createClient();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please verify.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setErrorMessage(error.message);
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/dashboard");
          router.refresh();
        }, 1500);
      }
    } catch {
      setErrorMessage("Unable to update password. Please request a new recovery link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-transparent font-sans text-pencil selection:bg-marker selection:text-pencil overflow-x-hidden">
      {/* Top Header / Back Navigation */}
      <div className="relative z-10 w-full max-w-md flex items-center justify-between mb-4 sm:mb-5">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-sheet bg-sheet border border-rule text-xs font-semibold text-pencil hover:text-ink hover:border-ink/40 shadow-xs transition-all duration-150 active:scale-[0.98] group"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5 text-muted group-hover:text-ink" />
          <span>Back to Login</span>
        </Link>

        <Link
          href="/"
          className="flex items-center gap-2 group transition-opacity hover:opacity-90"
        >
          <Image
            src="/assets/talaan-icon.png"
            alt="Talaan logo"
            width={28}
            height={28}
            className="flex-shrink-0 object-contain"
            priority
          />
          <span className="font-display font-black text-lg tracking-tight text-pencil">
            Talaan
          </span>
        </Link>
      </div>

      {/* Main Paper Sheet Card */}
      <div className="relative z-10 w-full max-w-md bg-sheet rounded-sheet border border-rule border-l-4 border-l-margin shadow-paper-lg p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Binder Edge Holes */}
        <div className="flex items-center justify-center gap-2 pb-3 mb-4 border-b border-rule/50" aria-hidden="true">
          <span className="w-2.5 h-2.5 rounded-full bg-paper border border-[#C5D0B4]" />
          <span className="w-2.5 h-2.5 rounded-full bg-paper border border-[#C5D0B4]" />
          <span className="w-2.5 h-2.5 rounded-full bg-paper border border-[#C5D0B4]" />
        </div>

        <div className="space-y-6">
          <div className="space-y-1.5 text-center">
            <h1 className="font-display font-bold text-2xl text-pencil tracking-tight">
              Set New Password
            </h1>
            <p className="text-xs text-muted font-sans leading-relaxed">
              Enter and confirm your new secure password for your Talaan store.
            </p>
          </div>

          {errorMessage && (
            <div
              role="alert"
              className="p-3.5 rounded-row bg-[#FDF2F2] border border-margin text-margin text-xs flex items-start gap-2.5 animate-in fade-in duration-200"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span className="font-medium leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {success && (
            <div
              role="status"
              className="p-3.5 rounded-row bg-[#F0FDF4] border border-[#1F7A4D]/40 text-[#1F7A4D] text-xs flex items-center gap-2.5 animate-in fade-in duration-200"
            >
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium">Password updated! Redirecting to dashboard...</span>
            </div>
          )}

          <form onSubmit={handleResetPassword} className="space-y-4">
            {/* New Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="new-password"
                className="block text-xs font-semibold text-pencil font-sans"
              >
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  autoFocus
                  className="w-full min-h-[48px] pl-10 pr-10 py-2.5 bg-sheet border border-rule rounded-row text-sm text-pencil placeholder:text-muted focus:border-ink focus:ring-1 focus:ring-ink outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-pencil p-1 cursor-pointer transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="confirm-password"
                className="block text-xs font-semibold text-pencil font-sans"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type new password"
                  required
                  className="w-full min-h-[48px] pl-10 pr-3.5 py-2.5 bg-sheet border border-rule rounded-row text-sm text-pencil placeholder:text-muted focus:border-ink focus:ring-1 focus:ring-ink outline-none transition-all"
                />
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={loading || success}
              className="w-full shadow-paper min-h-[48px] text-sm font-bold"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating password...</span>
                </span>
              ) : (
                <span>Update Password</span>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

