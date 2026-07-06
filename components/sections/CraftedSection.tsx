"use client";

import dynamic from "next/dynamic";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { KnightSceneSkeleton } from "@/components/three/KnightSceneSkeleton";

// Three.js is only ever needed once this section scrolls into view, so
// it's code-split from the main bundle the same way the chess engine
// is in the hero — no reason to ship WebGL setup code before anyone
// scrolls this far.
const KnightScene = dynamic(
  () => import("@/components/three/KnightScene").then((mod) => mod.KnightScene),
  { ssr: false, loading: () => <KnightSceneSkeleton /> }
);

const DETAILS = [
  {
    title: "Every set, hand-tuned",
    description: "Piece weighting and board contrast are calibrated for hours of play, not a first screenshot.",
  },
  {
    title: "Zero cost when idle",
    description: "The 3D view only renders while it's on screen and pauses the instant you switch tabs.",
  },
  {
    title: "Built for touch and mouse alike",
    description: "Drag to turn the piece on any device — no plugin, no install, just WebGL your browser already has.",
  },
];

export function CraftedSection() {
  return (
    <section aria-label="Craftsmanship" className="scroll-mt-20 border-b border-ink-700">
      <div className="mx-auto grid max-w-container gap-14 px-6 py-20 lg:grid-cols-2 lg:items-center lg:px-10 lg:py-28">
        <div>
          <SectionHeading
            eyebrow="Craftsmanship"
            title="Pieces worth looking at twice"
            description="A closer look at the knight — the same procedural model rendered in real time, right in your browser."
          />

          <ul className="mt-10 space-y-6">
            {DETAILS.map((detail, index) => (
              <RevealOnScroll key={detail.title} as="li" delay={index * 0.08}>
                <h3 className="font-display text-lg font-semibold text-paper-100">
                  {detail.title}
                </h3>
                <p className="mt-1 text-sm text-paper-300">{detail.description}</p>
              </RevealOnScroll>
            ))}
          </ul>
        </div>

        <RevealOnScroll delay={0.1}>
          <KnightScene />
          <p className="mt-3 text-center font-mono text-xs text-paper-500">
            Drag to rotate — spins on its own when you let go.
          </p>
        </RevealOnScroll>
      </div>
    </section>
  );
}
