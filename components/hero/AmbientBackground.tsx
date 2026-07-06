/**
 * Brief improvement #6. Pure CSS, transform/opacity only, so it never
 * triggers layout — the two blurred divs "drift" via the `drift`
 * keyframe defined in tailwind.config.ts, and the knight silhouette is
 * a single inline SVG at low opacity. Marked aria-hidden since it's
 * decorative and communicates nothing to assistive tech.
 */
export function AmbientBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="animate-drift absolute -left-24 -top-24 h-[420px] w-[420px] rounded-full bg-accent-500/10 blur-[110px] will-change-transform" />
      <div
        className="absolute -right-32 top-1/3 h-[380px] w-[380px] rounded-full bg-signal-500/[0.06] blur-[110px] will-change-transform"
        style={{ animation: "drift 22s ease-in-out infinite reverse" }}
      />
      <svg
        className="absolute -bottom-10 right-[8%] h-64 w-64 opacity-[0.04] sm:h-80 sm:w-80"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path
          d="M19 21H5v-2h1v-1.5c0-1.4.7-2.6 1.8-3.4L9 13V9c0-2.8 2.2-5 5-5 .6 0 1.1.4 1.2 1l1.6 6.5c.3 1.2-.2 2.4-1.2 3.1l-2.1 1.5c-.6.4-.9 1-.9 1.7V19h1v2h5v0Zm-8-9.5c.6 0 1-.4 1-1s-.4-1-1-1-1 .4-1 1 .4 1 1 1Z"
          className="text-paper-100"
        />
      </svg>
    </div>
  );
}
