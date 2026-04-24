"use client";

/** Состояние для прототипа: `?tab=verification&verifyStatus=in_progress` (см. `VERIFICATION_STATUS_QUERY`). */

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  HelpCircle,
  Lock,
  Shield,
  XCircle,
} from "lucide-react";

import {
  VERIFICATION_STATUS_QUERY,
  VERIFICATION_STEPS,
  parseVerificationUiStatus,
  type VerificationStepId,
  type VerificationUiStatus,
} from "@/constants/dashboard/profile-verification";
import { profileDashboardHref } from "@/constants/dashboard/profile-page";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

function statusMeta(status: VerificationUiStatus): {
  label: string;
  tone: string;
  description: string;
} {
  switch (status) {
    case "not_started":
      return {
        label: "Не начата",
        tone: "bg-neutral-100 text-neutral-700 ring-1 ring-neutral-200/80",
        description: "Подтвердите личность, чтобы снять ограничения по операциям в USDT и на вторичном рынке.",
      };
    case "in_progress":
      return {
        label: "В процессе",
        tone: "bg-amber-50 text-amber-900 ring-1 ring-amber-200/80",
        description: "Заполните шаги ниже и отправьте заявку — черновик можно дополнить до отправки.",
      };
    case "pending_review":
      return {
        label: "На проверке",
        tone: "bg-blue-50 text-blue-900 ring-1 ring-blue-200/80",
        description: "Заявка получена. Команда RevShare проверяет документы — обычно это 1–2 рабочих дня.",
      };
    case "approved":
      return {
        label: "Подтверждена",
        tone: "bg-lime-100/90 text-lime-950 ring-1 ring-lime-200/80",
        description: "Аккаунт соответствует требованиям платформы. Доступны полные лимиты по пополнению, выводу и вторичному рынку.",
      };
    case "rejected":
      return {
        label: "Требуются правки",
        tone: "bg-red-50 text-red-900 ring-1 ring-red-200/80",
        description: "Проверка не пройдена. Исправьте замечания и отправьте документы снова — это бесплатно.",
      };
  }
}

function stepVisualState(
  status: VerificationUiStatus,
  stepIndex: number,
): "done" | "current" | "upcoming" | "locked" {
  if (status === "approved") return "done";
  if (status === "rejected") return stepIndex === 0 ? "current" : "upcoming";
  if (status === "pending_review") return "done";
  if (status === "not_started") return stepIndex === 0 ? "current" : "upcoming";
  /* in_progress */
  if (stepIndex <= 1) return "done";
  if (stepIndex === 2) return "current";
  return "upcoming";
}

function VerificationHref(next: VerificationUiStatus) {
  const u = new URLSearchParams();
  u.set("tab", "verification");
  u.set(VERIFICATION_STATUS_QUERY, next);
  return `${ROUTES.dashboardProfile}?${u.toString()}`;
}

const ACCESS_ROWS: Array<{
  id: string;
  label: string;
  hint: string;
  before: "full" | "limited" | "none";
  after: "full" | "limited" | "none";
}> = [
  {
    id: "deposit",
    label: "Пополнение USDT (TRC20)",
    hint: "Ввод средств на баланс кабинета",
    before: "limited",
    after: "full",
  },
  {
    id: "withdraw",
    label: "Вывод на кошелёк",
    hint: "Перевод USDT на ваш внешний адрес",
    before: "limited",
    after: "full",
  },
  {
    id: "secondary",
    label: "Вторичный рынок",
    hint: "Сделки с долями rights / units",
    before: "limited",
    after: "full",
  },
  {
    id: "limits",
    label: "Лимиты заявок",
    hint: "Размер и частота операций",
    before: "limited",
    after: "full",
  },
];

function AccessPill({ kind }: { kind: "full" | "limited" | "none" }) {
  if (kind === "full")
    return (
      <span className="inline-flex items-center gap-1 rounded-lg bg-lime-100/90 px-2 py-1 text-[11px] font-semibold text-lime-950">
        <Check className="size-3.5 shrink-0" aria-hidden />
        Полный доступ
      </span>
    );
  if (kind === "limited")
    return (
      <span className="inline-flex items-center gap-1 rounded-lg bg-neutral-100 px-2 py-1 text-[11px] font-semibold text-neutral-700">
        <Lock className="size-3.5 shrink-0 text-neutral-500" aria-hidden />
        С лимитами
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-lg bg-neutral-100 px-2 py-1 text-[11px] font-semibold text-neutral-500">
      <Lock className="size-3.5 shrink-0" aria-hidden />
      Недоступно
    </span>
  );
}

function DocumentsList({ status }: { status: VerificationUiStatus }) {
  const idOk =
    status === "pending_review" || status === "approved" || status === "in_progress";
  const addrOk = status === "pending_review" || status === "approved";
  const selfieOk = status === "pending_review" || status === "approved";

  const items = [
    {
      id: "id",
      title: "Удостоверение личности",
      sub: "Паспорт РФ или ID, срок действия не истёк",
      ok: idOk,
    },
    {
      id: "addr",
      title: "Подтверждение адреса",
      sub: "Рекомендуется для полного доступа",
      ok: addrOk,
    },
    {
      id: "selfie",
      title: "Селфи с документом",
      sub: "Лицо и документ в кадре, без редактирования",
      ok: selfieOk,
    },
  ];

  return (
    <ul className="divide-y divide-neutral-100 rounded-2xl border border-neutral-100 bg-white">
      {items.map((item) => (
        <li key={item.id} className="flex items-start gap-3 px-4 py-3.5 sm:px-5">
          <div
            className={cn(
              "mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg",
              item.ok ? "bg-lime-100/80 text-lime-900" : "bg-neutral-100 text-neutral-400",
            )}
          >
            {item.ok ? <Check className="size-4" aria-hidden /> : <FileText className="size-4" aria-hidden />}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-neutral-900">{item.title}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-neutral-500">{item.sub}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function SubmittedSummary({ status }: { status: VerificationUiStatus }) {
  if (status !== "in_progress" && status !== "pending_review" && status !== "approved" && status !== "rejected") {
    return null;
  }
  return (
    <section className="rounded-2xl bg-neutral-50 px-4 py-4 sm:px-5 sm:py-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">В заявке</p>
      <h3 className="mt-1.5 text-sm font-semibold tracking-tight text-neutral-900">Кратко о данных</h3>
      <dl className="mt-3 space-y-2 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-neutral-500">ФИО</dt>
          <dd className="font-medium text-neutral-900">Иванов И. И.</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-neutral-500">Документ</dt>
          <dd className="font-medium text-neutral-900">Паспорт ·••• 4512</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-neutral-500">Страна</dt>
          <dd className="font-medium text-neutral-900">Россия</dd>
        </div>
      </dl>
      <p className="mt-3 text-xs text-neutral-500">
        После отправки изменить данные можно только через повторную заявку или поддержку.
      </p>
    </section>
  );
}

export function ProfileVerificationContent() {
  const searchParams = useSearchParams();
  const status = useMemo(
    () => parseVerificationUiStatus(searchParams.get(VERIFICATION_STATUS_QUERY)),
    [searchParams],
  );
  const meta = statusMeta(status);

  const beforeAccess = status === "approved" ? ("full" as const) : ("limited" as const);
  const afterAccess = "full" as const;

  return (
    <div className="space-y-6">
      {/* 1. Заголовок страницы */}
      <header className="space-y-1">
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-400">Аккаунт</p>
        <h1 className="text-xl font-semibold tracking-tight text-neutral-900 sm:text-2xl">Верификация</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-neutral-500">
          Подтверждение личности для RevShare: безопасные выплаты в USDT, контроль лимитов и доступ к вторичному рынку
          rights / units по трекам.
        </p>
      </header>

      {/* 2. Статус */}
      <section className="rounded-3xl bg-white px-4 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div
              className={cn(
                "grid size-11 shrink-0 place-items-center rounded-2xl",
                status === "approved" && "bg-lime-100/90 text-lime-950",
                status === "pending_review" && "bg-blue-50 text-blue-800",
                status === "rejected" && "bg-red-50 text-red-800",
                status === "in_progress" && "bg-amber-50 text-amber-900",
                status === "not_started" && "bg-neutral-100 text-neutral-600",
              )}
            >
              {status === "approved" ? (
                <CheckCircle2 className="size-6" aria-hidden />
              ) : status === "pending_review" ? (
                <Clock className="size-6" aria-hidden />
              ) : status === "rejected" ? (
                <XCircle className="size-6" aria-hidden />
              ) : (
                <Shield className="size-6" aria-hidden />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
                Статус верификации
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold", meta.tone)}>
                  {meta.label}
                </span>
                {(status === "pending_review" || status === "approved" || status === "rejected") && (
                  <span className="text-xs text-neutral-500">Обновлено: 18.04.2026</span>
                )}
              </div>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-neutral-600">{meta.description}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Отклонение */}
      {status === "rejected" && (
        <section
          className="rounded-2xl border border-red-100 bg-red-50/50 px-4 py-4 sm:px-5"
          role="status"
          aria-live="polite"
        >
          <div className="flex gap-2">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-700" aria-hidden />
            <div>
              <p className="text-sm font-semibold text-red-900">Что не так с заявкой</p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-red-800/95">
                <li>Фото разворота паспорта размыто — загрузите файл в лучшем качестве.</li>
                <li>Адрес в документе не совпадает с выпиской по адресу.</li>
              </ul>
              <p className="mt-3 text-xs text-red-800/80">
                Исправьте пункты и отправьте снова — повторная подача бесплатна.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* 3. Доступ и лимиты */}
      <section className="rounded-3xl bg-white px-4 py-5 sm:px-6 sm:py-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">Доступ</p>
        <h2 className="mt-1.5 text-lg font-semibold tracking-tight text-neutral-900">Что доступно сейчас и после проверки</h2>
        <p className="mt-1 max-w-2xl text-sm text-neutral-500">
          Это не инвестиционный продукт и не брокерский счёт — мы проверяем личность, чтобы защитить выплаты и сделки с
          долями в доходе треков.
        </p>
        <div className="mt-4 overflow-x-auto rounded-2xl bg-neutral-50/80">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                <th className="px-3 py-3 pl-4 font-medium">Операция</th>
                <th className="px-3 py-3 font-medium">Сейчас</th>
                <th className="px-3 py-3 pr-4 font-medium">После подтверждения</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {ACCESS_ROWS.map((row, i) => (
                <tr key={row.id} className={cn(i !== ACCESS_ROWS.length - 1 && "border-b border-neutral-100")}>
                  <td className="px-3 py-3 pl-4">
                    <p className="font-medium text-neutral-900">{row.label}</p>
                    <p className="text-xs text-neutral-500">{row.hint}</p>
                  </td>
                  <td className="px-3 py-3 align-top">
                    <AccessPill kind={status === "approved" ? "full" : row.before} />
                  </td>
                  <td className="px-3 py-3 pr-4 align-top">
                    <AccessPill kind={afterAccess} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 4–5. Шаги и документы */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(260px,320px)] lg:items-start">
        <section className="rounded-3xl bg-white px-4 py-5 sm:px-6 sm:py-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">Шаги</p>
          <h2 className="mt-1.5 text-lg font-semibold tracking-tight text-neutral-900">Как пройти проверку</h2>
          <ol className="mt-5 space-y-0">
            {VERIFICATION_STEPS.map((step, index) => {
              const visual = stepVisualState(status, index);
              const isLast = index === VERIFICATION_STEPS.length - 1;
              return (
                <li key={step.id} className="relative flex gap-4 pb-8 last:pb-0">
                  {!isLast && (
                    <span
                      className={cn(
                        "absolute left-[15px] top-8 h-[calc(100%-0.5rem)] w-px",
                        visual === "done" ? "bg-lime-300/90" : "bg-neutral-200",
                      )}
                      aria-hidden
                    />
                  )}
                  <div
                    className={cn(
                      "relative z-1 grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold",
                      visual === "done" && "bg-lime-400 text-neutral-950",
                      visual === "current" && "bg-neutral-900 text-white ring-4 ring-neutral-900/10",
                      visual === "upcoming" && "bg-neutral-100 text-neutral-400",
                      visual === "locked" && "bg-neutral-100 text-neutral-400",
                    )}
                  >
                    {visual === "done" ? <Check className="size-4" aria-hidden /> : index + 1}
                  </div>
                  <div className="min-w-0 pt-0.5">
                    <p className="text-sm font-semibold text-neutral-900">{step.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-neutral-500">{step.description}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        <div className="space-y-4">
          <section>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">Документы</p>
            <h2 className="mt-1.5 text-sm font-semibold tracking-tight text-neutral-900">Что подготовить</h2>
            <p className="mt-1 text-xs leading-relaxed text-neutral-500">
              Файлы JPG или PDF, до 10 МБ каждый. Данные только для проверки и не публикуются.
            </p>
            <div className="mt-3">
              <DocumentsList status={status} />
            </div>
          </section>

          <SubmittedSummary status={status} />
        </div>
      </div>

      {/* 6–7. CTA и сроки */}
      <section className="rounded-3xl bg-neutral-50 px-4 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-neutral-900">Дальнейшие действия</h2>
            {status === "pending_review" && (
              <p className="mt-1 flex items-center gap-2 text-sm text-neutral-600">
                <Clock className="size-4 shrink-0 text-blue-700" aria-hidden />
                Рассмотрение: обычно 1–2 рабочих дня. Уведомление придёт на почту аккаунта.
              </p>
            )}
            {status === "approved" && (
              <p className="mt-1 text-sm text-neutral-600">
                Спасибо, что прошли проверку. При смене паспорта или страны может потребоваться обновление — напишите в
                поддержку.
              </p>
            )}
            {(status === "not_started" || status === "in_progress") && (
              <p className="mt-1 text-sm text-neutral-600">
                Заполните шаги и отправьте заявку. Можно сохранить черновик и вернуться позже.
              </p>
            )}
            {status === "rejected" && (
              <p className="mt-1 text-sm text-neutral-600">Исправьте замечания выше и отправьте заявку повторно.</p>
            )}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {(status === "not_started" || status === "rejected") && (
              <Link
                href={VerificationHref("in_progress")}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-lime-400 px-5 text-xs font-semibold text-neutral-950 transition hover:bg-lime-300"
              >
                {status === "rejected" ? "Исправить и продолжить" : "Начать верификацию"}
              </Link>
            )}
            {status === "in_progress" && (
              <>
                <Link
                  href={VerificationHref("pending_review")}
                  className="inline-flex h-10 items-center justify-center rounded-xl bg-lime-400 px-5 text-xs font-semibold text-neutral-950 transition hover:bg-lime-300"
                >
                  Отправить на проверку
                </Link>
                <button
                  type="button"
                  className="inline-flex h-10 items-center justify-center rounded-xl bg-neutral-100 px-5 text-xs font-semibold text-neutral-800 transition hover:bg-neutral-200/90"
                >
                  Сохранить черновик
                </button>
              </>
            )}
            {status === "pending_review" && (
              <button
                type="button"
                disabled
                className="inline-flex h-10 cursor-not-allowed items-center justify-center rounded-xl bg-neutral-200/80 px-5 text-xs font-semibold text-neutral-500"
              >
                На проверке
              </button>
            )}
            {status === "approved" && (
              <Link
                href={ROUTES.dashboardPayoutsHistory}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-neutral-900 px-5 text-xs font-semibold text-white transition hover:bg-neutral-800"
              >
                История выплат
                <ChevronRight className="ml-1 size-4" aria-hidden />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* 9. Поддержка */}
      <section className="flex flex-col gap-3 rounded-2xl border border-neutral-100 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex gap-3">
          <HelpCircle className="mt-0.5 size-5 shrink-0 text-neutral-400" aria-hidden />
          <div>
            <p className="text-sm font-semibold text-neutral-900">Нужна помощь?</p>
            <p className="mt-0.5 text-xs leading-relaxed text-neutral-500">
              Напишите в поддержку — укажите ID аккаунта и тему «Верификация». Мы не запрашиваем пароль и коды по почте.
            </p>
          </div>
        </div>
        <Link
          href={ROUTES.guideSelection}
          className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-neutral-800 hover:text-neutral-950"
        >
          Как устроен кабинет
          <ChevronRight className="size-4" aria-hidden />
        </Link>
      </section>
    </div>
  );
}
