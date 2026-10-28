// impeccable-disable side-tab -- intentional red margin line per docs/design.md
import { ArrowLeft } from "lucide-react";

export default function CustomerDetailLoading() {
  return (
    <div className="min-h-screen bg-transparent text-pencil font-sans pb-24 animate-pulse select-none">
      {/* Sticky Header Skeleton */}
      <header className="sticky top-0 z-20 bg-sheet/95 backdrop-blur-sm border-b border-rule px-4 sm:px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-muted p-1">
            <ArrowLeft className="w-4 h-4" />
            <span>Customers</span>
          </div>

          <div className="text-center space-y-1">
            <div className="h-6 w-36 bg-rule/70 rounded mx-auto" />
            <div className="h-3 w-48 bg-rule/40 rounded mx-auto" />
          </div>

          <div className="h-6 w-24 bg-rule/40 rounded-row" />
        </div>
      </header>

      {/* Main Container Skeleton (2-column layout matching Image 2) */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column Skeleton */}
          <div className="lg:col-span-6 space-y-6">
            {/* Balance Card Skeleton */}
            <div className="p-5 sm:p-6 rounded-row border border-rule bg-sheet shadow-paper space-y-4">
              <div className="flex justify-between items-center">
                <div className="h-3.5 w-28 bg-rule/50 rounded" />
                <div className="h-4 w-20 bg-rule/40 rounded" />
              </div>
              <div className="h-9 w-40 bg-rule/70 rounded" />
              <div className="pt-3 border-t border-rule/60 grid grid-cols-2 gap-4">
                <div className="h-4 w-28 bg-rule/40 rounded" />
                <div className="h-4 w-28 bg-rule/40 rounded" />
              </div>
            </div>

            {/* Transaction History Pad Skeleton */}
            <div className="rounded-row border border-rule bg-[#FFFEF8] border-l-4 border-l-margin/50 shadow-paper overflow-hidden">
              <div className="p-4 border-b border-rule flex justify-between items-center bg-[#FBFDF6]/60">
                <div className="h-4 w-36 bg-rule/70 rounded" />
                <div className="h-3 w-28 bg-rule/40 rounded" />
              </div>
              <div className="divide-y divide-[#E6ECE0]">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 flex justify-between items-center">
                    <div className="space-y-1">
                      <div className="h-4 w-32 bg-rule/70 rounded" />
                      <div className="h-3 w-40 bg-rule/40 rounded" />
                    </div>
                    <div className="h-5 w-20 bg-rule/60 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Memo Skeleton */}
          <div className="lg:col-span-6">
            <div className="relative h-72 w-full rounded-row bg-[#FFF9D2]/80 border border-[#EADB85] shadow-paper p-6 space-y-4">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-margin/50" />
              <div className="h-5 w-48 bg-[#EADB85] rounded" />
              <div className="flex gap-2">
                <div className="h-7 w-20 bg-[#EADB85] rounded-row" />
                <div className="h-7 w-20 bg-[#EADB85] rounded-row" />
              </div>
              <div className="h-24 w-full bg-[#EADB85]/40 rounded" />
              <div className="flex justify-between items-center pt-2">
                <div className="h-3 w-32 bg-[#EADB85]/70 rounded" />
                <div className="h-8 w-24 bg-[#EADB85] rounded-row" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
