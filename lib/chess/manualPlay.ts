import { Chess, type Square as ChessJsSquare } from "chess.js";
import type { BoardPiece, PieceColor, Square } from "./types";

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;
const RANKS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

function readBoard(chess: Chess): BoardPiece[] {
  const pieces: BoardPiece[] = [];
  for (const file of FILES) {
    for (const rank of RANKS) {
      const square = `${file}${rank}` as ChessJsSquare;
      const piece = chess.get(square);
      if (piece) {
        pieces.push({ square: square as Square, type: piece.type, color: piece.color });
      }
    }
  }
  return pieces;
}

/** Whose turn it is to move in a given FEN. */
export function sideToMove(fen: string): PieceColor {
  return new Chess(fen).turn();
}

/**
 * Legal destination squares for the piece on `square`, given the
 * position in `fen`. Returns an empty array if it's not that side's
 * turn or there's no piece there — the caller doesn't need to check
 * either case separately.
 */
export function legalTargets(fen: string, square: Square): Square[] {
  const chess = new Chess(fen);
  const moves = chess.moves({ square: square as ChessJsSquare, verbose: true });
  return moves.map((move) => move.to as Square);
}

export interface AppliedMove {
  fen: string;
  pieces: BoardPiece[];
  san: string;
  from: Square;
  to: Square;
  isCheckmate: boolean;
  isCheck: boolean;
  isGameOver: boolean;
}

/**
 * Attempts a move from `square` to `to`. Always promotes to queen when
 * a pawn reaches the back rank — a promotion picker is a reasonable
 * "what I'd improve with more time" item, out of scope for a hero-demo
 * click-to-move interaction. Returns `null` for illegal moves so the
 * caller can no-op rather than throw.
 */
export function tryMove(fen: string, from: Square, to: Square): AppliedMove | null {
  const chess = new Chess(fen);
  const move = chess.move({ from: from as ChessJsSquare, to: to as ChessJsSquare, promotion: "q" });
  if (!move) return null;

  return {
    fen: chess.fen(),
    pieces: readBoard(chess),
    san: move.san,
    from: move.from as Square,
    to: move.to as Square,
    isCheckmate: chess.isCheckmate(),
    isCheck: chess.inCheck(),
    isGameOver: chess.isGameOver(),
  };
}
