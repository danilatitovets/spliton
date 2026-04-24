/** Уровни ask по возрастанию цены. */
export function sortAsks(levels: { price: number; units: number }[]) {
  return [...levels].sort((a, b) => a.price - b.price);
}

/** Уровни bid по убыванию цены. */
export function sortBids(levels: { price: number; units: number }[]) {
  return [...levels].sort((a, b) => b.price - a.price);
}

export type WalkResult = {
  filledUnits: number;
  totalUsdt: number;
  avgPrice: number;
  unfilledUnits: number;
};

/** Покупка: съедаем ask снизу вверх по цене. */
export function walkBuyAgainstAsks(
  asks: { price: number; units: number }[],
  unitsWanted: number,
  maxPrice?: number,
): WalkResult {
  const sorted = sortAsks(asks);
  let remaining = unitsWanted;
  let totalUsdt = 0;
  for (const lvl of sorted) {
    if (maxPrice != null && lvl.price > maxPrice) break;
    const take = Math.min(remaining, lvl.units);
    totalUsdt += take * lvl.price;
    remaining -= take;
    if (remaining <= 0) break;
  }
  const filled = unitsWanted - remaining;
  return {
    filledUnits: filled,
    totalUsdt,
    avgPrice: filled > 0 ? totalUsdt / filled : 0,
    unfilledUnits: remaining,
  };
}

/** Продажа: съедаем bid сверху вниз. */
export function walkSellAgainstBids(
  bids: { price: number; units: number }[],
  unitsWanted: number,
  minPrice?: number,
): WalkResult {
  const sorted = sortBids(bids);
  let remaining = unitsWanted;
  let totalUsdt = 0;
  for (const lvl of sorted) {
    if (minPrice != null && lvl.price < minPrice) break;
    const take = Math.min(remaining, lvl.units);
    totalUsdt += take * lvl.price;
    remaining -= take;
    if (remaining <= 0) break;
  }
  const filled = unitsWanted - remaining;
  return {
    filledUnits: filled,
    totalUsdt,
    avgPrice: filled > 0 ? totalUsdt / filled : 0,
    unfilledUnits: remaining,
  };
}
