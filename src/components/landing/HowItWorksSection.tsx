import { Camera, Calculator, CheckSquare } from "lucide-react";

export function HowItWorksSection() {
  const steps = [
    {
      step: "01",
      icon: Camera,
      title: "1. Capture & Vision Extraction",
      subtitle: "Direct From Notebook Photos",
      description:
        "Snap a photo of your counter notebook. The vision model extracts customer names, items, and handwritten amounts directly from the page without altering or fabricating numbers.",
    },
    {
      step: "02",
      icon: Calculator,
      title: "2. Deterministic Centavo Math",
      subtitle: "Zero LLM Arithmetic • Fail-Closed Code",
      description:
        "Strict TypeScript code calculates item totals (quantity × unit price) and reconciles page sums in integer centavos. Any discrepancy is flagged with a red margin indicator before saving.",
    },
    {
      step: "03",
      icon: CheckSquare,
      title: "3. Human Confirm & Polite Reminders",
      subtitle: "Storekeeper Keeps Sovereign Authority",
      description:
        "You review marked rows and approve final balances. Once confirmed, generate respectful Taglish payment reminders with one tap to share via SMS or messaging apps.",
    },
  ];

  return (
    <section id="how-it-works" className="min-h-[100dvh] w-full py-16 sm:py-24 border-t border-rule bg-paper scroll-mt-0 flex flex-col justify-center">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10 sm:space-y-12 w-full">
        <div className="text-center max-w-2xl mx-auto space-y-2.5">
          <h2 className="font-display font-bold text-2xl sm:text-4xl text-pencil tracking-tight">
            How Talaan keeps your counter habit honest
          </h2>
          <p className="text-sm sm:text-base text-muted font-sans leading-relaxed">
            Never replace your trusted paper notebook. Talaan bridges handwritten counter notes
            to verified digital records in three fail-closed steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {steps.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="group relative bg-sheet border border-rule border-l-2 border-l-margin rounded-sheet p-6 sm:p-7 shadow-paper hover:shadow-paper-lg hover:border-ink/40 hover:-translate-y-1 transition-all duration-300 ease-out flex flex-col justify-between"
              >
                <div className="space-y-3.5">
                  {/* Top Row: Icon Well and Step Indicator */}
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-row bg-paper border border-rule flex items-center justify-center text-ink group-hover:bg-ink group-hover:text-sheet group-hover:border-ink transition-colors duration-200 shadow-xs">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-display font-black text-2xl text-muted/70 group-hover:text-ink transition-colors duration-200 tabular-nums select-none">
                      {item.step}
                    </span>
                  </div>

                  {/* Title & Tight Subtitle */}
                  <div className="space-y-1">
                    <h3 className="font-display font-bold text-lg sm:text-xl text-pencil tracking-tight group-hover:text-ink transition-colors duration-150">
                      {item.title}
                    </h3>
                    <p className="text-xs font-semibold text-muted font-sans">
                      {item.subtitle}
                    </p>
                  </div>

                  {/* Description: tight spacing directly below */}
                  <p className="text-xs sm:text-sm text-pencil/80 font-sans leading-relaxed pt-0.5">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

