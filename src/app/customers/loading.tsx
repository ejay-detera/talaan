export default function CustomersLoading() {
  return (
    <div className="min-h-screen bg-paper text-pencil font-sans pb-16 animate-pulse select-none">
      {/* Header Skeleton */}
      <header className="sticky top-0 z-20 bg-sheet/95 backdrop-blur-sm border-b border-rule px-4 py-3">
        <div className="max-w-xl mx-auto flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="h-4 w-32 bg-rule/70 rounded" />
              <div className="h-2.5 w-40 bg-rule/40 rounded" />
            </div>
            <div className="h-7 w-20 bg-rule/40 rounded-row" />
          </div>
          <div className="flex gap-2 pt-2 border-t border-rule/60">
            <div className="flex-1 h-10 bg-rule/40 rounded-row" />
            <div className="flex-1 h-10 bg-rule/60 rounded-row" />
          </div>
        </div>
      </header>

      {/* Main Skeleton */}
      <main className="max-w-xl mx-auto px-4 pt-5 space-y-5">
        <div className="h-24 w-full rounded-sheet bg-sheet border border-rule p-4 space-y-2">
          <div className="h-3.5 w-36 bg-rule/50 rounded" />
          <div className="h-7 w-28 bg-rule/70 rounded" />
        </div>

        <div className="space-y-2.5">
          <div className="h-3.5 w-32 bg-rule/60 rounded" />
          <div className="h-20 w-full rounded-sheet bg-sheet border border-rule" />
          <div className="h-20 w-full rounded-sheet bg-sheet border border-rule" />
          <div className="h-20 w-full rounded-sheet bg-sheet border border-rule" />
        </div>
      </main>
    </div>
  );
}

