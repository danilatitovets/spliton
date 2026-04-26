import { ROUTES } from "@/constants/routes";

/** Ссылка на разбор карточки в каталоге (якорь на mock-карточку). */
export const GUIDE_CATALOG_CARD_HREF = `${ROUTES.catalogReleaseParameters}#rp-card` as const;

/** Правая колонка: порядок как на странице, подписи = названия разделов. */
export const GUIDE_IN_PAGE_NAV = [
  { id: "guide-top", label: "Гид по выбору релиза" },
  { id: "topics", label: "Выберите раздел" },
  { id: "checklist", label: "На что смотреть перед входом" },
  { id: "release-card", label: "Язык карточки в каталоге" },
  { id: "factors", label: "Пять факторов выбора релиза" },
  { id: "deal", label: "Как устроена сделка" },
  { id: "payouts", label: "Как оценивать выплаты" },
  { id: "risks", label: "Какие риски учитывать" },
  { id: "compare", label: "Как сравнивать релизы между собой" },
  { id: "faq", label: "FAQ" },
] as const;

/** Иконка раздела в сетке «Выберите раздел» — сопоставляется с Lucide в `GuideExchangeCard`. */
export type GuideTopicIconId = "checklist" | "release" | "factors" | "deal" | "payouts" | "risks";

export type GuideTopicCardEntry = {
  anchor: string;
  href?: string;
  title: string;
  description: string;
  icon: GuideTopicIconId;
};

export const GUIDE_TOPIC_CARDS = [
  {
    anchor: "checklist",
    title: "Чеклист перед входом",
    description:
      "Шесть быстрых фильтров: доходность, история выплат, доля пользователей (investor_share), deal, secondary и прозрачность.",
    icon: "checklist",
  },
  {
    anchor: "release-card",
    href: GUIDE_CATALOG_CARD_HREF,
    title: "Параметры релиза",
    description:
      "Полный разбор полей карточки и mock UI — на странице каталога; в гиде только отбор и сравнение релизов.",
    icon: "release",
  },
  {
    anchor: "factors",
    title: "Пять факторов оценки",
    description: "Единая модель: доходность, структура, история, спрос и ликвидность — в одном каркасе.",
    icon: "factors",
  },
  {
    anchor: "deal",
    title: "Структура сделки",
    description: "От raise target до net payout: где теряется и где концентрируется ваша доля.",
    icon: "deal",
  },
  {
    anchor: "payouts",
    title: "Выплаты и история",
    description: "Стабильность периодов, accrued vs released и сравнение cashflow между релизами.",
    icon: "payouts",
  },
  {
    anchor: "risks",
    title: "Риски и оговорки",
    description: "Честный перечень ограничений: волатильность, ликвидность и несовпадение ожиданий.",
    icon: "risks",
  },
] satisfies readonly GuideTopicCardEntry[];

export const GUIDE_SELECTION_FACTORS = [
  {
    title: "1. Доходность",
    desc: "Смотрите expected yield в связке с качеством payout history, а не изолированно.",
    note: "В каталоге сравнивайте yield и волатильность выплат рядом.",
    watch: "Expected yield, динамика за 30/90 дней, отклонения период-к-периоду",
  },
  {
    title: "2. Структура сделки",
    desc: "Оценивайте, как делится revenue между пользователями (пул UNT), артистом и платформой.",
    note: "Чем прозрачнее split и комиссии, тем точнее прогноз payout.",
    watch: "Investor share, platform fee, условия распределения дохода",
  },
  {
    title: "3. История выплат",
    desc: "Стабильные выплаты часто важнее разового высокого пика.",
    note: "Сравнивайте регулярность и размер payout по периодам.",
    watch: "Payout frequency, accrued vs released, просадки",
  },
  {
    title: "4. Спрос и активность",
    desc: "Активность по релизу влияет на velocity доходов и интерес рынка.",
    note: "Смотрите тренд по UNT и общую вовлеченность актива.",
    watch: "Filled round %, динамика спроса, повторные входы пользователей",
  },
  {
    title: "5. Ликвидность / secondary market",
    desc: "Ликвидность определяет гибкость выхода до полного цикла выплат.",
    note: "Оценивайте глубину спроса и скорость исполнения заявок.",
    watch: "Bid/ask активность, объем сделок, спред ликвидности",
  },
] as const;

export const GUIDE_SELECTION_RISKS = [
  "Нерегулярность дохода по отдельным периодам",
  "Разная динамика между релизами даже в одном жанре",
  "Срок окупаемости может отличаться от ожиданий",
  "Ограниченная ликвидность в secondary market",
  "Высокая доходность не гарантирует стабильность выплат",
] as const;

export type GuideFaqCategoryId = "general" | "yield" | "deal" | "liquidity";

export type GuideFaqFilterId = "all" | GuideFaqCategoryId;

export const GUIDE_FAQ_FILTERS: { id: GuideFaqFilterId; label: string }[] = [
  { id: "all", label: "Все" },
  { id: "general", label: "Общее" },
  { id: "yield", label: "Доходность" },
  { id: "deal", label: "Сделка" },
  { id: "liquidity", label: "Ликвидность" },
];

export const GUIDE_SELECTION_FAQ = [
  {
    category: "yield" satisfies GuideFaqCategoryId,
    q: "Что важнее: высокая доходность или стабильные выплаты?",
    a: "Для устойчивой стратегии чаще важнее стабильность payout history. Высокий yield имеет смысл только вместе с контролируемой волатильностью.",
  },
  {
    category: "general" satisfies GuideFaqCategoryId,
    q: "Как понять, что сделка слишком агрессивная?",
    a: "Если доходность значительно выше медианы каталога при слабой истории выплат и низкой ликвидности, это сигнал повышенного риска.",
  },
  {
    category: "deal" satisfies GuideFaqCategoryId,
    q: "Зачем смотреть investor share?",
    a: "Investor share напрямую влияет на то, какая часть revenue конвертируется в ваш payout после комиссий и распределений.",
  },
  {
    category: "liquidity" satisfies GuideFaqCategoryId,
    q: "Когда secondary market важнее, чем payout yield?",
    a: "Когда важна гибкость выхода: высокая ликвидность позволяет управлять позицией до завершения полного payout-цикла.",
  },
  {
    category: "general" satisfies GuideFaqCategoryId,
    q: "На что смотреть новичку в первую очередь?",
    a: "Начните с 4 пунктов: payout history, investor share, структура сделки и динамика спроса по UNT.",
  },
] as const;
