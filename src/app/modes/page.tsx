import { ModeCard } from "@/components/ui/ModeCard";
import { SiteHeader } from "@/components/ui/SiteHeader";

export default function ModesPage() {
  return (
    <main className="min-h-screen bg-[url('/assets/board/icy_sea.jpg')] bg-cover bg-center text-slate-950">
      <SiteHeader />

      <section className="min-h-[calc(100vh-4rem)] bg-sky-50/85 px-4 py-12 backdrop-blur-sm sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-sky-700">Gambit modes</p>
          <h1 className="mt-3 text-5xl font-black tracking-tight">How do you want to train?</h1>
          <p className="mt-4 max-w-2xl text-lg leading-7 text-slate-700">
            Every mode uses puzzles saved on your device. Download a pack first, then choose your challenge.
          </p>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <ModeCard
              action="Play Normal"
              description="Unlimited time, no strikes, and random puzzles from your offline Random Pack."
              eyebrow="Practice"
              href="/play/normal"
              title="Normal"
            />
            <ModeCard
              accent="slate"
              action="Choose Rush"
              description="Solve under pressure: three minutes, or no clock with three strikes."
              eyebrow="Speed"
              href="/play/rush"
              title="Puzzle Rush"
            />
            <ModeCard
              accent="amber"
              action="Coming next"
              description="Choose a downloaded rating range and practice at a difficulty that fits you."
              disabled
              eyebrow="In development"
              href="/modes"
              title="Rated"
            />
          </div>
        </div>
      </section>
    </main>
  );
}