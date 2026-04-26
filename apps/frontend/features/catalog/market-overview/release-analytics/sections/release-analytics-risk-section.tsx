export function ReleaseAnalyticsRiskSection({ notes }: { notes: string[] }) {
  return (
    <section className="min-w-0 border-t border-white/8 pt-10 pb-6">
      <h2 className="text-xl font-semibold tracking-tight text-white">Ограничения и дисклеймер</h2>
      <p className="mt-2 max-w-prose text-[14px] leading-relaxed text-zinc-500">
        Ниже — как читать эту страницу: ориентиры по mock-данным, без юридической силы и без персональной рекомендации к
        сделке.
      </p>

      <div className="mt-8 flex max-w-[68ch] flex-col gap-2.5">
        {notes.map((n, i) => (
          <p
            key={i}
            className="rounded-xl bg-[#111111] px-4 py-4 text-[15px] leading-[1.65] text-zinc-400 text-pretty"
          >
            {n}
          </p>
        ))}
      </div>
    </section>
  );
}
