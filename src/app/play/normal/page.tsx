import { NormalPuzzleGame } from "@/components/chess/NormalPuzzleGame";
import { SiteHeader } from "@/components/ui/SiteHeader";

export default function NormalModePage() {
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
            <NormalPuzzleGame />
          </div>
        </section>
      </div>
    </main>
  );
}