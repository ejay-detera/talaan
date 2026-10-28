import { Suspense } from "react";
import Image from "next/image";
import { Navbar } from "@/components/landing/Navbar";
import { LandingCta } from "@/components/landing/LandingCta";
import { PaperMockupShowcase } from "@/components/landing/PaperMockupShowcase";
import {
  PinnedStickyNote,
  CustomerBalancesWidget,
  PaymentReminderDraftWidget,
  DeterministicShieldWidget,
} from "@/components/landing/FloatingWidgets";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { InitialLoader } from "@/components/shared/InitialLoader";

export default function HomePage() {
  return (
    <div className="relative flex min-h-screen flex-col bg-transparent text-pencil font-sans selection:bg-marker selection:text-pencil overflow-x-hidden">
      {/* Quick Initial Page Load / Reload Overlay */}
      <InitialLoader />

      {/* Floating Centered Gooey Navigation */}
      <Navbar />

      {/* Main Persuade Hero */}
      <main className="relative z-10 flex-1 w-full">
        {/* Top Centered Hero Header */}
        <section id="hero" className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-24 sm:pt-32 pb-8 text-center space-y-6">
          <div className="space-y-4 max-w-3xl mx-auto">
            <h1 className="font-display font-bold text-3xl sm:text-5xl lg:text-5xl leading-[1.08] tracking-tight text-pencil text-balance">
              Turn handwritten store notebooks into verified digital ledgers.
            </h1>
            <p className="text-base sm:text-xl text-pencil/80 leading-relaxed font-sans max-w-2xl mx-auto text-balance">
              Keep your physical notebook habit at the counter. Talaan extracts rows directly
              from photos of your notebook and uses{" "}
              <strong className="text-pencil font-semibold">deterministic code</strong> to verify every
              centavo before you save.
            </p>
          </div>

          {/* Action Zone: Sign In or Open App */}
          <div className="max-w-md mx-auto pt-2">
            <Suspense fallback={<div className="h-[56px] w-full min-w-[240px] rounded-row bg-sheet/40 animate-pulse" />}>
              <LandingCta />
            </Suspense>
          </div>
        </section>

        {/* Hero Paper Artifact Workspace (Mockup 1 & 2 inspired) */}
        <section id="verification" className="w-full max-w-7xl mx-auto px-4 sm:px-6 pb-16">
          <h2 className="sr-only">Counter Ledger Verification Workspace</h2>
          <div className="relative p-2 sm:p-6 lg:p-8">
            {/* Desktop Composition: Central Paper Hero Flanked by Micro-Widgets */}
            <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column (Desktop Widgets) */}
              <div className="hidden lg:flex lg:col-span-3 flex-col gap-6 items-end">
                <PinnedStickyNote />
                <PaymentReminderDraftWidget />
              </div>

              {/* Central Paper Sovereign Showcase (The Notebook, Kept) */}
              <div className="w-full lg:col-span-6 flex justify-center">
                <PaperMockupShowcase />
              </div>

              {/* Right Column (Desktop Widgets) */}
              <div className="hidden lg:flex lg:col-span-3 flex-col gap-6 items-start">
                <CustomerBalancesWidget />
                <DeterministicShieldWidget />
              </div>

              {/* Mobile / Tablet Responsive Fallback (Neat Grid Below Notebook) */}
              <div className="lg:hidden w-full grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="flex justify-center">
                  <PinnedStickyNote />
                </div>
                <div className="flex justify-center">
                  <CustomerBalancesWidget />
                </div>
                <div className="flex justify-center">
                  <PaymentReminderDraftWidget />
                </div>
                <div className="flex justify-center">
                  <DeterministicShieldWidget />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features & Workflow Section */}
        <FeaturesSection />

        {/* Architectural Trust Floor */}
        <section id="features" className="w-full py-14 border-t border-rule bg-sheet">
          <div className="max-w-4xl mx-auto px-4 text-center space-y-3">
            <h3 className="font-display font-bold text-lg text-pencil">
              Sovereign Ledger Guarantee
            </h3>
            <p className="text-xs sm:text-sm text-muted font-sans max-w-2xl mx-auto leading-relaxed">
              No automatic customer SMS blasts without your tap. No cloud fee surprise on open-weights inference.
              Every total is calculated in TypeScript integer centavos with zero LLM arithmetic.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-rule py-8 bg-sheet/80 backdrop-blur-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted font-sans">
          <div className="flex items-center gap-2.5">
            <Image
              src="/assets/talaan-icon.png"
              alt="Talaan logo"
              width={20}
              height={20}
              className="flex-shrink-0 object-contain"
            />
            <span className="font-bold text-pencil">Talaan</span>
            <span>&bull; Two-Phase Bookkeeping for Philippine Sari-Sari Stores</span>
          </div>
          <div>
            Meta Global AI Developer Hackathon 2026 &bull; Indie Developer Track
          </div>
        </div>
      </footer>
    </div>
  );
}
