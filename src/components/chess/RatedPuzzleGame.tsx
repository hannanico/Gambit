"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { PuzzlePlayer } from "@/components/chess/PuzzlePlayer";
import { getPuzzlePack } from "@/lib/puzzle-storage";
import type { Puzzle, PuzzlePack } from "@/types/puzzle";

const NEXT_PUZZLE_DELAY_MS = 900;

type RatedPuzzleGameProps = {
  pack: PuzzlePack;
};

function pickRandomPuzzle(puzzles: Puzzle[], previousId?: string): Puzzle {
  if (puzzles.length === 1) return puzzles[0];

  const available = previousId
    ? puzzles.filter((puzzle) => puzzle.id !== previousId)
    : puzzles;

  const pool = available.length ? available : puzzles;

  return pool[Math.floor(Math.random() * pool.length)];
}

export function RatedPuzzleGame({ pack }: RatedPuzzleGameProps) {
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [currentPuzzle, setCurrentPuzzle] = useState<Puzzle | null>(null);
  const [solved, setSolved] = useState(0);
  const [state, setState] = useState<
    "loading" | "ready" | "missing-pack" | "error"
  >("loading");

  const currentPuzzleIdRef = useRef<string | undefined>(undefined);
  const nextPuzzleTimeoutRef = useRef<number | null>(null);

  const clearPendingNextPuzzle = useCallback(() => {
    if (nextPuzzleTimeoutRef.current !== null) {
      window.clearTimeout(nextPuzzleTimeoutRef.current);
      nextPuzzleTimeoutRef.current = null;
    }
  }, []);

  const showPuzzle = useCallback(
    (previousId?: string) => {
      if (!puzzles.length) return;

      const next = pickRandomPuzzle(
        puzzles,
        previousId ?? currentPuzzleIdRef.current,
      );

      currentPuzzleIdRef.current = next.id;
      setCurrentPuzzle(next);
    },
    [puzzles],
  );

  const nextPuzzle = useCallback(() => {
    clearPendingNextPuzzle();
    showPuzzle();
  }, [clearPendingNextPuzzle, showPuzzle]);

  const scheduleNextPuzzle = useCallback(() => {
    clearPendingNextPuzzle();

    nextPuzzleTimeoutRef.current = window.setTimeout(() => {
      nextPuzzleTimeoutRef.current = null;
      showPuzzle();
    }, NEXT_PUZZLE_DELAY_MS);
  }, [clearPendingNextPuzzle, showPuzzle]);

  useEffect(() => {
    async function loadPack() {
      try {
        setState("loading");

        const storedPack = await getPuzzlePack(pack.id);

        if (!storedPack) {
          setState("missing-pack");
          return;
        }

        if (!storedPack.puzzles.length) {
          setState("error");
          return;
        }

        const firstPuzzle = pickRandomPuzzle(storedPack.puzzles);

        currentPuzzleIdRef.current = firstPuzzle.id;
        setPuzzles(storedPack.puzzles);
        setCurrentPuzzle(firstPuzzle);
        setState("ready");
      } catch {
        setState("error");
      }
    }

    void loadPack();

    return clearPendingNextPuzzle;
  }, [clearPendingNextPuzzle, pack.id]);

  if (state === "loading") {
    return (
      <div className="rounded-2xl border border-sky-100 bg-white p-6 text-slate-700 shadow-sm">
        Loading your downloaded Rated Pack...
      </div>
    );
  }

  if (state === "missing-pack") {
    return (
      <div className="rounded-2xl border border-sky-100 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-black text-slate-950">
          This pack is not downloaded
        </h2>

        <p className="mt-2 text-slate-600">
          Download the {pack.minRating.toLocaleString()}–
          {pack.maxRating.toLocaleString()} pack before playing this rating
          range offline.
        </p>

        <Link
          className="mt-5 inline-flex rounded-xl bg-amber-400 px-4 py-3 font-bold text-slate-950 transition hover:bg-amber-300"
          href="/packs"
        >
          Go to puzzle packs
        </Link>
      </div>
    );
  }

  if (state === "error" || !currentPuzzle) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800 shadow-sm">
        Gambit could not read this downloaded pack. Remove it from the Packs
        page and download it again.
      </div>
    );
  }

  return (
    <PuzzlePlayer
      key={currentPuzzle.id}
      mode="learning"
      onSolved={() => {
        setSolved((current) => current + 1);
        scheduleNextPuzzle();
      }}
      puzzle={currentPuzzle}
      sidebarContent={
        <div>
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[0.7rem] font-black uppercase tracking-[0.18em] text-amber-700">
                Rated range
              </p>

              <p className="mt-1 text-xl font-black text-slate-950">
                {pack.minRating.toLocaleString()}–
                {pack.maxRating.toLocaleString()}
              </p>

              <p className="mt-1 text-sm font-semibold leading-5 text-slate-600">
                Train within one rating range. No timer or strike limit.
              </p>
            </div>

            <div className="text-right">
              <p className="text-[0.65rem] font-black uppercase tracking-[0.14em] text-amber-700">
                Solved
              </p>

              <p className="text-3xl font-black text-slate-950">{solved}</p>
            </div>
          </div>

          <button
            className="mt-4 w-full rounded-xl bg-amber-300 px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-amber-200"
            onClick={nextPuzzle}
            type="button"
          >
            Next puzzle
          </button>

          <Link
            className="mt-2 block w-full rounded-xl border border-amber-300 bg-white px-4 py-3 text-center text-sm font-black text-amber-800 transition hover:bg-amber-50"
            href="/play/rated"
          >
            Change rating range
          </Link>

          <Link
            className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-center text-sm font-black text-slate-700 transition hover:bg-slate-100"
            href="/packs"
          >
            Manage puzzle packs
          </Link>
        </div>
      }
    />
  );
}