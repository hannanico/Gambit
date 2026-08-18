"use client";

import { useEffect, useState } from "react";
import { formatBytes, getManifest, downloadAndVerifyPack } from "@/lib/packs";
import {
  deletePuzzlePack,
  getDownloadedPackIds,
  savePuzzlePack,
} from "@/lib/puzzle-storage";
import type { PuzzleManifest, PuzzlePack } from "@/types/puzzle";
import { requestPersistentStorage } from "@/lib/storage-health";

type PackStatus = "idle" | "downloading" | "downloaded" | "error";

function rangeLabel(pack: PuzzlePack) {
  return `${pack.minRating.toLocaleString()}–${pack.maxRating.toLocaleString()}`;
}

function displayName(pack: PuzzlePack) {
  if (pack.id === "random-20k") return "Random puzzles";

  return `Rated ${rangeLabel(pack)}`;
}

export function PackManager() {
  const [manifest, setManifest] = useState<PuzzleManifest | null>(null);
  const [statuses, setStatuses] = useState<Record<string, PackStatus>>({});
  const [messages, setMessages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  async function loadPage() {
    try {
      setLoading(true);

      const [nextManifest, downloadedIds] = await Promise.all([
        getManifest(),
        getDownloadedPackIds(),
      ]);

      setManifest(nextManifest);

      const downloaded = new Set(downloadedIds);

      setStatuses(
        Object.fromEntries(
          nextManifest.packs.map((pack) => [
            pack.id,
            downloaded.has(pack.id) ? "downloaded" : "idle",
          ]),
        ),
      );
    } catch (error) {
      setMessages({
        page:
          error instanceof Error
            ? error.message
            : "Could not load puzzle packs.",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPage();
  }, []);

  async function downloadPack(pack: PuzzlePack) {
    setStatuses((current) => ({ ...current, [pack.id]: "downloading" }));
    setMessages((current) => ({ ...current, [pack.id]: "Downloading..." }));

    try {
      const puzzles = await downloadAndVerifyPack(pack);
      await savePuzzlePack(pack, puzzles);
      await requestPersistentStorage();

      setStatuses((current) => ({ ...current, [pack.id]: "downloaded" }));
      setMessages((current) => ({
        ...current,
        [pack.id]: `${puzzles.length.toLocaleString()} puzzles saved offline.`,
      }));
    } catch (error) {
      setStatuses((current) => ({ ...current, [pack.id]: "error" }));
      setMessages((current) => ({
        ...current,
        [pack.id]:
          error instanceof Error ? error.message : "Download failed.",
      }));
    }
  }

  async function removePack(pack: PuzzlePack) {
    try {
      await deletePuzzlePack(pack.id);

      setStatuses((current) => ({ ...current, [pack.id]: "idle" }));
      setMessages((current) => ({
        ...current,
        [pack.id]: "Removed from this device.",
      }));
    } catch {
      setMessages((current) => ({
        ...current,
        [pack.id]: "Could not remove this pack.",
      }));
    }
  }

  if (loading) {
    return <p className="text-slate-600">Loading available packs...</p>;
  }

  if (!manifest) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
        {messages.page ?? "Puzzle packs could not be loaded."}
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {manifest.packs.map((pack) => {
        const status = statuses[pack.id] ?? "idle";
        const isDownloaded = status === "downloaded";
        const isBusy = status === "downloading";

        return (
          <article
            className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm"
            key={pack.id}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-700">
                  {pack.id === "random-20k" ? "Normal & Puzzle Rush" : "Rated mode"}
                </p>

                <h2 className="mt-1 text-xl font-black text-slate-950">
                  {displayName(pack)}
                </h2>

                <p className="mt-1 text-sm text-slate-600">
                  {rangeLabel(pack)} rating · {pack.puzzleCount.toLocaleString()} puzzles ·{" "}
                  {formatBytes(pack.sizeBytes)}
                </p>

                {messages[pack.id] ? (
                  <p
                    className={`mt-2 text-sm ${
                      status === "error" ? "text-red-700" : "text-slate-600"
                    }`}
                  >
                    {messages[pack.id]}
                  </p>
                ) : null}
              </div>

              {isDownloaded ? (
                <button
                  className="rounded-xl border border-red-200 px-4 py-3 text-sm font-bold text-red-700 transition hover:bg-red-50"
                  onClick={() => void removePack(pack)}
                  type="button"
                >
                  Remove pack
                </button>
              ) : (
                <button
                  className="rounded-xl bg-sky-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-sky-300"
                  disabled={isBusy}
                  onClick={() => void downloadPack(pack)}
                  type="button"
                >
                  {isBusy ? "Downloading..." : "Download for offline use"}
                </button>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}