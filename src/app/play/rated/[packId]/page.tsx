import { notFound } from "next/navigation";
import { RatedPuzzleGame } from "@/components/chess/RatedPuzzleGame";
import { SiteHeader } from "@/components/ui/SiteHeader";
import type { PuzzleManifest, PuzzlePack } from "@/types/puzzle";

async function getManifest(): Promise<PuzzleManifest> {
  const response = await fetch(
    `${
      process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
    }/puzzle-packs/manifest.json`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Could not load puzzle packs.");
  }

  return response.json();
}

type RatedPuzzlePageProps = {
  params: Promise<{ packId: string }>;
};

export default async function RatedPuzzlePage({
  params,
}: RatedPuzzlePageProps) {
  const { packId } = await params;
  const manifest = await getManifest();
  const pack = manifest.packs.find((item) => item.id === packId);

  if (!pack || pack.id === "random-20k") {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[url('/assets/board/icy_sea.jpg')] bg-cover bg-center text-slate-950">
      <div className="lg:grid lg:h-screen lg:grid-cols-[220px_minmax(0,1fr)] lg:overflow-hidden">
        <aside className="hidden h-screen border-r border-sky-950/10 bg-sky-50/85 p-5 backdrop-blur-md lg:block">
          <SiteHeader variant="sidebar" />
        </aside>

        <div className="lg:hidden">
          <SiteHeader />
        </div>

        <section className="min-w-0 bg-sky-50/55 p-3 backdrop-blur-sm sm:p-4 lg:flex lg:h-screen lg:items-center lg:overflow-hidden lg:p-3">
          <div className="mx-auto w-full max-w-none">
            <RatedPuzzleGame pack={pack as PuzzlePack} />
          </div>
        </section>
      </div>
    </main>
  );
}