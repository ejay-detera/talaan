// impeccable-disable side-tab -- intentional red margin line per docs/design.md
export default function CustomersLoading() {
  return (
    <div className="min-h-screen bg-transparent text-pencil font-sans pb-24 animate-pulse select-none">
      {/* Floating Center Dock Skeleton */}
      <div className="sticky top-2.5 sm:top-4 z-40 flex justify-center items-center px-3 sm:px-4 mb-4">
        <div className="h-12 w-72 rounded-full bg-sheet/90 border border-rule shadow-paper-lg" />
      </div>

      {/* Main Skeleton */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-2 sm:pt-4 space-y-6">
        <div className="space-y-1 select-none">
          <div className="h-7 w-56 bg-rule/70 rounded" />
          <div className="h-4 w-72 bg-rule/40 rounded" />
        </div>

        {/* 2-Column Responsive Layout Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Pinned Sticky Memo Skeleton + Guide Card Skeleton */}
          <div className="lg:col-span-5 space-y-6">
            <div className="relative h-44 w-full rounded-row bg-[#FFF9D2]/80 border border-[#EADB85] shadow-[0_8px_24px_rgba(35,38,43,0.08)] p-5 space-y-3">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-margin/50" />
              <div className="flex justify-between">
                <div className="h-3.5 w-24 bg-[#EADB85] rounded" />
                <div className="h-3.5 w-24 bg-[#EADB85] rounded" />
              </div>
              <div className="h-9 w-36 bg-[#EADB85]/90 rounded" />
              <div className="h-4 w-52 bg-[#EADB85]/60 rounded" />
              <div className="h-3 w-40 bg-[#EADB85]/50 rounded pt-1" />
            </div>

            <div className="p-5 rounded-row border border-rule bg-sheet space-y-3">
              <div className="h-4 w-32 bg-rule/60 rounded" />
              <div className="h-3 w-full bg-rule/40 rounded" />
              <div className="h-3 w-3/4 bg-rule/40 rounded" />
            </div>
          </div>

          {/* Right Column: Counter Notepad Directory Pad Skeleton */}
          <div className="lg:col-span-7">
            <div className="relative rounded-row border border-rule bg-[#FFFEF8] border-l-4 border-l-margin/50 shadow-paper-lg overflow-hidden">
              {/* Pad Header */}
              <div className="p-4 border-b border-rule space-y-3 bg-[#FBFDF6]/60">
                <div className="flex justify-between items-center">
                  <div className="h-5 w-40 bg-rule/70 rounded" />
                  <div className="h-3 w-20 bg-rule/40 rounded" />
                </div>
                <div className="flex justify-between items-center gap-3">
                  <div className="h-7 flex-1 max-w-xs bg-sheet border border-rule rounded-pill" />
                  <div className="h-7 w-44 bg-rule/40 rounded-pill" />
                </div>
              </div>

              {/* Ruled Rows */}
              <div className="divide-y divide-[#E6ECE0]">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="p-4 flex justify-between items-center">
                    <div className="space-y-1.5">
                      <div className="h-4 w-28 bg-rule/70 rounded" />
                      <div className="h-3 w-36 bg-rule/40 rounded" />
                    </div>
                    <div className="space-y-1 text-right">
                      <div className="h-4 w-16 bg-rule/70 rounded ml-auto" />
                      <div className="h-3 w-20 bg-rule/40 rounded ml-auto" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Pad Footer */}
              <div className="p-4 bg-[#F6F9EF]/80 border-t-2 border-rule flex justify-between items-center">
                <div className="h-4 w-36 bg-rule/70 rounded" />
                <div className="h-5 w-24 bg-rule/80 rounded" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}