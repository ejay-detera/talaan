import Image from "next/image";
import { Navbar } from "@/components/landing/Navbar";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { PaperMockupShowcase } from "@/components/landing/PaperMockupShowcase";
import { HeroCounterDesk } from "@/components/landing/HeroCounterDesk";
import {
  PinnedStickyNote,
  CustomerBalancesWidget,
  PaymentReminderDraftWidget,
  DeterministicShieldWidget,
} from "@/components/landing/FloatingWidgets";
import { GsapPaperChoreography } from "@/components/landing/GsapPaperChoreography";
import { InitialLoader } from "@/components/shared/InitialLoader";

export default function HomePage() {
  return (
    <div className="relative flex min-h-screen flex-col bg-transparent text-pencil font-sans selection:bg-marker selection:text-pencil overflow-x-hidden">
      {/* Quick Initial Page Load / Reload Overlay */}
      <InitialLoader />

      {/* Floating Centered Gooey Navigation */}
      <Navbar />

      {/* Main Persuade Flow */}
      <main className="relative z-10 flex-1 w-full">
        {/* 1. Hero Section: Rich 2-Column Counter Desk */}
        <section id="hero" className="min-h-[100dvh] w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-8 sm:pb-10 flex flex-col justify-center scroll-mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
            {/* Left Column: Headline, Description & Bold Motto */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-5 text-center lg:text-left">
              <div className="space-y-3 sm:space-y-4">
                <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl xl:text-[3.5rem] leading-[1.08] tracking-tight text-pencil text-balance">
                  Turn handwritten store notebooks into verified digital ledgers.
                </h1>
                <p className="text-base sm:text-lg text-pencil/80 leading-relaxed font-sans max-w-xl mx-auto lg:mx-0 text-balance">
                  Keep your physical notebook habit at the counter. Talaan extracts rows directly
                  from photos of your notebook and uses{" "}
                  <strong className="text-pencil font-bold">deterministic code</strong>{" "}
                  to verify every centavo before you save.
                </p>
              </div>

              {/* Bold Counter Motto Quote (no yellow highlight) */}
              <p className="font-hand font-bold text-xl sm:text-2xl text-pencil pt-1">
                &ldquo;Sulat pa rin sa papel &bull; Talaan ang bahala sa kuwenta.&rdquo;
              </p>
            </div>

            {/* Right Column: Layered Counter Desk Scene */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <HeroCounterDesk />
            </div>
          </div>
        </section>

        {/* 2. How It Works Section: Follows Hero immediately */}
        <HowItWorksSection />

        {/* 3. Proof Section: Physical Notebook & Symmetrical Verification Widgets */}
        <section id="verification" className="min-h-[100dvh] w-full max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 scroll-mt-0 flex flex-col justify-center">
          <div className="text-center max-w-2xl mx-auto space-y-2.5 mb-8 sm:mb-12">
            <h2 className="font-display font-bold text-2xl sm:text-4xl text-pencil tracking-tight">
              The Notebook, Kept — Sovereign Ledger Verification
            </h2>
            <p className="text-sm sm:text-base text-muted font-sans leading-relaxed">
              Raw handwritten entries reconciled against deterministic centavos with two-ply proof.
            </p>
          </div>

          <GsapPaperChoreography className="relative p-2 sm:p-6 lg:p-8">
            {/* Desktop Composition: 2 Flanking Widgets Left, Notebook Center, 2 Flanking Widgets Right */}
            <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column (2 widgets): Pinned Sticky Note + Payment Reminder Draft */}
              <div className="hidden lg:flex lg:col-span-3 flex-col gap-6 items-end gsap-flank-left">
                <PinnedStickyNote />
                <PaymentReminderDraftWidget />
              </div>

              {/* Central Paper Sovereign Showcase (Notebook ALONE, NO container at bottom) */}
              <div className="w-full lg:col-span-6 flex justify-center gsap-hero-paper">
                <PaperMockupShowcase />
              </div>

              {/* Right Column (2 widgets): Customer Balances + Deterministic Shield */}
              <div className="hidden lg:flex lg:col-span-3 flex-col gap-6 items-start gsap-flank-right">
                <CustomerBalancesWidget />
                <DeterministicShieldWidget />
              </div>

              {/* Mobile / Tablet Responsive Fallback */}
              <div className="lg:hidden w-full grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
                <div className="flex justify-center">
                  <PinnedStickyNote />
                </div>
                <div className="flex justify-center">
                  <PaymentReminderDraftWidget />
                </div>
                <div className="flex justify-center">
                  <CustomerBalancesWidget />
                </div>
                <div className="flex justify-center">
                  <DeterministicShieldWidget />
                </div>
              </div>
            </div>
          </GsapPaperChoreography>
        </section>

        {/* 4. Features Section: 3 equal capability cards & trust floor */}
        <FeaturesSection />
      </main>

      {/* 5. Footer */}
      <footer className="w-full border-t border-rule py-8 bg-sheet">
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
