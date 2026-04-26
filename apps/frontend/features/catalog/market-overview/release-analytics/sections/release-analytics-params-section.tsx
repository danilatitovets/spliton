import type { ReleaseMarketAnalyticsParamRow } from "@/types/catalog/release-market-analytics";

/** Ключи параметров → понятные подписи и подсказки для инвестора. */
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
  total_units: { group: "round", title: "Всего UNT", hint: "эмиссия в рамках сделки" },
  available_units: { group: "round", title: "Доступно сейчас", hint: "остаток к покупке" },
  primary_unit_price: {
    group: "round",
    title: "Цена UNT (первичка)",
    hint: "Стоимость за 1 UNT в первичном раунде — то же значение, что на странице покупки",
  },
  promo_budget: { group: "cash", title: "Промо-бюджет" },
  artist_upfront: { group: "cash", title: "Аванс артисту" },
  platform_upfront: { group: "cash", title: "Аванс платформе" },
};

const GROUP_TITLE: Record<(typeof PARAM_META)[string]["group"], { k: string; t: string; d: string }> = {
  shares: {
    k: "Доли",
    t: "Как делится гросс",
    d: "Проценты в модели revenue share — сумма может не совпадать с 100% из-за округления.",
  },
  round: {
    k: "Раунд и UNT",
    t: "Параметры размещения",
    d: "Цели сбора и объём прав в UNT.",
  },
  cash: {
    k: "Платежи",
    t: "Разовые выплаты",
    d: "Фиксированные суммы по договору.",
  },
};

function StructuredParamRow({ row }: { row: ReleaseMarketAnalyticsParamRow }) {
  const meta = PARAM_META[row.label] ?? {
    group: "round" as const,
    title: row.label.replace(/_/g, " "),
  };
  return (
    <div className="rounded-xl bg-[#111111] px-4 py-4 sm:px-5">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
        <div className="min-w-0">
          <p className="text-[24px] font-semibold leading-tight text-zinc-200">{meta.title}</p>
        </div>
        <p className="shrink-0 font-mono text-[30px] font-semibold tabular-nums tracking-tight text-white">{row.value}</p>
      </div>
    </div>
  );
}

function parseCompactValue(value: string) {
  const normalized = value.replace(/\s/g, "").replace(",", ".");
  const num = Number.parseFloat(normalized.replace(/[^\d.]/g, ""));
  if (!Number.isFinite(num)) return 0;
  if (normalized.includes("K")) return num * 1000;
  if (normalized.includes("M")) return num * 1000000;
  return num;
}

function formatCompactTick(value: number) {
  if (!Number.isFinite(value) || value <= 0) return "0";
  if (value >= 1000000) return `${(value / 1000000).toFixed(1).replace(".", ",")}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1).replace(".", ",")}K`;
  return `${Math.round(value)}`;
}

function RoundPlacementChart({ rows }: { rows: ReleaseMarketAnalyticsParamRow[] }) {
  const byLabel = Object.fromEntries(rows.map((r) => [r.label, r]));
  const targetRaw = byLabel.raise_target?.value ?? "0";
  const capRaw = byLabel.hard_cap?.value ?? "0";
  const target = parseCompactValue(targetRaw);
  const cap = parseCompactValue(capRaw);
  const ratio = cap > 0 ? Math.min(100, Math.max(0, (target / cap) * 100)) : 0;
  const targetY = 100 - ratio;
  const targetLabelY = Math.max(14, targetY - 2);
  const capY = 12;
  const capLabelY = Math.max(10, capY - 2);
  const ticks = [1, 0.75, 0.5, 0.25].map((k) => ({
    y: (1 - k) * 100,
    value: formatCompactTick(cap * k),
  }));

  return (
    <div className="rounded-xl bg-[#111111] p-4 sm:p-5">
      <div className="mt-3 rounded-lg bg-[#0d0d0d] p-3">
        <div className="relative h-44 overflow-hidden rounded-md bg-[#0a0a0a]">
          <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
            {ticks.map((tick) => (
              <g key={tick.y}>
                <line x1="0" y1={tick.y} x2="100" y2={tick.y} stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" />
                <text x="98" y={Math.max(6, tick.y - 1)} textAnchor="end" fontSize="3.5" fill="rgba(255,255,255,0.55)">
                  {tick.value}
                </text>
              </g>
            ))}
            <polyline
              points="0,72 8,74 16,69 24,66 32,62 40,59 48,54 56,58 64,51 72,47 80,43 88,39 96,34 100,33"
              fill="none"
              stroke="#B7F500"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line x1="0" y1={100 - ratio} x2="100" y2={100 - ratio} stroke="#34d399" strokeWidth="1.1" strokeDasharray="3 2" />
            <line x1="0" y1="12" x2="100" y2="12" stroke="#f59e0b" strokeWidth="1.1" strokeDasharray="3 2" />
            <rect x="70" y={targetLabelY - 5.5} width="28" height="7.5" rx="2" fill="#07120f" opacity="0.95" />
            <text x="84" y={targetLabelY} textAnchor="middle" fontSize="4.4" fill="#34d399">
              Цель {targetRaw}
            </text>
            <rect x="70" y={capLabelY - 5.5} width="28" height="7.5" rx="2" fill="#171108" opacity="0.95" />
            <text x="84" y={capLabelY} textAnchor="middle" fontSize="4.4" fill="#f59e0b">
              Cap {capRaw}
            </text>
          </svg>
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px]">
          <span className="font-mono text-[28px] font-semibold text-emerald-400">{targetRaw}</span>
          <span className="font-mono text-[28px] font-semibold text-amber-400">{capRaw}</span>
        </div>
      </div>
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
    <section className="min-w-0 space-y-6">
      <header className="max-w-2xl">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-600">Параметры</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-white">Структура сделки</h2>
        <p className="mt-2 text-[14px] leading-relaxed text-zinc-500">
          Поля карточки релиза — в удобном виде. Значения демонстрационные.
        </p>
      </header>

      <div className="flex flex-col gap-8">
        {order.map((groupId) => {
          const rows = grouped[groupId];
          if (!rows?.length) return null;
          const head = GROUP_TITLE[groupId];
          return (
            <div key={groupId} className="min-w-0">
              <p className="font-mono text-[12px] font-semibold uppercase tracking-[0.12em] text-zinc-600">{head.k}</p>
              <h3 className="mt-1 text-[20px] font-semibold tracking-tight text-white">{head.t}</h3>
              <p className="mt-1.5 max-w-[62ch] text-[12px] leading-relaxed text-zinc-600">{head.d}</p>
              {groupId === "round" ? (
                <div className="mt-4 grid min-w-0 gap-3 lg:grid-cols-[minmax(0,1fr)_360px]">
                  <div className="flex min-w-0 flex-col gap-2.5">
                    {rows.map((p) => (
                      <StructuredParamRow key={p.label} row={p} />
                    ))}
                  </div>
                  <RoundPlacementChart rows={rows} />
                </div>
              ) : (
                <div className="mt-4 flex flex-col gap-2.5">
                  {rows.map((p) => (
                    <StructuredParamRow key={p.label} row={p} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
