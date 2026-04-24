import type { ReleaseRowTrend } from "@/types/analytics/releases";

/** Парсит строку вида `+1,24%`, `−0,68%`, `0,00%` (ru) в число процентов. */
export function parseSignedPercentChange(changePct: string): number {
  let s = changePct.trim().replace("%", "").replace(/\u2212/g, "-").replace(",", ".");
  let sign = 1;
  if (s.startsWith("+")) s = s.slice(1);
  else if (s.startsWith("-")) {
    sign = -1;
    s = s.slice(1);
  }
  const n = Number.parseFloat(s) * sign;
  return Number.isFinite(n) ? n : 0;
}

export function directionFromChangePct(changePct: string): ReleaseRowTrend {
  const n = parseSignedPercentChange(changePct);
  if (Math.abs(n) < 1e-6) return "flat";
  if (n > 0) return "up";
  return "down";
}
