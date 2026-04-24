/**
 * Прототип уровня защиты: `?tab=security&securityState=hardened` — все рекомендуемые опции включены.
 * По умолчанию: `standard`.
 */
export const SECURITY_STATE_QUERY = "securityState";

export const SECURITY_UI_STATES = ["standard", "hardened"] as const;

export type SecurityUiState = (typeof SECURITY_UI_STATES)[number];

export function parseSecurityUiState(raw: string | null): SecurityUiState {
  return raw === "hardened" ? "hardened" : "standard";
}

export type SecuritySessionRow = {
  id: string;
  device: string;
  location: string;
  ip: string;
  lastActive: string;
  current: boolean;
};

export const MOCK_SECURITY_SESSIONS: SecuritySessionRow[] = [
  {
    id: "1",
    device: "Chrome · Windows",
    location: "Москва, Россия",
    ip: "185.•••.••12",
    lastActive: "Сейчас",
    current: true,
  },
  {
    id: "2",
    device: "Safari · iPhone",
    location: "Санкт-Петербург, Россия",
    ip: "178.•••.••88",
    lastActive: "2 дня назад",
    current: false,
  },
  {
    id: "3",
    device: "Firefox · macOS",
    location: "Неизвестно",
    ip: "91.•••.••40",
    lastActive: "14 дней назад",
    current: false,
  },
];
