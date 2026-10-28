import { ArrowLeft } from "lucide-react";

export default function ReviewLoading() {
  return (
    <div className="flex-1 flex flex-col bg-transparent text-pencil font-sans pb-6 animate-pulse select-none">
      {/* Top Header Skeleton */}
      <header className="bg-sheet/95 backdrop-blur-sm border-b border-rule px-4 sm:px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <div className="inline-flex items-center gap-1.5 text-xs text-muted p-1">
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </div>

          <div className="h-4 w-px bg-rule" aria-hidden="true" />

          <div className="space-y-1">
            <div className="h-5 w-32 bg-rule/70 rounded" />
            <div className="h-3 w-40 bg-rule/40 rounded" />
          </div>
        </div>
      </header>

      {/* Main Review Container Skeleton */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-5 space-y-4">
        {/* Banner Skeleton */}
        <div className="h-20 w-full rounded-sheet bg-sheet border border-rule flex items-center justify-between p-4">
          <div className="space-y-1.5">
            <div className="h-4 w-48 bg-rule/70 rounded" />
            <div className="h-3 w-36 bg-rule/40 rounded" />
          </div>
          <div className="h-10 w-28 bg-rule/60 rounded-row" />
        </div>

        {/* Spreadsheet Skeleton */}
        <div className="rounded-sheet border border-rule bg-sheet p-4 space-y-3">
          <div className="h-10 w-full bg-paper/60 rounded border border-rule/50" />
          <div className="h-64 w-full rounded bg-sheet border border-rule/50" />
        </div>
      </main>
    </div>
  );
}
