export type NewsCategoryId = "product" | "payouts" | "market" | "legal";

export type NewsArticle = {
  id: string;
  /** ISO 8601 для атрибута dateTime */
  isoDate: string;
  dateLabel: string;
  category: NewsCategoryId;
  title: string;
  excerpt: string;
  isNew?: boolean;
};

export const NEWS_CATEGORY_META: Record<
  NewsCategoryId,
  { label: string; pillClass: string }
> = {
  product: {
    label: "Продукт",
    pillClass: "border-lime-200/90 bg-lime-50 text-lime-900",
  },
  payouts: {
    label: "Выплаты",
    pillClass: "border-sky-200/90 bg-sky-50 text-sky-900",
  },
  market: {
    label: "Рынок",
    pillClass: "border-violet-200/90 bg-violet-50 text-violet-900",
  },
  legal: {
    label: "Документы",
    pillClass: "border-neutral-200 bg-neutral-100 text-neutral-800",
  },
};

export const newsArticlesMock: NewsArticle[] = [
  {
    id: "n-2026-04-12-secondary",
    isoDate: "2026-04-12",
    dateLabel: "12 апр. 2026",
    category: "market",
    title: "Вторичный рынок: подсказки в стакане и история сделок",
    excerpt:
      "В кабинете обновлены подписи к глубине стакана и фильтрам истории — меньше сомнений при размещении лимитных заявок в USDT (TRC20).",
    isNew: true,
  },
  {
    id: "n-2026-04-08-payouts",
    isoDate: "2026-04-08",
    dateLabel: "8 апр. 2026",
    category: "payouts",
    title: "Выплаты: единый формат сумм и комиссий в подтверждении",
    excerpt:
      "Перед подтверждением вывода теперь явно показываются сумма к списанию, комиссия сети и итог к получению — в том же стиле, что и пополнение.",
    isNew: true,
  },
  {
    id: "n-2026-03-28-product",
    isoDate: "2026-03-28",
    dateLabel: "28 мар. 2026",
    category: "product",
    title: "Каталог релизов: быстрый просмотр доходности",
    excerpt:
      "В карточке релиза добавлены ориентиры по последним выплатам и ликвидности units — данные по-прежнему ориентировочные до подключения live API.",
  },
  {
    id: "n-2026-03-15-legal",
    isoDate: "2026-03-15",
    dateLabel: "15 мар. 2026",
    category: "legal",
    title: "Уточнения в разделе комиссий и лимитов",
    excerpt:
      "Страница «Комиссии» дополнена примерами расчёта для первичной покупки units и сделок на вторичном рынке — без изменения базовых тарифов.",
  },
  {
    id: "n-2026-03-02-metrics",
    isoDate: "2026-03-02",
    dateLabel: "2 мар. 2026",
    category: "product",
    title: "Метрики портфеля: светлый режим и экспорт в работе",
    excerpt:
      "Экран метрик активов переведён в тот же светлый каркас, что профиль и выплаты; выгрузка в CSV запланирована в следующем релизе.",
  },
  {
    id: "n-2026-02-18-support",
    isoDate: "2026-02-18",
    dateLabel: "18 февр. 2026",
    category: "product",
    title: "Поддержка: шаблоны обращений по выплатам и верификации",
    excerpt:
      "В форме обращения добавлены быстрые темы — меньше уточняющих вопросов со стороны поддержки и быстрее маршрутизация тикета.",
  },
];
