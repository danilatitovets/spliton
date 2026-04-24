import { ROUTES } from "@/constants/routes";

/** Ссылка на разбор карточки в каталоге (якорь на mock-карточку). */
export const GUIDE_CATALOG_CARD_HREF = `${ROUTES.catalogReleaseParameters}#rp-card` as const;

export const GUIDE_IN_PAGE_NAV = [
  { id: "guide-top", label: "Старт" },
  { id: "topics", label: "Разделы" },
  { id: "checklist", label: "Чеклист" },
  { id: "release-card", label: "Каталог" },
  { id: "factors", label: "Факторы" },
  { id: "deal", label: "Сделка" },
  { id: "payouts", label: "Выплаты" },
  { id: "risks", label: "Риски" },
  { id: "compare", label: "Сравнение" },
  { id: "faq", label: "FAQ" },
] as const;

/** Имя файла в `public/images/Select_section/` (кодируется в URL при сборке ссылки). */
export type GuideTopicCardEntry = {
  anchor: string;
  href?: string;
  title: string;
  description: string;
  topicImageFile: string;
};

const GUIDE_TOPIC_IMAGE_DIR = "/images/Select_section";

export function guideTopicImageSrc(fileName: string): string {
  return `${GUIDE_TOPIC_IMAGE_DIR}/${encodeURIComponent(fileName)}`;
}

export const GUIDE_TOPIC_CARDS = [
  {
    anchor: "checklist",
    title: "Чеклист перед входом",
    description:
      "Шесть быстрых фильтров: доходность, история выплат, доля пользователей (investor_share), deal, secondary и прозрачность.",
    topicImageFile: "Checklist_before_entering.png",
  },
  {
    anchor: "release-card",
    href: GUIDE_CATALOG_CARD_HREF,
    title: "Параметры релиза",
    description:
      "Полный разбор полей карточки и mock UI — на странице каталога; в гиде только отбор и сравнение релизов.",
    topicImageFile: "Release parameters.png",
  },
  {
    anchor: "factors",
    title: "Пять факторов оценки",
    description: "Единая модель: доходность, структура, история, спрос и ликвидность — в одном каркасе.",
    topicImageFile: "Five evaluation factors.png",
  },
  {
    anchor: "deal",
    title: "Структура сделки",
    description: "От raise target до net payout: где теряется и где концентрируется ваша доля.",
    topicImageFile: "Transaction_structure.png",
  },
  {
    anchor: "payouts",
    title: "Выплаты и история",
    description: "Стабильность периодов, accrued vs released и сравнение cashflow между релизами.",
    topicImageFile: "Payments_and_history.png",
  },
  {
    anchor: "risks",
    title: "Риски и оговорки",
    description: "Честный перечень ограничений: волатильность, ликвидность и несовпадение ожиданий.",
    topicImageFile: "Risks_and_Disclaimers.png",
  },
] satisfies readonly GuideTopicCardEntry[];

/** In-page hash targets on /guide/selection for checklist cross-links */
export type GuideChecklistCrosslinkSection =
  | "factors"
  | "deal"
  | "payouts"
  | "risks"
  | "compare"
  | "faq";

export type GuideChecklistAssociation = {
  label: string;
  section?: GuideChecklistCrosslinkSection;
  /** Внешняя страница (например разбор карточки в каталоге) */
  href?: string;
};

export type GuideChecklistRow = {
  title: string;
  associations: readonly GuideChecklistAssociation[];
};

export const GUIDE_SELECTION_CHECKLIST = [
  {
    title: "Доходность релиза",
    associations: [
      { label: "Expected yield", href: GUIDE_CATALOG_CARD_HREF },
      { label: "Payout history", section: "payouts" },
      { label: "Волатильность 30/90 дн." },
      { label: "Фактор 1 · доходность", section: "factors" },
    ],
  },
  {
    title: "История выплат",
    associations: [
      { label: "Payout history · UI", href: GUIDE_CATALOG_CARD_HREF },
      { label: "Выплаты и периоды", section: "payouts" },
      { label: "Фактор 3 · история", section: "factors" },
    ],
  },
  {
    title: "Доля пользователей (investor_share)",
    associations: [
      { label: "Структура сделки", section: "deal" },
      { label: "Фактор 2 · split", section: "factors" },
      { label: "FAQ · investor share", section: "faq" },
    ],
  },
  {
    title: "Условия сделки",
    associations: [
      { label: "Deal · блок гида", section: "deal" },
      { label: "Фактор 2 · структура", section: "factors" },
      { label: "Сравнение релизов", section: "compare" },
    ],
  },
  {
    title: "Потенциал secondary market",
    associations: [
      { label: "Фактор 5 · ликвидность", section: "factors" },
      { label: "Риски ликвидности", section: "risks" },
      { label: "FAQ · secondary", section: "faq" },
    ],
  },
  {
    title: "Прозрачность структуры",
    associations: [
      { label: "Структура сделки", section: "deal" },
      { label: "Таблица сравнения", section: "compare" },
      { label: "FAQ · прозрачность", section: "faq" },
    ],
  },
] as const satisfies readonly GuideChecklistRow[];

export const GUIDE_SELECTION_FACTORS = [
  {
    title: "1. Доходность",
    desc: "Смотрите expected yield в связке с качеством payout history, а не изолированно.",
    note: "В каталоге сравнивайте yield и волатильность выплат рядом.",
    watch: "Expected yield, динамика за 30/90 дней, отклонения период-к-периоду",
  },
  {
    title: "2. Структура сделки",
    desc: "Оценивайте, как делится revenue между пользователями (пул units), артистом и платформой.",
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
    note: "Смотрите тренд по units и общую вовлеченность актива.",
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
    a: "Начните с 4 пунктов: payout history, investor share, структура сделки и динамика спроса по units.",
  },
] as const;
