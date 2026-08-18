"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { PuzzlePlayer } from "@/components/chess/PuzzlePlayer";
import { getPuzzlePack } from "@/lib/puzzle-storage";
import type { Puzzle } from "@/types/puzzle";

const RANDOM_PACK_ID = "random-20k";
const NEXT_PUZZLE_DELAY_MS = 900;

function pickRandomPuzzle(puzzles: Puzzle[], previousId?: string): Puzzle {
  if (puzzles.length === 1) return puzzles[0];

  const available = previousId
    ? puzzles.filter((puzzle) => puzzle.id !== previousId)
    : puzzles;

  const pool = available.length ? available : puzzles;

  return pool[Math.floor(Math.random() * pool.length)];
}

export function NormalPuzzleGame() {
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
    async function loadRandomPack() {
      try {
        const storedPack = await getPuzzlePack(RANDOM_PACK_ID);

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

    void loadRandomPack();

    return clearPendingNextPuzzle;
  }, [clearPendingNextPuzzle]);

  if (state === "loading") {
    return (
      <div className="rounded-2xl border border-sky-100 bg-white p-6 text-slate-700 shadow-sm">
        Loading your offline puzzle pack...
      </div>
    );
  }

  if (state === "missing-pack") {
    return (
      <div className="rounded-2xl border border-sky-100 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-black text-slate-950">
          Download the Random Pack first
        </h2>

        <p className="mt-2 text-slate-600">
          Normal mode uses the Random puzzles pack. Download it once, then
          solve puzzles without an account or internet connection.
        </p>

        <Link
          className="mt-5 inline-flex rounded-xl bg-sky-500 px-4 py-3 font-bold text-white transition hover:bg-sky-600"
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
        Gambit could not read the downloaded Random Pack. Remove it from the
        packs page and download it again.
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
              <p className="text-[0.7rem] font-black uppercase tracking-[0.18em] text-sky-700">
                Normal mode
              </p>

              <p className="mt-1 text-sm font-semibold leading-5 text-slate-600">
                Train without a timer or strike limit.
              </p>
            </div>

            <div className="text-right">
              <p className="text-[0.65rem] font-black uppercase tracking-[0.14em] text-sky-700">
                Solved
              </p>

              <p className="text-3xl font-black text-slate-950">{solved}</p>
            </div>
          </div>

          <button
            className="mt-4 w-full rounded-xl bg-sky-500 px-4 py-3 text-sm font-black text-white transition hover:bg-sky-600"
            onClick={nextPuzzle}
            type="button"
          >
            Next puzzle
          </button>

          <Link
            className="mt-2 block w-full rounded-xl border border-sky-300 bg-white px-4 py-3 text-center text-sm font-black text-sky-800 transition hover:bg-sky-50"
            href="/packs"
          >
            Manage puzzle packs
          </Link>

          <p className="mt-3 text-xs leading-5 text-slate-500">
            Playing from your downloaded Random Pack.
          </p>
        </div>
      }
    />
  );
}