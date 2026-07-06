import type { GameRecord } from "./types";

/**
 * The Evergreen Game (Anderssen vs. Dufresne, Berlin 1852).
 *
 * This is a public-domain historical game record — the move sequence
 * itself is a fact, not the platform's copyrighted content. Used here
 * purely as sample data to drive the playback engine; swap in any
 * PGN source (a real game library, a live server feed) without
 * touching the rendering or playback code, since both are decoupled
 * from this data by the `usePgnPlayback` hook.
 */
export const evergreenGame: GameRecord = {
  title: "The Evergreen Game",
  players: "Anderssen vs. Dufresne",
  year: 1852,
  moves: [
    "e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5", "b4", "Bxb4", "c3", "Ba5",
    "d4", "exd4", "O-O", "d3", "Qb3", "Qf6", "e5", "Qg6", "Re1", "Nge7",
    "Ba3", "b5", "Qxb5", "Rb8", "Qa4", "Bb6", "Nbd2", "Bb7", "Ne4", "Qf5",
    "Bxd3", "Qh5", "Nf6+", "gxf6", "exf6", "Rg8", "Rad1", "Qxf3", "Rxe7+", "Nxe7",
    "Qxd7+", "Kxd7", "Bf5+", "Ke8", "Bd7+", "Kf8", "Bxe7#",
  ],
};
