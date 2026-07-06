interface AutoplayControlsProps {
  isPlaying: boolean;
  isFinished: boolean;
  onToggle: () => void;
  onReplay: () => void;
}

/**
 * Explicit pause/play/replay control. Brief improvement #1: the
 * original autoplay runs with no manual control at all, which is an
 * accessibility gap for anyone who wants to read the board at their
 * own pace, not just a nice-to-have.
 */
export function AutoplayControls({
  isPlaying,
  isFinished,
  onToggle,
  onReplay,
}: AutoplayControlsProps) {
  if (isFinished) {
    return (
      <button
        type="button"
        onClick={onReplay}
        className="flex flex-1 items-center justify-center gap-2 rounded-md border border-ink-600 bg-ink-800/80 px-4 py-2 text-sm font-medium text-paper-100 transition-colors hover:border-accent-400 hover:text-accent-400"
      >
        <ReplayIcon />
        Watch replay
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={isPlaying}
      className="flex flex-1 items-center justify-center gap-2 rounded-md border border-ink-600 bg-ink-800/80 px-4 py-2 text-sm font-medium text-paper-100 transition-colors hover:border-accent-400 hover:text-accent-400"
    >
      {isPlaying ? <PauseIcon /> : <PlayIcon />}
      {isPlaying ? "Autoplay in progress" : "Paused — play"}
    </button>
  );
}

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
      <path d="M3 1.5v11l9-5.5-9-5.5Z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
      <rect x="3" y="2" width="3" height="10" />
      <rect x="8" y="2" width="3" height="10" />
    </svg>
  );
}

function ReplayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M12 7A5 5 0 1 1 10.6 3.4M12 1.5v3h-3"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
