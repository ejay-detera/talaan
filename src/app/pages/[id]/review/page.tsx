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

  // Format notebook page date (e.g., "October 27, 2026")
  let formattedDate = page.page_date || "Recent Page";
  if (page.page_date) {
    try {
      const parts = page.page_date.split("-");
      if (parts.length === 3) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        formattedDate = new Intl.DateTimeFormat("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }).format(d);
      }
    } catch {
      formattedDate = page.page_date;
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-transparent text-pencil font-sans selection:bg-marker selection:text-pencil pb-6">
      {/* Top Header matching Image 1 */}
      <header className="bg-sheet/95 backdrop-blur-sm border-b border-rule px-4 sm:px-6 py-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-pencil hover:text-ink transition-colors p-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>

            <div className="h-4 w-px bg-rule" aria-hidden="true" />

            <div>
              <h1 className="font-display font-bold text-lg sm:text-2xl text-pencil tracking-tight">
                Page Review
              </h1>
              <p className="text-xs sm:text-sm text-muted font-sans font-medium">
                Notebook of {formattedDate}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-5">
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
