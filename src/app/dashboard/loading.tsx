import { Store } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-paper text-pencil font-sans pb-16 animate-pulse select-none">
      {/* Dashboard Sticky Header Skeleton */}
      <header className="sticky top-0 z-20 bg-sheet/95 backdrop-blur-sm border-b border-rule px-4 py-3.5">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-row bg-paper border border-rule text-ink/40">
              <Store className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <div className="h-4 w-28 bg-rule/70 rounded" />
              <div className="h-2.5 w-36 bg-rule/40 rounded" />
            </div>
          </div>
          <div className="h-7 w-20 bg-rule/40 rounded-row" />
        </div>
      </header>

      {/* Main Content Area Skeleton */}
      <main className="max-w-xl mx-auto px-4 pt-6 space-y-6">
        {/* Scan Button Placeholder */}
        <div className="h-16 w-full rounded-sheet bg-sheet border border-rule flex items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-full bg-rule/50" />
          <div className="h-4 w-44 bg-rule/60 rounded" />
        </div>

        {/* Recent Pages List Skeleton */}
        <div className="space-y-3">
          <div className="h-3.5 w-32 bg-rule/70 rounded" />
          <div className="space-y-2.5">
            <div className="h-20 w-full rounded-sheet bg-sheet border border-rule p-3.5 space-y-2">
              <div className="flex justify-between items-center">
                <div className="h-3.5 w-24 bg-rule/60 rounded" />
                <div className="h-4 w-16 bg-rule/60 rounded" />
              </div>
              <div className="h-3 w-36 bg-rule/40 rounded" />
            </div>
            <div className="h-20 w-full rounded-sheet bg-sheet border border-rule p-3.5 space-y-2">
              <div className="flex justify-between items-center">
                <div className="h-3.5 w-24 bg-rule/60 rounded" />
                <div className="h-4 w-16 bg-rule/60 rounded" />
              </div>
              <div className="h-3 w-36 bg-rule/40 rounded" />
            </div>
            <div className="h-20 w-full rounded-sheet bg-sheet border border-rule p-3.5 space-y-2">
              <div className="flex justify-between items-center">
                <div className="h-3.5 w-24 bg-rule/60 rounded" />
                <div className="h-4 w-16 bg-rule/60 rounded" />
              </div>
              <div className="h-3 w-36 bg-rule/40 rounded" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
