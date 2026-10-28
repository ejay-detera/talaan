import { AppHeaderNav } from "@/components/shared/AppHeaderNav";

export default function SummaryLoading() {
  return (
    <div className="flex-1 flex flex-col bg-transparent text-pencil font-sans pb-16 animate-pulse select-none">
      <AppHeaderNav storeName="Store..." activeTab="summary" />
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 pt-2 sm:pt-4 space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <div className="h-7 w-48 bg-rule/70 rounded" />
            <div className="h-4 w-64 bg-rule/40 rounded" />
          </div>
          <div className="h-8 w-44 bg-rule/40 rounded-pill" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-4 h-96 rounded-row border border-[#EADB85] bg-[#FFF9D2]/70 shadow-paper" />
          <div className="lg:col-span-8 h-96 rounded-sheet border border-rule bg-sheet shadow-paper-lg" />
        </div>
      </main>
    </div>
  );
}

