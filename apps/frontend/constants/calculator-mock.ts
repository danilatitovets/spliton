/**
 * Иллюстративные коэффициенты для UI-калькуляторов.
 * Реальные тарифы подставятся из API / конфигурации продукта.
 */
export const CALCULATOR_MOCK = {
  buyPlatformFeeRate: 0.025,
  secondaryMarketFeeRate: 0.015,
  /** Минимальная комиссия вывода, USDT */
  withdrawFeeMinUsdt: 1,
  withdrawFeeRate: 0.005,
  /** Цена за unit по умолчанию (справочно), USDT */
  defaultPricePerUnitUsdt: 12.5,
  /** Иллюстративный объём units в релизе для оценки доли */
  defaultTotalUnitsOutstanding: 1_000_000,
} as const;
