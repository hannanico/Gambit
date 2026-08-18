"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/modes", label: "Modes" },
  { href: "/packs", label: "Packs" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-white/40 bg-sky-50/85 backdrop-blur-md">
      <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link className="flex items-baseline gap-2" href="/">
          <span className="font-serif text-3xl font-black tracking-tight text-slate-950">
            Gambit
          </span>
          <span className="hidden text-xs font-bold uppercase tracking-[0.2em] text-sky-700 sm:inline">
            Offline chess
          </span>
        </Link>

        <nav aria-label="Main navigation" className="flex items-center gap-1">
          {links.map((link) => {
            const active = pathname === link.href;

            return (
              <Link
                className={`rounded-lg px-3 py-2 text-sm font-bold transition sm:px-4 ${
                  active
                    ? "bg-slate-950 text-white"
                    : "text-slate-700 hover:bg-sky-100 hover:text-slate-950"
                }`}
                href={link.href}
                key={link.href}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}