import type { ReactNode } from "react";
import { SiteHeader } from "@/components/ui/SiteHeader";

type GameShellProps = {
  board: ReactNode;
  panel: ReactNode;
};

export function GameShell({ board, panel }: GameShellProps) {
  return (
    <main className="min-h-screen bg-[url('/assets/board/icy_sea.png')] bg-cover bg-center text-slate-950">
      <div className="lg:grid lg:min-h-screen lg:grid-cols-[220px_minmax(0,1fr)_300px]">
        <aside className="hidden border-r border-sky-950/10 bg-sky-50/85 p-5 backdrop-blur-md lg:block">
          <SiteHeader />
        </aside>

        <section className="flex min-h-screen items-center justify-center p-3 sm:p-5 lg:p-6">
          {board}
        </section>

        <aside className="border-t border-sky-950/10 bg-sky-50/90 p-3 backdrop-blur-md lg:border-l lg:border-t-0 lg:p-5">
          {panel}
        </aside>
      </div>

      <div className="lg:hidden">
        <SiteHeader />
      </div>
    </main>
  );
}