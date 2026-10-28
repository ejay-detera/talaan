import React from "react";

interface DeterministicTrustCardProps {
  className?: string;
}

/**
 * DeterministicTrustCard
 *
 * Implements the counter verification value card from the dashboard design mockup.
 * Styled as a taped index memo card with a tilted verification stamp.
 */
export function DeterministicTrustCard({ className = "" }: DeterministicTrustCardProps) {
  return (
    <div
      className={`relative rounded-row border border-[#D5DEC6] bg-[#FFFEF8] p-5 sm:p-6 space-y-3.5 shadow-paper select-none transform rotate-[-0.5deg] hover:rotate-0 transition-transform duration-300 ${className}`}
    >
      {/* Decorative Counter Paper Tape on Top Left */}
      <div
        className="absolute -top-2.5 left-8 w-20 h-4.5 bg-[#EAE3CE]/80 border border-[#DDD3BC]/70 shadow-[0_1px_3px_rgba(35,38,43,0.08)] pointer-events-none rounded-[2px] -rotate-2 z-10"
        aria-hidden="true"
      />

      {/* Tilted Verification Stamp */}
      <div className="pt-1">
        <div className="inline-block px-3 py-1 border border-pencil/40 text-xs font-bold text-pencil/80 -rotate-1 rounded-sm uppercase tracking-wider bg-[#FFFDF5] shadow-[1px_1px_0px_rgba(35,38,43,0.08)]">
          Deterministic Code Engine &bull; Zero LLM Math
        </div>
      </div>

      {/* Explanatory Body */}
      <p className="text-sm text-pencil/85 font-sans leading-relaxed">
        AI reads the handwriting. Deterministic code counts every total for exact
        centavo arithmetic with your store&apos;s money.
      </p>
    </div>
  );
}
