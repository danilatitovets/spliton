import { RELEASE_ANALYTICS_ROWS_MOCK } from "@/mocks/analytics/releases.mock";
import type {
  ReleaseAnalyticsCompareApi,
  ReleaseAnalyticsFunnelApi,
  ReleaseAnalyticsGenresApi,
  ReleaseAnalyticsTimeseriesApi,
} from "@/services/release-analytics.service";
import type { ReleaseAnalyticsPeriod } from "@/types/analytics/releases";

function daysForPeriod(period: ReleaseAnalyticsPeriod): number {
  if (period === "7d") return 7;
  if (period === "30d") return 30;
  if (period === "90d") return 90;
  return 120;
}

function periodMul(period: ReleaseAnalyticsPeriod): number {
  if (period === "7d") return 0.28;
  if (period === "30d") return 1;
  if (period === "90d") return 2.6;
  return 4.2;
}

function isoDaysBack(daysBack: number): string {
  const d = new Date();
  d.setUTCHours(12, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - daysBack);
  return d.toISOString().slice(0, 10);
}

function wave(i: number, base: number, amp: number): number {
  return Math.max(0, base + Math.sin(i * 0.55) * amp + Math.cos(i * 0.31) * (amp * 0.45));
}

function buildVolumeSeries(days: number, base: number, amp: number, countBase: number) {
  const step = days <= 7 ? 1 : days <= 30 ? 1 : days <= 90 ? 3 : 4;
  const points: { date: string; volumeUsdt: string; ordersCount: number; tradesCount: number }[] = [];
  for (let i = days - 1; i >= 0; i -= step) {
    const v = wave(i, base, amp);
    points.push({
      date: isoDaysBack(i),
      volumeUsdt: v.toFixed(2),
      ordersCount: Math.max(1, Math.round(countBase + Math.sin(i * 0.4) * (countBase * 0.35))),
      tradesCount: Math.max(1, Math.round(countBase * 0.7 + Math.cos(i * 0.35) * (countBase * 0.25))),
    });
  }
  return points;
}

/** Demo charts for `/analytics/releases` when cabinet Demo is on or live source is off. */
export function buildReleaseAnalyticsChartsMock(period: ReleaseAnalyticsPeriod): {
  timeseries: ReleaseAnalyticsTimeseriesApi;
  compare: ReleaseAnalyticsCompareApi;
  genres: ReleaseAnalyticsGenresApi;
  funnel: ReleaseAnalyticsFunnelApi;
} {
  const days = daysForPeriod(period);
  const mul = periodMul(period);
  const updatedAt = new Date().toISOString();

  const primary = buildVolumeSeries(days, 42_000 * mul, 18_000 * mul, 28);
  const secondary = buildVolumeSeries(days, 14_500 * mul, 6_200 * mul, 16);
  const payouts = buildVolumeSeries(days, 9_800 * mul, 3_400 * mul, 8).map((p) => ({
    date: p.date,
    payoutsUsdt: p.volumeUsdt,
    distributionsCount: Math.max(1, Math.round(p.ordersCount / 4)),
  }));

  const compareItems = RELEASE_ANALYTICS_ROWS_MOCK.slice(0, 8).map((row, i) => {
    const raised = 180_000 + i * 42_000;
    const secondaryVol = 28_000 + i * 9_500;
    const payoutsUsdt = Number(row.payouts.replace(/[^\d]/g, "")) || 50_000;
    return {
      id: row.id,
      symbol: row.symbol,
      title: row.release,
      artist: row.artist,
      raisedUsdt: String(Math.round(raised * mul)),
      soldUnits: String(12_000 + i * 2_400),
      holdersCount: 120 + i * 38,
      secondaryVolumeUsdt: String(Math.round(secondaryVol * mul)),
      payoutsUsdt: String(Math.round(payoutsUsdt * Math.min(mul, 2))),
      liquidityScore: 48 + i * 5,
      progressPct: 38 + i * 6,
    };
  });

  const genreBuckets: Record<string, { count: number; volume: number; yieldSum: number }> = {};
  for (const row of RELEASE_ANALYTICS_ROWS_MOCK) {
    const key = row.genre === "hiphop" ? "Hip-Hop" : row.genre === "pop" ? "Pop" : "Electronic";
    const vol = Number(row.payouts.replace(/[^\d]/g, "")) || 40_000;
    const y = Number(row.yieldPct.replace("%", "").replace(",", ".")) || 10;
    const prev = genreBuckets[key] ?? { count: 0, volume: 0, yieldSum: 0 };
    prev.count += 1;
    prev.volume += vol;
    prev.yieldSum += y;
    genreBuckets[key] = prev;
  }

  return {
    timeseries: {
      period,
      updatedAt,
      primaryVolume: primary.map(({ date, volumeUsdt, ordersCount }) => ({
        date,
        volumeUsdt,
        ordersCount,
      })),
      secondaryVolume: secondary.map(({ date, volumeUsdt, tradesCount }) => ({
        date,
        volumeUsdt,
        tradesCount,
        avgPriceUsdt: (1.02 + (tradesCount % 7) * 0.01).toFixed(4),
      })),
      payouts,
    },
    compare: {
      period,
      updatedAt,
      items: compareItems,
    },
    genres: {
      period,
      updatedAt,
      items: Object.entries(genreBuckets).map(([genre, g]) => ({
        genre,
        count: Math.round(g.count * (period === "7d" ? 0.6 : 1) * 4),
        volumeUsdt: String(Math.round(g.volume * mul)),
        averageYieldPct: g.yieldSum / g.count,
        avgProgressPct: 52 + (genre.length % 5) * 3,
      })),
    },
    funnel: {
      period,
      updatedAt,
      steps: {
        createdReleases: period === "all" ? 128 : period === "90d" ? 74 : period === "30d" ? 42 : 18,
        activeRounds: period === "all" ? 61 : period === "90d" ? 48 : period === "30d" ? 34 : 16,
        soldUnits: String(Math.round(1_840_000 * mul)),
        holders: Math.round(3_420 * Math.min(mul, 1.4)),
        payoutsReleases: period === "7d" ? 9 : 18,
        secondaryListings: Math.round(86 * Math.min(mul, 1.2)),
        secondaryTrades: Math.round(412 * mul),
      },
    },
  };
}