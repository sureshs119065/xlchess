export function KnightSceneSkeleton() {
  return (
    <div
      className="aspect-[4/5] w-full overflow-hidden rounded-lg border border-ink-600 bg-ink-800"
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
