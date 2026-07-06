/**
 * Design tokens — single source of truth.
 *
 * These values are consumed by tailwind.config.ts so that no component
 * ever hardcodes a hex value, an arbitrary pixel figure, or a magic
 * animation duration. If a design decision needs to change, it changes
 * here once.
 *
 * Palette rationale (see README "Design decisions"):
 * - bg/ink   : near-black indigo, deeper than the source site's navy so
 *              the board and accent colors read with more contrast.
 * - accent   : the brand indigo/purple from the baseline site, kept as
 *              the primary interactive color (CTAs, links, focus rings).
 * - signal   : a warm brass/gold used ONLY for the live/notation signature
 *              element and count-up stats — a single deliberate accent
 *              borrowed from tournament chess clocks and brass plaques,
 *              never mixed into body UI so it stays meaningful.
 * - board    : board squares are tinted to the brand palette instead of
 *              the generic felt-green/cream pairing, so the demo reads
 *              as "XLChess" rather than "generic chess widget."
 */

export const colors = {
  ink: {
    950: "#07091420", // overlay tint, not a solid color
    900: "#0A0D19",
    800: "#12162A",
    700: "#1B2038",
    600: "#262C4C",
  },
  paper: {
    100: "#F5F6FA",
    300: "#C7CAE0",
    500: "#8B90A8",
  },
  accent: {
    500: "#6D5DFC",
    400: "#8B7DFF",
    600: "#5546DB",
    subtle: "#6D5DFC1A",
  },
  signal: {
    500: "#E8B95B",
    400: "#F2CE85",
    subtle: "#E8B95B1A",
  },
  board: {
    light: "#E8E6DC",
    dark: "#454C74",
    highlight: "#E8B95B66",
    lastMove: "#6D5DFC4D",
  },
  state: {
    success: "#4ADE80",
    danger: "#F87171",
  },
} as const;

export const radii = {
  sm: "0.375rem",
  md: "0.75rem",
  lg: "1.25rem",
  xl: "1.75rem",
  full: "9999px",
} as const;

export const shadows = {
  card: "0 20px 60px -20px rgba(7, 9, 20, 0.65)",
  cta: "0 12px 30px -10px rgba(109, 93, 252, 0.55)",
  ring: "0 0 0 3px rgba(109, 93, 252, 0.45)",
} as const;

export const spacing = {
  gutter: "1.5rem",
  section: "6rem",
  heroGap: "4rem",
} as const;

export const motion = {
  stagger: 0.08, // seconds — the ~80ms entrance stagger called for in the brief
  ease: [0.16, 1, 0.3, 1] as const, // "easeOut"-style custom bezier
  fast: 0.18,
  base: 0.4,
  slow: 0.8,
} as const;

export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

export const fonts = {
  display: "var(--font-display)",
  body: "var(--font-body)",
  mono: "var(--font-mono)",
} as const;
