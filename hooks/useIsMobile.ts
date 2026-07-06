"use client";

import { useEffect, useState } from "react";
import { breakpoints } from "@/styles/tokens";

/**
 * Reports whether the viewport is below the `md` breakpoint (768px).
 * Used to gate the full interactive board demo — below this width we
 * render a simplified, read-only preview instead (see brief item 8).
 *
 * Defaults to `false` on the server so SSR output matches desktop
 * markup; the real value settles on mount before paint-affecting
 * layout runs, and the board's fixed aspect-ratio box prevents any
 * layout shift while that settles (see brief performance targets).
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(`(max-width: ${breakpoints.md - 1}px)`);
    setIsMobile(query.matches);

    const handleChange = (event: MediaQueryListEvent) => setIsMobile(event.matches);
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  return isMobile;
}
