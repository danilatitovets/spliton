import { RELEASE_PARAMETERS_GRID } from "@/constants/release-parameters/page";

import { ReleaseSectionShell } from "./ui/release-section-shell";

export function ReleaseParametersGrid() {
  return (
    <ReleaseSectionShell
      id="rp-params"
      kicker="Словарь полей"
      title="Ключевые параметры"
      subtitle="Ниже — восемь полей карточки каталога. Сначала «что это простыми словами», затем «на что смотреть при сравнении двух релизов»."
    >
      <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2">
        {RELEASE_PARAMETERS_GRID.map((p, i) => (
          <article
            key={p.title}
            className="flex min-h-full flex-col rounded-2xl bg-[#111111] p-5 transition-colors hover:bg-[#141414] md:p-6"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono text-[11px] font-semibold uppercase tracking-wide text-sky-400/90">{p.title}</p>
                <h3 className="mt-1 text-lg font-semibold tracking-tight text-white md:text-xl">{p.titleRu}</h3>
              </div>
              <span className="shrink-0 font-mono text-[11px] font-semibold tabular-nums text-zinc-600">
                {String(i + 1).padStart(2, "0")}
              </span>
            </div>

            <div className="mt-4 flex-1 rounded-xl bg-[#0a0a0a] px-4 py-3.5">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">Что это</p>
              <p className="mt-2 text-sm leading-relaxed text-zinc-300 md:text-[15px]">{p.definition}</p>
            </div>

            <div className="mt-3">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                При сравнении в каталоге
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-zinc-500 md:text-sm">{p.why}</p>
            </div>
          </article>
        ))}
      </div>
    </ReleaseSectionShell>
  );
}
