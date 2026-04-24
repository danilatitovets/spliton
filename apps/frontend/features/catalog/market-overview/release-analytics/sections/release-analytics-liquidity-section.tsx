import Link from "next/link";

import { catalogBuyUnitsPath } from "@/constants/routes";
import { cn } from "@/lib/utils";
import type {
  ReleaseMarketAnalyticsLiquidity,
  ReleaseMarketLiquiditySignal,
} from "@/types/catalog/release-market-analytics";

function valueToneClass(tone: ReleaseMarketLiquiditySignal) {
  if (tone === "positive") return "text-[#c8f06a]";
  if (tone === "negative") return "text-fuchsia-300/95";
  return "text-zinc-200";
}

function badgeToneClass(tone: ReleaseMarketLiquiditySignal) {
  if (tone === "positive") return "text-[#d4f570] ring-[#B7F500]/25";
  if (tone === "negative") return "text-fuchsia-200/90 ring-fuchsia-500/25";
  return "text-zinc-300 ring-white/10";
}

function LiqCard({
  title,
  value,
  tone,
  hint,
  mono = true,
}: {
  title: string;
  value: string;
  tone: ReleaseMarketLiquiditySignal;
  hint: string;
  mono?: boolean;
}) {
  return (
    <div className="flex min-h-[96px] flex-col rounded-lg bg-[#0a0a0a]/90 px-3 py-3 ring-1 ring-white/6">
      <p className="text-[11px] leading-snug text-zinc-500">{title}</p>
      <p
        className={cn(
          "mt-auto pt-3 text-[16px] font-semibold tabular-nums leading-none tracking-tight",
          mono ? "font-mono" : "",
          valueToneClass(tone),
        )}
      >
        {value}
      </p>
      <p className="mt-2 text-[10px] leading-snug text-zinc-600">{hint}</p>
    </div>
  );
}

export function ReleaseAnalyticsLiquiditySection({
  liquidity,
  releaseId,
}: {
  liquidity: ReleaseMarketAnalyticsLiquidity;
  releaseId: string;
}) {
  const s = liquidity.signals;

  const spreadHint =
    s.spread === "positive" ? "Узко относительно жанра — ликвиднее matching." : s.spread === "negative" ? "Шире — проскальзывание заметнее." : "В пределах типичного для сегмента.";

  const depthHint =
    s.depth === "positive" ? "Глубина выше медианы площадки." : s.depth === "negative" ? "Глубина ниже — крупные заявки аккуратнее." : "Достаточно для средних размеров.";

  const flowHint =
    s.flow === "positive" ? "Активность в потоке выше недавнего базиса." : s.flow === "negative" ? "Поток слабее — следите за спредом." : "Без выраженного сдвига по mock.";

  const priceHint =
    s.avgPrice === "positive"
      ? "Средняя у верхней границы диапазона — спрос заметен."
      : s.avgPrice === "negative"
        ? "Ближе к нижней границе — мягче спрос в окне."
        : "Внутри объявленного коридора цен.";

  return (
    <section className="space-y-4">
      <div>
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-600">Ликвидность</p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight text-white">Рынок и активность</h2>
        <p className="mt-1.5 max-w-[62ch] text-[12px] leading-relaxed text-zinc-600">
          Цвет значений — ориентир по mock-логике (не сигнал к сделке).
        </p>
      </div>

      <div className="space-y-5 rounded-xl bg-[#111111] px-4 py-5 sm:px-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-zinc-500">Листинги на secondary</p>
            <p className="mt-1 text-[13px] leading-snug text-zinc-400">
              {liquidity.hasSecondaryListings ? "Есть активные лоты — можно торговать units." : "Лоты ограничены или отсутствуют."}
            </p>
          </div>
          <span
            className={cn(
              "shrink-0 self-start rounded-md bg-[#0a0a0a] px-3 py-1.5 font-mono text-[11px] font-semibold ring-1 sm:self-center",
              badgeToneClass(s.listings),
            )}
          >
            {liquidity.hasSecondaryListings ? "Да" : "Нет"}
          </span>
        </div>

        <div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-600">Цена и спред</p>
            <Link
              href={catalogBuyUnitsPath(releaseId)}
              className="inline-flex h-9 w-fit shrink-0 items-center justify-center rounded-full bg-[#B7F500] px-4 text-[12px] font-semibold text-black transition hover:bg-[#c9ff52]"
            >
              Купить units
            </Link>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-3">
            <LiqCard title="Средняя цена unit" value={liquidity.avgUnitPrice} tone={s.avgPrice} hint={priceHint} />
            <LiqCard title="Спред" value={liquidity.spread} tone={s.spread} hint={spreadHint} />
            <LiqCard title="Диапазон цен" value={liquidity.priceRange} tone="neutral" hint="Окно котировок по сделкам secondary (mock)." mono={false} />
          </div>
        </div>

        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-600">Оборот и сделки</p>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-3">
            <LiqCard title="Объём за 24 часа" value={liquidity.volume24h} tone={s.flow} hint={flowHint} />
            <LiqCard title="Объём за 7 дней" value={liquidity.volume7d} tone={s.flow} hint="Суммарный оборот за неделю (mock)." />
            <LiqCard title="Сделок за 24 часа" value={liquidity.trades24h} tone={s.flow} hint="Число сделок за сутки." />
            <LiqCard title="Сделок за 7 дней" value={liquidity.trades7d} tone={s.flow} hint="Недельная активность matching." />
          </div>
        </div>

        <div
          className={cn(
            "rounded-lg px-3 py-3 ring-1",
            s.depth === "positive" && "bg-[#B7F500]/6 ring-[#B7F500]/15",
            s.depth === "negative" && "bg-fuchsia-500/6 ring-fuchsia-500/15",
            s.depth === "neutral" && "bg-[#0a0a0a]/80 ring-white/6",
          )}
        >
          <p className={cn("text-[11px] font-semibold", s.depth === "positive" && "text-[#d4f570]", s.depth === "negative" && "text-fuchsia-200/90", s.depth === "neutral" && "text-zinc-400")}>
            Глубина стакана
          </p>
          <p className="mt-1.5 text-[12px] leading-relaxed text-zinc-500">{liquidity.depthNote}</p>
          <p className="mt-2 text-[10px] leading-snug text-zinc-600">{depthHint}</p>
        </div>
      </div>
    </section>
  );
}
