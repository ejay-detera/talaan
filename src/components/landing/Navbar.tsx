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
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Synchronize scroll position with active gooey nav item (suppressed during programmatic flight)
  useEffect(() => {
    const handleScroll = () => {
      if (isAnimatingRef.current) return;

      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // 1. Detect document bottom (features section at bottom of page)
      if (scrollY + windowHeight >= documentHeight - 90) {
        setActiveIndex(NAV_ITEMS.length - 1);
        return;
      }

      // 2. Detect page top / hero
      if (scrollY < 120) {
        setActiveIndex(0);
        return;
      }

      // 3. Dynamically map sections by actual physical DOM offsetTop
      const readingLine = scrollY + 200;
      const sections = NAV_ITEMS.map((item, idx) => {
        const id = item.href?.startsWith("#") ? item.href.slice(1) : null;
        const el = id ? document.getElementById(id) : null;
        return {
          index: idx,
          id,
          top: el ? el.offsetTop : Infinity,
        };
      }).filter((s) => s.top !== Infinity);

      // Sort ascending by DOM top
      sections.sort((a, b) => a.top - b.top);

      for (let i = sections.length - 1; i >= 0; i--) {
        if (readingLine >= sections[i].top - 50) {
          setActiveIndex(sections[i].index);
          return;
        }
      }

      setActiveIndex(0);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const handleNavChange = (index: number, item: GooeyNavItem) => {
    setActiveIndex(index);
    if (item.href?.startsWith("#")) {
      const targetId = item.href.slice(1);
      const target = document.getElementById(targetId);
      if (target) {
        isAnimatingRef.current = true;
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }

        // Programmatic travel via Lenis if initialized, or native smooth scroll
        const lenis = (
          window as unknown as {
            __lenis?: {
              scrollTo: (
                target: HTMLElement | number | string,
                opts?: Record<string, unknown>
              ) => void;
            };
          }
        ).__lenis;

        if (lenis) {
          lenis.scrollTo(target, { offset: -88, duration: 0.8 });
        } else {
          const targetY = Math.max(
            0,
            target.getBoundingClientRect().top + window.scrollY - 88
          );
          window.scrollTo({ top: targetY, behavior: "smooth" });
        }

        // Lock scroll spy during travel, then confirm active index and arrival effect
        scrollTimeoutRef.current = setTimeout(() => {
          isAnimatingRef.current = false;
          setActiveIndex(index);

          // Tactile arrival pulse on target section
          target.classList.remove("section-arrival-pulse");
          void target.offsetWidth;
          target.classList.add("section-arrival-pulse");

          setTimeout(() => {
            target.classList.remove("section-arrival-pulse");
          }, 1000);
        }, 850);
      }
    }
  };

  return (
    <div className="fixed top-3.5 sm:top-5 inset-x-0 z-40 flex justify-center items-center px-3 sm:px-4 pointer-events-none">
      {/* Floating Center Dock with GooeyNav */}
      <header className="pointer-events-auto flex items-center gap-2 sm:gap-3.5 p-2 sm:p-2.5 pl-2.5 sm:pl-3.5 rounded-sheet bg-sheet border border-rule shadow-paper-lg transition-all duration-300">
        {/* Placement Icon & Brand */}
        <Link
          href="#hero"
          onClick={(e) => {
            e.preventDefault();
            isAnimatingRef.current = true;
            setActiveIndex(0);
            if (scrollTimeoutRef.current) {
              clearTimeout(scrollTimeoutRef.current);
            }

            const lenis = (
              window as unknown as {
                __lenis?: {
                  scrollTo: (
                    target: HTMLElement | number | string,
                    opts?: Record<string, unknown>
                  ) => void;
                };
              }
            ).__lenis;

            if (lenis) {
              lenis.scrollTo(0, { duration: 0.8 });
            } else {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }

            scrollTimeoutRef.current = setTimeout(() => {
              isAnimatingRef.current = false;
              setActiveIndex(0);
              window.history.pushState(null, "", "#hero");
            }, 850);
          }}
          className="flex items-center gap-2.5 p-1 pr-2.5 sm:pr-3.5 rounded-full hover:bg-paper transition-all select-none group active:scale-[0.98]"
          title="Talaan - Back to top"
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
