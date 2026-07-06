"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function ScrollCue({ targetId }: { targetId: string }) {
  const reducedMotion = useReducedMotion();

  return (
    <a
      href={`#${targetId}`}
      aria-label="Scroll to the next section"
      className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-paper-500 transition-colors hover:text-paper-100 sm:flex"
    >
      <span className="font-mono text-[10px] uppercase tracking-widest">Scroll</span>
      <motion.svg
        width="16"
        height="10"
        viewBox="0 0 16 10"
        fill="none"
        aria-hidden="true"
        animate={reducedMotion ? {} : { y: [0, 5, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <path d="M1 1l7 7 7-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </motion.svg>
    </a>
  );
}
