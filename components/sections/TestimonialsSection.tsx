import { SectionHeading } from "@/components/ui/SectionHeading";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

const REVIEWS = [
  {
    initials: "MJ",
    handle: "maren_j",
    rating: "1,840 → 2,010 in four months",
    quote:
      "The post-game reviews are the whole product for me. It's the first tool that told me why I kept losing the same knight endgame instead of just showing me the eval bar.",
  },
  {
    initials: "TO",
    handle: "theo_opens_e4",
    rating: "1,205 → 1,560 in four months",
    quote:
      "I'd bounced off three other apps before this one stuck. The matchmaking queue is fast enough that I actually play in the ten minutes I have between meetings.",
  },
  {
    initials: "RS",
    handle: "rooksandsilence",
    rating: "2,140 → 2,205 in four months",
    quote:
      "Tournament scheduling across time zones used to be a mess for our club. Now everyone just shows up to the same bracket and it runs itself.",
  },
];

export function TestimonialsSection() {
  return (
    <section aria-label="Player reviews" className="scroll-mt-20 border-b border-ink-700">
      <div className="mx-auto max-w-container px-6 py-20 lg:px-10 lg:py-28">
        <SectionHeading eyebrow="Player reviews" title="What 3,200 rated players are saying" />

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {REVIEWS.map((review, index) => (
            <RevealOnScroll key={review.handle} delay={index * 0.08}>
              <figure className="flex h-full flex-col rounded-lg border border-ink-600 bg-ink-800/50 p-6">
                <blockquote className="flex-1 text-sm text-paper-300">
                  &ldquo;{review.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-subtle font-mono text-xs font-medium text-accent-400">
                    {review.initials}
                  </span>
                  <span>
                    <span className="block text-sm font-medium text-paper-100">
                      {review.handle}
                    </span>
                    <span className="block font-mono text-[11px] text-paper-500">
                      {review.rating}
                    </span>
                  </span>
                </figcaption>
              </figure>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
