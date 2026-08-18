"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { InstallGambitButton } from "@/components/pwa/InstallGambitButton";

const links = [
  { href: "/", label: "Home" },
  { href: "/modes", label: "Modes" },
  { href: "/packs", label: "Packs" },
];

type SiteHeaderProps = {
  variant?: "topbar" | "sidebar";
};

export function SiteHeader({ variant = "topbar" }: SiteHeaderProps) {
  const pathname = usePathname();

  if (variant === "sidebar") {
    return (
      <nav aria-label="Main navigation" className="flex h-full flex-col">
        <Link className="flex items-baseline gap-2" href="/">
          <span className="font-serif text-3xl font-black tracking-tight text-slate-950">
            Gambit
          </span>

          <span className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-sky-700">
            Offline chess
          </span>
        </Link>

        <div className="mt-10 grid gap-2">
          {links.map((link) => {
            const active = pathname === link.href;

            return (
              <Link
                className={`rounded-xl px-4 py-3 text-sm font-black transition ${
                  active
                    ? "bg-slate-950 text-white shadow-sm"
                    : "text-slate-700 hover:bg-sky-100 hover:text-slate-950"
                }`}
                href={link.href}
                key={link.href}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="mt-auto pt-6">
          <InstallGambitButton />
        </div>
      </nav>
    );
  }

  return (
    <header className="relative z-30 border-b border-white/40 bg-sky-50/90 backdrop-blur-md">
      <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link className="flex items-baseline gap-2" href="/">
          <span className="font-serif text-3xl font-black tracking-tight text-slate-950">
            Gambit
          </span>

          <span className="hidden text-xs font-bold uppercase tracking-[0.2em] text-sky-700 sm:inline">
            Offline chess
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <InstallGambitButton />

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
      </div>
    </header>
  );
}