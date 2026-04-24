export type MarketOverviewPeriod = "24h" | "7d" | "30d" | "90d";

export type MarketOverviewCategory =
  | "all"
  | "new"
  | "yield"
  | "stable"
  | "demand"
  | "secondary"
  | "premium"
  | "archive";

export type MarketRowTrend = "up" | "down" | "flat";

export type MarketTableSortKey = "yield" | "payouts" | "activity" | "units";

export type MarketOverviewRow = {
  id: string;
  symbol: string;
  title: string;
  artist: string;
  segment: string;
  yieldPct: number;
  payoutsUsdt: number;
  activityScore: number;
  availableUnits: number;
  /** Цена 1 unit в первичном раунде, USDT TRC20 (мок каталога; одна позиция — одно значение). */
  primaryUnitPriceUsdt: number;
  secondaryLabel: "Высокий" | "Средний" | "Низкий" | "—";
  liquidityLabel: "Deep" | "Mid" | "Thin";
  trend: MarketRowTrend;
  sparkline: number[];
  status: "Активен" | "Пауза" | "Закрыт" | "Новый";
  /** Для фильтра «Выплаты» в UI */
  payoutFreq: "monthly" | "biweekly";
  categories: MarketOverviewCategory[];
};
