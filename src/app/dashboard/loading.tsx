// impeccable-disable side-tab -- intentional red margin line per docs/design.md
export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-transparent text-pencil font-sans pb-28 animate-pulse select-none">
      {/* Floating Center Dock Skeleton */}
      <div className="sticky top-2.5 sm:top-4 z-40 flex justify-center items-center px-3 sm:px-4 mb-4">
        <div className="h-12 w-72 rounded-full bg-sheet/90 border border-rule shadow-paper-lg" />
      </div>

      {/* Main Content Area Skeleton */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-2 sm:pt-4 space-y-6">
        {/* Header Skeleton */}
        <div className="space-y-2">
          <div className="h-7 w-56 bg-rule/70 rounded" />
          <div className="h-4 w-40 bg-rule/40 rounded" />
        </div>

        {/* 2-Column Responsive Dashboard Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Pinned Sticky Note Skeleton */}
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

            {/* Notebook Pad Skeleton */}
            <div className="h-84 w-full rounded-row bg-[#FFFEFB] border border-rule shadow-paper overflow-hidden">
              <div className="h-9 bg-[#F2F6EC] border-b border-rule flex items-center px-4">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-paper border border-[#C5D0B4]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-paper border border-[#C5D0B4]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-paper border border-[#C5D0B4]" />
                </div>
              </div>
              <div className="p-5 space-y-4">
                <div className="h-36 w-full rounded-sm bg-paper/70 border border-rule/60" />
                <div className="h-7 w-28 bg-rule/70 rounded" />
                <div className="h-4 w-40 bg-rule/40 rounded" />
                <div className="h-8 w-28 bg-rule/60 rounded-row" />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Who Owes Credit Lined Note Skeleton */}
            <div className="relative h-68 w-full rounded-row bg-[#FFFEF8] border border-[#D5DEC6] border-l-4 border-l-margin/50 shadow-paper overflow-hidden">
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-24 h-4 bg-[#EAE3CE] rounded-[2px]" />
              <div className="h-12 border-b border-rule px-5 flex items-center justify-between">
                <div className="h-4 w-32 bg-rule/70 rounded" />
                <div className="h-3 w-20 bg-rule/40 rounded" />
              </div>
              <div className="p-5 space-y-3.5">
                <div className="h-9 w-full bg-paper/50 rounded" />
                <div className="h-9 w-full bg-paper/50 rounded" />
                <div className="h-9 w-full bg-paper/50 rounded" />
              </div>
            </div>

            {/* Taped Index Card Skeleton */}
            <div className="relative h-32 w-full rounded-row bg-[#FFFEF8] border border-[#D5DEC6] shadow-paper p-5 space-y-3">
              <div className="absolute -top-2 left-8 w-16 h-4 bg-[#EAE3CE] -rotate-2 rounded-[2px]" />
              <div className="h-5 w-44 bg-rule/60 rounded" />
              <div className="h-4 w-full bg-rule/40 rounded" />
            </div>
          </div>
        </div>
      </main>

      {/* Scan FAB Skeleton */}
      <div className="fixed bottom-5 sm:bottom-6 right-4 sm:right-6">
        <div className="h-14 w-36 rounded-full bg-rule/80 shadow-paper-lg" />
      </div>
    </div>
  );
}