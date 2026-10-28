"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import GooeyNav from "@/components/shared/GooeyNav";
import { SignOutButton } from "@/components/shared/SignOutButton";

interface AppHeaderNavProps {
  storeName: string;
  activeTab: "pages" | "customers" | "summary";
}

const TABS = [
  { label: "Notebook", href: "/dashboard" },
  { label: "Customers", href: "/customers" },
  { label: "Summary", href: "/summary" },
];

export function AppHeaderNav({ activeTab }: AppHeaderNavProps) {
  const router = useRouter();

  const tabIndex = activeTab === "pages" ? 0 : activeTab === "customers" ? 1 : 2;

  const handleTabChange = (idx: number) => {
    if (idx !== tabIndex && TABS[idx]) {
      router.push(TABS[idx].href);
    }
  };

  return (
    <div className="sticky top-2.5 sm:top-4 z-40 flex justify-center items-center px-3 sm:px-4 pointer-events-none print:hidden mb-4">
      {/* Floating Center Dock with GooeyNav */}
      <header className="pointer-events-auto flex items-center gap-1.5 sm:gap-2.5 p-1.5 sm:p-2 pl-2 sm:pl-3 rounded-full bg-sheet/95 backdrop-blur-md border border-rule shadow-paper-lg transition-all duration-300">
        {/* Placement Icon & Brand (Static & non-interactive on user pages) */}
        <div className="flex items-center gap-2 p-1 pr-1.5 sm:pr-2.5 select-none pointer-events-none cursor-default">
          <Image
            src="/assets/talaan-icon.png"
            alt="Talaan logo"
            width={28}
            height={28}
            className="flex-shrink-0 object-contain"
          />
          <span className="font-display font-black text-sm tracking-tight text-pencil hidden md:inline">
            Talaan
          </span>
        </div>

        {/* Divider */}
        <div className="h-5 sm:h-6 w-[1px] bg-rule" aria-hidden="true" />

        {/* Centered Gooey Nav Component */}
        <div className="flex items-center">
          <GooeyNav
            items={TABS}
            activeIndex={tabIndex}
            onChange={handleTabChange}
            theme="light"
            color="#1E3FAE"
            activeTextColor="#FFFFFF"
            colors={["#1E3FAE", "#2550D8", "#1A3694"]}
            size="sm"
            frame={false}
            particleCount={12}
            animationTime={420}
            spread={45}
            gooeyness={0.5}
            wobble={0.35}
            hoverEffect={true}
          />
        </div>

        {/* Divider */}
        <div className="h-5 sm:h-6 w-[1px] bg-rule" aria-hidden="true" />

        {/* Sign Out Action Button */}
        <div className="flex items-center pr-1">
          <SignOutButton />
        </div>
      </header>
    </div>
  );
}
