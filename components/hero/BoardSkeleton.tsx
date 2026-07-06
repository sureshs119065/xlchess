/**
 * Fixed aspect-ratio placeholder shown while the code-split chess demo
 * (chess.js + ChessBoardSVG) hydrates. Reserves the exact box the real
 * board will occupy so there's no layout shift on hydration — required
 * by the brief's "No CLS" performance target.
 */
export function BoardSkeleton() {
  return (
    <div
      className="aspect-square w-full overflow-hidden rounded-lg bg-ink-700"
      role="presentation"
      aria-hidden="true"
    >
      <div
        className="h-full w-full animate-shimmer bg-[length:200%_100%]"
        style={{
          backgroundImage:
            "linear-gradient(110deg, transparent 40%, rgba(139,125,255,0.14) 50%, transparent 60%)",
        }}
      />
    </div>
  );
}
