import { PackManager } from "@/components/packs/PackManager";
import { SiteHeader } from "@/components/ui/SiteHeader";

export default function PacksPage() {
  return (
    <main className="min-h-screen bg-[url('/assets/board/icy_sea.jpg')] bg-cover bg-center text-slate-950">
  <SiteHeader />

  <div className="bg-sky-50/80 px-4 py-8 backdrop-blur-sm sm:px-8">
    <div className="mx-auto max-w-4xl">
      <header className="mb-8 rounded-2xl border border-white/50 bg-white/85 px-5 py-5 shadow-lg">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-sky-700">Gambit</p>
        <h1 className="mt-1 text-3xl font-black text-slate-950">Puzzle packs</h1>
      </header>

      <section className="rounded-2xl border border-white/50 bg-white/85 p-5 shadow-lg sm:p-7">
        <h2 className="text-2xl font-black text-slate-950">Download once. Solve anywhere.</h2>
        <p className="mt-2 max-w-2xl text-slate-600">
          Puzzle packs are stored only on this device. Download a pack while online,
          then Gambit can use it without an account or a connection.
        </p>
        <div className="mt-6"><PackManager /></div>
      </section>
    </div>
  </div>
</main>
  );
}