"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
        router.push("/");
        router.refresh();
      }
    } catch {
      setErrorMessage("Hindi makakonekta sa server. Pakisubukan muli.");
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
        setErrorMessage(data.error || "Hindi makapasok sa demo store.");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setErrorMessage("May problema sa pagpasok sa demo store.");
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-paper text-pencil">
      {/* Brand Header */}
      <header className="mb-6 text-center max-w-sm w-full">
        <div className="flex items-center justify-between mb-4 px-1">
          <span className="text-sm font-display font-bold tracking-tight text-pencil">
            Talaan
          </span>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-sheet border border-rule text-xs font-sans text-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-paid"></span>
            <span>Muse Glimmer</span>
          </div>
        </div>

        <h1 className="text-3xl font-display font-bold text-pencil tracking-tight">
          Bawat sentimo, tugma sa listahan.
        </h1>
        <p className="mt-2 text-sm text-muted">
          Two-phase notebook extraction at centavo-accurate bookkeeping.
        </p>
      </header>

      {/* Main Counter Slip Card with Left Red Margin Line */}
      <main className="w-full max-w-sm bg-sheet rounded-sheet border border-rule border-l-[3px] border-l-margin p-6">
        <div className="mb-5">
          <h2 className="text-xl font-display font-bold text-pencil">
            Mag-sign in
          </h2>
          <p className="text-sm text-muted mt-0.5">
            Pumili ng paraan para buksan ang iyong listahan
          </p>
        </div>

        {/* Error Alert in Red Margin Semantics */}
        {errorMessage && (
          <div
            role="alert"
            className="mb-4 p-3 rounded-row bg-[#FDF2F2] border border-margin text-margin text-sm flex items-start gap-2"
          >
            <span className="font-bold select-none">✕</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 1-Tap Demo Store Primary Button (56px Thumb-zone target) */}
        <button
          type="button"
          onClick={handleDemoSignIn}
          disabled={demoLoading || loading}
          className="w-full min-h-[56px] px-4 py-3 bg-ink hover:bg-[#162F85] text-sheet font-sans font-semibold text-base rounded-row transition-colors flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 disabled:opacity-60 cursor-pointer"
        >
          {demoLoading ? (
            <span>Binubuksan ang demo...</span>
          ) : (
            <span>Subukan ang demo (Aling Nena)</span>
          )}
        </button>
        <p className="text-xs text-center text-muted mt-2">
          May kasamang 5 suki at sample listahan pages para sa pagsusuri.
        </p>

        {/* Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-rule"></div>
          </div>
          <span className="relative bg-sheet px-3 text-xs text-muted font-sans">
            o mag-sign in gamit ang email
          </span>
        </div>

        {/* Standard Email/Password Form */}
        <form onSubmit={handleEmailSignIn} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold text-pencil mb-1.5"
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="aling.nena@sari.ph"
              required
              className="w-full min-h-[48px] px-3.5 py-2.5 bg-sheet border border-rule rounded-row text-sm text-pencil placeholder-muted focus:border-ink outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-semibold text-pencil mb-1.5"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full min-h-[48px] px-3.5 py-2.5 bg-sheet border border-rule rounded-row text-sm text-pencil placeholder-muted focus:border-ink outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading || demoLoading}
            className="w-full min-h-[48px] px-4 py-2.5 bg-sheet hover:bg-paper border-[1.5px] border-ink text-ink font-sans font-semibold text-sm rounded-row transition-colors flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 disabled:opacity-60 cursor-pointer"
          >
            {loading ? "Nag-veverify..." : "Mag-login sa tindahan"}
          </button>
        </form>
      </main>

      {/* Footer Info */}
      <footer className="mt-8 text-center text-xs text-muted">
        <p>Talaan &bull; Meta Global AI Developer Hackathon 2026</p>
      </footer>
    </div>
  );
}
