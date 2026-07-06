import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { HeroCTA } from "@/components/hero/HeroCTA";

export function FinalCTASection() {
  return (
    <section aria-label="Get started" className="border-b border-ink-700">
      <div className="mx-auto max-w-container px-6 py-20 text-center lg:px-10 lg:py-28">
        <RevealOnScroll className="mx-auto max-w-2xl">
          <h2 className="text-balance font-display text-3xl font-semibold leading-tight text-paper-100 sm:text-4xl">
            Your next best move starts now.
          </h2>
          <p className="mt-4 text-paper-300">
            No credit card, no install — just a board and an opponent your speed.
          </p>
          <div className="mt-8 flex justify-center">
            <HeroCTA href="/play">Play now</HeroCTA>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
