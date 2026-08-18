"use client";

import { Chess, type Square } from "chess.js";
import { useEffect, useRef, useState } from "react";
import { ChessBoard } from "@/components/chess/ChessBoard";
import { applyUciMove, movesFromPuzzle, uciToMove } from "@/lib/chess";
import type { Puzzle } from "@/types/puzzle";

type PuzzlePlayerProps = {
  puzzle: Puzzle;
  onSolved?: () => void;
  onIncorrect?: () => void;
};

type PuzzleStatus = "loading" | "playing" | "replying" | "solved" | "incorrect";

function sideName(color: "w" | "b") {
  return color === "w" ? "White" : "Black";
}

export function PuzzlePlayer({
  puzzle,
  onSolved,
  onIncorrect,
}: PuzzlePlayerProps) {
  const chessRef = useRef(new Chess());
  const movesRef = useRef<string[]>([]);
  const moveIndexRef = useRef(0);

  const [fen, setFen] = useState(puzzle.fen);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [status, setStatus] = useState<PuzzleStatus>("loading");
  const [message, setMessage] = useState("Loading puzzle...");
  const [playerColor, setPlayerColor] = useState<"w" | "b">("w");

  useEffect(() => {
    const chess = new Chess(puzzle.fen);
    const moves = movesFromPuzzle(puzzle.moves);

    chessRef.current = chess;
    movesRef.current = moves;
    moveIndexRef.current = 0;

    setFen(chess.fen());
    setSelectedSquare(null);
    setStatus("loading");
    setMessage("Preparing puzzle...");

    if (moves.length < 2) {
      setStatus("incorrect");
      setMessage("This puzzle does not contain enough moves.");
      return;
    }

    const openingMove = applyUciMove(chess, moves[0]);

    if (!openingMove) {
      setStatus("incorrect");
      setMessage("The opening move in this puzzle is invalid.");
      return;
    }

    moveIndexRef.current = 1;

    // After the opening move, it is the user's side to move.
    setPlayerColor(chess.turn());
    setFen(chess.fen());
    setStatus("playing");
    setMessage(`${sideName(chess.turn())} to move — find the best move.`);
  }, [puzzle]);

  function markIncorrect(reason: string) {
    setSelectedSquare(null);
    setStatus("incorrect");
    setMessage(reason);

    window.setTimeout(() => {
      onIncorrect?.();
    }, 900);
  }

  function finishSolved() {
    setSelectedSquare(null);
    setFen(chessRef.current.fen());
    setStatus("solved");
    setMessage("Puzzle solved!");
    onSolved?.();
  }

  function handleSquareClick(square:string) {
    if (status !== "playing") return;

    const chess = chessRef.current;
    const clickedPiece = chess.get(square as Square);

    // First click: only allow selecting a piece belonging to the side to move.
    if (!selectedSquare) {
      if (!clickedPiece) {
        setMessage(`${sideName(playerColor)} to move — select one of your pieces.`);
        return;
      }

      if (clickedPiece.color !== playerColor) {
        setMessage(`You are playing ${sideName(playerColor)}. Select a ${sideName(playerColor).toLowerCase()} piece.`);
        return;
      }

      setSelectedSquare(square);
      setMessage(`Selected ${square}. Choose a legal destination.`);
      return;
    }

    // Clicking another friendly piece changes selection rather than submitting a move.
    if (clickedPiece?.color === playerColor) {
      setSelectedSquare(square);
      setMessage(`Selected ${square}. Choose a legal destination.`);
      return;
    }

    if (selectedSquare === square) {
      setSelectedSquare(null);
      setMessage(`${sideName(playerColor)} to move — find the best move.`);
      return;
    }

    const expectedUci = movesRef.current[moveIndexRef.current];

    if (!expectedUci) {
      finishSolved();
      return;
    }

    const expectedMove = uciToMove(expectedUci);

    // First validate chess legality. Illegal moves should NOT consume a puzzle.
    let legalMove;
    try {
      legalMove = chess.move({
        from: selectedSquare as Square,
        to: square as Square,
        promotion: expectedMove.promotion,
      });
    } catch {
      legalMove = null;
    }

    if (!legalMove) {
      setSelectedSquare(null);
      setMessage("That move is not legal. Try again.");
      return;
    }

    // The move was legal, but now compare it with the expected puzzle move.
    const playedUci = `${legalMove.from}${legalMove.to}${
      legalMove.promotion ?? ""
    }`;

    if (playedUci !== expectedUci) {
      markIncorrect("That move is legal, but it is not the puzzle solution.");
      return;
    }

    moveIndexRef.current += 1;
    setSelectedSquare(null);
    setFen(chess.fen());

    const opponentReply = movesRef.current[moveIndexRef.current];

    // The user's move completed the full solution.
    if (!opponentReply) {
      finishSolved();
      return;
    }

    setStatus("replying");
    setMessage(`${sideName(chess.turn())} is responding...`);

    window.setTimeout(() => {
      const replyResult = applyUciMove(chess, opponentReply);

      if (!replyResult) {
        setStatus("incorrect");
        setMessage("The puzzle reply could not be applied.");
        return;
      }

      moveIndexRef.current += 1;
      setFen(chess.fen());

      if (!movesRef.current[moveIndexRef.current]) {
        finishSolved();
        return;
      }

      setStatus("playing");
      setMessage(`${sideName(chess.turn())} to move — find the best move.`);
    }, 450);
  }

  const turnText =
    status === "playing"
      ? `You play ${sideName(playerColor)}`
      : status === "replying"
        ? "Opponent is moving"
        : status === "solved"
          ? "Completed"
          : status === "incorrect"
            ? "Puzzle missed"
            : "Loading";

  return (
    <section className="w-full max-w-2xl">
      <div className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-sky-200 bg-white/90 px-4 py-3 shadow-sm">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-700">
            Your side
          </p>
          <p className="text-lg font-black text-slate-950">
            {status === "playing" || status === "replying"
              ? `You are ${sideName(playerColor)}`
              : turnText}
          </p>
        </div>

        <div
          className={`rounded-full px-3 py-1 text-sm font-bold ${
            status === "playing"
              ? "bg-emerald-100 text-emerald-800"
              : status === "replying"
                ? "bg-amber-100 text-amber-800"
                : "bg-slate-100 text-slate-700"
          }`}
        >
          {turnText}
        </div>
      </div>

      <ChessBoard
        fen={fen}
        onSquareClick={handleSquareClick}
        selectedSquare={selectedSquare}
      />

      <div className="mt-4 flex items-center justify-between rounded-xl border border-sky-200 bg-white/90 px-4 py-3 shadow-sm">
        <div>
          <p className="font-semibold text-slate-900">{message}</p>
          <p className="text-sm text-slate-600">
            Puzzle rating: {puzzle.rating}
          </p>
        </div>
      </div>
    </section>
  );
}