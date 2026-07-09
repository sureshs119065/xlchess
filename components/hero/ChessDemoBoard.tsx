"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChessBoardSVG } from "@/components/chess/ChessBoardSVG";
import { MoveCounter } from "./MoveCounter";
import { AutoplayControls } from "./AutoplayControls";
import { MoveTicker } from "./MoveTicker";
import { FreePlayTicker } from "./FreePlayTicker";
import { usePgnPlayback } from "@/lib/chess/usePgnPlayback";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useInView } from "@/hooks/useInView";
import { getInitialFen, getInitialPieces } from "@/lib/chess/pgn";
import {
  describeGameEnd,
  legalTargets,
  sideToMove,
  tryMove,
  type FreePlayStep,
} from "@/lib/chess/manualPlay";
import type { BoardPiece, Square } from "@/lib/chess/types";
import { evergreenGame } from "@/lib/chess/games";
import { motion as motionTokens } from "@/styles/tokens";

const INITIAL_PIECES = getInitialPieces();
const INITIAL_FEN = getInitialFen();

/**
 * Free play now records its own move history rather than just holding
 * "the current position". `history` is append-only in the normal case;
 * `viewIndex` (-1 = the starting position free play began from) is
 * which position is currently displayed. Clicking an earlier move in
 * FreePlayTicker only moves `viewIndex` — it doesn't touch `history` —
 * so browsing back costs nothing. Only playing a *new* move while
 * `viewIndex` isn't at the end truncates `history` at that point
 * (see handleSquareActivate), the same "rewind and branch" behavior
 * a real analysis board gives you.
 */
interface ManualState {
  startFen: string;
  startPieces: BoardPiece[];
  startLastMove: { from: Square | null; to: Square | null };
  startStatus: string;
  history: FreePlayStep[];
  viewIndex: number;
  selected: Square | null;
  targets: Square[];
}

export function ChessDemoBoard() {
  const reducedMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const { ref: viewportRef, inView } = useInView<HTMLDivElement>({ threshold: 0.15, once: false });

  const [userPaused, setUserPaused] = useState(reducedMotion || isMobile);
  const [isHoverPaused, setIsHoverPaused] = useState(false);
  const [manual, setManual] = useState<ManualState | null>(null);

  const playback = usePgnPlayback({ game: evergreenGame, intervalMs: 1400, startPaused: true });
  const { steps, currentStep, currentIndex, movesRemaining, isPlaying, play, pause, skipToEnd, goToIndex, reset } =
    playback;

  const isFinished = currentIndex >= steps.length - 1;
  const shouldAutoplay = !userPaused && !isHoverPaused && !manual && inView && !isFinished;

  useEffect(() => {
    if (shouldAutoplay && !isPlaying) play();
    if (!shouldAutoplay && isPlaying) pause();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldAutoplay]);

  useEffect(() => {
    if (reducedMotion && currentIndex === -1) {
      skipToEnd();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  const demoPieces = currentStep ? currentStep.pieces : INITIAL_PIECES;
  const demoFen = currentStep ? currentStep.fen : INITIAL_FEN;
  const demoLastMove = { from: currentStep?.from ?? null, to: currentStep?.to ?? null };

  // Derived "what's actually on the board right now" for free play —
  // computed from history + viewIndex rather than stored redundantly,
  // so jumping the ticker (which only changes viewIndex) can never get
  // out of sync with what's displayed.
  // Looked up once here (with the undefined case collapsed to null),
  // rather than indexing manual.history[manual.viewIndex] repeatedly
  // below — TS can't prove that index is always in range on its own,
  // so this is also the single place that needs to know it is.
  const activeStep: FreePlayStep | null =
    manual && manual.viewIndex >= 0 ? (manual.history[manual.viewIndex] ?? null) : null;

  const viewFen = manual ? (activeStep ? activeStep.fen : manual.startFen) : demoFen;
  const viewPieces = manual ? (activeStep ? activeStep.pieces : manual.startPieces) : demoPieces;
  const viewLastMove = manual
    ? activeStep
      ? { from: activeStep.from, to: activeStep.to }
      : manual.startLastMove
    : demoLastMove;
  const viewStatus = manual ? (activeStep ? activeStep.status : manual.startStatus) : null;
  // Only the position actually being viewed can lock the board — if
  // you've rewound before the checkmate, moving from there is legal
  // again (that's the whole point of being able to branch).
  const viewIsGameOver = activeStep ? activeStep.isGameOver : false;
  const displayedPieces = viewPieces;
  const displayedLastMove = viewLastMove;

  function handleSquareActivate(square: Square) {
    if (manual && viewIsGameOver) return;

    const fen = viewFen;
    const pieces = viewPieces;
    const pieceAt = pieces.find((piece) => piece.square === square) ?? null;
    const turn = sideToMove(fen);
    const selected = manual?.selected ?? null;

    if (selected && selected === square) {
      setManual({ ...manual!, selected: null, targets: [] });
      return;
    }

    if (selected && (manual?.targets ?? []).includes(square)) {
      const result = tryMove(fen, selected, square);
      if (result) {
        const moverColor = turn; // whoever just moved, before the turn flips
        // Truncate at the current view point, not the end of history —
        // this is the "playing from a rewound position discards what
        // came after" branch behavior.
        const priorHistory = manual ? manual.history.slice(0, manual.viewIndex + 1) : [];
        const ply = priorHistory.length + 1;
        const moveNumber = Math.ceil(ply / 2);
        const status = result.isGameOver
          ? describeGameEnd(result.endReason, moverColor)
          : result.isCheck
            ? `Check — ${sideToMove(result.fen) === "w" ? "White" : "Black"} to move`
            : `${sideToMove(result.fen) === "w" ? "White" : "Black"} to move`;

        const newStep: FreePlayStep = {
          ply,
          moveNumber,
          color: moverColor,
          san: result.san,
          fen: result.fen,
          pieces: result.pieces,
          from: result.from,
          to: result.to,
          isCheck: result.isCheck,
          isGameOver: result.isGameOver,
          endReason: result.endReason,
          status,
        };

        const newHistory = [...priorHistory, newStep];

        setManual({
          ...(manual as ManualState),
          history: newHistory,
          viewIndex: newHistory.length - 1,
          selected: null,
          targets: [],
        });
      }
      return;
    }

    if (pieceAt && pieceAt.color === turn) {
      setManual(
        manual
          ? { ...manual, selected: square, targets: legalTargets(fen, square) }
          : {
              // First click of a fresh free-play session, started
              // mid-demo: the position free play begins from is
              // wherever the autoplay demo happened to be paused.
              startFen: demoFen,
              startPieces: demoPieces,
              startLastMove: demoLastMove,
              startStatus: `${turn === "w" ? "White" : "Black"} to move`,
              history: [],
              viewIndex: -1,
              selected: square,
              targets: legalTargets(fen, square),
            }
      );
      return;
    }

    if (manual) {
      setManual({ ...manual, selected: null, targets: [] });
    }
  }

  function exitFreePlay() {
    setManual(null);
  }

  function startFreshGame() {
    pause();
    setManual({
      startFen: INITIAL_FEN,
      startPieces: INITIAL_PIECES,
      startLastMove: { from: null, to: null },
      startStatus: "White to move",
      history: [],
      viewIndex: -1,
      selected: null,
      targets: [],
    });
  }

  function handleReplayClick() {
    setUserPaused(false);
    reset();
  }

  function handleSelectMove(index: number) {
    if (manual) setManual(null);
    setUserPaused(true);
    goToIndex(index);
  }

  /** Rewinds free play's own ticker to the position right after a
   *  given move — pure navigation, doesn't touch `history` itself. */
  function handleSelectFreePlayMove(index: number) {
    if (!manual) return;
    setManual({ ...manual, viewIndex: index, selected: null, targets: [] });
  }

  return (
    <div
      ref={viewportRef}
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
              onSquareActivate={
                isMobile
                  ? undefined
                  : (square) => {
                      if (!manual) pause();
                      handleSquareActivate(square);
                    }
              }
            />
          </div>
          <p aria-live="polite" className="sr-only">
            {manual ? viewStatus : (currentStep?.label ?? "Starting position")}
          </p>
        </motion.div>

        <div>
          {manual ? (
            <FreePlayTicker
              history={manual.history}
              viewIndex={manual.viewIndex}
              onSelectMove={handleSelectFreePlayMove}
            />
          ) : (
            <MoveTicker
              steps={steps}
              currentIndex={currentIndex}
              title={evergreenGame.title}
              players={evergreenGame.players}
              year={evergreenGame.year}
              onSelectMove={handleSelectMove}
            />
          )}
        </div>
      </div>

      {!isMobile ? (
        <div className="flex items-center gap-3">
          {manual ? (
            <>
              <div
                aria-live="polite"
                className="flex flex-1 items-center justify-center gap-2 rounded-md border border-signal-500/40 bg-signal-subtle px-4 py-2 text-sm font-medium text-signal-500"
              >
                {viewStatus}
              </div>
              <button
                type="button"
                onClick={startFreshGame}
                className="rounded-md border border-ink-600 bg-ink-800/80 px-4 py-2 text-sm font-medium text-paper-100 transition-colors hover:border-accent-400 hover:text-accent-400"
              >
                New game
              </button>
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
                isPlaying={isPlaying}
                isFinished={isFinished}
                onToggle={() => setUserPaused((prev) => !prev)}
                onReplay={handleReplayClick}
              />
              <MoveCounter movesRemaining={movesRemaining} isFinished={isFinished} />
            </>
          )}
        </div>
      ) : (
        <p className="text-center font-mono text-xs text-paper-500">
          {evergreenGame.title} — {evergreenGame.players}, {evergreenGame.year}. Tap any move
          above to jump to that position. Making your own moves is available on desktop.
        </p>
      )}

      {!isMobile && !manual && (
        <p className="text-center text-xs text-paper-500">
          Click any piece to pause the demo and try your own move, or{" "}
          <button
            type="button"
            onClick={startFreshGame}
            className="text-paper-300 underline decoration-ink-600 decoration-2 underline-offset-2 transition-colors hover:text-paper-100 hover:decoration-accent-400"
          >
            play a two-player game
          </button>{" "}
          from the start.
        </p>
      )}
    </div>
  );
}