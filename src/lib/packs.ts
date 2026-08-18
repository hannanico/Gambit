import type { Puzzle, PuzzleManifest, PuzzlePack } from "@/types/puzzle";

function isPuzzle(value: unknown): value is Puzzle {
  if (!value || typeof value !== "object") return false;

  const puzzle = value as Record<string, unknown>;

  return (
    typeof puzzle.id === "string" &&
    typeof puzzle.fen === "string" &&
    typeof puzzle.moves === "string" &&
    typeof puzzle.rating === "number" &&
    puzzle.moves.trim().length > 0
  );
}

export async function getManifest(): Promise<PuzzleManifest> {
  const response = await fetch("/puzzle-packs/manifest.json", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Could not load the puzzle-pack manifest.");
  }

  return response.json() as Promise<PuzzleManifest>;
}

export async function sha256(buffer: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", buffer);

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function downloadAndVerifyPack(
  pack: PuzzlePack,
): Promise<Puzzle[]> {
  const response = await fetch(`/puzzle-packs/${pack.file}`);

  if (!response.ok) {
    throw new Error(`Could not download ${pack.file}.`);
  }

  const buffer = await response.arrayBuffer();
  const actualHash = await sha256(buffer);

  if (actualHash !== pack.sha256.toLowerCase()) {
    throw new Error(
      `The download failed verification. Expected SHA-256 does not match for ${pack.file}.`,
    );
  }

  const text = new TextDecoder().decode(buffer);
  const parsed: unknown = JSON.parse(text);

  if (!Array.isArray(parsed) || !parsed.every(isPuzzle)) {
    throw new Error(`The file ${pack.file} has an invalid puzzle format.`);
  }

  if (parsed.length !== pack.puzzleCount) {
    throw new Error(
      `Expected ${pack.puzzleCount.toLocaleString()} puzzles, but found ${parsed.length.toLocaleString()}.`,
    );
  }

  return parsed;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${Math.ceil(bytes / 1024)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}