export function ReleaseAnalyticsRiskSection({ notes }: { notes: string[] }) {
  return (
    <section className="space-y-4 pb-4">
      <div>
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-600">Важно</p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight text-white">Ограничения и дисклеймер</h2>
        <p className="mt-1.5 max-w-[62ch] text-[12px] leading-relaxed text-zinc-600">
          Коротко о том, как интерпретировать эту страницу.
        </p>
      </div>

      <ol className="list-none space-y-0 rounded-xl bg-[#111111] p-1">
        {notes.map((n, i) => (
          <li
            key={i}
            className="flex gap-3 border-t border-white/[0.05] px-4 py-3.5 first:border-t-0 first:pt-4 last:pb-4"
          >
            <span
              className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-[#0a0a0a] font-mono text-[10px] font-semibold text-zinc-500 ring-1 ring-white/8"
              aria-hidden
            >
              {i + 1}
            </span>
            <p className="min-w-0 text-[13px] leading-relaxed text-zinc-400">{n}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
