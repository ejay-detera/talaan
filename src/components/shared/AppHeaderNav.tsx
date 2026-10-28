import Link from "next/link";
import { Store, BookOpen, Users, BarChart3 } from "lucide-react";
import { SignOutButton } from "@/components/shared/SignOutButton";

interface AppHeaderNavProps {
  storeName: string;
  activeTab: "pages" | "customers" | "summary";
}

export function AppHeaderNav({ storeName, activeTab }: AppHeaderNavProps) {
  return (
    <header className="sticky top-0 z-20 bg-sheet/95 backdrop-blur-sm border-b border-rule px-4 py-3 print:hidden">
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
              <p className="text-sm text-muted">Talaan &bull; Sari-Sari Store Ledger</p>
            </div>
          </div>

          <SignOutButton />
        </div>

        {/* Tab Switcher: Kuwaderno (Pages) | Mga Suki (Customers) | Ulat (Summary) */}
        <nav aria-label="Pangunahing nabigasyon" className="flex border-t border-rule/60 pt-2 gap-2">
          <Link
            href="/dashboard"
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-row text-sm font-bold transition-all select-none min-h-[48px] ${
              activeTab === "pages"
                ? "bg-ink text-sheet shadow-paper"
                : "bg-paper text-pencil hover:bg-paper/80 border border-rule/60"
            }`}
          >
            <BookOpen className="w-4 h-4 flex-shrink-0" />
            <span>Kuwaderno</span>
          </Link>

          <Link
            href="/customers"
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-row text-sm font-bold transition-all select-none min-h-[48px] ${
              activeTab === "customers"
                ? "bg-ink text-sheet shadow-paper"
                : "bg-paper text-pencil hover:bg-paper/80 border border-rule/60"
            }`}
          >
            <Users className="w-4 h-4 flex-shrink-0" />
            <span>Mga Suki</span>
          </Link>

          <Link
            href="/summary"
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-row text-sm font-bold transition-all select-none min-h-[48px] ${
              activeTab === "summary"
                ? "bg-ink text-sheet shadow-paper"
                : "bg-paper text-pencil hover:bg-paper/80 border border-rule/60"
            }`}
          >
            <BarChart3 className="w-4 h-4 flex-shrink-0" />
            <span>Ulat</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}

