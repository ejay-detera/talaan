"use client";

import React, { useRef, useLayoutEffect } from "react";
import gsap from "gsap";

interface GsapPaperChoreographyProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * GsapPaperChoreography
 *
 * Implements high-precision physical paper entrance and settling sequences
 * using GSAP timelines. Renders authentic paper-on-desk physics:
 * weighted drops, rotational settling, and tactile stamp impact.
 */
export function GsapPaperChoreography({
  children,
  className = "",
}: GsapPaperChoreographyProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "power3.out", duration: 0.8 },
      });

      // 1. Central paper showcase drop & settle
      tl.from(".gsap-hero-paper", {
        y: -35,
        opacity: 0,
        scale: 0.98,
        duration: 0.9,
      });

      // 2. Left and right flanking paper slips drop with subtle rotation
      tl.from(
        ".gsap-flank-left",
        {
          y: -25,
          opacity: 0,
          rotation: -4,
          stagger: 0.15,
          duration: 0.7,
        },
        "-=0.6"
      );

      tl.from(
        ".gsap-flank-right",
        {
          y: -25,
          opacity: 0,
          rotation: 3,
          stagger: 0.15,
          duration: 0.7,
        },
        "-=0.6"
      );

      // 3. Tactile Stamp Press Physics (springy stamp hit)
      tl.from(
        ".gsap-stamp",
        {
          scale: 1.35,
          opacity: 0,
          rotation: -10,
          duration: 0.5,
          ease: "back.out(2.2)",
        },
        "-=0.3"
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}

