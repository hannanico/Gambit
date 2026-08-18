"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { PuzzlePlayer } from "@/components/chess/PuzzlePlayer";
import { getPuzzlePack } from "@/lib/puzzle-storage";
import type { Puzzle } from "@/types/puzzle";

const RANDOM_PACK_ID = "random-20k";

function pickRandomPuzzle(puzzles: Puzzle[], previousId?: string): Puzzle {
  if (puzzles.length === 1) return puzzles[0];

  let nextPuzzle = puzzles[Math.floor(Math.random() * puzzles.length)];

  while (nextPuzzle.id === previousId) {
    nextPuzzle = puzzles[Math.floor(Math.random() * puzzles.length)];
  }

  return nextPuzzle;
}

export function NormalPuzzleGame() {
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [currentPuzzle, setCurrentPuzzle] = useState<Puzzle | null>(null);
  const [solved, setSolved] = useState(0);
  const [state, setState] = useState<
    "loading" | "ready" | "missing-pack" | "error"
  >("loading");

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

        setPuzzles(storedPack.puzzles);
        setCurrentPuzzle(pickRandomPuzzle(storedPack.puzzles));
        setState("ready");
      } catch {
        setState("error");
      }
    }

    void loadRandomPack();
  }, []);

  const nextPuzzle = useCallback(() => {
    setCurrentPuzzle((previousPuzzle) =>
      pickRandomPuzzle(puzzles, previousPuzzle?.id),
    );
  }, [puzzles]);

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
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
      <PuzzlePlayer
        key={currentPuzzle.id}
        onIncorrect={nextPuzzle}
        onSolved={() => {
          setSolved((current) => current + 1);
          window.setTimeout(nextPuzzle, 900);
        }}
        puzzle={currentPuzzle}
      />

      <aside className="rounded-2xl border border-white/50 bg-slate-950 p-6 text-white shadow-xl">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-sky-300">
          Normal
        </p>

        <h2 className="mt-2 text-2xl font-black">Train without pressure</h2>

        <p className="mt-3 text-sm leading-6 text-slate-300">
          Random offline puzzles. No timer and no strikes.
        </p>

        <div className="mt-6 rounded-xl bg-white/10 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-200">
            Solved this session
          </p>
          <p className="mt-1 text-4xl font-black">{solved}</p>
        </div>

        <button
          className="mt-6 w-full rounded-xl bg-sky-400 px-4 py-3 font-bold text-slate-950 transition hover:bg-sky-300"
          onClick={nextPuzzle}
          type="button"
        >
          Skip puzzle
        </button>

        <Link
          className="mt-3 block w-full rounded-xl border border-sky-300 px-4 py-3 text-center font-bold text-sky-200 transition hover:bg-slate-900"
          href="/packs"
        >
          Manage puzzle packs
        </Link>

        <p className="mt-5 text-xs leading-5 text-slate-400">
          Playing from your downloaded Random Pack.
        </p>
      </aside>
    </div>
  );
}