import { RatedPackSelector } from "@/components/chess/RatedPackSelector";
import { SiteHeader } from "@/components/ui/SiteHeader";

export default function RatedModePage() {
  return (
    <main className="min-h-screen bg-[url('/assets/board/icy_sea.jpg')] bg-cover bg-center text-slate-950">
      <SiteHeader />

      <section className="min-h-[calc(100vh-4rem)] bg-sky-50/85 px-3 py-12 backdrop-blur-sm sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-700">
            Rated mode
          </p>

          <h1 className="mt-3 text-5xl font-black tracking-tight">
            Choose your range.
          </h1>

          <p className="mt-4 max-w-xl text-lg leading-7 text-slate-700">
            Choose a downloaded rating pack and train at your pace. There is no
            timer, no strike limit, and no account.
          </p>

          <div className="mt-10">
            <RatedPackSelector />
          </div>
        </div>
      </section>
    </main>
  );
}