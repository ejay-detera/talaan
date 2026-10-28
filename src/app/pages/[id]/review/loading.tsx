import { ArrowLeft } from "lucide-react";

export default function ReviewLoading() {
  return (
    <div className="min-h-screen bg-paper text-pencil font-sans pb-12 animate-pulse select-none">
      {/* Sticky Top Header Skeleton */}
      <header className="sticky top-0 z-20 bg-sheet/95 backdrop-blur-sm border-b border-rule px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-1.5 text-xs text-muted p-1">
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </div>

          <div className="text-center space-y-1">
            <div className="h-4 w-32 bg-rule/70 rounded mx-auto" />
            <div className="h-2.5 w-24 bg-rule/40 rounded mx-auto" />
          </div>

          <div className="h-5 w-16 bg-rule/40 rounded-row" />
        </div>
      </header>

      {/* Main Review Container Skeleton */}
      <main className="max-w-2xl mx-auto px-4 pt-4 space-y-4">
        {/* Notebook Preview Toggle Skeleton */}
        <div className="h-10 w-full rounded-sheet bg-sheet border border-rule flex items-center justify-between px-3">
          <div className="h-3.5 w-36 bg-rule/50 rounded" />
          <div className="h-4 w-12 bg-rule/40 rounded" />
        </div>

        {/* Entry Rows Skeleton */}
        <div className="rounded-sheet border border-rule bg-sheet p-4 space-y-3">
          <div className="h-3.5 w-40 bg-rule/60 rounded" />
          <div className="space-y-2 pt-1">
            <div className="h-12 w-full rounded bg-paper/70 border border-rule/50" />
            <div className="h-12 w-full rounded bg-paper/70 border border-rule/50" />
            <div className="h-12 w-full rounded bg-paper/70 border border-rule/50" />
            <div className="h-12 w-full rounded bg-paper/70 border border-rule/50" />
          </div>
        </div>

        {/* Proof Bar Skeleton */}
        <div className="h-14 w-full rounded-row bg-sheet border border-rule flex items-center justify-between px-4">
          <div className="h-4 w-28 bg-rule/50 rounded" />
          <div className="h-4 w-28 bg-rule/70 rounded" />
        </div>
      </main>
    </div>
  );
}
