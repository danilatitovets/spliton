import { ROUTES, secondaryMarketBookPath } from "@/constants/routes";

export const SECONDARY_MARKET_TABS = [
  { id: "market", label: "Рынок" },
  { id: "analytics", label: "Аналитика" },
  { id: "orders", label: "Мои ордера" },
  { id: "history", label: "История сделок" },
  { id: "watchlist", label: "Избранное" },
  { id: "rules", label: "Правила рынка" },
] as const;

export type SecondaryMarketTabId = (typeof SECONDARY_MARKET_TABS)[number]["id"];

/** Тип «страницы» внутри workspace — для бейджа и тона шапки. */
export type SecondaryMarketTabZone = "trading" | "operations" | "ledger" | "research" | "reference";

export type SecondaryMarketTabPageMeta = {
  /** Заголовок вкладки браузера (без суффикса продукта). */
  documentTitle: string;
  zone: SecondaryMarketTabZone;
  /** Короткий бейдж над заголовком. */
  zoneLabel: string;
  /** Крупный заголовок текущей поверхности. */
  surfaceTitle: string;
  surfaceSubtitle: string;
};

export const SECONDARY_MARKET_TAB_META: Record<SecondaryMarketTabId, SecondaryMarketTabPageMeta> = {
  market: {
    documentTitle: "Рынок",
    zone: "trading",
    zoneLabel: "Торговый зал",
    surfaceTitle: "Рынок листингов",
    surfaceSubtitle:
      "Каталог лотов: «Стакан» открывает отдельную страницу терминала по инструменту (mnr / sgn / vlt в макете). Данные — демо.",
  },
  analytics: {
    documentTitle: "Торговая аналитика",
    zone: "trading",
    zoneLabel: "Вторичный рынок",
    surfaceTitle: "Торговая аналитика",
    surfaceSubtitle:
      "Котировки, ликвидность, спред и сделки по инструменту на вторичке. Доходность и выплаты — на странице «Аналитика релиза».",
  },
  orders: {
    documentTitle: "Мои ордера",
    zone: "operations",
    zoneLabel: "Операции",
    surfaceTitle: "Активные и завершённые заявки",
    surfaceSubtitle:
      "Статусы лимитных и рыночных ордеров, частичное исполнение и действия по заявке — в одном операционном экране.",
  },
  history: {
    documentTitle: "История сделок",
    zone: "ledger",
    zoneLabel: "Журнал",
    surfaceTitle: "История сделок",
    surfaceSubtitle:
      "Хронология исполненных сделок на вторичном рынке RevShare. Здесь отображаются покупки и продажи units, сумма расчёта, комиссия и статус зачисления.",
  },
  watchlist: {
    documentTitle: "Избранное",
    zone: "research",
    zoneLabel: "Наблюдение",
    surfaceTitle: "Watchlist релизов",
    surfaceSubtitle:
      "Закреплённые релизы: стакан — отдельная страница терминала; торговая аналитика — вкладка «Аналитика» с параметром release; performance актива — в `/analytics/releases/[id]`.",
  },
  rules: {
    documentTitle: "Правила рынка",
    zone: "reference",
    zoneLabel: "Справочник",
    surfaceTitle: "Правила и политика исполнения",
    surfaceSubtitle:
      "Комиссии, лимиты, матчинг, settlement и ограничения — без юридической простыни; полные условия — в оферте платформы.",
  },
};

/** Валидный `tab` из query для `/dashboard/secondary-market`. Раньше был отдельный `book` — считаем как «Рынок». */
export function parseSecondaryMarketTabParam(raw: string | null): SecondaryMarketTabId | null {
  if (!raw) return null;
  if (raw === "book") return "market";
  return SECONDARY_MARKET_TABS.some((t) => t.id === raw) ? (raw as SecondaryMarketTabId) : null;
}

/** Mock id стакана (совпадает с `BOOK_MARKETS` в компоненте стакана). */
export type SecondaryBookMarketId = "mnr" | "sgn" | "vlt";

export function isSecondaryBookMarketQuery(raw: string | null): raw is SecondaryBookMarketId {
  return raw === "mnr" || raw === "sgn" || raw === "vlt";
}

const SYMBOL_TO_BOOK: Record<string, SecondaryBookMarketId> = {
  MNR: "mnr",
  SGN: "sgn",
  VLT: "vlt",
};

/** Символ листинга → id стакана; `null`, если отдельного стакана в макете нет. */
export function secondaryMarketBookIdForSymbol(symbol: string): SecondaryBookMarketId | null {
  return SYMBOL_TO_BOOK[symbol] ?? null;
}

/** Ссылка на вкладку вторичного рынка с query. */
export function secondaryMarketHref(
  tab: SecondaryMarketTabId,
  opts?: { market?: SecondaryBookMarketId | string; release?: string },
): string {
  const p = new URLSearchParams();
  p.set("tab", tab);
  if (opts?.market) p.set("market", String(opts.market));
  if (opts?.release) p.set("release", String(opts.release));
  return `${ROUTES.dashboardSecondaryMarket}?${p.toString()}`;
}

/** Стакан выбранного инструмента — отдельная страница терминала. */
export function secondaryMarketBookHref(marketId: SecondaryBookMarketId | string): string {
  return secondaryMarketBookPath(String(marketId));
}
