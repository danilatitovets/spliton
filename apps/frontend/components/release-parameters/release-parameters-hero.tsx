import { RELEASE_PARAMETERS_HERO_PILLS, RELEASE_PARAMETERS_SUMMARY } from "@/constants/release-parameters/page";

export function ReleaseParametersHero() {
  return (
    <section id="rp-top" data-release-parameters-section className="scroll-mt-28 pt-6 md:pt-10">
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">RevShare · Catalog</p>
      <h1 className="mt-3 max-w-4xl text-3xl font-semibold tracking-tight text-white md:text-4xl lg:text-5xl">
        Параметры релиза
      </h1>

      <div className="mt-6 max-w-3xl space-y-4 text-sm leading-relaxed text-zinc-400 md:text-base">
        <p>
          Как читать карточку актива в каталоге: какие поля важны, что означают UNT и investor share, как понимать
          raise target, payout model и статус. Это не гид по выбору и не аналитика — только язык карточки релиза.
        </p>
        <p className="text-zinc-500">
          Ниже — тот же спокойный ритм, что на гиде: плотные секции на чёрном фоне, плитки без рамок и sky-акцент, как
          в каталоге.
        </p>
        <p className="text-xs leading-relaxed text-zinc-600">
          По модели продукта вы получаете revenue share rights и UNT в USDT (TRC20): это не ценные бумаги, не
          брокерские инструменты и не гарантированная доходность.
        </p>
      </div>

      <div className="mt-10">
        <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Найдите нужный блок</div>
        <div className="mt-4 flex flex-wrap gap-2">
          {RELEASE_PARAMETERS_HERO_PILLS.map((pill) => (
            <a
              key={pill.href}
              href={pill.href}
              className="inline-flex items-center gap-2 rounded-xl bg-[#111111] px-3.5 py-2 text-left text-[13px] text-white transition-colors hover:bg-white/4"
            >
              <span className="font-medium">{pill.label}</span>
              <span className="text-[11px] text-zinc-500">{pill.hint}</span>
            </a>
          ))}
        </div>
      </div>

      <div className="mt-12 max-w-4xl">
        <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Опорные поля</div>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500">
          Четыре термина, с которых удобно сверять любую карточку — без отдельной колонки, одной сеткой под якорями.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {RELEASE_PARAMETERS_SUMMARY.map((row) => (
            <div
              key={row.label}
              className="rounded-xl bg-[#111111] p-4 transition-colors hover:bg-white/4 md:p-5"
            >
              <p className="font-mono text-[10px] font-semibold uppercase tracking-wide text-zinc-500">{row.label}</p>
              <p className="mt-2 text-sm font-semibold text-white">{row.value}</p>
              <p className="mt-2 text-xs leading-relaxed text-zinc-500">{row.hint}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
