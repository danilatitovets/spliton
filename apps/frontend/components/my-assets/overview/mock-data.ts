import { ROUTES } from "@/constants/routes";

export type SummaryMetric = {
  label: string;
  value: string;
  helper: string;
};

export type PositionItem = {
  id: string;
  cover: string;
  release: string;
  artist: string;
  statuses: string[];
  units: string;
  share: string;
  accrued: string;
  available: string;
  href: string;
};

export type RecentPayoutItem = {
  id: string;
  release: string;
  date: string;
  amount: string;
};

export type QuickLinkItem = {
  id: string;
  label: string;
  description: string;
  href: string;
};

export type AccountStatusItem = {
  id: string;
  label: string;
  value: string;
  tone?: "ok" | "neutral";
};

export type ActivityItem = {
  id: string;
  date: string;
  type: string;
  target: string;
  amount: string;
  status: string;
};

export type DocumentItem = {
  id: string;
  title: string;
  type: string;
  updatedAt: string;
  href: string;
};

export const summaryMetrics: SummaryMetric[] = [
  {
    label: "Позиции",
    value: "6",
    helper: "Релизы с начислениями и правом на выплаты",
  },
  {
    label: "Units в системе",
    value: "12 840",
    helper: "Нормированные единицы revenue share rights",
  },
  {
    label: "Доступно к выводу",
    value: "184.32 USDT",
    helper: "Баланс, доступный для withdraw",
  },
  {
    label: "Начислено за период",
    value: "427.90 USDT",
    helper: "Последние distributions по релизам",
  },
];

export const myPositions: PositionItem[] = [
  {
    id: "nightdrive-echoes",
    cover: "NE",
    release: "Night Drive Echoes",
    artist: "Ari Sol",
    statuses: ["Активен", "Идут выплаты", "Доступен secondary"],
    units: "2 400",
    share: "2.40%",
    accrued: "168.40 USDT",
    available: "74.20 USDT",
    href: ROUTES.catalogReleaseParameters,
  },
  {
    id: "city-after-rain",
    cover: "CR",
    release: "City After Rain",
    artist: "Mira Lane",
    statuses: ["Активен", "Идут выплаты"],
    units: "1 950",
    share: "1.95%",
    accrued: "121.10 USDT",
    available: "33.45 USDT",
    href: ROUTES.catalogReleaseParameters,
  },
  {
    id: "northline-signal",
    cover: "NS",
    release: "Northline Signal",
    artist: "Volt Harbor",
    statuses: ["Активен", "Доступен secondary"],
    units: "3 120",
    share: "3.12%",
    accrued: "84.70 USDT",
    available: "28.30 USDT",
    href: ROUTES.catalogReleaseParameters,
  },
  {
    id: "silent-station",
    cover: "SS",
    release: "Silent Station",
    artist: "Kite Rooms",
    statuses: ["Активен", "Идут выплаты"],
    units: "1 600",
    share: "1.60%",
    accrued: "42.50 USDT",
    available: "19.30 USDT",
    href: ROUTES.catalogReleaseParameters,
  },
  {
    id: "mirrored-sky",
    cover: "MS",
    release: "Mirrored Sky",
    artist: "June Polar",
    statuses: ["Активен"],
    units: "2 100",
    share: "2.10%",
    accrued: "11.20 USDT",
    available: "8.12 USDT",
    href: ROUTES.catalogReleaseParameters,
  },
];

export const recentPayouts: RecentPayoutItem[] = [
  { id: "rp-1", release: "Night Drive Echoes", date: "18 Apr 2026", amount: "21.40 USDT" },
  { id: "rp-2", release: "City After Rain", date: "17 Apr 2026", amount: "14.85 USDT" },
  { id: "rp-3", release: "Northline Signal", date: "16 Apr 2026", amount: "9.10 USDT" },
  { id: "rp-4", release: "Silent Station", date: "15 Apr 2026", amount: "7.92 USDT" },
  { id: "rp-5", release: "Mirrored Sky", date: "13 Apr 2026", amount: "3.48 USDT" },
];

export const quickLinks: QuickLinkItem[] = [
  { id: "ql-payouts", label: "Выплаты", description: "Начисления и история выводов", href: ROUTES.myAssetsPayouts },
  {
    id: "ql-ops",
    label: "История выплат",
    description: "Покупки, продажи, переводы и выводы",
    href: ROUTES.myAssetsOperations,
  },
  { id: "ql-docs", label: "Документы", description: "Отчеты и материалы по релизам", href: ROUTES.myAssetsDocuments },
  {
    id: "ql-positions",
    label: "Структура позиций",
    description: "Распределение units по релизам",
    href: ROUTES.myAssetsPositionsStructure,
  },
];

export const accountStatuses: AccountStatusItem[] = [
  { id: "wallet", label: "Wallet", value: "USDT (TRC20)", tone: "ok" },
  { id: "withdrawals", label: "Withdrawals", value: "enabled", tone: "ok" },
  { id: "secondary", label: "Secondary market", value: "available", tone: "ok" },
  { id: "documents", label: "Documents", value: "updated", tone: "neutral" },
];

export const activityItems: ActivityItem[] = [
  {
    id: "ac-1",
    date: "18 Apr 2026",
    type: "Покупка UNT",
    target: "Northline Signal",
    amount: "+420 units",
    status: "completed",
  },
  {
    id: "ac-2",
    date: "17 Apr 2026",
    type: "Rights transfer",
    target: "to user #4021",
    amount: "-160 units",
    status: "completed",
  },
  {
    id: "ac-3",
    date: "16 Apr 2026",
    type: "Пополнение",
    target: "USDT wallet",
    amount: "250.00 USDT",
    status: "confirmed",
  },
  {
    id: "ac-4",
    date: "15 Apr 2026",
    type: "Заявка на вывод",
    target: "TRC20 address",
    amount: "80.00 USDT",
    status: "processing",
  },
  {
    id: "ac-5",
    date: "14 Apr 2026",
    type: "Completed payout",
    target: "City After Rain",
    amount: "14.85 USDT",
    status: "completed",
  },
];

export const documents: DocumentItem[] = [
  {
    id: "doc-1",
    title: "Deal summary",
    type: "Release terms",
    updatedAt: "18 Apr 2026",
    href: ROUTES.myAssetsDocuments,
  },
  {
    id: "doc-2",
    title: "Revenue statement",
    type: "Monthly statement",
    updatedAt: "17 Apr 2026",
    href: ROUTES.myAssetsDocuments,
  },
  {
    id: "doc-3",
    title: "Distribution report",
    type: "Payout detail",
    updatedAt: "16 Apr 2026",
    href: ROUTES.myAssetsDocuments,
  },
  {
    id: "doc-4",
    title: "Round terms",
    type: "Unit structure",
    updatedAt: "15 Apr 2026",
    href: ROUTES.myAssetsDocuments,
  },
];
