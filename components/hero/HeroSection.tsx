"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { HeroCopy } from "./HeroCopy";
import { HeroCTA } from "./HeroCTA";
import { StatStrip } from "./StatStrip";
import { AmbientBackground } from "./AmbientBackground";
import { BoardSkeleton } from "./BoardSkeleton";
import { ScrollCue } from "./ScrollCue";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { motion as motionTokens } from "@/styles/tokens";

// Code-split per the brief's performance target: the chess engine and
// board (chess.js + SVG rendering) never block the hero text's LCP
// paint. `ssr: false` because the board's interactivity (hover-pause,
// interval-driven playback) only makes sense once mounted client-side.
const ChessDemoBoard = dynamic(
  () => import("./ChessDemoBoard").then((mod) => mod.ChessDemoBoard),
  { ssr: false, loading: () => <BoardSkeleton /> }
);

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: motionTokens.stagger, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: motionTokens.slow, ease: motionTokens.ease },
  },
};

export function HeroSection() {
  const reducedMotion = useReducedMotion();

  return (
    <section
      aria-label="Hero"
      className="relative overflow-hidden border-b border-ink-700 pb-20 pt-8"
    >
      <AmbientBackground />

      <div className="relative mx-auto grid max-w-container gap-12 px-6 pt-12 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-10 lg:pt-20">
        <motion.div
          initial={reducedMotion ? "visible" : "hidden"}
          animate="visible"
          variants={containerVariants}
        >
          <HeroCopy variants={itemVariants} />

          <motion.div variants={itemVariants} className="mt-8 flex flex-wrap items-center gap-4">
            <HeroCTA href="/play">Play now</HeroCTA>
            <a
              href="#how-it-works"
              className="text-sm font-medium text-paper-300 underline decoration-ink-600 decoration-2 underline-offset-4 transition-colors hover:text-paper-100 hover:decoration-accent-400"
            >
              Watch how it works
            </a>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-10">
            <StatStrip />
          </motion.div>
        </motion.div>

        <motion.div
          initial={reducedMotion ? "visible" : "hidden"}
          animate="visible"
          variants={itemVariants}
          transition={{ duration: motionTokens.slow, ease: motionTokens.ease, delay: 0.24 }}
        >
          <ChessDemoBoard />
        </motion.div>
      </div>

      <ScrollCue targetId="how-it-works" />
    </section>
  );
}
