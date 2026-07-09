"use client";

import { useEffect, useRef } from "react";
import clsx from "clsx";
import type { FreePlayStep } from "@/lib/chess/manualPlay";

interface FreePlayTickerProps {
  history: FreePlayStep[];
  /** -1 = the position free play started from, before any moves. */
  viewIndex: number;
  /** Fired when a move is clicked — rewinds the board to right after it. */
  onSelectMove: (index: number) => void;
}

/**
 * Free play's own version of MoveTicker. Same broadcast-notation look
 * and the same "click a move to jump there" interaction, but fed by
 * moves the user is actually making rather than a recorded PGN. It
 * replaces the old static "Free play — notation doesn't apply" panel,
 * since once free play records its own moves, notation applies just
 * fine — it just needs its own list instead of the demo game's.
 *
 * Jumping to an earlier move doesn't delete later ones by itself —
 * only playing a *new* move from that earlier position does (handled
 * in ChessDemoBoard, which truncates `history` at that point). This
 * matches how a real PGN viewer / analysis board lets you rewind and
 * look without losing anything until you actually deviate.
 */
export function FreePlayTicker({ history, viewIndex, onSelectMove }: FreePlayTickerProps) {
  const listRef = useRef<HTMLOListElement>(null);
  const activeRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    const list = listRef.current;
    const active = activeRef.current;
    if (!list || !active) return;

    // Same manual-offset scroll as MoveTicker — never scrollIntoView,
    // never touches anything outside this list.
    const listRect = list.getBoundingClientRect();
    const activeRect = active.getBoundingClientRect();

    if (activeRect.top < listRect.top) {
      list.scrollTop -= listRect.top - activeRect.top;
    } else if (activeRect.bottom > listRect.bottom) {
      list.scrollTop += activeRect.bottom - listRect.bottom;
    }
  }, [viewIndex]);

  return (
    <div className="flex h-full max-h-[420px] flex-col self-start rounded-lg border border-signal-500/30 bg-ink-800/60">
      <div className="border-b border-ink-600 px-4 py-3">
        <p className="font-mono text-[11px] uppercase tracking-widest text-signal-500">
          Free play
        </p>
        <p className="mt-0.5 text-sm font-medium text-paper-300">
          {history.length === 0 ? "Make a move to begin" : "Your game so far"}
        </p>
      </div>

      {history.length === 0 ? (
        <p className="flex flex-1 items-center p-4 text-center text-xs text-paper-500">
          Moves you make will show up here — click any of them later to jump back to that
          position.
        </p>
      ) : (
        <ol
          ref={listRef}
          aria-label="Free play move list"
          className="grid max-h-[260px] auto-rows-min grid-cols-3 gap-x-2 gap-y-1 overflow-y-auto p-3 font-mono text-[13px] sm:max-h-[340px] lg:max-h-[360px] lg:grid-cols-2"
        >
          {history.map((step, index) => {
            const isActive = index === viewIndex;
            const isPast = index < viewIndex;
            const showMoveNumber = step.color === "w";

            return (
              <li key={step.ply} ref={isActive ? activeRef : undefined}>
                <button
                  type="button"
                  onClick={() => onSelectMove(index)}
                  aria-current={isActive ? "step" : undefined}
                  aria-label={`Jump to move ${step.moveNumber}, ${
                    step.color === "w" ? "White" : "Black"
                  } ${step.san}`}
                  className={clsx(
                    "flex w-full items-baseline gap-1.5 rounded px-1.5 py-0.5 text-left transition-colors",
                    "hover:bg-ink-600/60",
                    isActive && "bg-signal-subtle text-signal-500 hover:bg-signal-subtle",
                    !isActive && isPast && "text-paper-300",
                    !isActive && !isPast && "text-paper-500"
                  )}
                >
                  {showMoveNumber && (
                    <span className="text-paper-500" aria-hidden="true">
                      {step.moveNumber}.
                    </span>
                  )}
                  <span>{step.san}</span>
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}