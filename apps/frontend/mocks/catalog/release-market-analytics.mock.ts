import type { MarketOverviewRow } from "@/types/market-overview";
import type {
  ReleaseMarketAnalyticsChartBlock,
  ReleaseMarketAnalyticsHero,
  ReleaseMarketAnalyticsLiquidity,
  ReleaseMarketAnalyticsPageData,
  ReleaseMarketAnalyticsParamRow,
  ReleaseMarketAnalyticsPeriodRow,
  ReleaseMarketAnalyticsPayoutInsights,
  ReleaseMarketAnalyticsStatusKey,
} from "@/types/catalog/release-market-analytics";

import { formatUsdtCompact, formatUsdtFixedRu, formatUnitsCompact } from "@/lib/market-overview/format";
import { getPrimaryUnitPriceUsdt, roundUsdt2 } from "@/lib/market-overview/pricing";

function seedFromId(id: string): number {
  let s = 0;
  for (let i = 0; i < id.length; i++) s = (s * 31 + id.charCodeAt(i)) >>> 0;
  return s || 1;
}

function series(n: number, base: number, amp: number, seed: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const wobble = Math.sin((i + seed) * 0.42) * amp * 0.35 + Math.cos((i * seed) / 17) * amp * 0.2;
    out.push(Math.max(0, base + wobble + (i / n) * amp * 0.15));
  }
  return out;
}

function mapStatus(row: MarketOverviewRow): { key: ReleaseMarketAnalyticsStatusKey; label: string } {
  if (row.status === "Закрыт") return { key: "closed", label: "Closed" };
  if (row.status === "Пауза") return { key: "payouts", label: "Payouts" };
  if (row.status === "Новый") return { key: "new", label: "New" };
  return { key: "active", label: "Active" };
}

function phaseLabel(row: MarketOverviewRow): string {
  if (row.status === "Новый") return "Funding";
  if (row.status === "Закрыт") return "Closed";
  if (row.secondaryLabel === "Высокий") return "Payouts · secondary active";
  if (row.secondaryLabel === "Средний") return "Payouts · selective secondary";
  return "Payouts";
}

export function buildReleaseMarketAnalyticsPageData(row: MarketOverviewRow): ReleaseMarketAnalyticsPageData {
  const seed = seedFromId(row.id);
  const primaryPx = getPrimaryUnitPriceUsdt(row);
  const secMid = roundUsdt2(primaryPx * (1 + ((seed % 11) - 5) * 0.004));
  const secLo = roundUsdt2(primaryPx * 0.966);
  const secHi = roundUsdt2(primaryPx * 1.045);
  const st = mapStatus(row);

  const holders = 420 + (seed % 1800);
  const totalPayoutsUsdt = row.payoutsUsdt * (1.1 + (seed % 7) / 40);
  const cumulative = totalPayoutsUsdt * 3.2;

  const hero: ReleaseMarketAnalyticsHero = {
    yieldPct: `${row.yieldPct.toFixed(1).replace(".", ",")}%`,
    totalPayouts: `${formatUsdtCompact(Math.round(totalPayoutsUsdt))} USDT`,
    activeHolders: holders.toLocaleString("ru-RU"),
    availableUnits: formatUnitsCompact(row.availableUnits),
    liquidityLabel: row.liquidityLabel,
    secondaryStatus: row.secondaryLabel,
    trend7d: row.trend === "up" ? "+0,42 п.п." : row.trend === "down" ? "−0,18 п.п." : "±0,02 п.п.",
    trend30d: row.trend === "up" ? "+1,05 п.п." : row.trend === "down" ? "−0,64 п.п." : "+0,11 п.п.",
    phase: phaseLabel(row),
  };

  const charts: ReleaseMarketAnalyticsChartBlock[] = [
    {
      id: "yield",
      title: "Динамика доходности",
      caption: "Нормализованный индекс gross yield (mock)",
      series: series(28, row.yieldPct * 0.85, 2.4, seed),
      accent: "lime",
    },
    {
      id: "payouts",
      title: "Выплаты по периодам",
      caption: "USDT к инвесторам, скользящее окно",
      series: series(24, row.payoutsUsdt / 9000, row.payoutsUsdt / 7000, seed + 3),
      accent: "sky",
    },
    {
      id: "secondary",
      title: "Активность secondary",
      caption: "Оборот перепродаж, отн. индекс",
      series: series(22, 38 + (seed % 12), 18, seed + 7),
      accent: "fuchsia",
    },
    {
      id: "demand",
      title: "Спрос / объём",
      caption: "Заявки + matched volume (mock)",
      series: series(26, row.activityScore * 0.4, row.activityScore * 0.25, seed + 11),
      accent: "zinc",
    },
    {
      id: "unit",
      title: "Цена unit (secondary)",
      caption:
        row.secondaryLabel === "Низкий" || row.secondaryLabel === "—"
          ? "Низкая ликвидность — серия условная"
          : "Mid price по сделкам secondary",
      series: series(20, primaryPx, Math.max(0.015, primaryPx * 0.03), seed + 19),
      accent: "lime",
    },
  ];

  const periodTable: ReleaseMarketAnalyticsPeriodRow[] = [
    {
      period: "7D",
      payouts: `${formatUsdtCompact(Math.round(row.payoutsUsdt * 0.18))} USDT`,
      yield: `${(row.yieldPct - 0.2).toFixed(1).replace(".", ",")}%`,
      tradeVolume: `${formatUsdtCompact(Math.round(row.payoutsUsdt * 0.42))} USDT`,
      tradesCount: String(120 + (seed % 80)),
      interestChange: row.trend === "up" ? "+6,2%" : row.trend === "down" ? "−3,1%" : "+0,4%",
    },
    {
      period: "30D",
      payouts: `${formatUsdtCompact(Math.round(row.payoutsUsdt * 0.72))} USDT`,
      yield: `${row.yieldPct.toFixed(1).replace(".", ",")}%`,
      tradeVolume: `${formatUsdtCompact(Math.round(row.payoutsUsdt * 1.55))} USDT`,
      tradesCount: String(480 + (seed % 220)),
      interestChange: row.trend === "up" ? "+12,8%" : row.trend === "down" ? "−4,6%" : "+1,2%",
    },
    {
      period: "90D",
      payouts: `${formatUsdtCompact(Math.round(row.payoutsUsdt * 2.05))} USDT`,
      yield: `${(row.yieldPct + 0.15).toFixed(1).replace(".", ",")}%`,
      tradeVolume: `${formatUsdtCompact(Math.round(row.payoutsUsdt * 4.2))} USDT`,
      tradesCount: String(1200 + (seed % 400)),
      interestChange: row.trend === "up" ? "+18,4%" : row.trend === "down" ? "−9,2%" : "+2,0%",
    },
  ];

  const hasListings = row.secondaryLabel !== "—" && row.secondaryLabel !== "Низкий";
  const spreadSig =
    row.liquidityLabel === "Deep" ? ("positive" as const) : row.liquidityLabel === "Mid" ? ("neutral" as const) : ("negative" as const);
  const flowSig =
    row.trend === "up" ? ("positive" as const) : row.trend === "down" ? ("negative" as const) : ("neutral" as const);
  /** Средняя чуть выше верха диапазона в mock → «жарко», иначе нейтрально */
  const avgPriceSig = seed % 3 === 0 ? ("positive" as const) : seed % 3 === 1 ? ("neutral" as const) : ("negative" as const);

  const liquidity: ReleaseMarketAnalyticsLiquidity = {
    hasSecondaryListings: hasListings,
    avgUnitPrice: `${formatUsdtFixedRu(secMid)} USDT`,
    spread: "0,6–1,2%",
    priceRange: `${formatUsdtFixedRu(secLo)}–${formatUsdtFixedRu(secHi)} USDT`,
    volume24h: `${formatUsdtCompact(Math.round(row.payoutsUsdt * 0.05))} USDT`,
    volume7d: `${formatUsdtCompact(Math.round(row.payoutsUsdt * 0.31))} USDT`,
    trades24h: String(14 + (seed % 20)),
    trades7d: String(86 + (seed % 40)),
    depthNote:
      row.liquidityLabel === "Deep"
        ? "Стакан глубже медианы по жанру · mock depth index 0,74"
        : row.liquidityLabel === "Mid"
          ? "Достаточная глубина для типичных размеров заявок"
          : "Глубина ограничена — крупные заявки могут проходить с проскальзыванием",
    signals: {
      listings: hasListings ? "positive" : "negative",
      spread: spreadSig,
      depth: spreadSig,
      flow: flowSig,
      avgPrice: avgPriceSig,
    },
  };

  const dist = 62 + (seed % 8);
  const artistShare = 18 + (seed % 5);
  const investorShare = Math.max(14, 100 - dist - artistShare);
  const params: ReleaseMarketAnalyticsParamRow[] = [
    { label: "distribution_share", value: `${dist}%` },
    { label: "artist_share", value: `${artistShare}%` },
    { label: "investor_share", value: `${investorShare}%` },
    { label: "raise_target", value: `${formatUsdtCompact(640_000 + (seed % 120) * 1000)} USDT` },
    { label: "hard_cap", value: `${formatUsdtCompact(820_000 + (seed % 90) * 1000)} USDT` },
    { label: "total_units", value: formatUnitsCompact(row.availableUnits * 2.4) },
    { label: "available_units", value: formatUnitsCompact(row.availableUnits) },
    { label: "primary_unit_price", value: `${formatUsdtFixedRu(primaryPx)} USDT` },
    { label: "promo_budget", value: `${formatUsdtCompact(42_000 + (seed % 30) * 1000)} USDT` },
    { label: "artist_upfront", value: `${formatUsdtCompact(18_000 + (seed % 12) * 500)} USDT` },
    { label: "platform_upfront", value: `${formatUsdtCompact(9600 + (seed % 8) * 400)} USDT` },
  ];

  const payoutInsights: ReleaseMarketAnalyticsPayoutInsights = {
    lastPayout: `${formatUsdtCompact(Math.round(row.payoutsUsdt * 0.04))} USDT · 12.04`,
    avgPayoutPeriod: `${formatUsdtCompact(Math.round(row.payoutsUsdt * 0.035))} USDT`,
    accrualFrequency: row.payoutFreq === "monthly" ? "Ежемесячно" : "Раз в 2 недели",
    cumulativePayouts: `${formatUsdtCompact(Math.round(cumulative))} USDT`,
    payoutStatus: row.status === "Пауза" ? "Hold · пауза начислений" : "On track · mock",
  };

  const riskNotes = [
    "Данные аналитики не являются гарантией дохода и не являются персональной инвестиционной рекомендацией.",
    "Активность secondary market зависит от спроса и может существенно меняться между периодами.",
    "Historical performance не гарантирует future payouts: смотрите условия сделки и риски в карточке релиза.",
  ];

  return {
    header: {
      catalogReleaseId: row.id,
      releaseTitle: row.title,
      artist: row.artist,
      symbol: row.symbol,
      internalId: `REL-${row.id.padStart(4, "0")}`,
      statusKey: st.key,
      statusLabel: st.label,
      genre: row.segment,
    },
    hero,
    charts,
    periodTable,
    liquidity,
    params,
    payoutInsights,
    riskNotes,
  };
}
