"use client";

import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { motion as motionTokens } from "@/styles/tokens";

interface RevealOnScrollProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "li";
}

const variants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

/**
 * One-shot fade-and-rise triggered when the element scrolls into view.
 * Used by every section below the hero so entrances feel consistent
 * without each section re-implementing its own IntersectionObserver.
 */
export function RevealOnScroll({ children, className, delay = 0, as = "div" }: RevealOnScrollProps) {
  const reducedMotion = useReducedMotion();
  const MotionTag = as === "li" ? motion.li : motion.div;

  return (
    <MotionTag
      className={className}
      initial={reducedMotion ? "visible" : "hidden"}
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={variants}
      transition={{ duration: motionTokens.slow, ease: motionTokens.ease, delay }}
    >
      {children}
    </MotionTag>
  );
}
