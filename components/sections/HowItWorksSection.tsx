import { SectionHeading } from "@/components/ui/SectionHeading";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

const STEPS = [
  {
    number: "01",
    title: "Set your rating",
    description:
      "Play a short calibration set — five games, no pressure — so every match after this one starts fair.",
  },
  {
    number: "02",
    title: "Get matched instantly",
    description:
      "Our queue pairs you with someone within 60 rating points in under ten seconds, day or night.",
  },
  {
    number: "03",
    title: "Review and improve",
    description:
      "Every game gets an engine-annotated recap afterward — the three moves that mattered, explained in plain language.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" aria-label="How it works" className="scroll-mt-20 border-b border-ink-700">
      <div className="mx-auto max-w-container px-6 py-20 lg:px-10 lg:py-28">
        <SectionHeading
          eyebrow="How it works"
          title="Three moves to your first real game"
          description="No lobby to configure, no settings to tune — just play."
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <RevealOnScroll key={step.number} delay={index * 0.08}>
              <div className="h-full rounded-lg border border-ink-600 bg-ink-800/50 p-6">
                <span className="font-mono text-sm text-accent-400">{step.number}</span>
                <h3 className="mt-4 font-display text-xl font-semibold text-paper-100">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-paper-300">{step.description}</p>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
