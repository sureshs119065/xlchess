interface MoveCounterProps {
  movesRemaining: number;
  isFinished: boolean;
}

export function MoveCounter({ movesRemaining, isFinished }: MoveCounterProps) {
  return (
    <div
      className="flex flex-col items-center rounded-md border border-ink-600 bg-ink-800/80 px-4 py-2 font-mono"
      aria-live="polite"
    >
      <span className="text-lg font-medium leading-none text-paper-100">
        {isFinished ? "0" : movesRemaining}
      </span>
      <span className="mt-1 text-[10px] uppercase tracking-wider text-paper-500">
        {isFinished ? "complete" : "moves left"}
      </span>
    </div>
  );
}
