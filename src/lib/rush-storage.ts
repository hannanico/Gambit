export type RushVariant = "timed" | "no-time";

const SCORE_KEYS: Record<RushVariant, string> = {
  timed: "gambit.rush.timed.best-score",
  "no-time": "gambit.rush.no-time.best-score",
};

export function getRushBestScore(variant: RushVariant): number {
  if (typeof window === "undefined") return 0;

  const storedValue = window.localStorage.getItem(SCORE_KEYS[variant]);
  const score = Number(storedValue);

  return Number.isFinite(score) && score > 0 ? score : 0;
}

export function saveRushBestScore(variant: RushVariant, score: number): number {
  const currentBest = getRushBestScore(variant);
  const nextBest = Math.max(currentBest, score);

  window.localStorage.setItem(SCORE_KEYS[variant], String(nextBest));

  return nextBest;
}