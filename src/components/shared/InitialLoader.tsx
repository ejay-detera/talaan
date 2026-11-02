"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const STEPS = [
  { label: "Opening counter listahan...", percent: 25 },
  { label: "Extracting handwritten line items...", percent: 55 },
  { label: "Reconciling integer centavos...", percent: 85 },
  { label: "Two-phase ledger verified. Ready.", percent: 100 },
];

export function InitialLoader() {
  const [loading, setLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const step1 = setTimeout(() => setStepIndex(1), 250);
    const step2 = setTimeout(() => setStepIndex(2), 550);
    const step3 = setTimeout(() => setStepIndex(3), 850);
    const fadeTimer = setTimeout(() => setFadeOut(true), 1100);
    const removeTimer = setTimeout(() => setLoading(false), 1350);

    return () => {
      clearTimeout(step1);
      clearTimeout(step2);
      clearTimeout(step3);
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!loading) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-paper/85 text-pencil font-sans selection:bg-marker backdrop-blur-[2px] transition-all duration-250 pointer-events-none ${
        fadeOut ? "opacity-0 invisible scale-[0.98]" : "opacity-100 scale-100"
      }`}
      aria-hidden="true"
    >
      {/* Pinned Sticky Notepad Loader */}
      <div className="relative w-full max-w-[340px] bg-[#FFF9D2] border border-[#EADB85] rounded-row p-5 sm:p-6 shadow-sticky select-none animate-in fade-in zoom-in-95 duration-200 transform -rotate-1">
        {/* Physical Pushpin Graphic */}
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 flex items-center justify-center pointer-events-none"
          aria-hidden="true"
        >
          <span className="w-4 h-4 rounded-full bg-margin border border-[#9A1F1E] shadow-sm block relative">
            <span className="w-1.5 h-1.5 rounded-full bg-white/70 absolute top-0.5 left-0.5" />
          </span>
        </div>

        {/* Notepad Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#EADB85]/70">
          <div className="flex items-center gap-2">
            <Image
              src="/assets/talaan-icon.png"
              alt="Talaan logo"
              width={26}
              height={26}
              className="flex-shrink-0 object-contain"
            />
            <span className="font-display font-black text-sm text-[#383318] tracking-tight">
              Talaan
            </span>
          </div>
          <span className="text-[11px] font-sans font-semibold text-[#6E5D1E] uppercase tracking-wider">
            Counter Memo
          </span>
        </div>

        {/* Handwritten Memo Body */}
        <div className="py-3">
          <p className="font-hand text-xl text-[#383318] leading-tight">
            &ldquo;Sulat pa rin sa papel &bull; Talaan ang bahala sa kuwenta.&rdquo;
          </p>
        </div>

        {/* Loading Bar & Dynamic Step Label Below */}
        <div className="pt-2 border-t border-[#EADB85]/70 space-y-2">
          <div className="h-1.5 w-full bg-[#EADB85] rounded-xs overflow-hidden relative">
            <div
              className="h-full bg-ink rounded-xs transition-all duration-300 ease-out"
              style={{
                width: `${STEPS[stepIndex].percent}%`,
              }}
            />
          </div>

          <div className="flex items-center justify-between text-xs font-sans text-[#6E5D1E]">
            <span className="font-medium truncate pr-2">
              {STEPS[stepIndex].label}
            </span>
            <span className="tabular-nums font-bold text-ink shrink-0">
              {STEPS[stepIndex].percent}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
