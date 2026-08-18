import Link from "next/link";

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[url('/assets/board/icy_sea.jpg')] bg-cover bg-center p-5 text-slate-950">
      <section className="w-full max-w-lg rounded-3xl border border-white/60 bg-white/90 p-8 text-center shadow-2xl backdrop-blur">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-sky-700">
          Gambit
        </p>

        <h1 className="mt-3 text-4xl font-black tracking-tight">
          You are offline.
        </h1>

        <p className="mt-4 leading-7 text-slate-600">
          Reconnect once to load this part of Gambit. Previously downloaded
          puzzle packs will still be available when the app is cached.
        </p>

        <Link
          className="mt-7 inline-flex rounded-xl bg-slate-950 px-5 py-3 font-black text-white transition hover:bg-slate-800"
          href="/"
        >
          Try again
        </Link>
      </section>
    </main>
  );
}