import { motion } from "framer-motion";
import type { Variants } from "framer-motion";

interface HeroCopyProps {
  variants: Variants;
}

/**
 * Original copy inspired by the baseline site's structure (eyebrow →
 * headline → gradient sub-headline → description) but rewritten in
 * XLChess's own words, not reproduced verbatim, per the brief's
 * copyright note.
 */
export function HeroCopy({ variants }: HeroCopyProps) {
  return (
    <>
      <motion.p
        variants={variants}
        className="font-mono text-xs uppercase tracking-[0.2em] text-signal-500"
      >
        Live now · The Evergreen Game, 1852
      </motion.p>

      <motion.h1
        variants={variants}
        className="mt-4 text-balance font-display text-[2.75rem] font-semibold leading-[1.05] tracking-tight text-paper-100 sm:text-6xl"
      >
        Master every opening.
        <br />
        <span className="bg-gradient-to-r from-accent-400 to-signal-500 bg-clip-text text-transparent">
          Own every endgame.
        </span>
      </motion.h1>

      <motion.p variants={variants} className="mt-5 max-w-lg text-lg text-paper-300">
        A complete chess platform for players who take improvement seriously —
        structured lessons, ranked play, and a study bench that remembers
        every line you&rsquo;ve ever tried.
      </motion.p>
    </>
  );
}
