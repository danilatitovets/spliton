import { ROUTES } from "@/constants/routes";

export type DashboardNavBadge = "new" | "free" | "hot";

export type DashboardNavSubItem = {
  label: string;
  description: string;
  href: string;
  /** Плашка справа от заголовка (как NEW / FREE на референсе) */
  badge?: DashboardNavBadge;
  /** Путь к svg/png в `public` (например `/icons/partner.svg`) */
  iconSrc?: string;
  /** Пока нет картинки — короткий маркер в плейсхолдере (1–2 символа) */
  iconHint?: string;
  /** Деструктивное действие (например «Выйти») */
  danger?: boolean;
};

export type DashboardNavItem = {
  id: string;
  label: string;
  href: string;
  /** Текст в левой колонке mega-menu */
  megaTeaser?: string;
  children?: DashboardNavSubItem[];
};

export const dashboardNavItems: DashboardNavItem[] = [
  { id: "home", label: "Главная", href: ROUTES.dashboard },
  {
    id: "catalog",
    label: "Каталог",
    href: ROUTES.dashboardCatalog,
    megaTeaser:
      "Revenue share по трекам: units, USDT (TRC20), раунды, выплаты и secondary для передачи прав — без брокерской модели.",
    children: [
      {
        label: "Аналитика релизов",
        description: "Доходность, выплаты и сравнение по строкам каталога — ориентиры, не гарантии дохода.",
        href: ROUTES.analyticsReleases,
      },
      {
        label: "Гид по выбору",
        description: "Пошаговые рекомендации по отбору релизов под стратегию",
        href: ROUTES.guideSelection,
        badge: "new",
      },
      {
        label: "Параметры релиза",
        description: "Карточка трека: units, investor_share, раунд, выплаты USDT (TRC20) и secondary.",
        href: ROUTES.catalogReleaseParameters,
      },
      {
        label: "Обзор рынка",
        description: "Ликвидность, поток размещений и secondary — без дублирования построчной доходности из аналитики.",
        href: ROUTES.catalogMarketOverview,
      },
    ],
  },
  {
    id: "holdings",
    label: "Мои активы",
    href: ROUTES.myAssetsOverview,
    megaTeaser: "Сводка holdings: позиции, units, структура и активность по релизам.",
    children: [
      {
        label: "Сводка",
        description: "Краткий обзор текущих positions, units и статуса holdings.",
        href: ROUTES.myAssetsOverview,
      },
      {
        label: "Метрики",
        description: "Структура positions, распределение units и ключевые показатели.",
        href: ROUTES.myAssetsMetrics,
      },
      {
        label: "Активность",
        description: "Действия по holdings: покупки units, transfers и secondary.",
        href: ROUTES.myAssetsOperations,
      },
      {
        label: "Позиции",
        description: "Список всех holdings по релизам с units и статусами.",
        href: ROUTES.myAssetsPositionsStructure,
      },
    ],
  },
  {
    id: "payouts",
    label: "Выплаты",
    href: ROUTES.dashboardPayouts,
    megaTeaser: "Обзор, сравнение периодов, график начислений и операции USDT без лишних шагов.",
    children: [
      {
        label: "Обзор",
        description: "График динамики начислений",
        href: ROUTES.dashboardPayouts,
      },
      {
        label: "Сравнение",
        description: "Два периода: начисления и выводы",
        href: ROUTES.dashboardPayoutsComparison,
      },
      {
        label: "История выплат",
        description: "Все начисления на кошелёк",
        href: ROUTES.dashboardPayoutsHistory,
      },
      {
        label: "Пополнить",
        description: "Пополнение баланса USDT",
        href: `${ROUTES.dashboardPayouts}/deposit`,
      },
      {
        label: "Вывод",
        description: "Вывод USDT и реквизиты",
        href: `${ROUTES.dashboardPayouts}/withdraw`,
      },
    ],
  },
  {
    id: "secondary",
    label: "Вторичный рынок",
    href: ROUTES.dashboardSecondaryMarket,
  },
  {
    id: "misc",
    label: "Сервисы",
    href: ROUTES.support,
    megaTeaser: "Сервисные разделы: поддержка, комиссии, статус и программы — без лишнего шума.",
    children: [
      {
        label: "Поддержка",
        description: "Центр помощи, поиск и быстрые ссылки в кабинет.",
        href: ROUTES.support,
        iconHint: "?",
      },
      {
        label: "Калькулятор",
        description: "Покупка и продажа units, вывод USDT и пример начислений по введённым данным.",
        href: ROUTES.calculator,
        iconHint: "Σ",
      },
      {
        label: "Комиссии",
        description: "Таблица тарифов, примеры расчёта и пояснения по USDT и рынкам.",
        href: ROUTES.fees,
        iconHint: "%",
      },
      {
        label: "Статус системы",
        description: "Сервисы, техработы, инциденты и ссылки в поддержку.",
        href: ROUTES.systemStatus,
        iconHint: "●",
      },
      {
        label: "Новости",
        description: "Релизы продукта и объявления для инвесторов.",
        href: ROUTES.news,
        iconHint: "N",
      },
      {
        label: "Реферальная программа",
        description: "Ссылка, код, статистика приглашений и награды в USDT.",
        href: ROUTES.referralProgram,
        iconHint: "RF",
      },
      {
        label: "Партнёрская программа",
        description: "Медиа, сообщества, лейблы: форматы, заявка и отличие от рефералки.",
        href: ROUTES.partnerProgram,
        iconHint: "PR",
      },
    ],
  },
];


