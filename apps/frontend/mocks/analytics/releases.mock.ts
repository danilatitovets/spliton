import { MARKET_OVERVIEW_ROWS } from "@/mocks/market-overview-rows";
import type { ReleaseAnalyticsRow, ReleaseRowGenre, ReleaseRowStatus } from "@/types/analytics/releases";

function segmentToGenre(segment: string): ReleaseRowGenre {
  const s = segment.toLowerCase();
  if (s.includes("hip")) return "hiphop";
  if (s === "pop") return "pop";
  return "electronic";
}

function marketStatusToRowStatus(status: (typeof MARKET_OVERVIEW_ROWS)[number]["status"]): ReleaseRowStatus {
  if (status === "Пауза") return "Paused";
  if (status === "Закрыт") return "Closed";
  return "Active";
}

function spark12(sparkline: number[]): number[] {
  if (sparkline.length >= 12) return sparkline.slice(0, 12);
  const out = [...sparkline];
  while (out.length < 12) {
    out.push(out[out.length - 1] ?? 40);
  }
  return out;
}

function changePctFromTrend(t: (typeof MARKET_OVERVIEW_ROWS)[number]["trend"]): string {
  if (t === "up") return "+1,24%";
  if (t === "down") return "−0,68%";
  return "0,00%";
}

/**
 * Строки аналитики релизов совпадают по id и метаданным с обзором рынка каталога,
 * чтобы `/analytics/releases/{id}` и `/catalog/market-overview/analytics/{id}` описывали один релиз.
 */
export const RELEASE_ANALYTICS_ROWS_MOCK: ReleaseAnalyticsRow[] = MARKET_OVERVIEW_ROWS.map((r, i) => {
  const lo = Math.round(r.payoutsUsdt * 0.72);
  const hi = Math.round(r.payoutsUsdt * 1.18);
  return {
    id: r.id,
    symbol: r.symbol,
    release: r.title,
    artist: r.artist,
    genre: segmentToGenre(r.segment),
    yieldPct: `${r.yieldPct.toFixed(1).replace(".", ",")}%`,
    changePct: changePctFromTrend(r.trend),
    payouts: `${Math.round(r.payoutsUsdt).toLocaleString("ru-RU")} USDT`,
    units: Math.round(r.availableUnits).toLocaleString("ru-RU"),
    status: marketStatusToRowStatus(r.status),
    trend: r.trend,
    sparkline: spark12(r.sparkline),
    payoutBand: {
      lo: `${lo.toLocaleString("ru-RU")} USDT`,
      hi: `${hi.toLocaleString("ru-RU")} USDT`,
      t: 0.42 + (i % 6) * 0.06,
    },
  };
});
