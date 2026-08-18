"use client";

import { Chess, type Move, type Square } from "chess.js";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ChessBoard } from "@/components/chess/ChessBoard";
import { applyUciMove, movesFromPuzzle, uciToMove } from "@/lib/chess";
import { playSound } from "@/lib/sounds";
import {
  getSoundEnabled,
  setSoundEnabled,
} from "@/lib/sound-settings";  
import type { Puzzle } from "@/types/puzzle";

type TrainingMode = "strict" | "learning";

type PlayerStatus =
  | "preparing"
  | "opening"
  | "playing"
  | "replying"
  | "incorrect"
  | "solved"
  | "revealing";

type PuzzlePlayerProps = {
  puzzle: Puzzle;
  onSolved?: () => void;
  onIncorrect?: () => void;
  locked?: boolean;
  mode?: TrainingMode;
  sidebarContent?: ReactNode;
};

type LastMove = {
  from: string;
  to: string;
};

const OPENING_DELAY_MS = 700;
const REPLY_DELAY_MS = 550;
const REVEAL_DELAY_MS = 700;

function sideName(color: "w" | "b") {
  return color === "w" ? "White" : "Black";
}

function toLastMove(move: Move): LastMove {
  return { from: move.from, to: move.to };
}

export function PuzzlePlayer({
  puzzle,
  onSolved,
  onIncorrect,
  locked = false,
  mode = "strict",
  sidebarContent,
}: PuzzlePlayerProps) {
  const chessRef = useRef(new Chess());
  const movesRef = useRef<string[]>([]);
  const moveIndexRef = useRef(0);
  const timeoutsRef = useRef<number[]>([]);

  const [fen, setFen] = useState(puzzle.fen);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<string[]>([]);
  const [lastMove, setLastMove] = useState<LastMove | null>(null);
  const [status, setStatus] = useState<PlayerStatus>("preparing");
  const [message, setMessage] = useState("Preparing puzzle...");
  const [playerColor, setPlayerColor] = useState<"w" | "b">("w");
  const [mistakeSnapshot, setMistakeSnapshot] = useState<string | null>(null);
  const [hintLevel, setHintLevel] = useState(0);
  const [soundEnabled, setSoundEnabledState] = useState(true);

  useEffect(() => {
    setSoundEnabledState(getSoundEnabled());
  }, []);

  const orientation = playerColor === "w" ? "white" : "black";
  const isLocked = locked || !["playing", "incorrect"].includes(status);

  const hudStatus = useMemo(() => {
    if (status === "opening") return "Opponent is making the first move";
    if (status === "replying") return "Opponent is responding";
    if (status === "revealing") return "Showing solution";
    if (status === "solved") return "Puzzle solved";

    if (status === "incorrect") {
      return mode === "learning"
        ? "That is not the best move"
        : "Puzzle missed";
    }

    if (status === "playing") return `${sideName(playerColor)} to move`;

    return "Loading puzzle";
  }, [mode, playerColor, status]);

  const badgeClass = useMemo(() => {
    if (status === "playing") return "bg-emerald-100 text-emerald-800";
    if (status === "incorrect") return "bg-red-100 text-red-800";
    if (status === "solved") return "bg-sky-100 text-sky-800";

    return "bg-amber-100 text-amber-800";
  }, [status]);

  function clearScheduledWork() {
    timeoutsRef.current.forEach((timeout) => window.clearTimeout(timeout));
    timeoutsRef.current = [];
  }

  function schedule(callback: () => void, delay: number) {
    const timeout = window.setTimeout(callback, delay);
    timeoutsRef.current.push(timeout);
  }

  function updateBoard(nextMessage?: string) {
    setFen(chessRef.current.fen());

    if (nextMessage) {
      setMessage(nextMessage);
    }
  }

  function playMoveSound(move: Move) {
    if (move.captured) {
      playSound("capture");
      return;
    }

    if (chessRef.current.isCheck()) {
      playSound("move-check");
      return;
    }

    playSound("move");
  }

  function toggleSound() {
  const nextEnabled = !soundEnabled;

  setSoundEnabled(nextEnabled);
  setSoundEnabledState(nextEnabled);

  if (nextEnabled) {
    window.setTimeout(() => {
      playSound("move");
    }, 0);
  }
}

  function resetSelection() {
    setSelectedSquare(null);
    setLegalMoves([]);
  }

  function finishSolved() {
    playSound("puzzle-correct");
    clearScheduledWork();
    resetSelection();
    setStatus("solved");
    setMessage("Puzzle solved!");
    updateBoard();
    onSolved?.();
  }

  function playOpponentMove(uci: string, onDone?: () => void) {
    const result = applyUciMove(chessRef.current, uci);

    if (!result) {
      setStatus("incorrect");
      setMessage("The puzzle move could not be applied.");
      return;
    }

    setLastMove(toLastMove(result));
    playMoveSound(result);
    updateBoard(
      `${sideName(chessRef.current.turn())} to move — find the best move.`,
    );
    onDone?.();
  }

  useEffect(() => {
    clearScheduledWork();

    const chess = new Chess(puzzle.fen);
    const moves = movesFromPuzzle(puzzle.moves);

    chessRef.current = chess;
    movesRef.current = moves;
    moveIndexRef.current = 0;

    setFen(chess.fen());
    setLastMove(null);
    setMistakeSnapshot(null);
    setHintLevel(0);
    resetSelection();

    if (moves.length < 2) {
      setStatus("incorrect");
      setMessage("This puzzle does not contain enough moves.");
      return;
    }

    const chessForOpening = new Chess(puzzle.fen);
    const firstMove = applyUciMove(chessForOpening, moves[0]);
    const playerSide: "w" | "b" = firstMove
      ? chessForOpening.turn()
      : chess.turn();

    setPlayerColor(playerSide);

    setStatus("opening");
    setMessage(`${sideName(chess.turn())} is making the first move...`);

    schedule(() => {
      const result = applyUciMove(chess, moves[0]);

      if (!result) {
        setStatus("incorrect");
        setMessage("The opening move in this puzzle is invalid.");
        return;
      }

      moveIndexRef.current = 1;
      setLastMove(toLastMove(result));
      playMoveSound(result);
      setFen(chess.fen());
      setStatus("playing");
      setMessage(`${sideName(chess.turn())} to move — find the best move.`);
    }, OPENING_DELAY_MS);

    return clearScheduledWork;
  }, [puzzle]);

  function selectSquare(square: string) {
    const chess = chessRef.current;
    const piece = chess.get(square as Square);

    if (!piece) {
      setMessage(
        `${sideName(playerColor)} to move — select one of your pieces.`,
      );
      return;
    }

    if (piece.color !== playerColor) {
      setMessage(
        `You are playing ${sideName(
          playerColor,
        )}. Select a ${sideName(playerColor).toLowerCase()} piece.`,
      );
      return;
    }

    const destinations = chess.moves({
      square: square as Square,
      verbose: true,
    }) as Move[];

    setSelectedSquare(square);
    setLegalMoves(destinations.map((move) => move.to));
    setHintLevel(0);
    setMessage(`Selected ${square}. Choose a legal destination.`);
  }

  function restoreAfterMistake() {
    if (!mistakeSnapshot) return;

    chessRef.current.load(mistakeSnapshot);
    setFen(chessRef.current.fen());
    setLastMove(null);
    setMistakeSnapshot(null);
    setHintLevel(0);
    resetSelection();
    setStatus("playing");
    setMessage(`${sideName(playerColor)} to move — try again.`);
  }

  function handleSquareClick(square: string) {
    if (locked || status !== "playing") return;

    const chess = chessRef.current;
    const clickedPiece = chess.get(square as Square);

    if (!selectedSquare) {
      selectSquare(square);
      return;
    }

    if (selectedSquare === square) {
      resetSelection();
      setMessage(`${sideName(playerColor)} to move — find the best move.`);
      return;
    }

    if (clickedPiece?.color === playerColor) {
      selectSquare(square);
      return;
    }

    const expectedUci = movesRef.current[moveIndexRef.current];

    if (!expectedUci) {
      finishSolved();
      return;
    }

    const expectedMove = uciToMove(expectedUci);
    const positionBeforeAttempt = chess.fen();

    let legalMove: Move | null = null;

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
      playSound("illegal");
      resetSelection();
      setMessage("That move is not legal. Try again.");
      return;
    }

    const playedUci = `${legalMove.from}${legalMove.to}${
      legalMove.promotion ?? ""
    }`;

    if (playedUci !== expectedUci) {
      playSound("puzzle-wrong");
      resetSelection();
      setLastMove(toLastMove(legalMove));
      updateBoard("That move is legal, but it is not the best move.");

      if (mode === "strict") {
        setStatus("incorrect");
        onIncorrect?.();
        return;
      }

      setMistakeSnapshot(positionBeforeAttempt);
      setStatus("incorrect");
      return;
    }

    playMoveSound(legalMove);
    moveIndexRef.current += 1;
    resetSelection();
    setHintLevel(0);
    setLastMove(toLastMove(legalMove));
    updateBoard();

    const opponentReply = movesRef.current[moveIndexRef.current];

    if (!opponentReply) {
      finishSolved();
      return;
    }

    setStatus("replying");
    setMessage(`${sideName(chess.turn())} is responding...`);

    schedule(() => {
      playOpponentMove(opponentReply, () => {
        moveIndexRef.current += 1;

        if (!movesRef.current[moveIndexRef.current]) {
          finishSolved();
          return;
        }

        setStatus("playing");
      });
    }, REPLY_DELAY_MS);
  }

  function showHint() {
    if (mode !== "learning" || status !== "playing") return;

    const expectedUci = movesRef.current[moveIndexRef.current];

    if (!expectedUci) return;

    const expected = uciToMove(expectedUci);

    if (hintLevel === 0) {
      setSelectedSquare(expected.from);
      setLegalMoves([]);
      setHintLevel(1);
      setMessage(`Hint: look at ${expected.from}.`);
      return;
    }

    setSelectedSquare(expected.from);
    setLegalMoves([expected.to]);
    setHintLevel(2);
    setMessage(`Hint: move from ${expected.from} to ${expected.to}.`);
  }

  function revealSolution() {
    if (mode !== "learning" || !["playing", "incorrect"].includes(status)) {
      return;
    }

    clearScheduledWork();

    if (mistakeSnapshot) {
      chessRef.current.load(mistakeSnapshot);
      moveIndexRef.current = Math.max(1, moveIndexRef.current);
      setMistakeSnapshot(null);
      setFen(chessRef.current.fen());
      setLastMove(null);
    }

    resetSelection();
    setStatus("revealing");
    setMessage("Showing the solution...");

    function playNext() {
      const nextUci = movesRef.current[moveIndexRef.current];

      if (!nextUci) {
        finishSolved();
        return;
      }

      const result = applyUciMove(chessRef.current, nextUci);

      if (!result) {
        setStatus("incorrect");
        setMessage("The solution could not be played.");
        return;
      }

      moveIndexRef.current += 1;
      setLastMove(toLastMove(result));
      playMoveSound(result);
      updateBoard();
      schedule(playNext, REVEAL_DELAY_MS);
    }

    schedule(playNext, 250);
  }

  const expectedUci = movesRef.current[moveIndexRef.current];
  const expectedMove = expectedUci ? uciToMove(expectedUci) : null;

  return (
    <section className="mx-auto min-h-[100dvh] w-full max-w-[1600px] px-2 pb-3 sm:px-4 lg:min-h-0">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-center lg:gap-6">
        <div className="flex min-w-0 justify-center">
          <ChessBoard
            disabled={isLocked}
            fen={fen}
            lastMove={lastMove}
            legalMoves={legalMoves}
            onSquareClick={handleSquareClick}
            orientation={orientation}
            selectedSquare={selectedSquare}
          />
        </div>

        <aside className="rounded-2xl border border-sky-200 bg-white/95 p-3 shadow-lg backdrop-blur-sm sm:p-4 lg:max-h-[calc(100dvh-3rem)] lg:overflow-y-auto lg:p-5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[0.6rem] font-black uppercase tracking-[0.16em] text-sky-700">
                {mode === "learning" ? "Training puzzle" : "Chess puzzle"}
              </p>

              <h1 className="mt-1 truncate text-lg font-black tracking-tight text-slate-950 sm:text-xl">
                You play {sideName(playerColor)}
              </h1>

              <p className="mt-1 text-xs font-semibold text-slate-600 sm:text-sm">
                Puzzle rating {puzzle.rating}
              </p>
            </div>
            
            <span
              className={`shrink-0 rounded-full px-2 py-1 text-[0.65rem] font-black sm:px-3 sm:text-xs ${badgeClass}`}
            >
              {status === "playing" ? "Your move" : hudStatus}
            </span>
          </div>

          <div className="my-3 border-t border-sky-950/10 sm:my-4" />

          <div>
            <p className="text-sm font-black text-sky-800">{hudStatus}</p>

            <p className="mt-1 text-sm font-semibold leading-5 text-slate-900 sm:text-base sm:leading-6">
              {message}
            </p>
          </div>

          {mode === "learning" ? (
            <div className="mt-3 grid gap-2 sm:mt-5">
              {status === "incorrect" ? (
                <button
                  className="rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-black text-white transition hover:bg-sky-600 sm:py-3"
                  onClick={restoreAfterMistake}
                  type="button"
                >
                  Try again
                </button>
              ) : null}

              {status === "playing" ? (
                <button
                  className="rounded-xl border border-sky-300 bg-white px-4 py-2.5 text-sm font-black text-sky-800 transition hover:bg-sky-50 sm:py-3"
                  onClick={showHint}
                  type="button"
                >
                  {hintLevel === 0 ? "Hint" : "More specific hint"}
                </button>
              ) : null}

              {["playing", "incorrect"].includes(status) ? (
                <button
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-100 sm:py-3"
                  onClick={revealSolution}
                  type="button"
                >
                  Reveal solution
                </button>
              ) : null}
            </div>
          ) : null}

          {mode === "learning" && status === "playing" && expectedMove ? (
            <p className="mt-3 rounded-xl bg-sky-50 px-3 py-2.5 text-xs leading-4 text-slate-600 sm:mt-4 sm:py-3 sm:leading-5">
              Hints are optional. The first identifies a piece; the second
              identifies its destination.
            </p>
          ) : null}

          <button
            aria-label={soundEnabled ? "Turn sounds off" : "Turn sounds on"}
            className="mt-3 flex w-full items-center justify-between rounded-xl border border-sky-200 bg-white px-3 py-2.5 text-sm font-black text-sky-800 transition hover:bg-sky-50"
            onClick={toggleSound}
            type="button"
          >
            <span>Sound effects</span>
            <span aria-hidden="true">{soundEnabled ? "🔊 On" : "🔇 Off"}</span>
          </button>

          {mode === "strict" && status === "incorrect" ? (
            <p className="mt-3 rounded-xl bg-red-50 px-3 py-2.5 text-xs font-semibold leading-5 text-red-800 sm:mt-5 sm:px-3 sm:py-3 sm:text-sm sm:leading-6">
              This puzzle has been recorded as missed. Choose the next puzzle
              from the panel beside the board.
            </p>
          ) : null}

          {status === "solved" ? (
            <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2.5 text-xs font-semibold leading-5 text-emerald-800 sm:mt-5 sm:px-3 sm:py-3 sm:text-sm sm:leading-6">
              Nice work. Select the next puzzle to continue your session.
            </p>
          ) : null}

          {sidebarContent ? (
            <>
              <div className="my-3 border-t border-sky-950/10 sm:my-5" />
              {sidebarContent}
            </>
          ) : null}
        </aside>
      </div>
    </section>
  );
}