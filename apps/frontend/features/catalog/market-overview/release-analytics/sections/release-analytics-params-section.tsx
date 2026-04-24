import type { ReleaseMarketAnalyticsParamRow } from "@/types/catalog/release-market-analytics";

/** Ключи из mock → понятные подписи и подсказки для инвестора. */
const PARAM_META: Record<string, { title: string; hint?: string; group: "shares" | "round" | "cash" }> = {
  distribution_share: {
    group: "shares",
    title: "Доля дистрибуции",
    hint: "доля гросса, идущая в пул выплат",
  },
  artist_share: { group: "shares", title: "Доля артиста" },
  investor_share: { group: "shares", title: "Доля инвесторов", hint: "остаток после других долей" },
  raise_target: { group: "round", title: "Цель сбора", hint: "плановый объём раунда" },
  hard_cap: { group: "round", title: "Hard cap", hint: "верхняя граница сбора" },
  total_units: { group: "round", title: "Всего units", hint: "эмиссия в рамках сделки" },
  available_units: { group: "round", title: "Доступно сейчас", hint: "остаток к покупке" },
  primary_unit_price: {
    group: "round",
    title: "Цена unit (первичка)",
    hint: "USDT за 1 unit в первичном раунде — то же значение, что на странице покупки",
  },
  promo_budget: { group: "cash", title: "Промо-бюджет" },
  artist_upfront: { group: "cash", title: "Аванс артисту" },
  platform_upfront: { group: "cash", title: "Аванс платформе" },
};

const GROUP_TITLE: Record<(typeof PARAM_META)[string]["group"], { k: string; t: string; d: string }> = {
  shares: {
    k: "Доли",
    t: "Как делится гросс",
    d: "Проценты в модели revenue share — сумма может не совпадать с 100% из-за округления в mock.",
  },
  round: {
    k: "Раунд и units",
    t: "Параметры размещения",
    d: "Цели сбора и объём прав в units.",
  },
  cash: {
    k: "Платежи",
    t: "Разовые выплаты",
    d: "Фиксированные суммы по договору (mock).",
  },
};

function ParamRow({ row }: { row: ReleaseMarketAnalyticsParamRow }) {
  const meta = PARAM_META[row.label] ?? {
    group: "round" as const,
    title: row.label.replace(/_/g, " "),
  };
  return (
    <div className="flex flex-col gap-0.5 border-t border-white/[0.05] py-3 first:border-t-0 first:pt-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-zinc-200">{meta.title}</p>
        {meta.hint ? <p className="mt-0.5 text-[11px] leading-snug text-zinc-600">{meta.hint}</p> : null}
      </div>
      <p className="mt-1 shrink-0 font-mono text-[13px] font-semibold tabular-nums text-white sm:mt-0 sm:text-right">{row.value}</p>
    </div>
  );
}

export function ReleaseAnalyticsParamsSection({ params }: { params: ReleaseMarketAnalyticsParamRow[] }) {
  const grouped = params.reduce<Record<string, ReleaseMarketAnalyticsParamRow[]>>((acc, p) => {
    const g = PARAM_META[p.label]?.group ?? "round";
    acc[g] = acc[g] ?? [];
    acc[g].push(p);
    return acc;
  }, {});

  const order: (keyof typeof GROUP_TITLE)[] = ["shares", "round", "cash"];

  return (
    <section className="space-y-4">
      <div>
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-600">Параметры</p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight text-white">Структура сделки</h2>
        <p className="mt-1.5 max-w-[62ch] text-[12px] leading-relaxed text-zinc-600">
          Поля карточки релиза — в удобном виде. Значения демонстрационные.
        </p>
      </div>

      <div className="space-y-5">
        {order.map((groupId) => {
          const rows = grouped[groupId];
          if (!rows?.length) return null;
          const head = GROUP_TITLE[groupId];
          return (
            <div key={groupId} className="rounded-xl bg-[#111111] px-4 py-4 sm:px-5">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-600">{head.k}</p>
              <h3 className="mt-1 text-[15px] font-semibold text-white">{head.t}</h3>
              <p className="mt-1 text-[11px] leading-relaxed text-zinc-600">{head.d}</p>
              <div className="mt-4">
                {rows.map((p) => (
                  <ParamRow key={p.label} row={p} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
