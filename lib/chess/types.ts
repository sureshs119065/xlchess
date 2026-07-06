export type Square =
  | `${"a" | "b" | "c" | "d" | "e" | "f" | "g" | "h"}${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8}`;

export type PieceColor = "w" | "b";

export type PieceType = "p" | "n" | "b" | "r" | "q" | "k";

export interface BoardPiece {
  square: Square;
  type: PieceType;
  color: PieceColor;
}

/** One fully-resolved step of playback: the position after the move, plus
 * enough metadata to render notation, captions, and aria-labels without
 * re-deriving anything from the FEN string downstream. */
export interface PlaybackStep {
  /** 1-indexed ply number (half-move count). */
  ply: number;
  /** Move number as printed in standard notation, e.g. 12 for "12. Nf3". */
  moveNumber: number;
  color: PieceColor;
  /** Standard Algebraic Notation, e.g. "Nf3", "O-O", "Bxe7#". */
  san: string;
  /** Board position after this move, as an array of occupied squares. */
  pieces: BoardPiece[];
  /** FEN of the position after this move — lets free-play resume from here. */
  fen: string;
  /** Squares involved in this move, used to draw the last-move highlight. */
  from: Square | null;
  to: Square | null;
  /** True on the final ply of the game. */
  isFinal: boolean;
  /** Human-readable caption for screen readers and the move ticker. */
  label: string;
}

export interface GameRecord {
  title: string;
  players: string;
  year: number;
  /** Moves in SAN, one entry per ply, in order. */
  moves: string[];
}
