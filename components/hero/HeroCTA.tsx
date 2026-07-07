"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { KNIGHT_ICON_PATH } from "@/lib/knightPath";

const MAX_TILT_DEG = 6;

interface HeroCTAProps {
  href: string;
  children: React.ReactNode;
}

/**
 * Brief improvement #4: a subtle 3D tilt that tracks the pointer,
 * capped at ~6deg so it reads as "responsive" rather than gimmicky.
 * Disabled entirely on touch devices (no meaningful pointer position)
 * and under reduced-motion (a tilt is still motion).
 */
export function HeroCTA({ href, children }: HeroCTAProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const reducedMotion = useReducedMotion();

  const handlePointerMove = (event: React.PointerEvent<HTMLAnchorElement>) => {
    if (event.pointerType === "touch" || reducedMotion || !ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const relativeX = (event.clientX - rect.left) / rect.width - 0.5;
    const relativeY = (event.clientY - rect.top) / rect.height - 0.5;

    setTilt({
      x: relativeY * -MAX_TILT_DEG * 2,
      y: relativeX * MAX_TILT_DEG * 2,
    });
  };

  const resetTilt = () => setTilt({ x: 0, y: 0 });

  return (
    <motion.a
      ref={ref}
      href={href}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetTilt}
      onBlur={resetTilt}
      animate={{ rotateX: tilt.x, rotateY: tilt.y }}
      transition={{ type: "spring", stiffness: 260, damping: 20, mass: 0.5 }}
      style={{ transformStyle: "preserve-3d" }}
      className="group inline-flex items-center gap-2.5 rounded-md bg-accent-500 px-6 py-3.5 text-[15px] font-semibold text-paper-100 shadow-cta transition-colors hover:bg-accent-400 focus-visible:bg-accent-400"
    >
      <KnightIcon />
      {children}
    </motion.a>
  );
}

function KnightIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className="shrink-0"
    >
      <path d={KNIGHT_ICON_PATH} />
    </svg>
  );
}
