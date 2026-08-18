"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { PuzzlePlayer } from "@/components/chess/PuzzlePlayer";
import { getPuzzlePack } from "@/lib/puzzle-storage";
import {
  getRushBestScore,
  saveRushBestScore,
  type RushVariant,
} from "@/lib/rush-storage";
import type { Puzzle } from "@/types/puzzle";

const RANDOM_PACK_ID = "random-20k";
const STARTING_STRIKES = 3;
const TIMED_RUSH_SECONDS = 180;

type GamePhase = "loading" | "ready" | "playing" | "finished" | "missing-pack" | "error";

type PuzzleRushGameProps = {
  variant: RushVariant;
};

function pickRandomPuzzle(puzzles: Puzzle[], excludedIds: string[]): Puzzle {
  if (puzzles.length === 1) return puzzles[0];

  const excluded = new Set(excludedIds);
  const available = puzzles.filter((puzzle) => !excluded.has(puzzle.id));
  const pool = available.length ? available : puzzles;

  return pool[Math.floor(Math.random() * pool.length)];
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function PuzzleRushGame({ variant }: PuzzleRushGameProps) {
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [currentPuzzle, setCurrentPuzzle] = useState<Puzzle | null>(null);
  const [phase, setPhase] = useState<GamePhase>("loading");
  const [score, setScore] = useState(0);
  const [strikes, setStrikes] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(TIMED_RUSH_SECONDS);
  const [usedPuzzleIds, setUsedPuzzleIds] = useState<string[]>([]);

  const phaseRef = useRef<GamePhase>("loading");
  const scoreRef = useRef(0);
  const strikesRef = useRef(0);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    strikesRef.current = strikes;
  }, [strikes]);

  useEffect(() => {
    setBestScore(getRushBestScore(variant));
  }, [variant]);

  const finishGame = useCallback(() => {
    if (phaseRef.current === "finished") return;

    const nextBest = saveRushBestScore(variant, scoreRef.current);
    setBestScore(nextBest);
    setPhase("finished");
  }, [variant]);

  useEffect(() => {
    async function loadRandomPack() {
      try {
        const storedPack = await getPuzzlePack(RANDOM_PACK_ID);

        if (!storedPack) {
          setPhase("missing-pack");
          return;
        }

        if (!storedPack.puzzles.length) {
          setPhase("error");
          return;
        }

        setPuzzles(storedPack.puzzles);
        setPhase("ready");
      } catch {
        setPhase("error");
      }
    }

    void loadRandomPack();
  }, []);

  const startGame = useCallback(() => {
    if (!puzzles.length) return;

    const firstPuzzle = pickRandomPuzzle(puzzles, []);

    setCurrentPuzzle(firstPuzzle);
    setUsedPuzzleIds([firstPuzzle.id]);
    setScore(0);
    setStrikes(0);
    setSecondsLeft(TIMED_RUSH_SECONDS);
    setPhase("playing");
  }, [puzzles]);

  useEffect(() => {
    if (phase !== "ready") return;
    startGame();
  }, [phase, startGame]);

  useEffect(() => {
    if (variant !== "timed" || phase !== "playing") return;

    const timer = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          finishGame();
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [finishGame, phase, variant]);

  const nextPuzzle = useCallback(() => {
    if (!puzzles.length || phaseRef.current !== "playing") return;

    setCurrentPuzzle((current) => {
      const next = pickRandomPuzzle(puzzles, [
        ...usedPuzzleIds,
        current?.id ?? "",
      ]);

      setUsedPuzzleIds((used) => [...used.slice(-99), next.id]);
      return next;
    });
  }, [puzzles, usedPuzzleIds]);

  function handleSolved() {
    if (phaseRef.current !== "playing") return;

    setScore((current) => current + 1);
    window.setTimeout(nextPuzzle, 650);
  }

  function handleIncorrect() {
    if (phaseRef.current !== "playing") return;

    const nextStrikes = strikesRef.current + 1;
    setStrikes(nextStrikes);

    if (nextStrikes >= STARTING_STRIKES) {
      window.setTimeout(finishGame, 650);
      return;
    }

    window.setTimeout(nextPuzzle, 650);
  }

  if (phase === "loading" || phase === "ready") {
    return (
      <div className="rounded-2xl border border-sky-100 bg-white p-6 text-slate-700 shadow-sm">
        Loading your offline Random Pack...
      </div>
    );
  }

  if (phase === "missing-pack") {
    return (
      <div className="rounded-2xl border border-sky-100 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-black text-slate-950">Download the Random Pack first</h2>
        <p className="mt-2 text-slate-600">
          Puzzle Rush uses the Random puzzles pack. Download it once, then play offline.
        </p>
        <Link className="mt-5 inline-flex rounded-xl bg-sky-500 px-4 py-3 font-bold text-white" href="/packs">
          Go to puzzle packs
        </Link>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800 shadow-sm">
        Gambit could not read the downloaded Random Pack. Remove it from the packs page and download it again.
      </div>
    );
  }

  if (phase === "finished") {
    const endedByTime = variant === "timed" && secondsLeft === 0;

    return (
      <section className="mx-auto max-w-xl rounded-3xl border border-white/50 bg-slate-950 p-8 text-center text-white shadow-2xl">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-sky-300">Puzzle Rush complete</p>
        <h2 className="mt-3 text-4xl font-black">
          {endedByTime ? "Time's up." : "Three strikes."}
        </h2>
        <p className="mt-4 text-slate-300">Your score</p>
        <p className="mt-1 text-7xl font-black text-sky-300">{score}</p>
        <p className="mt-4 text-sm text-slate-300">
          Best {variant === "timed" ? "Timed" : "No-Time"} Rush score: {bestScore}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            className="rounded-xl bg-sky-400 px-5 py-3 font-black text-slate-950 transition hover:bg-sky-300"
            onClick={startGame}
            type="button"
          >
            Play again
          </button>
          <Link className="rounded-xl border border-slate-600 px-5 py-3 font-black text-white transition hover:bg-slate-900" href="/modes">
            All modes
          </Link>
        </div>
      </section>
    );
  }

  if (!currentPuzzle) return null;

  const remainingStrikes = STARTING_STRIKES - strikes;

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
      <PuzzlePlayer
        key={currentPuzzle.id}
        locked={phase !== "playing"}
        onIncorrect={handleIncorrect}
        onSolved={handleSolved}
        puzzle={currentPuzzle}
      />

      <aside className="rounded-2xl border border-white/50 bg-slate-950 p-6 text-white shadow-xl">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-sky-300">
          {variant === "timed" ? "Timed Rush" : "No-Time Rush"}
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-white/10 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-sky-200">Score</p>
            <p className="mt-1 text-4xl font-black">{score}</p>
          </div>
          <div className="rounded-xl bg-white/10 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-sky-200">
              {variant === "timed" ? "Time" : "Best"}
            </p>
            <p className="mt-1 text-4xl font-black">
              {variant === "timed" ? formatTime(secondsLeft) : bestScore}
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-white/10 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-sky-200">Strikes</p>
          <div className="mt-2 flex gap-2" aria-label={`${remainingStrikes} strikes remaining`}>
            {Array.from({ length: STARTING_STRIKES }).map((_, index) => (
              <span
                className={`h-3 flex-1 rounded-full ${
                  index < strikes ? "bg-red-500" : "bg-sky-300"
                }`}
                key={index}
              />
            ))}
          </div>
          <p className="mt-2 text-sm text-slate-300">{remainingStrikes} remaining</p>
        </div>

        <p className="mt-6 text-sm leading-6 text-slate-300">
          {variant === "timed"
            ? "Solve as many puzzles as you can in three minutes."
            : "There is no clock. The run ends after three incorrect solutions."}
        </p>

        <Link className="mt-6 block rounded-xl border border-sky-300 px-4 py-3 text-center font-bold text-sky-200 transition hover:bg-slate-900" href="/packs">
          Manage puzzle packs
        </Link>
      </aside>
    </div>
  );
}