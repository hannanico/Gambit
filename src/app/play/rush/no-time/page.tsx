import { PuzzleRushGame } from "@/components/chess/PuzzleRushGame";
import { SiteHeader } from "@/components/ui/SiteHeader";

export default function NoTimeRushPage() {
  return (
    <main className="min-h-screen bg-[url('/assets/board/icy_sea.jpg')] bg-cover bg-center text-slate-950">
      <SiteHeader />
      <div className="bg-sky-50/65 px-4 py-8 backdrop-blur-sm sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-sky-700">Puzzle Rush</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">No clock. Three strikes.</h1>
          </div>
          <PuzzleRushGame variant="no-time" />
        </div>
      </div>
    </main>
  );
}