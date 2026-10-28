import { AppHeaderNav } from "@/components/shared/AppHeaderNav";

export default function SummaryLoading() {
  return (
    <div className="min-h-screen bg-transparent text-pencil font-sans">
      <AppHeaderNav storeName="Store..." activeTab="summary" />
      <main className="max-w-xl mx-auto px-4 pt-4 space-y-4">
        <div className="h-40 rounded-sheet border border-rule bg-sheet animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="h-28 rounded-sheet border border-rule bg-sheet animate-pulse" />
          <div className="h-28 rounded-sheet border border-rule bg-sheet animate-pulse" />
        </div>
        <div className="h-64 rounded-sheet border border-rule bg-sheet animate-pulse" />
      </main>
    </div>
  );
}

