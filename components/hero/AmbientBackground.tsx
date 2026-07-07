"use client";

import dynamic from "next/dynamic";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useReducedMotion } from "@/hooks/useReducedMotion";

// The 3D piece pulls in Three.js — code-split and client-only so it
// never competes with the headline text for the LCP paint budget (same
// pattern as the chess demo board in HeroSection).
const Queen3D = dynamic(() => import("@/components/three/Queen3D").then((mod) => mod.Queen3D), {
  ssr: false,
});

/**
 * Brief improvement #6, upgraded: the brief calls for a faint drifting
 * knight/pawn silhouette. This renders a lathed, idle-rotating 3D white
 * queen instead of a flat silhouette — same "ambient chess piece" idea,
 * more presence, still purely decorative and GPU-composited.
 *
 * Mobile gets a flat Unicode queen glyph instead of a WebGL context: a
 * spinning 3D piece is a poor trade against battery and thermal budget
 * on a phone for something purely ambient.
 */
export function AmbientBackground() {
  const isMobile = useIsMobile();
  const reducedMotion = useReducedMotion();

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="animate-drift absolute -left-24 -top-24 h-[420px] w-[420px] rounded-full bg-accent-500/10 blur-[110px] will-change-transform" />
      <div
        className="absolute -right-32 top-1/3 h-[380px] w-[380px] rounded-full bg-signal-500/[0.06] blur-[110px] will-change-transform"
        style={{ animation: "drift 22s ease-in-out infinite reverse" }}
      />

      {isMobile ? (
        <span
          className="absolute -bottom-16 right-[6%] font-serif text-[13rem] leading-none text-paper-100 opacity-[0.05]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          ♕
        </span>
      ) : (
        <Queen3D
          reducedMotion={reducedMotion}
          className="absolute -bottom-16 right-[4%] h-72 w-72 opacity-[0.16] lg:h-96 lg:w-96"
        />
      )}
    </div>
  );
}
