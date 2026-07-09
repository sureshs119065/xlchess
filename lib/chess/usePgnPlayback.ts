"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { GameRecord, PlaybackStep } from "./types";
import { buildPlayback } from "./pgn";

interface UsePgnPlaybackOptions {
  game: GameRecord;
  /** Milliseconds between moves during autoplay. */
  intervalMs?: number;
  /** Starts paused — used when the user prefers reduced motion. */
  startPaused?: boolean;
}

interface UsePgnPlaybackResult {
  steps: PlaybackStep[];
  currentStep: PlaybackStep | null;
  currentIndex: number;
  movesRemaining: number;
  isPlaying: boolean;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  /** Jumps straight to the final position — used for the reduced-motion fallback. */
  skipToEnd: () => void;
  /** Jumps to an arbitrary ply (e.g. clicking a move in the notation ticker), pausing playback. */
  goToIndex: (index: number) => void;
  reset: () => void;
}

/**
 * Drives move-by-move playback on an interval. Deliberately has no
 * knowledge of hover/focus/visibility — that's UI state that belongs
 * to the component consuming this hook (see ChessDemoBoard), so this
 * stays reusable for a scrubber, a "step forward" button, or a future
 * live-game feed.
 */
export function usePgnPlayback({
  game,
  intervalMs = 1400,
  startPaused = false,
}: UsePgnPlaybackOptions): UsePgnPlaybackResult {
  const steps = useMemo(() => buildPlayback(game), [game]);
  const [currentIndex, setCurrentIndex] = useState(-1); // -1 = starting position
  const [isPlaying, setIsPlaying] = useState(!startPaused);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isPlaying) {
      clearTimer();
      return;
    }

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = prev + 1;
        if (next >= steps.length - 1) {
          clearTimer();
          setIsPlaying(false);
          return steps.length - 1;
        }
        return next;
      });
    }, intervalMs);

    // Cleared on every dependency change AND on unmount — required by
    // the brief's performance checklist (item 10).
    return clearTimer;
  }, [isPlaying, intervalMs, steps.length, clearTimer]);

  const play = useCallback(() => {
    setCurrentIndex((prev) => (prev >= steps.length - 1 ? -1 : prev));
    setIsPlaying(true);
  }, [steps.length]);

  const pause = useCallback(() => setIsPlaying(false), []);
  const toggle = useCallback(() => setIsPlaying((prev) => !prev), []);

  const skipToEnd = useCallback(() => {
    clearTimer();
    setIsPlaying(false);
    setCurrentIndex(steps.length - 1);
  }, [clearTimer, steps.length]);

  const goToIndex = useCallback(
    (index: number) => {
      clearTimer();
      setIsPlaying(false);
      setCurrentIndex(Math.max(-1, Math.min(index, steps.length - 1)));
    },
    [clearTimer, steps.length]
  );

  const reset = useCallback(() => {
    clearTimer();
    setCurrentIndex(-1);
    setIsPlaying(!startPaused);
  }, [clearTimer, startPaused]);

  const currentStep = currentIndex >= 0 ? steps[currentIndex] ?? null : null;
  const movesRemaining = Math.max(steps.length - 1 - currentIndex, 0);

  return {
    steps,
    currentStep,
    currentIndex,
    movesRemaining,
    isPlaying,
    play,
    pause,
    toggle,
    skipToEnd,
    goToIndex,
    reset,
  };
}
