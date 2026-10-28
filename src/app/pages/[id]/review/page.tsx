import { connection } from "next/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getReviewPage } from "@/services/pages";
import { ReviewSheet } from "@/components/review/ReviewSheet";
import { ConfirmedPageSheet } from "@/components/review/ConfirmedPageSheet";

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
            <p className="text-sm text-muted">
              {page.page_date || "Kuwaderno"} &bull; {entries.length} linya
            </p>
          </div>

          {/* Model Provenance Badge */}
          <div className="px-2 py-0.5 rounded-row border border-rule bg-sheet text-sm font-bold text-muted uppercase tracking-wider">
            {page.model}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-2xl mx-auto px-4 pt-4">
        {isAlreadyConfirmed ? (
          <ConfirmedPageSheet
            page={{
              id: page.id,
              page_date: page.page_date,
              written_total: page.written_total !== null ? Number(page.written_total) : null,
              computed_total: Number(page.computed_total),
              has_page_discrepancy: page.has_page_discrepancy,
              model: page.model,
            }}
            entries={entries}
            imageUrl={imageUrl}
          />
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
