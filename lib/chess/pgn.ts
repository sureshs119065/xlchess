import { Chess, type Square as ChessJsSquare } from "chess.js";
import type { BoardPiece, GameRecord, PlaybackStep, Square } from "./types";

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

const PIECE_NAMES: Record<string, string> = {
  p: "pawn",
  n: "knight",
  b: "bishop",
  r: "rook",
  q: "queen",
  k: "king",
};

function describeMove(san: string, color: "w" | "b", moveNumber: number): string {
  const side = color === "w" ? "White" : "Black";
  const suffix = san.endsWith("#") ? ", checkmate" : san.endsWith("+") ? ", check" : "";
  const clean = san.replace(/[+#]/g, "");

  if (clean === "O-O") return `Move ${moveNumber}: ${side} castles kingside${suffix}`;
  if (clean === "O-O-O") return `Move ${moveNumber}: ${side} castles queenside${suffix}`;

  const pieceLetterMatch = clean.match(/^[NBRQK]/);
  const pieceName = pieceLetterMatch ? PIECE_NAMES[pieceLetterMatch[0].toLowerCase()] : "pawn";
  const isCapture = clean.includes("x");
  const destination = clean.slice(-2);

  return `Move ${moveNumber}: ${side} ${pieceName}${isCapture ? " captures on" : " to"} ${destination}${suffix}`;
}

/** The standard starting position, used before playback has advanced (ply -1). */
export function getInitialPieces(): BoardPiece[] {
  return readBoard(new Chess());
}

/** FEN for the standard starting position. */
export function getInitialFen(): string {
  return new Chess().fen();
}

/**
 * Replays a game's SAN move list through chess.js and returns one
 * fully-resolved `PlaybackStep` per ply. This is the only place that
 * talks to the chess engine directly — the board component, the move
 * ticker, and the counter all consume plain typed data, so the engine
 * could be swapped (e.g. for a server-streamed live game) without
 * touching any rendering code.
 */
export function buildPlayback(game: GameRecord): PlaybackStep[] {
  const chess = new Chess();
  const steps: PlaybackStep[] = [];

  game.moves.forEach((san, index) => {
    const move = chess.move(san);
    if (!move) {
      // Malformed PGN data should never reach production silently —
      // fail loudly in development rather than rendering a broken board.
      throw new Error(`Illegal or malformed move "${san}" at ply ${index + 1}`);
    }

    const ply = index + 1;
    const moveNumber = Math.ceil(ply / 2);

    steps.push({
      ply,
      moveNumber,
      color: move.color,
      san: move.san,
      pieces: readBoard(chess),
      fen: chess.fen(),
      from: move.from as Square,
      to: move.to as Square,
      isFinal: index === game.moves.length - 1,
      label: describeMove(move.san, move.color, moveNumber),
    });
  });

  return steps;
}
