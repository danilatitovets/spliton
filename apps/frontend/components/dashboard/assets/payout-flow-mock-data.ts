export type PayoutFaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type PayoutStep = {
  id: number;
  title: string;
  value: string;
  state: "active" | "pending" | "done";
};

export type PayoutMetaRow = {
  label: string;
  value: string;
};

export type PayoutHistoryEntry = {
  id: string;
  time: string;
  address: string;
  txId: string;
  asset: string;
  amount: string;
  progress: string;
  status: string;
  fee?: string;
};

export const depositSteps: PayoutStep[] = [
  { id: 1, title: "Выбор криптовалюты", value: "USDT", state: "done" },
  { id: 2, title: "Выберите сеть", value: "Tron (TRC20)", state: "done" },
  { id: 3, title: "Подробнее о пополнении", value: "TP5eB1Af8zqufUFFDBuuT5shfbBveo3", state: "active" },
];

export const withdrawSteps: PayoutStep[] = [
  { id: 1, title: "Выбор криптовалюты", value: "USDT", state: "done" },
  { id: 2, title: "Укажите назначение", value: "TN7k...9wLX", state: "done" },
  { id: 3, title: "Укажите сумму вывода", value: "Доступно: 286.40 USDT", state: "active" },
];

export const depositMeta: PayoutMetaRow[] = [
  { label: "Минимальный депозит", value: "0,01 USDT" },
  { label: "Время зачисления", value: "~ 1 минута" },
  { label: "Доступно для вывода", value: "~ 2 минуты" },
  { label: "Контракт токена", value: "Детали" },
];

export const withdrawMeta: PayoutMetaRow[] = [
  { label: "Сеть вывода", value: "TRC20" },
  { label: "Комиссия сети", value: "0.15 USDT" },
  { label: "Минимальный вывод", value: "10 USDT" },
  { label: "Время обработки", value: "~ 2–5 минут" },
];

export const depositFaq: PayoutFaqItem[] = [
  {
    id: "dep-how",
    question: "Как внести депозит?",
    answer:
      "Выберите USDT и сеть TRC20, затем скопируйте адрес или отсканируйте QR и отправьте перевод из своего кошелька. После подтверждений в сети зачисление отобразится в истории пополнений.",
  },
  {
    id: "dep-delay",
    question: "Почему депозит может не отобразиться сразу?",
    answer:
      "Блокчейн Tron подтверждает транзакции с задержкой; пока не набрано достаточно подтверждений, статус может оставаться «в обработке». Неверная сеть или контракт токена также задерживают зачисление.",
  },
  {
    id: "dep-address",
    question: "Как узнать адрес депозита и проверить хеш?",
    answer:
      "Актуальный адрес показан на последнем шаге мастера пополнения. TxID из кошелька можно сравнить с записью в таблице ниже или открыть в обозревателе блокчейна Tron.",
  },
  {
    id: "dep-network",
    question: "Какой сетью пополнять USDT?",
    answer:
      "Только TRC20 (Tron), как указано в интерфейсе. Перевод из другой сети может привести к потере средств — всегда проверяйте сеть перед отправкой.",
  },
];

export const withdrawFaq: PayoutFaqItem[] = [
  {
    id: "wd-how",
    question: "Как вывести средства?",
    answer:
      "Укажите актив USDT, адрес кошелька получателя в сети TRC20, сумму с учётом лимитов и комиссии сети, затем отправьте заявку. После обработки платформа инициирует перевод в блокчейн.",
  },
  {
    id: "wd-pending",
    question: "Почему средства могут быть в обработке?",
    answer:
      "Заявки проходят проверки лимитов и безопасности; в сети Tron время подтверждения может варьироваться. В ленте выводов отображается актуальный статус и прогресс.",
  },
  {
    id: "wd-address",
    question: "Какой адрес использовать для вывода?",
    answer:
      "Только ваш внешний адрес в формате TRC20 (начинается с T…). Убедитесь, что кошелёк принимает USDT в этой сети; ошибка в адресе необратима.",
  },
  {
    id: "wd-fee",
    question: "Как рассчитывается комиссия сети?",
    answer:
      "Комиссия Tron за исходящий перевод USDT задаётся сетью и показана в сводке перед отправкой заявки. Сумма к получению на адресе = сумма вывода минус комиссия сети (и иные удержания, если появятся в продукте).",
  },
];

export const depositHistory: PayoutHistoryEntry[] = [
  {
    id: "dep-1",
    time: "18.04.2026, 01:08",
    address: "UCzR...0WbY",
    txId: "fe22...11c9",
    asset: "USDT",
    amount: "15.00",
    progress: "2/2 подтверждений",
    status: "Получено",
  },
  {
    id: "dep-2",
    time: "12.04.2026, 16:42",
    address: "UJa2...9dQm",
    txId: "cc18...a013",
    asset: "USDT",
    amount: "48.20",
    progress: "2/2 подтверждений",
    status: "Получено",
  },
];

export const withdrawHistory: PayoutHistoryEntry[] = [
  {
    id: "wd-1",
    time: "19.04.2026, 10:34",
    address: "TN7k...9wLX",
    txId: "0b36...3bff",
    asset: "USDT",
    amount: "148.50",
    fee: "0.15",
    progress: "Отправлено в сеть",
    status: "Отправлено",
  },
  {
    id: "wd-2",
    time: "15.04.2026, 21:07",
    address: "TG4p...2nZa",
    txId: "ac02...88d1",
    asset: "USDT",
    amount: "60.00",
    fee: "0.15",
    progress: "Подтверждено",
    status: "Завершено",
  },
];
