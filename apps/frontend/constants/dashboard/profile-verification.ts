/**
 * UI-состояние верификации (MVP).
 * Для демо/тестов: `?tab=verification&verifyStatus=pending_review` и т.д.
 */
export const VERIFICATION_STATUS_QUERY = "verifyStatus";

export const VERIFICATION_UI_STATUSES = [
  "not_started",
  "in_progress",
  "pending_review",
  "approved",
  "rejected",
] as const;

export type VerificationUiStatus = (typeof VERIFICATION_UI_STATUSES)[number];

export function parseVerificationUiStatus(raw: string | null): VerificationUiStatus {
  if (raw && (VERIFICATION_UI_STATUSES as readonly string[]).includes(raw)) {
    return raw as VerificationUiStatus;
  }
  return "not_started";
}

export type VerificationStepId = "profile" | "document" | "address" | "submit";

export const VERIFICATION_STEPS: Array<{
  id: VerificationStepId;
  title: string;
  description: string;
}> = [
  {
    id: "profile",
    title: "Данные аккаунта",
    description: "ФИО, дата рождения, страна резидентности — как в документе.",
  },
  {
    id: "document",
    title: "Удостоверение личности",
    description: "Паспорт или национальный ID: разворот с фото и машиночитаемой зоной.",
  },
  {
    id: "address",
    title: "Подтверждение адреса",
    description: "Выписка или счёт не старше 3 месяцев с вашим именем и адресом.",
  },
  {
    id: "submit",
    title: "Отправка на проверку",
    description: "Мы проверим документы и пришлём результат на почту.",
  },
];
