import type { MarketOverviewRow } from "@/types/market-overview";

export function roundUsdt2(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Цена 1 unit в первичном раунде из данных релиза (mock каталога). */
export function getPrimaryUnitPriceUsdt(row: MarketOverviewRow): number {
  return roundUsdt2(row.primaryUnitPriceUsdt);
}

/** Итого USDT за `units` по прайсу первичного раунда. */
export function primaryOrderTotalUsdt(row: MarketOverviewRow, units: number): number {
  return roundUsdt2(getPrimaryUnitPriceUsdt(row) * units);
}

/**
 * Сколько целых units можно купить на сумму `usdt` при фиксированной цене (вниз, без переплаты за «дробный» tail).
 */
export function unitsFromUsdtBudget(unitPriceUsdt: number, usdt: number, maxUnits: number): number {
  const p = unitPriceUsdt;
  if (!(p > 0) || !Number.isFinite(usdt)) return 1;
  if (usdt < p) return 1;
  const q = Math.floor((usdt + 1e-9) / p);
  return Math.min(maxUnits, Math.max(1, q));
}

/** Парсинг ввода суммы (запятая или точка как десятичный разделитель, пробелы как разделитель тысяч). */
export function parseRuMoneyInput(raw: string): number | null {
  const s = raw.replace(/\s/g, "").replace(/'/g, "").trim();
  if (!s) return null;
  const lastComma = s.lastIndexOf(",");
  const lastDot = s.lastIndexOf(".");
  let normalized: string;
  if (lastComma > lastDot) {
    normalized = s.replace(/\./g, "").replace(",", ".");
  } else {
    normalized = s.replace(/,/g, "");
  }
  const n = Number.parseFloat(normalized);
  return Number.isFinite(n) ? n : null;
}
