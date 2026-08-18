"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getManifest } from "@/lib/packs";
import { getDownloadedPackIds } from "@/lib/puzzle-storage";
import type { PuzzleManifest, PuzzlePack } from "@/types/puzzle";

const RANDOM_PACK_ID = "random-20k";

function difficultyName(pack: PuzzlePack): string {
  if (pack.maxRating <= 1000) return "Beginner";
  if (pack.maxRating <= 1500) return "Intermediate";
  if (pack.maxRating <= 2000) return "Advanced";
  if (pack.maxRating <= 2500) return "Expert";
  return "Master";
}

function packDescription(pack: PuzzlePack): string {
  const range = `${pack.minRating.toLocaleString()}–${pack.maxRating.toLocaleString()}`;

  if (pack.maxRating <= 1000) return `${range}: learn the core tactical patterns.`;
  if (pack.maxRating <= 1500) return `${range}: sharpen common tactical ideas.`;
  if (pack.maxRating <= 2000) return `${range}: calculate deeper combinations.`;
  if (pack.maxRating <= 2500) return `${range}: test advanced tactical vision.`;
  return `${range}: take on master-level tactics.`;
}

export function RatedPackSelector() {
  const [manifest, setManifest] = useState<PuzzleManifest | null>(null);
  const [downloadedIds, setDownloadedIds] = useState<Set<string>>(new Set());
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    async function loadPacks() {
      try {
        const [nextManifest, ids] = await Promise.all([
          getManifest(),
          getDownloadedPackIds(),
        ]);

        setManifest(nextManifest);
        setDownloadedIds(new Set(ids));
        setState("ready");
      } catch {
        setState("error");
      }
    }

    void loadPacks();
  }, []);

  if (state === "loading") {
    return <p className="text-slate-600">Checking your downloaded rating packs...</p>;
  }

  if (state === "error" || !manifest) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
        Gambit could not load the available rating packs.
      </div>
    );
  }

  const ratingPacks = manifest.packs.filter((pack) => pack.id !== RANDOM_PACK_ID);
  const downloadedCount = ratingPacks.filter((pack) => downloadedIds.has(pack.id)).length;

  return (
    <div>
      <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-950">
        <p className="font-bold">{downloadedCount} of {ratingPacks.length} rating packs available offline</p>
        <p className="mt-1 text-sm text-amber-900">
          Download more rating packs from Packs whenever you want to train a new range.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {ratingPacks.map((pack) => {
          const downloaded = downloadedIds.has(pack.id);

          return (
            <article
              className={`rounded-2xl border p-5 shadow-sm ${
                downloaded
                  ? "border-amber-200 bg-white"
                  : "border-slate-200 bg-slate-50 opacity-80"
              }`}
              key={pack.id}
            >
              <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">
                {difficultyName(pack)}
              </p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">
                {pack.minRating.toLocaleString()}–{pack.maxRating.toLocaleString()}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{packDescription(pack)}</p>
              <p className="mt-4 text-sm font-semibold text-slate-500">
                {pack.puzzleCount.toLocaleString()} puzzles
              </p>

              {downloaded ? (
                <Link
                  className="mt-5 inline-flex rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white transition hover:bg-slate-800"
                  href={`/play/rated/${pack.id}`}
                >
                  Start training
                </Link>
              ) : (
                <Link
                  className="mt-5 inline-flex rounded-xl border border-amber-300 px-4 py-3 text-sm font-black text-amber-800 transition hover:bg-amber-50"
                  href="/packs"
                >
                  Download pack
                </Link>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}