/** Labels and tooltips for admin deposits section. */

export const DEPOSIT_FIELD_TOOLTIPS = {
  confirmations:
    "Количество подтверждений в сети TRC20. Зачисление возможно после достижения required confirmations.",
  manualReview: "Пополнение отправлено на проверку бухгалтерии или compliance.",
  reconcile: "Ручная сверка и зачисление на доступный баланс через wallet ledger.",
  txHash: "Blockchain transaction id (TRC20).",
  ledgerCredit: "Создаётся wallet transaction deposit_completed при зачислении.",
} as const;

const STATUS_LABELS: Record<string, string> = {
  pending: "Ожидает",
  detected: "Обнаружено",
  confirming: "Подтверждается",
  pending_confirmations: "Ожидает подтверждений",
  confirmed: "Подтверждено, ожидает зачисления",
  confirmed_waiting_credit: "Подтверждено, ожидает зачисления",
  completed: "Зачислено",
  failed: "Ошибка",
  rejected: "Отклонено",
  ignored: "Игнорировано",
  manual_review: "Ручная проверка",
};

export function depositStatusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status;
}

export function depositStatusTone(
  status: string,
): "neutral" | "success" | "warning" | "pending" | "danger" {
  switch (status) {
    case "completed":
      return "success";
    case "confirmed":
    case "confirmed_waiting_credit":
    case "confirming":
    case "pending_confirmations":
    case "pending":
    case "detected":
      return "pending";
    case "manual_review":
      return "warning";
    case "failed":
    case "rejected":
    case "ignored":
      return "danger";
    default:
      return "neutral";
  }
}

export function formatConfirmations(current: number, required: number): string {
  return `${current} / ${required}`;
}

export function isReadyToCredit(current: number, required: number, status: string): boolean {
  return current >= required && (status === "confirming" || status === "pending");
}

export function tronTxExplorerUrl(txHash: string | null | undefined): string | null {
  if (!txHash?.trim()) return null;
  const base = process.env.NEXT_PUBLIC_TRON_EXPLORER_BASE_URL?.replace(/\/$/, "");
  if (!base) return null;
  return `${base}/#/transaction/${encodeURIComponent(txHash.trim())}`;
}
