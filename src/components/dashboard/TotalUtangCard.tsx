import Link from "next/link";
import { ArrowRight, Users, AlertCircle } from "lucide-react";
import { Amount } from "@/components/shared/Amount";

interface TotalUtangCardProps {
  totalStoreUtang: number;
  activeDebtorCount: number;
}

export function TotalUtangCard({
  totalStoreUtang,
  activeDebtorCount,
}: TotalUtangCardProps) {
  return (
    <div className="p-4 sm:p-5 rounded-sheet border border-rule bg-sheet space-y-3 select-none">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold text-muted uppercase tracking-wider flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-margin" />
          <span>Kabuuang Pautang ng Tindahan</span>
        </span>

        <span className="text-xs font-semibold text-muted flex items-center gap-1">
          <Users className="w-3.5 h-3.5" />
          <span>
            {activeDebtorCount === 1 ? "1 suki" : `${activeDebtorCount} mga suki`}
          </span>
        </span>
      </div>

      <div className="flex items-baseline justify-between gap-3">
        <div>
          <Amount amount={totalStoreUtang} size="lg" className="text-2xl font-extrabold text-pencil" />
          <p className="text-[11px] text-muted pt-0.5">
            Mula sa lahat ng kumpirmadong talaan ng utang
          </p>
        </div>

        <Link
          href="/customers"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-row bg-paper border border-rule text-xs font-bold text-ink hover:bg-paper/80 active:scale-[0.98] transition-all min-h-[44px]"
        >
          <span>Tingnan ang mga Suki</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
