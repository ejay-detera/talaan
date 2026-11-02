import { ShieldCheck, MessageSquare, ShoppingCart } from "lucide-react";

export function FeaturesSection() {
  const features = [
    {
      icon: ShieldCheck,
      tag: "Prepare → Confirm",
      title: "Two-Phase Sovereign Bookkeeping",
      description:
        "The AI vision model only drafts counter entries; it never directly touches customer ledger balances. You hold sovereign final approval on every row before transactions commit to your database.",
    },
    {
      icon: MessageSquare,
      tag: "Customer Goodwill",
      title: "Polite Taglish Payment Reminders",
      description:
        "Generate respectful, culturally courteous reminder drafts in authentic Filipino Taglish. Clear on exact balances and items, without uncomfortable confrontations that risk customer relationships.",
    },
    {
      icon: ShoppingCart,
      tag: "Inventory Liquidity",
      title: "Pamalengke Restock Checklist",
      description:
        "Talaan automatically compiles your most frequently credited goods into a market restock checklist. Know exactly what your community is consuming before the wet market opens.",
    },
  ];

  return (
    <section id="features" className="min-h-[100dvh] w-full py-16 sm:py-24 border-t border-rule bg-sheet scroll-mt-0 flex flex-col justify-center">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12 sm:space-y-16 w-full">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2.5">
          <h2 className="font-display font-bold text-2xl sm:text-4xl text-pencil tracking-tight">
            Built specifically for Philippine counter commerce
          </h2>
          <p className="text-sm sm:text-base text-muted font-sans leading-relaxed">
            Everything needed to manage store credit, eliminate arithmetic loss, and protect customer goodwill.
          </p>
        </div>

        {/* 3 Equal Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="group relative bg-paper/60 border border-rule rounded-sheet p-6 sm:p-8 shadow-paper hover:shadow-paper-lg hover:border-ink/40 hover:-translate-y-1 transition-all duration-300 ease-out flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Icon & Category Tag */}
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-row bg-sheet border border-rule flex items-center justify-center text-ink group-hover:bg-ink group-hover:text-sheet group-hover:border-ink transition-colors duration-200 shadow-xs">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-bold text-muted uppercase tracking-wider font-sans group-hover:text-ink transition-colors duration-150">
                      {item.tag}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-display font-bold text-lg sm:text-xl text-pencil tracking-tight group-hover:text-ink transition-colors duration-150">
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-pencil/80 font-sans leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sovereign Ledger Guarantee Trust Banner */}
        <div className="max-w-4xl mx-auto p-6 sm:p-8 rounded-sheet bg-paper border border-rule text-center space-y-2 shadow-xs">
          <h3 className="font-display font-bold text-base sm:text-lg text-pencil">
            Sovereign Ledger Guarantee
          </h3>
          <p className="text-xs sm:text-sm text-muted font-sans max-w-2xl mx-auto leading-relaxed">
            No automatic customer SMS blasts without your tap. No cloud fee surprise on open-weights inference.
            Every total is calculated in TypeScript integer centavos with zero LLM arithmetic.
          </p>
        </div>
      </div>
    </section>
  );
}
