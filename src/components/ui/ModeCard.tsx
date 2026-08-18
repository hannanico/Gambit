import Link from "next/link";

type ModeCardProps = {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  action: string;
  accent?: "sky" | "slate" | "amber";
  disabled?: boolean;
};

const accents = {
  sky: "border-sky-200 bg-sky-50 text-sky-900",
  slate: "border-slate-700 bg-slate-950 text-white",
  amber: "border-amber-200 bg-amber-50 text-amber-950",
};

export function ModeCard({
  eyebrow,
  title,
  description,
  href,
  action,
  accent = "sky",
  disabled = false,
}: ModeCardProps) {
  return (
    <article className={`flex min-h-64 flex-col rounded-2xl border p-6 shadow-lg ${accents[accent]}`}>
      <p className="text-xs font-black uppercase tracking-[0.2em] opacity-70">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-black tracking-tight">{title}</h2>
      <p className="mt-3 max-w-sm text-sm leading-6 opacity-80">{description}</p>

      <div className="mt-auto pt-7">
        {disabled ? (
          <span className="inline-flex rounded-xl border border-current/20 px-4 py-3 text-sm font-bold opacity-60">
            Coming next
          </span>
        ) : (
          <Link
            className={`inline-flex rounded-xl px-4 py-3 text-sm font-black transition ${
              accent === "slate"
                ? "bg-sky-400 text-slate-950 hover:bg-sky-300"
                : "bg-slate-950 text-white hover:bg-slate-800"
            }`}
            href={href}
          >
            {action}
          </Link>
        )}
      </div>
    </article>
  );
}