import { ROUTES } from "@/constants/routes";

/** Почта поддержки (UI + mailto). */
export const SUPPORT_HELPDESK_EMAIL = "support@revshare.example";

export type SupportArticle = {
  id: string;
  title: string;
  excerpt: string;
  readMin: number;
  /** Якорь или внешний раздел; MVP — заглушка # */
  href: string;
};

export const SUPPORT_QUICK_ACTIONS: Array<{
  label: string;
  description: string;
  href: string;
}> = [
  {
    label: "Пополнить USDT",
    description: "TRC20 · адрес и инструкция",
    href: `${ROUTES.dashboardPayouts}/deposit`,
  },
  {
    label: "Выплаты и вывод",
    description: "История, вывод, сравнение",
    href: ROUTES.dashboardPayoutsHistory,
  },
  {
    label: "Вторичный рынок",
    description: "Стакан, ордера, сделки",
    href: ROUTES.dashboardSecondaryMarket,
  },
  {
    label: "Профиль и безопасность",
    description: "Верификация, 2FA, сессии",
    href: `${ROUTES.dashboardProfile}?tab=security`,
  },
];

export const SUPPORT_TOPIC_CARDS: Array<{
  id: string;
  title: string;
  description: string;
  href: string;
}> = [
  {
    id: "deposit-trc20",
    title: "Пополнение USDT (TRC20)",
    description: "Сеть, комиссия сети, время зачисления и типичные ошибки адреса.",
    href: `${ROUTES.dashboardPayouts}/deposit`,
  },
  {
    id: "withdraw",
    title: "Вывод средств",
    description: "Заявки, лимиты, подтверждение по почте и статусы в ленте.",
    href: `${ROUTES.dashboardPayouts}/withdraw`,
  },
  {
    id: "payouts",
    title: "Revenue share и начисления",
    description: "Как формируются выплаты по долям, графики и сверка с балансом.",
    href: ROUTES.dashboardPayouts,
  },
  {
    id: "secondary",
    title: "Вторичный рынок",
    description: "Ордера, стакан, история сделок и избранное.",
    href: ROUTES.dashboardSecondaryMarket,
  },
  {
    id: "verification",
    title: "Верификация",
    description: "Статус аккаунта, документы и доступ к операциям.",
    href: `${ROUTES.dashboardProfile}?tab=verification`,
  },
  {
    id: "security",
    title: "Безопасность",
    description: "Пароль, 2FA, вывод и уведомления о входе.",
    href: `${ROUTES.dashboardProfile}?tab=security`,
  },
];

export const SUPPORT_KB_CATEGORIES: Array<{
  title: string;
  items: Array<{ label: string; href: string }>;
}> = [
  {
    title: "Баланс и USDT",
    items: [
      { label: "Ручное пополнение (deposit)", href: `${ROUTES.dashboardPayouts}/deposit` },
      { label: "Покупка USDT у провайдера", href: `${ROUTES.dashboardPayouts}/deposit` },
      { label: "Комиссии и лимиты", href: ROUTES.guideSelection },
      { label: "Начисления по релизам", href: ROUTES.dashboardPayouts },
    ],
  },
  {
    title: "Вторичный рынок",
    items: [
      { label: "Стакан и цены", href: ROUTES.dashboardSecondaryMarket },
      { label: "Ордера и исполнение", href: ROUTES.dashboardSecondaryMarket },
      { label: "История сделок", href: ROUTES.dashboardSecondaryMarket },
    ],
  },
  {
    title: "Аккаунт",
    items: [
      { label: "Верификация личности", href: `${ROUTES.dashboardProfile}?tab=verification` },
      { label: "Настройки кабинета", href: `${ROUTES.dashboardProfile}?tab=settings` },
      { label: "Активность", href: ROUTES.dashboardActivity },
    ],
  },
];

/** FAQ: колонки как на help-центре — заголовок + аккордеон вопросов */
export type SupportFaqItem = {
  id: string;
  question: string;
  answer: string;
  link?: { href: string; label: string };
};

export type SupportFaqGroup = {
  id: string;
  /** Заголовок колонки (верхний регистр в UI) */
  headline: string;
  items: SupportFaqItem[];
};

export const SUPPORT_FAQ_GROUPS: SupportFaqGroup[] = [
  {
    id: "balance",
    headline: "Баланс и USDT",
    items: [
      {
        id: "b-1",
        question: "Как пополнить баланс в USDT (TRC20)?",
        answer:
          "Откройте раздел пополнения, скопируйте адрес кошелька платформы и отправьте USDT только в сети TRC20. Сумма и комиссия сети отображаются в кабинете до подтверждения.",
        link: { href: `${ROUTES.dashboardPayouts}/deposit`, label: "Перейти к пополнению" },
      },
      {
        id: "b-2",
        question: "Что если средства не пришли?",
        answer:
          "Проверьте сеть (должна быть TRC20), корректность адреса и количество подтверждений в блокчейне. Транзакции в другой сети или на неверный адрес могут быть безвозвратны — при сомнениях не повторяйте перевод, напишите в поддержку с хешем tx.",
        link: { href: ROUTES.dashboardPayoutsHistory, label: "История операций" },
      },
      {
        id: "b-3",
        question: "Есть ли лимиты и комиссии?",
        answer:
          "Лимиты на ввод/вывод и внутренние комиссии задаются продуктом и могут зависеть от уровня верификации. Актуальные значения смотрите в формах пополнения и вывода и в гайдах по сделке.",
        link: { href: ROUTES.guideSelection, label: "Гиды" },
      },
      {
        id: "b-4",
        question: "Можно ли купить USDT через провайдера?",
        answer:
          "Если в кабинете доступен провайдер, выберите сумму и следуйте шагам оплаты. После успешной оплаты баланс обновится по статусу провайдера и правилам зачисления.",
        link: { href: `${ROUTES.dashboardPayouts}/deposit`, label: "Купить / пополнить" },
      },
    ],
  },
  {
    id: "market",
    headline: "Вторичный рынок",
    items: [
      {
        id: "m-1",
        question: "Как выставить заявку в стакане?",
        answer:
          "Во вторичном рынке выберите инструмент, тип заявки (покупка/продажа), цену и объём. После размещения заявка попадает в стакан; исполнение зависит от встречного объёма и цены.",
        link: { href: ROUTES.dashboardSecondaryMarket, label: "Открыть рынок" },
      },
      {
        id: "m-2",
        question: "Чем лимит отличается от рыночной?",
        answer:
          "Лимит исполняется по вашей цене или лучше, когда есть контрагент. Рыночная заявка стремится исполниться сразу по доступной ликвидности — проскальзывание возможно.",
      },
      {
        id: "m-3",
        question: "Где посмотреть историю сделок?",
        answer:
          "История сделок и статусы ордеров доступны в том же разделе вторичного рынка. Используйте её для сверки с выплатами и позициями.",
        link: { href: ROUTES.dashboardSecondaryMarket, label: "История и ордера" },
      },
      {
        id: "m-4",
        question: "Почему заявка отменена или частично исполнена?",
        answer:
          "Частичное исполнение возможно при нехватке объёма на уровне цены. Отмена может быть по таймауту, ручной отмене или изменению параметров инструмента — детали в ленте по конкретному ордеру.",
      },
    ],
  },
  {
    id: "payouts",
    headline: "Выплаты и доли",
    items: [
      {
        id: "p-1",
        question: "Как устроены revenue share выплаты?",
        answer:
          "Выплаты привязаны к долям (units / rights) по релизам и правилам сделки. Начисления отображаются в разделе выплат и на графиках; сроки зависят от отчётного периода и условий релиза.",
        link: { href: ROUTES.dashboardPayouts, label: "Обзор выплат" },
      },
      {
        id: "p-2",
        question: "Как вывести USDT на свой кошелёк?",
        answer:
          "Укажите адрес TRC20, пройдите проверки безопасности и подтвердите заявку. Вывод обрабатывается в очереди; статус смотрите в истории выплат и уведомлениях.",
        link: { href: `${ROUTES.dashboardPayouts}/withdraw`, label: "Вывод" },
      },
      {
        id: "p-3",
        question: "Почему начисление отличается от ожидаемого?",
        answer:
          "Сумма может зависеть от доли, удержаний, налоговой документации (если применимо) и фактических поступлений по релизу. Сверяйте карточку релиза и период отчёта.",
        link: { href: ROUTES.dashboardPayoutsComparison, label: "Сравнение периодов" },
      },
    ],
  },
  {
    id: "account",
    headline: "Аккаунт и безопасность",
    items: [
      {
        id: "a-1",
        question: "Зачем нужна верификация?",
        answer:
          "Верификация снижает риск мошенничества и может быть обязательной для операций с выводом и лимитами. Статус и запрошенные документы — в профиле.",
        link: { href: `${ROUTES.dashboardProfile}?tab=verification`, label: "Верификация" },
      },
      {
        id: "a-2",
        question: "Как включить 2FA и защитить вывод?",
        answer:
          "В разделе безопасности подключите двухфакторную аутентификацию, проверьте почту и список сессий. Для вывода могут требоваться дополнительные подтверждения.",
        link: { href: `${ROUTES.dashboardProfile}?tab=security`, label: "Безопасность" },
      },
      {
        id: "a-3",
        question: "Поддержка просит seed-фразу или пароль?",
        answer:
          "Нет. RevShare не запрашивает seed-фразу, пароль от почты в переписке или «проверочные» переводы. Сообщайте только ID аккаунта и публичные детали операции.",
        link: { href: `mailto:${SUPPORT_HELPDESK_EMAIL}`, label: "Написать в поддержку" },
      },
      {
        id: "a-4",
        question: "Где посмотреть активность входов?",
        answer:
          "Лента действий по аккаунту доступна в разделе активности. При подозрении на взлом смените пароль, завершите сессии и обратитесь в поддержку.",
        link: { href: ROUTES.dashboardActivity, label: "Активность" },
      },
    ],
  },
];

export type SupportServiceStatusKind = "operational" | "delayed" | "maintenance";

export const SUPPORT_SERVICE_STATUS_ROWS: Array<{
  id: string;
  label: string;
  status: SupportServiceStatusKind;
  hint?: string;
}> = [
  { id: "svc-dep", label: "Депозиты", status: "operational", hint: "TRC20" },
  { id: "svc-wd", label: "Выводы", status: "operational", hint: "очередь < 30 мин" },
  { id: "svc-pay", label: "Выплаты", status: "delayed", hint: "задержка до 45 мин" },
  { id: "svc-sm", label: "Вторичный рынок", status: "operational" },
];

export const SUPPORT_FEATURED_ARTICLES: SupportArticle[] = [
  {
    id: "1",
    title: "Первые шаги: баланс, доли и выплаты",
    excerpt: "Как читать обзор активов, где смотреть начисления и что такое rights / units.",
    readMin: 4,
    href: ROUTES.guideSelection,
  },
  {
    id: "2",
    title: "Вывод USDT на TRC20: чек-лист",
    excerpt: "Проверка адреса, лимиты, время обработки и что делать при задержке.",
    readMin: 6,
    href: `${ROUTES.dashboardPayouts}/withdraw`,
  },
  {
    id: "3",
    title: "Вторичный рынок без лишнего шума",
    excerpt: "Заявки, спред и как не перепутать сторону сделки.",
    readMin: 5,
    href: ROUTES.dashboardSecondaryMarket,
  },
  {
    id: "4",
    title: "Структура сделки по релизу",
    excerpt: "Параметры revenue share и что смотреть перед покупкой доли.",
    readMin: 7,
    href: ROUTES.guideDealStructure,
  },
];
