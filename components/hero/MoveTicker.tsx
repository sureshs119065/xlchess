"use client";

import { useEffect, useRef } from "react";
import clsx from "clsx";
import type { PlaybackStep } from "@/lib/chess/types";

interface MoveTickerProps {
  steps: PlaybackStep[];
  currentIndex: number;
  title: string;
  players: string;
  year: number;
}

/**
 * The hero's signature element (per the design brief's "one memorable
 * thing" principle). Broadcast chess coverage — lichess, chess.com,
 * tournament overlays — always runs a live move list beside the board
 * in monospace notation. This borrows that real vernacular instead of
 * an invented stat card, and doubles as a second, denser way to
 * "watch" the game for anyone who prefers reading notation to
 * watching pieces move.
 */
export function MoveTicker({ steps, currentIndex, title, players, year }: MoveTickerProps) {
  const listRef = useRef<HTMLOListElement>(null);
  const activeRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    const list = listRef.current;
    const active = activeRef.current;
    if (!list || !active) return;

    // Deliberately NOT using `active.scrollIntoView()` here: that API
    // walks up every scrollable ancestor, including the page itself —
    // if the hero (and this ticker) has been scrolled out of the
    // viewport while the demo keeps autoplaying in the background,
    // scrollIntoView would yank the whole page back up to bring this
    // off-screen element into view. Computing the offset manually and
    // setting `list.scrollTop` directly confines the effect strictly
    // to this container, never the document.
    const listRect = list.getBoundingClientRect();
    const activeRect = active.getBoundingClientRect();

    if (activeRect.top < listRect.top) {
      list.scrollTop -= listRect.top - activeRect.top;
    } else if (activeRect.bottom > listRect.bottom) {
      list.scrollTop += activeRect.bottom - listRect.bottom;
    }
  }, [currentIndex]);

  return (
    <div className="flex max-h-[420px] flex-col self-start rounded-lg border border-ink-600 bg-ink-800/60">
      <div className="border-b border-ink-600 px-4 py-3">
        <p className="font-mono text-[11px] uppercase tracking-widest text-signal-500">
          {title}, {year}
        </p>
        <p className="mt-0.5 text-sm font-medium text-paper-300">{players}</p>
      </div>
      <ol
        ref={listRef}
        aria-label="Move list"
        className="grid auto-rows-min grid-cols-2 gap-x-2 gap-y-1 overflow-y-auto p-3 font-mono text-[13px]"
      >
        {steps.map((step, index) => {
          const isActive = index === currentIndex;
          const isPast = index < currentIndex;
          const showMoveNumber = step.color === "w";

          return (
            <li
              key={step.ply}
              ref={isActive ? activeRef : undefined}
              className={clsx(
                "flex items-baseline gap-1.5 rounded px-1.5 py-0.5 transition-colors",
                isActive && "bg-signal-subtle text-signal-500",
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
            </li>
          );
        })}
      </ol>
    </div>
  );
}
