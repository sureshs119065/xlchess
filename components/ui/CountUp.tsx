"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface CountUpProps {
  value: number;
  durationMs?: number;
  formatter?: (value: number) => string;
  start: boolean;
}

/**
 * Animates from 0 to `value` once `start` flips true (driven by
 * `useInView` in the parent). A raw requestAnimationFrame loop rather
 * than a library dependency, since this is the only place in the app
 * that needs frame-stepped numeric interpolation.
 */
export function CountUp({ value, durationMs = 1400, formatter, start }: CountUpProps) {
  const [display, setDisplay] = useState(0);
  const reducedMotion = useReducedMotion();
  const frameRef = useRef<number>();

  useEffect(() => {
    if (!start) return;

    if (reducedMotion) {
      setDisplay(value);
      return;
    }

    const startTime = performance.now();

    const step = (now: number) => {
      const progress = Math.min((now - startTime) / durationMs, 1);
      // Ease-out cubic — matches the entrance choreography easing elsewhere.
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
      }
    };

    frameRef.current = requestAnimationFrame(step);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [start, value, durationMs, reducedMotion]);

  return <span className="tabular-nums">{formatter ? formatter(display) : display}</span>;
}
