import { Chess, type Square } from "chess.js";

export function uciToMove(uci: string) {
  return {
    from: uci.slice(0, 2) as Square,
    to: uci.slice(2, 4) as Square,
    promotion: uci.length === 5 ? uci[4] : undefined,
  };
}

export function applyUciMove(chess: Chess, uci: string) {
  return chess.move(uciToMove(uci));
}

export function movesFromPuzzle(puzzleMoves: string) {
  return puzzleMoves.trim().split(/\s+/).filter(Boolean);
}