"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { PuzzlePlayer } from "@/components/chess/PuzzlePlayer";
import { getDownloadedPuzzlePacks } from "@/lib/puzzle-storage";
import {
  getRushBestScore,
  saveRushBestScore,
  type RushVariant,
} from "@/lib/rush-storage";
import type { Puzzle } from "@/types/puzzle";

const STARTING_STRIKES = 3;
const TIMED_RUSH_SECONDS = 180;
const NEXT_PUZZLE_DELAY_MS = 650;
const RUSH_RATING_STEP = 40;
const RUSH_RATING_WINDOW = 100;

type GamePhase =
  | "loading"
  | "ready"
  | "playing"
  | "finished"
  | "missing-pack"
  | "error";

type PuzzleRushGameProps = {
  variant: RushVariant;
};

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function getUniquePuzzles(storedPacks: Awaited<
  ReturnType<typeof getDownloadedPuzzlePacks>
>): Puzzle[] {
  const puzzlesById = new Map<string, Puzzle>();

  for (const storedPack of storedPacks) {
    for (const puzzle of storedPack.puzzles) {
      puzzlesById.set(puzzle.id, puzzle);
    }
  }

  return [...puzzlesById.values()].sort((a, b) => a.rating - b.rating);
}

function getRushTargetRating(
  score: number,
  minimumRating: number,
  maximumRating: number,
): number {
  return Math.min(
    minimumRating + score * RUSH_RATING_STEP,
    maximumRating,
  );
}

function pickRandomPuzzle(puzzles: Puzzle[]): Puzzle {
  return puzzles[Math.floor(Math.random() * puzzles.length)];
}

function pickRushPuzzle(
  allPuzzles: Puzzle[],
  score: number,
  usedPuzzleIds: Set<string>,
  previousPuzzleId: string | null,
  minimumRating: number | null,
): Puzzle | null {
  if (!allPuzzles.length) return null;

  const lowestRating = allPuzzles[0].rating;
  const highestRating = allPuzzles[allPuzzles.length - 1].rating;

  const targetRating = getRushTargetRating(
    score,
    lowestRating,
    highestRating,
  );

  const unused = allPuzzles.filter(
    (puzzle) => !usedPuzzleIds.has(puzzle.id),
  );

  const poolBeforeRepeats = unused.length ? unused : allPuzzles;

  const withoutImmediateRepeat = poolBeforeRepeats.filter(
    (puzzle) => puzzle.id !== previousPuzzleId,
  );

  const eligible =
    withoutImmediateRepeat.length > 0
      ? withoutImmediateRepeat
      : poolBeforeRepeats;

  // Puzzle ratings never decrease during a run.
  const atOrAbovePreviousRating =
    minimumRating === null
      ? eligible
      : eligible.filter((puzzle) => puzzle.rating >= minimumRating);

  // At the top of the downloaded rating range, a same-rating puzzle is allowed.
  // If the remaining pool has no suitable rating, retain the current level
  // rather than silently selecting an easier puzzle.
  const monotonicPool = atOrAbovePreviousRating.length
    ? atOrAbovePreviousRating
    : eligible.filter((puzzle) => puzzle.rating >= highestRating);

  if (!monotonicPool.length) {
    return null;
  }

  const withinTargetWindow = monotonicPool.filter(
    (puzzle) =>
      puzzle.rating >= targetRating - RUSH_RATING_WINDOW &&
      puzzle.rating <= targetRating + RUSH_RATING_WINDOW,
  );

  if (withinTargetWindow.length) {
    return pickRandomPuzzle(withinTargetWindow);
  }

  const nearestDistance = Math.min(
    ...monotonicPool.map((puzzle) => Math.abs(puzzle.rating - targetRating)),
  );

  const nearestPuzzles = monotonicPool.filter(
    (puzzle) =>
      Math.abs(puzzle.rating - targetRating) === nearestDistance,
  );

  return pickRandomPuzzle(nearestPuzzles);
}

export function PuzzleRushGame({ variant }: PuzzleRushGameProps) {
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [currentPuzzle, setCurrentPuzzle] = useState<Puzzle | null>(null);
  const [phase, setPhase] = useState<GamePhase>("loading");
  const [score, setScore] = useState(0);
  const [strikes, setStrikes] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(TIMED_RUSH_SECONDS);
  const [downloadedPackCount, setDownloadedPackCount] = useState(0);
  const [ratingRange, setRatingRange] = useState<{
    minimum: number;
    maximum: number;
  } | null>(null);

  const phaseRef = useRef<GamePhase>("loading");
  const scoreRef = useRef(0);
  const strikesRef = useRef(0);
  const usedPuzzleIdsRef = useRef(new Set<string>());
  const currentPuzzleIdRef = useRef<string | null>(null);
  const currentPuzzleRatingRef = useRef<number | null>(null);
  const nextPuzzleTimeoutRef = useRef<number | null>(null);

  const clearPendingTransition = useCallback(() => {
    if (nextPuzzleTimeoutRef.current !== null) {
      window.clearTimeout(nextPuzzleTimeoutRef.current);
      nextPuzzleTimeoutRef.current = null;
    }
  }, []);

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
    clearPendingTransition();

    if (phaseRef.current === "finished") return;

    const nextBest = saveRushBestScore(variant, scoreRef.current);

    setBestScore(nextBest);
    setPhase("finished");
  }, [clearPendingTransition, variant]);

  useEffect(() => {
    async function loadDownloadedPacks() {
      try {
        const storedPacks = await getDownloadedPuzzlePacks();
        const uniquePuzzles = getUniquePuzzles(storedPacks);

        if (!uniquePuzzles.length) {
          setPhase("missing-pack");
          return;
        }

        setPuzzles(uniquePuzzles);
        setDownloadedPackCount(storedPacks.length);
        setRatingRange({
          minimum: uniquePuzzles[0].rating,
          maximum: uniquePuzzles[uniquePuzzles.length - 1].rating,
        });
        setPhase("ready");
      } catch {
        setPhase("error");
      }
    }

    void loadDownloadedPacks();

    return clearPendingTransition;
  }, [clearPendingTransition]);

  const loadNextPuzzle = useCallback(
    (nextScore: number) => {
      if (!puzzles.length || phaseRef.current !== "playing") return;

      const next = pickRushPuzzle(
        puzzles,
        nextScore,
        usedPuzzleIdsRef.current,
        currentPuzzleIdRef.current,
        currentPuzzleRatingRef.current,
      );

      if (!next) {
        finishGame();
        return;
      }

      if (usedPuzzleIdsRef.current.size >= puzzles.length) {
        usedPuzzleIdsRef.current = new Set();
      }

      usedPuzzleIdsRef.current.add(next.id);
      currentPuzzleIdRef.current = next.id;
      currentPuzzleRatingRef.current = next.rating;
      setCurrentPuzzle(next);
    },
    [finishGame, puzzles],
  );

  const startGame = useCallback(() => {
    clearPendingTransition();

    if (!puzzles.length) return;

    scoreRef.current = 0;
    strikesRef.current = 0;
    usedPuzzleIdsRef.current = new Set();
    currentPuzzleIdRef.current = null;
    currentPuzzleRatingRef.current = null;

    setScore(0);
    setStrikes(0);
    setSecondsLeft(TIMED_RUSH_SECONDS);
    setPhase("playing");

    const firstPuzzle = pickRushPuzzle(
      puzzles,
      0,
      usedPuzzleIdsRef.current,
      null,
      null
    );

    if (!firstPuzzle) {
      setPhase("error");
      return;
    }

    usedPuzzleIdsRef.current.add(firstPuzzle.id);
    currentPuzzleIdRef.current = firstPuzzle.id;
    currentPuzzleRatingRef.current = firstPuzzle.rating;
    setCurrentPuzzle(firstPuzzle);
  }, [clearPendingTransition, puzzles]);

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

  const scheduleNextPuzzle = useCallback(
    (nextScore: number) => {
      clearPendingTransition();

      nextPuzzleTimeoutRef.current = window.setTimeout(() => {
        nextPuzzleTimeoutRef.current = null;
        loadNextPuzzle(nextScore);
      }, NEXT_PUZZLE_DELAY_MS);
    },
    [clearPendingTransition, loadNextPuzzle],
  );

  const scheduleFinishGame = useCallback(() => {
    clearPendingTransition();

    nextPuzzleTimeoutRef.current = window.setTimeout(() => {
      nextPuzzleTimeoutRef.current = null;
      finishGame();
    }, NEXT_PUZZLE_DELAY_MS);
  }, [clearPendingTransition, finishGame]);

  const handleSolved = useCallback(() => {
    if (phaseRef.current !== "playing") return;

    const nextScore = scoreRef.current + 1;

    scoreRef.current = nextScore;
    setScore(nextScore);
    scheduleNextPuzzle(nextScore);
  }, [scheduleNextPuzzle]);

  const handleIncorrect = useCallback(() => {
    if (phaseRef.current !== "playing") return;

    const nextStrikes = strikesRef.current + 1;

    strikesRef.current = nextStrikes;
    setStrikes(nextStrikes);

    if (nextStrikes >= STARTING_STRIKES) {
      scheduleFinishGame();
      return;
    }

    scheduleNextPuzzle(scoreRef.current);
  }, [scheduleFinishGame, scheduleNextPuzzle]);

  if (phase === "loading" || phase === "ready") {
    return (
      <div className="rounded-2xl border border-sky-100 bg-white p-6 text-slate-700 shadow-sm">
        Loading your downloaded puzzle packs...
      </div>
    );
  }

  if (phase === "missing-pack") {
    return (
      <div className="rounded-2xl border border-sky-100 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-black text-slate-950">
          Download a puzzle pack first
        </h2>

        <p className="mt-2 text-slate-600">
          Puzzle Rush uses every puzzle pack you download. You can start with
          any pack and download more later for longer runs and more variety.
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

  if (phase === "error") {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800 shadow-sm">
        Gambit could not read your downloaded puzzle packs. Remove the affected
        pack from the packs page and download it again.
      </div>
    );
  }

  if (phase === "finished") {
    const endedByTime = variant === "timed" && secondsLeft === 0;

    return (
      <section className="mx-auto max-w-xl rounded-3xl border border-white/50 bg-slate-950 p-8 text-center text-white shadow-2xl">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-sky-300">
          Puzzle Rush complete
        </p>

        <h2 className="mt-3 text-4xl font-black">
          {endedByTime ? "Time's up." : "Three strikes."}
        </h2>

        <p className="mt-4 text-slate-300">Your score</p>
        <p className="mt-1 text-7xl font-black text-sky-300">{score}</p>

        <p className="mt-4 text-sm text-slate-300">
          Best {variant === "timed" ? "Timed" : "No-Time"} Rush score:{" "}
          {bestScore}
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            className="rounded-xl bg-sky-400 px-5 py-3 font-black text-slate-950 transition hover:bg-sky-300"
            onClick={startGame}
            type="button"
          >
            Play again
          </button>

          <Link
            className="rounded-xl border border-slate-600 px-5 py-3 font-black text-white transition hover:bg-slate-900"
            href="/modes"
          >
            All modes
          </Link>
        </div>
      </section>
    );
  }

  if (!currentPuzzle) return null;

  const remainingStrikes = STARTING_STRIKES - strikes;
  const currentTargetRating = ratingRange
    ? getRushTargetRating(
        score,
        ratingRange.minimum,
        ratingRange.maximum,
      )
    : null;

  return (
    <PuzzlePlayer
      key={currentPuzzle.id}
      locked={phase !== "playing"}
      onIncorrect={handleIncorrect}
      onSolved={handleSolved}
      puzzle={currentPuzzle}
      sidebarContent={
        <div>
          <p className="text-[0.7rem] font-black uppercase tracking-[0.18em] text-sky-700">
            {variant === "timed" ? "Timed Rush" : "No-Time Rush"}
          </p>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-slate-950 px-3 py-3 text-white">
              <p className="text-[0.65rem] font-black uppercase tracking-[0.14em] text-sky-200">
                Score
              </p>

              <p className="mt-1 text-3xl font-black">{score}</p>
            </div>

            <div className="rounded-xl bg-slate-950 px-3 py-3 text-white">
              <p className="text-[0.65rem] font-black uppercase tracking-[0.14em] text-sky-200">
                {variant === "timed" ? "Time" : "Best"}
              </p>

              <p className="mt-1 text-3xl font-black">
                {variant === "timed" ? formatTime(secondsLeft) : bestScore}
              </p>
            </div>
          </div>

          <div className="mt-2 rounded-xl bg-slate-950 px-3 py-3 text-white">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[0.65rem] font-black uppercase tracking-[0.14em] text-sky-200">
                Strikes
              </p>

              <p className="text-xs font-semibold text-slate-300">
                {remainingStrikes} remaining
              </p>
            </div>

            <div
              aria-label={`${remainingStrikes} strikes remaining`}
              className="mt-2 flex gap-1.5"
            >
              {Array.from({ length: STARTING_STRIKES }).map((_, index) => (
                <span
                  className={`h-2.5 flex-1 rounded-full ${
                    index < strikes ? "bg-red-500" : "bg-sky-300"
                  }`}
                  key={index}
                />
              ))}
            </div>
          </div>

          {currentTargetRating !== null && ratingRange ? (
            <p className="mt-3 rounded-xl bg-sky-50 px-3 py-3 text-xs font-semibold leading-5 text-slate-600">
              Using{" "}
              {puzzles.length} puzzles from {downloadedPackCount} downloaded{" "}
              {downloadedPackCount === 1 ? "pack" : "packs"}.
            </p>
          ) : null}

          <p className="mt-3 text-sm leading-5 text-slate-600">
            {variant === "timed"
              ? "Solve as many puzzles as you can in three minutes."
              : "There is no clock. The run ends after three incorrect solutions."}
          </p>

          <Link
            className="mt-4 block w-full rounded-xl border border-sky-300 bg-white px-4 py-3 text-center text-sm font-black text-sky-800 transition hover:bg-sky-50"
            href="/packs"
          >
            Manage puzzle packs
          </Link>

          <p className="mt-3 text-xs leading-5 text-slate-500">
            Download more packs for longer Rush runs and more variety.
          </p>
        </div>
      }
    />
  );
}