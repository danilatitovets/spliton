import { CALCULATOR_MOCK } from "@/constants/calculator-mock";

/** Единый источник иллюстративных тарифов (см. калькулятор). */
export const FEES_RATES = {
  platformBuy: CALCULATOR_MOCK.buyPlatformFeeRate,
  secondary: CALCULATOR_MOCK.secondaryMarketFeeRate,
  withdrawMin: CALCULATOR_MOCK.withdrawFeeMinUsdt,
  withdrawRate: CALCULATOR_MOCK.withdrawFeeRate,
  deposit: 0,
  payoutRetention: 0,
} as const;

export type MainFeeRow = {
  operation: string;
  feeType: string;
  rateLabel: string;
  calculation: string;
  note: string;
};

export const mainFeeRows: MainFeeRow[] = [
  {
    operation: "Покупка rights / units (первичный рынок)",
    feeType: "Platform fee",
    rateLabel: `${(FEES_RATES.platformBuy * 100).toLocaleString("ru-RU", { maximumFractionDigits: 2 })} %`,
    calculation: "Процент от суммы платежа в USDT до подтверждения сделки.",
    note: "Отображается в превью ордера и в итоговой строке перед оплатой.",
  },
  {
    operation: "Продажа units на secondary market",
    feeType: "Secondary market fee",
    rateLabel: `${(FEES_RATES.secondary * 100).toLocaleString("ru-RU", { maximumFractionDigits: 2 })} %`,
    calculation: "Процент от суммы исполненной сделки (gross) в USDT.",
    note: "Удерживается при исполнении; итог «к получению» уже за вычетом комиссии.",
  },
  {
    operation: "Вывод USDT на внешний адрес (TRC20)",
    feeType: "Withdrawal fee",
    rateLabel: `max(${FEES_RATES.withdrawMin} USDT; ${(FEES_RATES.withdrawRate * 100).toLocaleString("ru-RU", { maximumFractionDigits: 2 })} %)`,
    calculation: "Берётся большая из двух величин: минимум или процент от запрошенной суммы вывода.",
    note: "Комиссия сети TRC20 оплачивается отдельно на стороне кошелька / сети и не входит в таблицу платформы.",
  },
  {
    operation: "Пополнение баланса USDT (TRC20)",
    feeType: "Deposit fee",
    rateLabel: `${(FEES_RATES.deposit * 100).toLocaleString("ru-RU")} %`,
    calculation: "Платформа не удерживает комиссию с входящего депозита.",
    note: "Перевод в блокчейне может иметь стороннюю комиссию сети — зависит от вашего кошелька.",
  },
  {
    operation: "Зачисление выплат по revenue share на баланс",
    feeType: "Payout settlement",
    rateLabel: "0 % (удержание платформы в примере)",
    calculation: "Начисление на внутренний баланс; иллюстративная строка для прозрачности.",
    note: "Условия конкретного релиза и налоговая отчётность — в карточке сделки и документах.",
  },
];

export type FeeSectionBlock = {
  id: string;
  title: string;
  subtitle: string;
  bullets: string[];
};

export const feeSectionBlocks: FeeSectionBlock[] = [
  {
    id: "wallet",
    title: "Wallet & Balance",
    subtitle: "Пополнение, баланс и зачисления",
    bullets: [
      "Пополнение: комиссия платформы 0 % — см. строку «Deposit fee».",
      "Входящие выплаты по rights: зачисление на баланс без отдельной строки «trading fee».",
      "Итоговые суммы по депозиту и балансу всегда видны до подтверждения входящего перевода (где применимо).",
    ],
  },
  {
    id: "market",
    title: "Market & Trading",
    subtitle: "Первичный и вторичный рынок units",
    bullets: [
      `Первичная покупка: platform fee ${(FEES_RATES.platformBuy * 100).toLocaleString("ru-RU", { maximumFractionDigits: 2 })} % от платежа.`,
      `Secondary: secondary fee ${(FEES_RATES.secondary * 100).toLocaleString("ru-RU", { maximumFractionDigits: 2 })} % от суммы сделки при исполнении.`,
      "Категории комиссий разделены: рыночные удержания не смешиваются с комиссией вывода.",
    ],
  },
  {
    id: "payouts",
    title: "Payouts & Withdrawals",
    subtitle: "Вывод на кошелёк",
    bullets: [
      `Вывод: max(${FEES_RATES.withdrawMin} USDT; ${(FEES_RATES.withdrawRate * 100).toLocaleString("ru-RU", { maximumFractionDigits: 2 })} %) от заявленной суммы.`,
      "Перед отправкой заявки показывается итог «к получению на адрес» за вычетом комиссии платформы.",
      "Сетевая комиссия TRC20 не устанавливается RevShare и может меняться в сети.",
    ],
  },
];

export type FeesFaqItem = { id: string; question: string; answer: string };

export const feesFaqItems: FeesFaqItem[] = [
  {
    id: "f1",
    question: "Есть ли комиссия за пополнение?",
    answer:
      "В текущей модели UI комиссия платформы на входящий депозит USDT (TRC20) равна 0 %. Отдельно может взиматься сеть при отправке с вашего внешнего кошелька.",
  },
  {
    id: "f2",
    question: "Когда удерживается secondary fee?",
    answer:
      "При исполнении сделки на внутреннем secondary market: комиссия считается от суммы сделки и отражается в деталях ордера до и после исполнения.",
  },
  {
    id: "f3",
    question: "Почему сумма к получению меньше суммы сделки?",
    answer:
      "На secondary отображается gross (полная сумма сделки) и отдельной строкой — комиссия. К получению (net) — это gross минус secondary fee и прочие удержания по конкретному сценарию.",
  },
  {
    id: "f4",
    question: "Есть ли комиссия за вывод?",
    answer:
      "Да: применяется withdrawal fee по правилам max(минимум USDT, процент от суммы). Точное значение показывается в форме вывода перед подтверждением.",
  },
  {
    id: "f5",
    question: "Где посмотреть итоговую сумму до подтверждения?",
    answer:
      "В превью операции: покупка units, продажа на secondary и вывод USDT — перед финальным подтверждением отображаются строки amount, fee и итог (total / net).",
  },
];
