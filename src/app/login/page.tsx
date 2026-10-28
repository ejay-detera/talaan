"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Store,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const supabase = createClient();

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMessage(error.message);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setErrorMessage("Unable to connect to the authentication server. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    setErrorMessage(null);
    setDemoLoading(true);

    try {
      const res = await fetch("/api/auth/demo", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Could not launch demo store.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setErrorMessage("Network issue launching demo store. Please retry.");
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 bg-transparent font-sans text-pencil selection:bg-marker selection:text-pencil overflow-x-hidden">

      {/* Prominent Header / Back to Home Navigation */}
      <div className="relative z-10 w-full max-w-4xl flex items-center justify-between mb-4 sm:mb-5">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-sheet bg-sheet border border-rule text-sm font-semibold text-pencil hover:text-ink hover:border-ink/40 shadow-paper hover:shadow-paper-lg transition-all duration-150 active:scale-[0.98] group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 text-muted group-hover:text-ink" />
          <span>Back to Home</span>
        </Link>

        <Link
          href="/"
          className="flex items-center gap-2.5 group transition-opacity hover:opacity-90"
        >
          <Image
            src="/assets/talaan-icon.png"
            alt="Talaan logo"
            width={34}
            height={34}
            className="flex-shrink-0 object-contain"
            priority
          />
          <span className="font-display font-black text-xl tracking-tight text-pencil">
            Talaan
          </span>
        </Link>
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-4xl bg-sheet rounded-sheet border border-rule shadow-paper-lg overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* Inner Split Layout: Left Form + Right Tactile Paper Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
          {/* Left Column: Login Form */}
          <div className="lg:col-span-6 p-6 sm:p-10 flex flex-col justify-between">
            <div className="space-y-6">
              {/* Header Title & Subtitle */}
              <div className="space-y-2">
                <h1 className="font-display font-bold text-3xl sm:text-4xl text-pencil tracking-tight">
                  Welcome back!
                </h1>
                <p className="text-sm text-muted leading-relaxed font-sans">
                  Access your store ledger and verify notebook transactions with{" "}
                  <strong className="text-pencil font-medium">deterministic math</strong>.
                </p>
              </div>

              {/* Error Message Alert */}
              {errorMessage && (
                <div
                  role="alert"
                  className="p-3.5 rounded-row bg-[#FDF2F2] border border-margin text-margin text-xs flex items-start gap-2.5 animate-in fade-in duration-200"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span className="font-medium leading-relaxed">{errorMessage}</span>
                </div>
              )}

              {/* Email / Password Form */}
              <form onSubmit={handleEmailSignIn} className="space-y-4">
                {/* Username / Email Field */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="email"
                    className="block text-xs font-semibold text-pencil font-sans"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="aling.nena@talaan.ph"
                      required
                      className="w-full min-h-[48px] pl-10 pr-3.5 py-2.5 bg-sheet border border-rule rounded-row text-sm text-pencil placeholder:text-muted focus:border-ink focus:ring-1 focus:ring-ink outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="block text-xs font-semibold text-pencil font-sans"
                    >
                      Password
                    </label>
                    <a
                      href="#forgot-password"
                      onClick={(e) => {
                        e.preventDefault();
                        setErrorMessage("Password recovery is available via demo store access below.");
                      }}
                      className="text-sm font-semibold text-ink hover:underline"
                    >
                      Forgot Password?
                    </a>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full min-h-[48px] pl-10 pr-10 py-2.5 bg-sheet border border-rule rounded-row text-sm text-pencil placeholder:text-muted focus:border-ink focus:ring-1 focus:ring-ink outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-pencil p-1 cursor-pointer transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Primary Login Button */}
                <Button
                  type="submit"
                  size="lg"
                  disabled={loading || demoLoading}
                  className="w-full shadow-paper min-h-[50px] text-base"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying credentials...</span>
                    </span>
                  ) : (
                    <span>Login</span>
                  )}
                </Button>
              </form>

              {/* Or Continue With Divider */}
              <div className="relative my-4 text-center select-none">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-rule" />
                </div>
                <span className="relative bg-sheet px-3 text-xs text-muted font-sans font-medium">
                  or continue with
                </span>
              </div>

              {/* 1-Tap Demo Store Instant Access Button */}
              <button
                type="button"
                onClick={handleDemoSignIn}
                disabled={demoLoading || loading}
                className="w-full min-h-[48px] px-4 py-2.5 bg-paper hover:bg-[#E8EDE0] active:bg-[#DFE5D4] border border-rule rounded-row text-pencil font-sans font-semibold text-sm transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-xs active:scale-[0.98]"
              >
                {demoLoading ? (
                  <span className="flex items-center gap-2 text-ink">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Opening Aling Nena&apos;s Store...</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-paid" />
                    <span>1-Tap Demo Store (Aling Nena)</span>
                  </span>
                )}
              </button>
            </div>

            {/* Bottom Footer Note */}
            <div className="pt-6 text-center text-xs text-muted font-sans border-t border-rule/50 mt-6">
              <span>Not a member yet? </span>
              <button
                type="button"
                onClick={handleDemoSignIn}
                disabled={demoLoading}
                className="font-semibold text-ink hover:underline cursor-pointer"
              >
                Launch Live Demo
              </button>
            </div>
          </div>

          {/* Right Column: Physical Paper Sovereign Mockup (Replacing Cartoon Figure) */}
          <div className="lg:col-span-6 bg-paper/70 p-6 sm:p-8 flex flex-col justify-between items-center text-center border-t lg:border-t-0 lg:border-l border-rule relative overflow-hidden select-none">
            {/* Top Customer Avatars */}
            <div className="w-full flex items-center justify-between pt-2 px-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-sheet border border-rule flex items-center justify-center text-xs font-bold text-pencil shadow-xs">
                  MJ
                </div>
                <span className="text-xs font-semibold text-pencil hidden sm:inline">
                  Mang Jose
                </span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-row bg-sheet border border-rule text-sm font-semibold text-paid">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Deterministic Math</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-pencil hidden sm:inline">
                  Ate Baby
                </span>
                <div className="w-8 h-8 rounded-full bg-sheet border border-rule flex items-center justify-center text-xs font-bold text-pencil shadow-xs">
                  AB
                </div>
              </div>
            </div>

            {/* Central Physical Notebook Mockup (Replaces Cartoon Meditating Person) */}
            <div className="my-6 w-full max-w-sm bg-sheet rounded-sheet border border-rule p-5 relative transform hover:scale-[1.02] transition-transform duration-300">
              {/* Binder Edge Holes */}
              <div className="flex items-center gap-1.5 mb-3 pb-2 border-b border-rule">
                <span className="w-2 h-2 rounded-full bg-paper border border-rule" />
                <span className="w-2 h-2 rounded-full bg-paper border border-rule" />
                <span className="w-2 h-2 rounded-full bg-paper border border-rule" />
                <span className="text-sm uppercase font-bold tracking-wider text-muted ml-1">
                  Counter Listahan &bull; Page 14
                </span>
              </div>

              {/* Lined Notebook Content with Red Margin Line */}
              <div className="relative pl-5 text-left space-y-2.5">
                <div className="absolute left-2.5 top-0 bottom-0 w-[2px] bg-margin" />

                <div className="font-hand text-lg text-pencil/90 leading-tight">
                  <p>Mang Jose — 2 corned beef @ 38 = ₱76.00</p>
                  <p className="text-margin font-semibold">
                    Ate Baby — 3 pancit canton @ 12 = ₱36.00
                  </p>
                  <p className="text-muted">Nanay Cora — toyo at suka = ₱54.00</p>
                </div>

                {/* Micro Discrepancy Caught Tag */}
                <div className="p-2 rounded-row bg-[#FDF2F2] border border-margin/40 text-sm font-sans text-margin font-semibold flex items-center justify-between">
                  <span>₱10.00 Overcharge Caught</span>
                  <span className="text-sm text-paid font-bold">100% Corrected</span>
                </div>
              </div>
            </div>

            {/* Bottom Tagline & Carousel Dots */}
            <div className="w-full space-y-3 pb-2">
              {/* Carousel Dots */}
              <div className="flex items-center justify-center gap-1.5" aria-hidden="true">
                <span className="w-2 h-2 rounded-full bg-ink" />
                <span className="w-2 h-2 rounded-full bg-rule" />
                <span className="w-2 h-2 rounded-full bg-rule" />
              </div>

              <div className="space-y-1 max-w-xs mx-auto">
                <h2 className="font-display font-bold text-base sm:text-lg text-pencil leading-tight">
                  Make your store bookkeeping easier and organized with Talaan
                </h2>
                <p className="text-xs text-muted font-sans">
                  Keep writing on paper. Code verifies the centavos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
