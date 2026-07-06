"use client";

import { useState } from "react";
import clsx from "clsx";
import type { BoardPiece, Square } from "@/lib/chess/types";

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;
const RANKS = [8, 7, 6, 5, 4, 3, 2, 1] as const; // top-to-bottom, White's perspective
const CELL = 64;
const BOARD_SIZE = CELL * 8;

const PIECE_LABELS: Record<BoardPiece["type"], string> = {
  p: "pawn",
  n: "knight",
  b: "bishop",
  r: "rook",
  q: "queen",
  k: "king",
};

/**
 * Unicode chess glyphs, rendered as SVG <text>. Chosen over per-piece
 * PNG/SVG sprite assets per the brief's performance note: no image
 * requests, trivially recolorable via `fill`, and crisp at any board
 * size without a spritesheet.
 */
const PIECE_GLYPHS: Record<BoardPiece["type"], string> = {
  p: "♟",
  n: "♞",
  b: "♝",
  r: "♜",
  q: "♛",
  k: "♚",
};

interface ChessBoardSVGProps {
  pieces: BoardPiece[];
  lastMove?: { from: Square | null; to: Square | null };
  /** Read-only disables tab-stops on squares — used for the mobile preview. */
  interactive?: boolean;
  className?: string;
  /** Currently-selected square in free-play mode, if any. */
  selectedSquare?: Square | null;
  /** Legal destination squares for the selected piece, if any. */
  legalTargets?: Square[];
  /** Fired when a square is clicked or activated via Enter/Space — omit to keep the board display-only. */
  onSquareActivate?: (square: Square) => void;
}

export function ChessBoardSVG({
  pieces,
  lastMove,
  interactive = true,
  className,
  selectedSquare = null,
  legalTargets = [],
  onSquareActivate,
}: ChessBoardSVGProps) {
  const [focusedSquare, setFocusedSquare] = useState<string | null>(null);
  const pieceBySquare = new Map(pieces.map((piece) => [piece.square, piece]));
  const legalTargetSet = new Set(legalTargets);

  return (
    <svg
      viewBox={`0 0 ${BOARD_SIZE} ${BOARD_SIZE}`}
      className={clsx("h-full w-full", className)}
      role="group"
      aria-label="Chess board, White's perspective"
    >
      {RANKS.map((rank, rowIndex) =>
        FILES.map((file, colIndex) => {
          const square = `${file}${rank}` as Square;
          const isLight = (rowIndex + colIndex) % 2 === 0;
          const piece = pieceBySquare.get(square);
          const isLastMoveSquare = square === lastMove?.from || square === lastMove?.to;
          const isSelected = square === selectedSquare;
          const isLegalTarget = legalTargetSet.has(square);
          const x = colIndex * CELL;
          const y = rowIndex * CELL;

          const pieceLabel = piece
            ? `${square}, ${piece.color === "w" ? "white" : "black"} ${PIECE_LABELS[piece.type]}`
            : `${square}, empty`;

          const activate = () => onSquareActivate?.(square);

          return (
            <g
              key={square}
              role={interactive ? "button" : undefined}
              tabIndex={interactive ? 0 : undefined}
              aria-label={pieceLabel}
              aria-pressed={onSquareActivate ? isSelected : undefined}
              onFocus={() => setFocusedSquare(square)}
              onBlur={() => setFocusedSquare((prev) => (prev === square ? null : prev))}
              onClick={interactive ? activate : undefined}
              onKeyDown={
                interactive
                  ? (event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        activate();
                      }
                    }
                  : undefined
              }
              className={clsx(
                "outline-none",
                interactive && onSquareActivate ? "cursor-pointer" : "cursor-default"
              )}
            >
              <rect
                x={x}
                y={y}
                width={CELL}
                height={CELL}
                fill={isLight ? "var(--board-light, #E8E6DC)" : "var(--board-dark, #454C74)"}
              />
              {isLastMoveSquare && (
                <rect x={x} y={y} width={CELL} height={CELL} fill="#6D5DFC4D" />
              )}
              {isSelected && (
                <rect x={x} y={y} width={CELL} height={CELL} fill="#E8B95B33" />
              )}
              {isLegalTarget && !piece && (
                <circle cx={x + CELL / 2} cy={y + CELL / 2} r={CELL * 0.11} fill="#E8B95B99" />
              )}
              {isLegalTarget && piece && (
                <rect
                  x={x + 3}
                  y={y + 3}
                  width={CELL - 6}
                  height={CELL - 6}
                  fill="none"
                  stroke="#E8B95B"
                  strokeWidth={3}
                  rx={4}
                />
              )}
              {focusedSquare === square && (
                <rect
                  x={x + 2}
                  y={y + 2}
                  width={CELL - 4}
                  height={CELL - 4}
                  fill="none"
                  stroke="#8B7DFF"
                  strokeWidth={3}
                  rx={4}
                />
              )}
              {piece && (
                <text
                  x={x + CELL / 2}
                  y={y + CELL / 2}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={CELL * 0.68}
                  fill={piece.color === "w" ? "#F5F6FA" : "#0A0D19"}
                  stroke={piece.color === "w" ? "#0A0D1966" : "none"}
                  strokeWidth={piece.color === "w" ? 1 : 0}
                  style={{ userSelect: "none" }}
                >
                  {PIECE_GLYPHS[piece.type]}
                </text>
              )}
              {/* Coordinate labels along the a-file and 1st rank, in the mono utility face. */}
              {colIndex === 0 && (
                <text
                  x={x + 4}
                  y={y + 12}
                  fontSize={10}
                  fontFamily="var(--font-mono)"
                  fill={isLight ? "#454C74" : "#E8E6DC"}
                  opacity={0.7}
                >
                  {rank}
                </text>
              )}
              {rowIndex === 7 && (
                <text
                  x={x + CELL - 10}
                  y={y + CELL - 6}
                  fontSize={10}
                  fontFamily="var(--font-mono)"
                  fill={isLight ? "#454C74" : "#E8E6DC"}
                  opacity={0.7}
                >
                  {file}
                </text>
              )}
            </g>
          );
        })
      )}
    </svg>
  );
}
