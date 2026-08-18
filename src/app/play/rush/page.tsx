import { ModeCard } from "@/components/ui/ModeCard";
import { SiteHeader } from "@/components/ui/SiteHeader";

export default function PuzzleRushPage() {
  return (
    <main className="min-h-screen bg-[url('/assets/board/icy_sea.jpg')] bg-cover bg-center text-slate-950">
      <SiteHeader />
      <section className="min-h-[calc(100vh-4rem)] bg-sky-50/85 px-4 py-12 backdrop-blur-sm sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-sky-700">Puzzle Rush</p>
          <h1 className="mt-3 text-5xl font-black tracking-tight">Choose your pressure.</h1>
          <p className="mt-4 max-w-2xl text-lg leading-7 text-slate-700">
            Both variants use your downloaded Random Pack. A legal wrong move costs one strike; illegal moves let you try again.
          </p>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <ModeCard
              accent="slate"
              action="Start Timed Rush"
              description="Three minutes to solve as many puzzles as you can. The run ends at zero time or after three strikes."
              eyebrow="3:00 timer · 3 strikes"
              href="/play/rush/timed"
              title="Timed Rush"
            />
            <ModeCard
              accent="amber"
              action="Start No-Time Rush"
              description="No timer. Keep solving until three legal-but-wrong answers end your run."
              eyebrow="No clock · 3 strikes"
              href="/play/rush/no-time"
              title="No-Time Rush"
            />
          </div>
        </div>
      </section>
    </main>
  );
}