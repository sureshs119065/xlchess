"use client";

import { useEffect, useRef, useState } from "react";

interface UseInViewOptions {
  /** Fraction of the element that must be visible to count as "in view". */
  threshold?: number;
  /** Only ever fire once — used for one-shot entrance/count-up animations. */
  once?: boolean;
}

/**
 * Thin IntersectionObserver wrapper. Kept dependency-free (no
 * react-intersection-observer) since the brief's own toolset already
 * covers this with Framer Motion's `whileInView`, but the stat strip's
 * count-up needs a raw boolean rather than a variant, so it lives here.
 */
export function useInView<T extends HTMLElement>({
  threshold = 0.4,
  once = true,
}: UseInViewOptions = {}) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, once]);

  return { ref, inView };
}
