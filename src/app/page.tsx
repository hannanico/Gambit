import Link from "next/link";
import { ChessMark } from "@/components/ui/ChessMark";
import { ModeCard } from "@/components/ui/ModeCard";
import { SiteHeader } from "@/components/ui/SiteHeader";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[url('/assets/board/icy_sea.png')] bg-cover bg-center text-slate-950">
      <SiteHeader />

      <section className="relative border-b border-sky-200/70 bg-sky-50/80 px-4 py-16 backdrop-blur-sm sm:px-6 sm:py-24 lg:px-8">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <ChessMark
            className="absolute -left-10 bottom-0 h-48 w-48 rotate-[-13deg] opacity-15 sm:h-64 sm:w-64"
            fallback="♞"
            src="/assets/brand/black-king.png"
          />
          <ChessMark
            className="absolute -right-12 -top-8 h-52 w-52 rotate-12 opacity-15 sm:h-72 sm:w-72"
            fallback="♕"
            src="/assets/brand/white-king.png"
          />
        </div>

        <div className="relative mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-sky-700">
              Chess puzzles. Anywhere.
            </p>
            <h1 className="mt-4 max-w-3xl font-serif text-5xl font-black leading-[0.92] tracking-tight sm:text-7xl">
              Find the move.
              <br />
              Win the position.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-700 sm:text-lg">
              Gambit is a focused, offline-first chess-puzzle trainer. Download
              your packs once, then solve tactics on your own terms.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                className="rounded-xl bg-slate-950 px-5 py-3 font-black text-white shadow-lg transition hover:bg-slate-800"
                href="/play/normal"
              >
                Play Normal
              </Link>
              <Link
                className="rounded-xl border border-slate-950/20 bg-white/80 px-5 py-3 font-black text-slate-950 transition hover:bg-white"
                href="/packs"
              >
                Download packs
              </Link>
            </div>
          </div>

          <div className="relative mx-auto grid aspect-square w-full max-w-md grid-cols-2 gap-3 rounded-4xl border-8 border-slate-950 bg-sky-500 p-4 shadow-2xl rotate-2">
            <div className="flex items-center justify-center bg-sky-100">
              <ChessMark className="h-28 w-28" fallback="♕" src="/assets/brand/white-crown.png" />
            </div>
            <div className="flex items-center justify-center bg-sky-700">
              <ChessMark className="h-28 w-28" fallback="♜" src="/assets/brand/black-rook.png" />
            </div>
            <div className="flex items-center justify-center bg-sky-700">
              <ChessMark className="h-28 w-28" fallback="♞" src="/assets/brand/black-knight.png" />
            </div>
            <div className="flex items-center justify-center bg-sky-100">
              <ChessMark className="h-28 w-28" fallback="♗" src="/assets/brand/white-bishop.png" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white/85 px-4 py-14 backdrop-blur-sm sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-sky-700">
                Pick your challenge
              </p>
              <h2 className="mt-2 text-4xl font-black tracking-tight text-slate-950">
                Choose a mode
              </h2>
            </div>
            <Link className="font-bold text-sky-800 hover:text-sky-600" href="/modes">
              Explore all modes →
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <ModeCard
              action="Play Normal"
              description="Random puzzles with no timer and no strikes. Practice one position at a time."
              eyebrow="Practice"
              href="/play/normal"
              title="Normal"
            />
            <ModeCard
              action="Play Puzzle Rush"
              accent="slate"
              description="Solve under pressure. Timed and three-strike variants are coming next."
              eyebrow="Speed"
              href="/play/rush"
              title="Puzzle Rush"
            />
            <ModeCard
              action="Play Rated mode"
              accent="amber"
              description="Select a rating range and train against puzzles at your chosen level."
              eyebrow="Focused training"
              href="/play/rated"
              title="Rated"
            />
          </div>
        </div>
      </section>

      <section className="bg-slate-950 px-4 py-14 text-white sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-sky-300">Offline by design</p>
            <p className="mt-3 leading-7 text-slate-300">Download puzzle packs once and practice without accounts, subscriptions, or a connection.</p>
          </div>
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-sky-300">Your pace</p>
            <p className="mt-3 leading-7 text-slate-300">Use Normal mode for deep calculation, then test your instincts in Puzzle Rush.</p>
          </div>
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-sky-300">Built for any board</p>
            <p className="mt-3 leading-7 text-slate-300">A responsive experience designed to feel natural on both desktop and mobile screens.</p>
          </div>
        </div>
      </section>
    </main>
  );
}