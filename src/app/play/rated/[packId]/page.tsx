import { notFound } from "next/navigation";
import { RatedPuzzleGame } from "@/components/chess/RatedPuzzleGame";
import { SiteHeader } from "@/components/ui/SiteHeader";
import type { PuzzleManifest, PuzzlePack } from "@/types/puzzle";

async function getManifest(): Promise<PuzzleManifest> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/puzzle-packs/manifest.json`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Could not load puzzle packs.");
  }

  return response.json();
}

type RatedPuzzlePageProps = {
  params: Promise<{ packId: string }>;
};

export default async function RatedPuzzlePage({ params }: RatedPuzzlePageProps) {
  const { packId } = await params;
  const manifest = await getManifest();
  const pack = manifest.packs.find((item) => item.id === packId);

  if (!pack || pack.id === "random-20k") {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[url('/assets/board/icy_sea.jpg')] bg-cover bg-center text-slate-950">
      <SiteHeader />

      <div className="bg-sky-50/65 px-4 py-8 backdrop-blur-sm sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">Rated mode</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">
              {pack.minRating.toLocaleString()}–{pack.maxRating.toLocaleString()} puzzles
            </h1>
          </div>

          <RatedPuzzleGame pack={pack as PuzzlePack} />
        </div>
      </div>
    </main>
  );
}