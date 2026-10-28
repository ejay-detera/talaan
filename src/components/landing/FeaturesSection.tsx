import { Camera, Calculator, CheckSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function FeaturesSection() {
  const steps = [
    {
      step: "01",
      icon: Camera,
      title: "1. Capture & Vision Extraction",
      subtitle: "Powered by Meta Muse Glimmer 30B",
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
    <section id="how-it-works" className="w-full py-14 sm:py-20 border-t border-rule bg-paper">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10 sm:space-y-14">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="font-display font-bold text-2xl sm:text-4xl text-pencil tracking-tight">
            How Talaan keeps your counter habit honest
          </h2>
          <p className="text-sm sm:text-base text-muted font-sans leading-relaxed">
            Never replace your trusted paper notebook. Talaan bridges handwritten counter notes
            to verified digital records with deterministic math.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {steps.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.step}
                className="group relative bg-sheet border border-rule rounded-sheet shadow-paper hover:shadow-paper-lg hover:border-ink/40 hover:-translate-y-1.5 transition-all duration-300 ease-out cursor-default overflow-hidden"
              >
                {/* Subtle top indicator on hover */}
                <div className="absolute top-0 inset-x-0 h-1 bg-ink opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <CardHeader className="p-6 sm:p-7 pb-3">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-row bg-paper border border-rule flex items-center justify-center text-ink group-hover:bg-ink group-hover:text-sheet group-hover:border-ink transition-all duration-300 shadow-xs group-hover:scale-105">
                      <Icon className="w-5 h-5 transition-transform duration-300" />
                    </div>
                    <span className="font-display font-black text-2xl text-muted group-hover:text-ink transition-colors duration-300 select-none">
                      {item.step}
                    </span>
                  </div>
                  <CardTitle className="text-lg sm:text-xl font-display font-bold text-pencil group-hover:text-ink transition-colors duration-200">
                    {item.title}
                  </CardTitle>
                  <p className="text-xs font-semibold text-muted font-sans mt-1">
                    {item.subtitle}
                  </p>
                </CardHeader>
                <CardContent className="p-6 sm:p-7 pt-2">
                  <p className="text-xs sm:text-sm text-pencil/80 font-sans leading-relaxed">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
