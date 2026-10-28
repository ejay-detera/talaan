"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import GooeyNav, { GooeyNavItem } from "@/components/shared/GooeyNav";

export interface NavbarProps {
  modelName?: string;
}

const NAV_ITEMS: GooeyNavItem[] = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Proof", href: "#verification" },
  { label: "Features", href: "#features" },
];

export function Navbar({}: NavbarProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const isAnimatingRef = useRef(false);

  // Synchronize scroll position with active gooey nav item (suppressed during programmatic flight)
  useEffect(() => {
    const handleScroll = () => {
      if (isAnimatingRef.current) return;

      const scrollPosition = window.scrollY + 160;
      const sectionIds = ["how-it-works", "verification", "features"];

      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i]);
        if (el) {
          const top = el.offsetTop;
          if (scrollPosition >= top) {
            setActiveIndex(i);
            return;
          }
        }
      }

      if (window.scrollY < 200) {
        setActiveIndex(0);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavChange = (index: number, item: GooeyNavItem) => {
    setActiveIndex(index);
    if (item.href?.startsWith("#")) {
      const targetId = item.href.slice(1);
      const target = document.getElementById(targetId);
      if (target) {
        isAnimatingRef.current = true;

        const targetY = Math.max(
          0,
          target.getBoundingClientRect().top + window.scrollY - 88
        );
        const startY = window.scrollY;
        const distance = Math.abs(targetY - startY);

        // Accelerated travel timing: snappier speed up (300ms - 460ms max)
        const duration = Math.min(460, Math.max(300, distance * 0.18));
        const startTime = performance.now();

        // High-velocity easeInOutQuart acceleration curve
        const ease = (t: number) =>
          t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;

        const animateScroll = (now: number) => {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easedProgress = ease(progress);

          window.scrollTo(0, startY + (targetY - startY) * easedProgress);

          if (progress < 1) {
            requestAnimationFrame(animateScroll);
          } else {
            isAnimatingRef.current = false;

            // Trigger tactile arrival pulse on the arrived section
            target.classList.remove("section-arrival-pulse");
            void target.offsetWidth; // force browser layout recalculation
            target.classList.add("section-arrival-pulse");

            setTimeout(() => {
              target.classList.remove("section-arrival-pulse");
            }, 1000);
          }
        };

        requestAnimationFrame(animateScroll);
      }
    }
  };

  return (
    <div className="fixed top-3.5 sm:top-5 inset-x-0 z-40 flex justify-center items-center px-3 sm:px-4 pointer-events-none">
      {/* Floating Center Dock with GooeyNav */}
      <header className="pointer-events-auto flex items-center gap-2 sm:gap-3.5 p-2 sm:p-2.5 pl-2.5 sm:pl-3.5 rounded-full bg-sheet/95 backdrop-blur-md border border-rule shadow-paper-lg transition-all duration-300">
        {/* Placement Icon & Brand */}
        <Link
          href="/"
          className="flex items-center gap-2.5 p-1 pr-2.5 sm:pr-3.5 rounded-full hover:bg-paper transition-all select-none group active:scale-[0.98]"
        >
          <Image
            src="/assets/talaan-icon.png"
            alt="Talaan logo"
            width={34}
            height={34}
            className="flex-shrink-0 object-contain transition-transform duration-200 group-hover:scale-105"
          />
          <span className="font-display font-black text-base tracking-tight text-pencil hidden sm:inline">
            Talaan
          </span>
        </Link>

        {/* Divider */}
        <div className="h-5 sm:h-6 w-[1px] bg-rule" />

        {/* Centered Gooey Nav Component */}
        <div className="flex items-center">
          <GooeyNav
            items={NAV_ITEMS}
            activeIndex={activeIndex}
            onChange={handleNavChange}
            theme="light"
            color="#1E3FAE"
            activeTextColor="#FFFFFF"
            colors={["#1E3FAE", "#2550D8", "#1A3694"]}
            size="md"
            frame={false}
            particleCount={15}
            animationTime={520}
            spread={52}
            gooeyness={0.55}
            wobble={0.4}
            hoverEffect={true}
          />
        </div>

        {/* Divider */}
        <div className="h-5 sm:h-6 w-[1px] bg-rule" />

        {/* Direct Action Link */}
        <div className="flex items-center pr-1 sm:pr-2">
          <Link
            href="/login"
            className="px-4 py-2 rounded-full text-sm font-semibold text-pencil hover:text-ink hover:bg-paper transition-all active:scale-[0.98] select-none"
          >
            Sign In
          </Link>
        </div>
      </header>
    </div>
  );
}
