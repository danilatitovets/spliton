/** Компактное отображение USDT для таблицы обзора рынка (mock). */
export function formatUsdtCompact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2).replace(".", ",")}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1).replace(".", ",")}K`;
  return value.toLocaleString("ru-RU");
}

export function formatUnitsCompact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2).replace(".", ",")}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return value.toLocaleString("ru-RU");
}

/** USDT для форм: два знака после запятой, ru-RU (например 1 234,50). */
export function formatUsdtFixedRu(value: number, fractionDigits = 2): string {
  return value.toLocaleString("ru-RU", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}
