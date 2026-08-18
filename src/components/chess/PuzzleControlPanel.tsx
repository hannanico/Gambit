type PuzzleControlPanelProps = {
  modeLabel: string;
  playerLabel: string;
  rating?: number;
  status: string;
  message: string;
  solvedThisSession: number;
  onHint?: () => void;
  onReveal?: () => void;
  onNextPuzzle: () => void;
};

export function PuzzleControlPanel({
  modeLabel,
  playerLabel,
  rating,
  status,
  message,
  solvedThisSession,
  onHint,
  onReveal,
  onNextPuzzle,
}: PuzzleControlPanelProps) {
  return (
    <section className="mx-auto flex max-w-sm flex-col gap-4 lg:max-w-none">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-700">
          {modeLabel}
        </p>

        <h1 className="mt-1 text-xl font-black text-slate-950">
          {playerLabel}
        </h1>

        {rating ? (
          <p className="mt-1 text-sm font-semibold text-slate-600">
            Puzzle rating {rating}
          </p>
        ) : null}
      </div>

      <div className="border-y border-sky-950/10 py-4">
        <p className="text-sm font-black text-sky-700">{status}</p>
        <p className="mt-1 text-base font-bold text-slate-900">{message}</p>
      </div>

      <div className="grid gap-2">
        {onHint ? (
          <button
            type="button"
            onClick={onHint}
            className="rounded-xl border border-sky-300 bg-white px-4 py-3 text-sm font-black text-sky-950 transition hover:bg-sky-100"
          >
            Hint
          </button>
        ) : null}

        {onReveal ? (
          <button
            type="button"
            onClick={onReveal}
            className="rounded-xl border border-sky-300 bg-white px-4 py-3 text-sm font-black text-sky-950 transition hover:bg-sky-100"
          >
            Reveal solution
          </button>
        ) : null}

        <button
          type="button"
          onClick={onNextPuzzle}
          className="rounded-xl bg-sky-500 px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-sky-400"
        >
          Next puzzle
        </button>
      </div>

      <div className="rounded-xl bg-slate-950 px-4 py-3 text-white">
        <p className="text-[0.68rem] font-black uppercase tracking-[0.16em] text-sky-200">
          Solved this session
        </p>
        <p className="mt-1 text-3xl font-black">{solvedThisSession}</p>
      </div>
    </section>
  );
}