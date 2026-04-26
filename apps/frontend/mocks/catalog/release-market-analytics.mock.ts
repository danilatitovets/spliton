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
  ReleaseMarketHeroMetric,
  ReleaseMarketHeroVsTone,
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

function m(value: string, vsPrevious?: string, vsTone?: ReleaseMarketHeroVsTone): ReleaseMarketHeroMetric {
  if (!vsPrevious) return { value };
  return { value, vsPrevious, vsTone: vsTone ?? "neutral" };
}

function trendTone(t: MarketOverviewRow["trend"]): ReleaseMarketHeroVsTone {
  if (t === "up") return "positive";
  if (t === "down") return "negative";
  return "neutral";
}

function liquidityRank(label: MarketOverviewRow["liquidityLabel"]): number {
  if (label === "Deep") return 3;
  if (label === "Mid") return 2;
  return 1;
}

function liquidityLabelFromRank(r: number): MarketOverviewRow["liquidityLabel"] {
  if (r >= 3) return "Deep";
  if (r === 2) return "Mid";
  return "Thin";
}

function secondaryRank(label: MarketOverviewRow["secondaryLabel"]): number {
  if (label === "Высокий") return 3;
  if (label === "Средний") return 2;
  if (label === "Низкий") return 1;
  return 0;
}

function secondaryLabelFromRank(r: number): MarketOverviewRow["secondaryLabel"] {
  if (r >= 3) return "Высокий";
  if (r === 2) return "Средний";
  if (r === 1) return "Низкий";
  return "—";
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

  const yieldTone = trendTone(row.trend);
  const yieldVs =
    row.trend === "up" ? "vs пр. неделю: +0,18 п.п." : row.trend === "down" ? "vs пр. неделю: −0,09 п.п." : "vs пр. неделю: ±0,01 п.п.";

  const payoutPct = 4 + (seed % 9);
  const payoutTones: ReleaseMarketHeroVsTone[] = ["positive", "negative", "neutral", "warning"];
  const payoutTone = payoutTones[seed % payoutTones.length];
  const payoutVsLines: Record<ReleaseMarketHeroVsTone, string> = {
    positive: `vs пр. 30D: +${payoutPct},2%`,
    negative: `vs пр. 30D: −${(seed % 5) + 1},8%`,
    neutral: "vs пр. 30D: ±0,3%",
    warning: "vs пр. 30D: волатильнее медианы",
  };

  const holderDelta = (seed % 5) - 2;
  const holderTone: ReleaseMarketHeroVsTone =
    holderDelta > 0 ? "positive" : holderDelta < 0 ? "negative" : "neutral";
  const holderVs =
    holderDelta === 0 ? "за 7D: без изменений" : `за 7D: ${holderDelta > 0 ? "+" : "−"}${Math.abs(holderDelta)} holders`;

  const unitsPct = 1.2 + (seed % 7) * 0.35;
  const unitsTone: ReleaseMarketHeroVsTone[] = ["positive", "negative", "neutral", "warning"];
  const uTone = unitsTone[(seed + 1) % unitsTone.length];
  const unitsVs =
    uTone === "positive"
      ? `к пр. неделе: +${unitsPct.toFixed(1).replace(".", ",")}% free float`
      : uTone === "negative"
        ? `к пр. неделе: −${(1.1 + (seed % 4) * 0.2).toFixed(1).replace(".", ",")}% free float`
        : uTone === "warning"
          ? "узкий диапазон vs 30D — следить за спросом"
          : "к пр. неделе: ±0,2%";

  const liqR = liquidityRank(row.liquidityLabel);
  const liqPrevR = Math.max(1, Math.min(3, liqR + ((seed % 3) - 1)));
  const liqPrevLabel = liquidityLabelFromRank(liqPrevR);
  const liqCmpTone: ReleaseMarketHeroVsTone =
    liqR > liqPrevR ? "positive" : liqR < liqPrevR ? "negative" : "neutral";
  const liqVs =
    liqPrevLabel === row.liquidityLabel ? "к 30D: без сдвига индекса" : `было ${liqPrevLabel} · 30D`;

  const secR = secondaryRank(row.secondaryLabel);
  const secPrevR = Math.max(0, Math.min(3, secR + ((seed % 4) - 2)));
  const secPrevLabel = secondaryLabelFromRank(secPrevR);
  const secCmpTone: ReleaseMarketHeroVsTone =
    secR > secPrevR ? "positive" : secR < secPrevR ? "negative" : secR === 0 ? "neutral" : "neutral";
  const secVs =
    secPrevLabel === row.secondaryLabel
      ? "к 30D: без изменений"
      : secPrevLabel === "—"
        ? "ранее — · первичный secondary"
        : `было «${secPrevLabel}» · 30D`;

  const t7 = row.trend === "up" ? "+0,42 п.п." : row.trend === "down" ? "−0,18 п.п." : "±0,02 п.п.";
  const t30 = row.trend === "up" ? "+1,05 п.п." : row.trend === "down" ? "−0,64 п.п." : "+0,11 п.п.";
  const t7Vs =
    row.trend === "up"
      ? "к пред. окну 7D: +0,11 п.п."
      : row.trend === "down"
        ? "к пред. окну 7D: −0,05 п.п."
        : "к пред. окну 7D: ±0,00 п.п.";
  const t30Vs =
    row.trend === "up"
      ? "к пред. окну 30D: +0,32 п.п."
      : row.trend === "down"
        ? "к пред. окну 30D: −0,21 п.п."
        : "к пред. окну 30D: +0,04 п.п.";
  const t7Tone = trendTone(row.trend);
  const t30Tone = row.trend === "flat" ? "neutral" : row.trend === "up" ? "positive" : "negative";

  const hero: ReleaseMarketAnalyticsHero = {
    yieldPct: m(`${row.yieldPct.toFixed(1).replace(".", ",")}%`, yieldVs, yieldTone),
    totalPayouts: m(`${formatUsdtCompact(Math.round(totalPayoutsUsdt))}`, payoutVsLines[payoutTone], payoutTone),
    activeHolders: m(holders.toLocaleString("ru-RU"), holderVs, holderTone),
    availableUnits: m(formatUnitsCompact(row.availableUnits), unitsVs, uTone),
    liquidity: m(row.liquidityLabel, liqVs, liqCmpTone),
    secondary: m(row.secondaryLabel, secVs, secCmpTone),
    trend7d: m(t7, t7Vs, t7Tone),
    trend30d: m(t30, t30Vs, t30Tone),
  };

  const charts: ReleaseMarketAnalyticsChartBlock[] = [
    {
      id: "yield",
      title: "Динамика доходности",
      caption: "Нормализованный индекс gross yield",
      series: series(28, row.yieldPct * 0.85, 2.4, seed),
      accent: "lime",
    },
    {
      id: "payouts",
      title: "Выплаты по периодам",
      caption: "Суммы к инвесторам, скользящее окно",
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
      caption: "Заявки и сопоставленный объём",
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
      payouts: `${formatUsdtCompact(Math.round(row.payoutsUsdt * 0.18))}`,
      yield: `${(row.yieldPct - 0.2).toFixed(1).replace(".", ",")}%`,
      tradeVolume: `${formatUsdtCompact(Math.round(row.payoutsUsdt * 0.42))}`,
      tradesCount: String(120 + (seed % 80)),
      interestChange: row.trend === "up" ? "+6,2%" : row.trend === "down" ? "−3,1%" : "+0,4%",
    },
    {
      period: "30D",
      payouts: `${formatUsdtCompact(Math.round(row.payoutsUsdt * 0.72))}`,
      yield: `${row.yieldPct.toFixed(1).replace(".", ",")}%`,
      tradeVolume: `${formatUsdtCompact(Math.round(row.payoutsUsdt * 1.55))}`,
      tradesCount: String(480 + (seed % 220)),
      interestChange: row.trend === "up" ? "+12,8%" : row.trend === "down" ? "−4,6%" : "+1,2%",
    },
    {
      period: "90D",
      payouts: `${formatUsdtCompact(Math.round(row.payoutsUsdt * 2.05))}`,
      yield: `${(row.yieldPct + 0.15).toFixed(1).replace(".", ",")}%`,
      tradeVolume: `${formatUsdtCompact(Math.round(row.payoutsUsdt * 4.2))}`,
      tradesCount: String(1200 + (seed % 400)),
      interestChange: row.trend === "up" ? "+18,4%" : row.trend === "down" ? "−9,2%" : "+2,0%",
    },
  ];

  const hasListings = row.secondaryLabel !== "—" && row.secondaryLabel !== "Низкий";
  type Sig = "positive" | "negative" | "neutral";
  const spreadSig: Sig =
    row.liquidityLabel === "Deep" ? "positive" : row.liquidityLabel === "Mid" ? "neutral" : "negative";
  const flowSig: Sig = row.trend === "up" ? "positive" : row.trend === "down" ? "negative" : "neutral";
  const avgPriceSig: Sig = seed % 3 === 0 ? "positive" : seed % 3 === 1 ? "neutral" : "negative";

  const sigToHero = (sig: Sig): ReleaseMarketHeroVsTone =>
    sig === "positive" ? "positive" : sig === "negative" ? "negative" : "neutral";

  const spreadHint =
    spreadSig === "positive"
      ? "Узко относительно жанра — ликвиднее matching."
      : spreadSig === "negative"
        ? "Шире — проскальзывание заметнее."
        : "В пределах типичного для сегмента.";
  const depthHint =
    spreadSig === "positive"
      ? "Глубина выше медианы площадки."
      : spreadSig === "negative"
        ? "Глубина ниже — крупные заявки аккуратнее."
        : "Достаточно для средних размеров.";
  const flowHint =
    flowSig === "positive"
      ? "Активность в потоке выше недавнего базиса."
      : flowSig === "negative"
        ? "Поток слабее — следите за спредом."
        : "Без выраженного сдвига в окне.";
  const priceHint =
    avgPriceSig === "positive"
      ? "Средняя у верхней границы диапазона — спрос заметен."
      : avgPriceSig === "negative"
        ? "Ближе к нижней границе — мягче спрос в окне."
        : "Внутри объявленного коридора цен.";

  const depthBody =
    row.liquidityLabel === "Deep"
      ? "Стакан глубже медианы по жанру · индекс глубины 0,74"
      : row.liquidityLabel === "Mid"
        ? "Достаточная глубина для типичных размеров заявок"
        : "Глубина ограничена — крупные заявки могут проходить с проскальзыванием";

  const vol24 = Math.round(row.payoutsUsdt * 0.05);
  const vol7 = Math.round(row.payoutsUsdt * 0.31);
  const t24 = 14 + (seed % 20);
  const trades7dCount = 86 + (seed % 40);

  const liquidity: ReleaseMarketAnalyticsLiquidity = {
    listings: {
      hasActive: hasListings,
      summary: hasListings ? "Есть активные лоты — можно торговать UNT." : "Лоты ограничены или отсутствуют.",
      vsPrevious: hasListings ? "vs 30D: без просадки лотов" : "vs 30D: −2 активных лота",
      vsTone: hasListings ? "positive" : "negative",
    },
    avgUnitPrice: {
      value: `${formatUsdtFixedRu(secMid)}`,
      hint: priceHint,
      vsPrevious:
        avgPriceSig === "positive"
          ? "к 7D: +0,02 USDT к mid"
          : avgPriceSig === "negative"
            ? "к 7D: −0,03 USDT к mid"
            : "к 7D: ±0,00 USDT",
      vsTone: sigToHero(avgPriceSig),
    },
    spread: {
      value: "0,6–1,2%",
      hint: spreadHint,
      vsPrevious: spreadSig === "positive" ? "к 30D: −0,08 п.п. по спреду" : spreadSig === "negative" ? "к 30D: +0,15 п.п." : "к 30D: ±0,02 п.п.",
      vsTone: spreadSig === "positive" ? "positive" : spreadSig === "negative" ? "negative" : "neutral",
    },
    priceRange: {
      value: `${formatUsdtFixedRu(secLo)}–${formatUsdtFixedRu(secHi)}`,
      hint: "Окно котировок по сделкам secondary.",
      vsPrevious: "коридор vs пр. неделю: без сдвига",
      vsTone: "neutral",
    },
    volume24h: {
      value: `${formatUsdtCompact(vol24)}`,
      hint: flowHint,
      vsPrevious: row.trend === "up" ? "vs вчера: +11%" : row.trend === "down" ? "vs вчера: −6%" : "vs вчера: ±1%",
      vsTone: sigToHero(flowSig),
    },
    volume7d: {
      value: `${formatUsdtCompact(vol7)}`,
      hint: "Суммарный оборот за неделю.",
      vsPrevious: `vs пр. 7D: +${(seed % 6) + 3},4%`,
      vsTone: (seed % 4 === 0 ? "warning" : "positive") as ReleaseMarketHeroVsTone,
    },
    trades24h: {
      value: String(t24),
      hint: "Число сделок за сутки.",
      vsPrevious: row.trend === "up" ? "vs пр. 24h: +4 сделки" : row.trend === "down" ? "vs пр. 24h: −2 сделки" : "vs пр. 24h: без изменений",
      vsTone: sigToHero(flowSig),
    },
    trades7d: {
      value: String(trades7dCount),
      hint: "Недельная активность matching.",
      vsPrevious:
        row.trend === "flat"
          ? "vs пр. неделю: ±0 сделок"
          : `vs пр. неделю: ${row.trend === "up" ? "+" : "−"}${(seed % 5) + 3} сделок`,
      vsTone: sigToHero(flowSig),
    },
    depth: {
      title: "Глубина стакана",
      body: depthBody,
      foot: depthHint,
      vsPrevious:
        spreadSig === "positive"
          ? "индекс глубины vs 90D: +0,06"
          : spreadSig === "negative"
            ? "индекс глубины vs 90D: −0,11"
            : "индекс глубины vs 90D: ±0,01",
      vsTone: sigToHero(spreadSig),
    },
  };

  const dist = 62 + (seed % 8);
  const artistShare = 18 + (seed % 5);
  const investorShare = Math.max(14, 100 - dist - artistShare);
  const params: ReleaseMarketAnalyticsParamRow[] = [
    { label: "distribution_share", value: `${dist}%` },
    { label: "artist_share", value: `${artistShare}%` },
    { label: "investor_share", value: `${investorShare}%` },
    { label: "raise_target", value: `${formatUsdtCompact(640_000 + (seed % 120) * 1000)}` },
    { label: "hard_cap", value: `${formatUsdtCompact(820_000 + (seed % 90) * 1000)}` },
    { label: "total_units", value: formatUnitsCompact(row.availableUnits * 2.4) },
    { label: "available_units", value: formatUnitsCompact(row.availableUnits) },
    { label: "primary_unit_price", value: `${formatUsdtFixedRu(primaryPx)}` },
    { label: "promo_budget", value: `${formatUsdtCompact(42_000 + (seed % 30) * 1000)}` },
    { label: "artist_upfront", value: `${formatUsdtCompact(18_000 + (seed % 12) * 500)}` },
    { label: "platform_upfront", value: `${formatUsdtCompact(9600 + (seed % 8) * 400)}` },
  ];

  const payoutInsights: ReleaseMarketAnalyticsPayoutInsights = {
    lastPayout: `${formatUsdtCompact(Math.round(row.payoutsUsdt * 0.04))} · 12.04`,
    avgPayoutPeriod: `${formatUsdtCompact(Math.round(row.payoutsUsdt * 0.035))}`,
    accrualFrequency: row.payoutFreq === "monthly" ? "Ежемесячно" : "Раз в 2 недели",
    cumulativePayouts: `${formatUsdtCompact(Math.round(cumulative))}`,
    payoutStatus: row.status === "Пауза" ? "Hold · пауза начислений" : "On track",
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
