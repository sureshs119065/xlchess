"use client";

import { useInView } from "@/hooks/useInView";
import { CountUp } from "@/components/ui/CountUp";

interface Stat {
  value: number;
  formatter?: (value: number) => string;
  label: string;
}

const STATS: Stat[] = [
  {
    value: 12400,
    formatter: (n) => n.toLocaleString("en-US"),
    label: "games played today",
  },
  {
    value: 48,
    formatter: (n) => (n / 10).toFixed(1),
    label: "★ from 3,200 reviews",
  },
  {
    value: 190,
    formatter: (n) => `${n}+`,
    label: "countries represented",
  },
];

/**
 * Brief improvement #5: a credibility strip absent from the baseline
 * hero. Numbers count up once, on scroll into view, rather than
 * looping or re-triggering — a stat that keeps re-animating reads as
 * decoration rather than information.
 */
export function StatStrip() {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.6 });

  return (
    <div
      ref={ref}
      className="flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-ink-600 pt-6"
    >
      {STATS.map((stat) => (
        <div key={stat.label} className="flex flex-col">
          <span className="font-mono text-xl font-medium text-signal-500">
            <CountUp value={stat.value} formatter={stat.formatter} start={inView} />
          </span>
          <span className="text-xs text-paper-500">{stat.label}</span>
        </div>
      ))}
    </div>
  );
}
