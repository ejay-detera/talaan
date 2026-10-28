import { ArrowLeft } from "lucide-react";

export default function CustomerDetailLoading() {
  return (
    <div className="min-h-screen bg-paper text-pencil font-sans pb-16 animate-pulse select-none">
      {/* Sticky Header Skeleton */}
      <header className="sticky top-0 z-20 bg-sheet/95 backdrop-blur-sm border-b border-rule px-4 py-3">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 text-xs text-muted p-1">
            <ArrowLeft className="w-4 h-4" />
            <span>Mga Suki</span>
          </div>

          <div className="h-4 w-28 bg-rule/70 rounded" />
          <div className="h-4 w-12 bg-transparent" />
        </div>
      </header>

      {/* Main Container Skeleton */}
      <main className="max-w-xl mx-auto px-4 pt-4 space-y-4">
        {/* Balance Header Card Skeleton */}
        <div className="p-4 sm:p-5 rounded-sheet border border-rule bg-sheet space-y-2">
          <div className="h-3.5 w-32 bg-rule/50 rounded" />
          <div className="h-8 w-40 bg-rule/70 rounded" />
          <div className="h-3 w-48 bg-rule/40 rounded" />
        </div>

        {/* Reminder Card Skeleton */}
        <div className="h-40 w-full rounded-sheet bg-sheet border border-rule" />

        {/* Transaction History Skeleton */}
        <div className="rounded-sheet border border-rule bg-sheet p-4 space-y-3">
          <div className="h-3.5 w-36 bg-rule/60 rounded" />
          <div className="space-y-2 pt-1">
            <div className="h-14 w-full rounded bg-paper/60 border border-rule/50" />
            <div className="h-14 w-full rounded bg-paper/60 border border-rule/50" />
            <div className="h-14 w-full rounded bg-paper/60 border border-rule/50" />
          </div>
        </div>
      </main>
    </div>
  );
}

