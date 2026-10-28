import { connection } from "next/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getReviewPage } from "@/services/pages";
import { ReviewSheet } from "@/components/review/ReviewSheet";

interface ReviewPageProps {
  params: Promise<{ id: string }>;
}

export default async function ReviewPage({ params }: ReviewPageProps) {
  await connection();
  const { id } = await params;
  if (!id) notFound();

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData?.user) {
    redirect("/login");
  }

  const reviewData = await getReviewPage(supabase, id);
  if (!reviewData) {
    notFound();
  }

  const { page, entries, customers, imageUrl } = reviewData;
  const isAlreadyConfirmed = page.status === "confirmed";

  return (
    <div className="min-h-screen bg-paper text-pencil font-sans selection:bg-marker selection:text-pencil pb-12">
      {/* Sticky Top Header */}
      <header className="sticky top-0 z-20 bg-sheet/95 backdrop-blur-sm border-b border-rule px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-pencil hover:text-ink transition-colors p-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>

          <div className="text-center">
            <h1 className="font-display font-bold text-base sm:text-lg text-pencil">
              Pagsusuri ng Pahina
            </h1>
            <p className="text-[11px] text-muted">
              {page.page_date || "Kuwaderno"} &bull; {entries.length} linya
            </p>
          </div>

          {/* Model Provenance Badge */}
          <div className="px-2 py-0.5 rounded-row border border-rule bg-sheet text-[10px] font-bold text-muted uppercase tracking-wider">
            {page.model}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-2xl mx-auto px-4 pt-4">
        {isAlreadyConfirmed ? (
          <div className="p-6 rounded-sheet border border-paid/40 bg-sheet shadow-paper text-center space-y-3">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-paid/10 text-paid mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="font-display font-bold text-lg text-pencil">
              Kumpirmado na ang Pahinang Ito
            </h2>
            <p className="text-xs text-muted max-w-sm mx-auto leading-relaxed">
              Naitala na ang mga entry sa ledger na may kabuuang halaga na{" "}
              <strong className="text-pencil font-bold">₱{Number(page.computed_total).toFixed(2)}</strong>.
            </p>
            <div className="pt-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold rounded-row bg-ink text-sheet hover:bg-ink/90"
              >
                Bumalik sa Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <ReviewSheet
            page={{
              id: page.id,
              page_date: page.page_date,
              written_total: page.written_total,
              status: page.status,
              model: page.model,
            }}
            initialEntries={entries}
            customerCandidates={customers}
            imageUrl={imageUrl}
          />
        )}
      </main>
    </div>
  );
}
