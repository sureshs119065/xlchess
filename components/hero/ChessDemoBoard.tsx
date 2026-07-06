"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChessBoardSVG } from "@/components/chess/ChessBoardSVG";
import { MoveCounter } from "./MoveCounter";
import { AutoplayControls } from "./AutoplayControls";
import { MoveTicker } from "./MoveTicker";
import { usePgnPlayback } from "@/lib/chess/usePgnPlayback";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useIsMobile } from "@/hooks/useIsMobile";
import { getInitialFen, getInitialPieces } from "@/lib/chess/pgn";
import { legalTargets, sideToMove, tryMove } from "@/lib/chess/manualPlay";
import type { BoardPiece, Square } from "@/lib/chess/types";
import { evergreenGame } from "@/lib/chess/games";
import { motion as motionTokens } from "@/styles/tokens";

const INITIAL_PIECES = getInitialPieces();
const INITIAL_FEN = getInitialFen();

interface ManualState {
  fen: string;
  pieces: BoardPiece[];
  lastMove: { from: Square | null; to: Square | null };
  selected: Square | null;
  targets: Square[];
  status: string | null;
}

/**
 * Live demo board for the hero. Owns:
 * - hover/focus pause (brief improvement #1)
 * - the reduced-motion fallback: a static final position + "Watch
 *   replay" button instead of autoplay (brief improvement #2)
 * - the mobile simplification to a read-only preview ≥768px gate
 *   (brief improvement #8)
 * - free-play: clicking any piece pauses the demo and hands the board
 *   over to the user, who can then make their own legal moves from
 *   that position (chess.js validates every move; illegal clicks are
 *   silently ignored rather than throwing).
 */
export function ChessDemoBoard() {
  const reducedMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const [isHoverPaused, setIsHoverPaused] = useState(false);
  const [manual, setManual] = useState<ManualState | null>(null);

  const playback = usePgnPlayback({
    game: evergreenGame,
    intervalMs: 1400,
    startPaused: reducedMotion || isMobile,
  });

  const { steps, currentStep, currentIndex, movesRemaining, isPlaying, pause, toggle, skipToEnd, reset } =
    playback;

  const isFinished = currentIndex >= steps.length - 1;
  const effectivelyPlaying = isPlaying && !isHoverPaused && !manual;

  // Reduced-motion users get the finished position immediately, with a
  // manual replay control, rather than motion they didn't ask for.
  useEffect(() => {
    if (reducedMotion && currentIndex === -1) {
      skipToEnd();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  const demoPieces = currentStep ? currentStep.pieces : INITIAL_PIECES;
  const demoFen = currentStep ? currentStep.fen : INITIAL_FEN;
  const demoLastMove = { from: currentStep?.from ?? null, to: currentStep?.to ?? null };

  const displayedPieces = manual ? manual.pieces : demoPieces;
  const displayedLastMove = manual ? manual.lastMove : demoLastMove;

  function handleSquareActivate(square: Square) {
    const fen = manual ? manual.fen : demoFen;
    const pieces = manual ? manual.pieces : demoPieces;
    const pieceAt = pieces.find((piece) => piece.square === square) ?? null;
    const turn = sideToMove(fen);

    // First interaction of the session: pause the running demo and
    // hand control to the user from wherever the board currently sits.
    if (!manual) {
      pause();
    }

    const selected = manual?.selected ?? null;

    // Clicking the already-selected square deselects it.
    if (selected && selected === square) {
      setManual({ ...manual!, selected: null, targets: [] });
      return;
    }

    // Clicking a legal destination completes the move.
    if (selected && (manual?.targets ?? []).includes(square)) {
      const result = tryMove(fen, selected, square);
      if (result) {
        setManual({
          fen: result.fen,
          pieces: result.pieces,
          lastMove: { from: result.from, to: result.to },
          selected: null,
          targets: [],
          status: result.isCheckmate
            ? "Checkmate"
            : result.isCheck
              ? "Check"
              : `${sideToMove(result.fen) === "w" ? "White" : "Black"} to move`,
        });
      }
      return;
    }

    // Otherwise, select a square only if it holds a piece belonging to
    // the side whose turn it is — matches normal chess rules and avoids
    // dead-end selections that can never produce a legal move.
    if (pieceAt && pieceAt.color === turn) {
      setManual({
        fen,
        pieces,
        lastMove: manual?.lastMove ?? demoLastMove,
        selected: square,
        targets: legalTargets(fen, square),
        status: manual?.status ?? `${turn === "w" ? "White" : "Black"} to move`,
      });
      return;
    }

    // Clicked an empty square or an opponent piece with nothing selected — no-op.
    if (manual) {
      setManual({ ...manual, selected: null, targets: [] });
    }
  }

  function exitFreePlay() {
    setManual(null);
  }

  return (
    <div
      className="flex flex-col gap-4"
      onMouseEnter={() => setIsHoverPaused(true)}
      onMouseLeave={() => setIsHoverPaused(false)}
      onFocus={() => setIsHoverPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
          setIsHoverPaused(false);
        }
      }}
    >
      <div className="grid gap-4 sm:grid-cols-[1fr] lg:grid-cols-[minmax(0,1fr)_180px]">
        <motion.div
          initial={false}
          animate={currentStep?.isFinal && !manual ? { scale: [1, 1.015, 1] } : {}}
          transition={{ duration: motionTokens.base }}
          className="overflow-hidden rounded-lg border border-ink-600 bg-ink-800 p-2 shadow-card"
        >
          <div className="aspect-square w-full">
            <ChessBoardSVG
              pieces={displayedPieces}
              lastMove={displayedLastMove}
              interactive={!isMobile}
              selectedSquare={manual?.selected ?? null}
              legalTargets={manual?.targets ?? []}
              onSquareActivate={isMobile ? undefined : handleSquareActivate}
            />
          </div>
          <p aria-live="polite" className="sr-only">
            {manual?.status ?? currentStep?.label ?? "Starting position"}
          </p>
        </motion.div>

        {!isMobile && (
          <div className="hidden lg:block">
            <MoveTicker
              steps={steps}
              currentIndex={currentIndex}
              title={evergreenGame.title}
              players={evergreenGame.players}
              year={evergreenGame.year}
            />
          </div>
        )}
      </div>

      {!isMobile ? (
        <div className="flex items-center gap-3">
          {manual ? (
            <>
              <div
                aria-live="polite"
                className="flex flex-1 items-center justify-center gap-2 rounded-md border border-signal-500/40 bg-signal-subtle px-4 py-2 text-sm font-medium text-signal-500"
              >
                {manual.status}
              </div>
              <button
                type="button"
                onClick={exitFreePlay}
                className="rounded-md border border-ink-600 bg-ink-800/80 px-4 py-2 text-sm font-medium text-paper-100 transition-colors hover:border-accent-400 hover:text-accent-400"
              >
                Back to demo
              </button>
            </>
          ) : (
            <>
              <AutoplayControls
                isPlaying={effectivelyPlaying}
                isFinished={isFinished}
                onToggle={toggle}
                onReplay={reset}
              />
              <MoveCounter movesRemaining={movesRemaining} isFinished={isFinished} />
            </>
          )}
        </div>
      ) : (
        <p className="text-center font-mono text-xs text-paper-500">
          {evergreenGame.title} — {evergreenGame.players}, {evergreenGame.year}. Full interactive
          replay and move-making available on desktop.
        </p>
      )}

      {!isMobile && !manual && (
        <p className="text-center text-xs text-paper-500">
          Click any piece to pause the demo and try your own move.
        </p>
      )}
    </div>
  );
}
