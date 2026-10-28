import Link from "next/link";
import { Store, BookOpen, Users } from "lucide-react";
import { SignOutButton } from "@/components/shared/SignOutButton";

interface AppHeaderNavProps {
  storeName: string;
  activeTab: "pages" | "customers";
}

export function AppHeaderNav({ storeName, activeTab }: AppHeaderNavProps) {
  return (
    <header className="sticky top-0 z-20 bg-sheet/95 backdrop-blur-sm border-b border-rule px-4 py-3">
      <div className="max-w-xl mx-auto flex flex-col gap-3">
        {/* Top bar: Store Name & Sign Out */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-row bg-paper border border-rule text-ink">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-display font-bold text-sm sm:text-base text-pencil leading-tight">
                {storeName}
              </h1>
              <p className="text-[11px] text-muted">Talaan &bull; Sari-Sari Store Ledger</p>
            </div>
          </div>

          <SignOutButton />
        </div>

        {/* Tab Switcher: Kuwaderno (Pages) | Mga Suki (Customers) */}
        <nav aria-label="Pangunahing nabigasyon" className="flex border-t border-rule/60 pt-2 gap-2">
          <Link
            href="/dashboard"
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-row text-xs font-bold transition-all select-none min-h-[44px] ${
              activeTab === "pages"
                ? "bg-ink text-sheet shadow-paper"
                : "bg-paper text-pencil hover:bg-paper/80 border border-rule/60"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Kuwaderno (Pahina)</span>
          </Link>

          <Link
            href="/customers"
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-row text-xs font-bold transition-all select-none min-h-[44px] ${
              activeTab === "customers"
                ? "bg-ink text-sheet shadow-paper"
                : "bg-paper text-pencil hover:bg-paper/80 border border-rule/60"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Mga Suki (Utang)</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}

