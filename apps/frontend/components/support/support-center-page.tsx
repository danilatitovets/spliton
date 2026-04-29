"use client";

import Link from "next/link";
import { ExternalLink, Mail, Shield } from "lucide-react";

import { SupportChatWidget } from "@/components/support/support-chat-widget";
import { SUPPORT_HELPDESK_EMAIL, SUPPORT_SERVICE_STATUS_ROWS, type SupportServiceStatusKind } from "@/constants/support-center";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

function statusLabel(s: SupportServiceStatusKind) {
  switch (s) {
    case "operational":
      return "Работает";
    case "delayed":
      return "Задержка";
    case "maintenance":
      return "Работы";
    default:
      return s;
  }
}

function statusPillClass(s: SupportServiceStatusKind) {
  switch (s) {
    case "operational":
      return "bg-neutral-100 text-neutral-800";
    case "delayed":
      return "bg-amber-50 text-amber-900";
    case "maintenance":
      return "bg-neutral-200/80 text-neutral-800";
    default:
      return "";
  }
}

const usefulLinks = [
  { label: "Пополнение USDT (TRC20)", href: `${ROUTES.dashboardPayouts}/deposit` },
  { label: "Вывод средств", href: `${ROUTES.dashboardPayouts}/withdraw` },
  { label: "История выплат и операций", href: ROUTES.dashboardPayoutsHistory },
  { label: "Вторичный рынок", href: ROUTES.dashboardSecondaryMarket },
  { label: "Верификация", href: `${ROUTES.dashboardProfile}?tab=verification` },
  { label: "Безопасность аккаунта", href: `${ROUTES.dashboardProfile}?tab=security` },
] as const;

const cardSurface = "rounded-3xl bg-white px-5 py-5 shadow-[0_8px_30px_-14px_rgba(0,0,0,0.08)] ring-1 ring-neutral-200/70 sm:px-6 sm:py-5";

/** Сетка и карточки в духе `/fees` и `/news`: белые панели, мягкие кольца. */
export function SupportCenterPage() {
  const statCards: {
    label: string;
    value: string;
    mono?: boolean;
    tone?: string;
  }[] = [
    { label: "Канал связи", value: "Чат · почта" },
    { label: "Средний ответ", value: "~12 мин", mono: true, tone: "text-blue-800" },
    { label: "Статус линии", value: "Онлайн", tone: "text-neutral-700" },
  ];

  return (
    <div className="space-y-7 pb-4 sm:space-y-8">
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {statCards.map((card) => (
          <div key={card.label} className={cn(cardSurface)}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">{card.label}</p>
            <p
              className={cn(
                "mt-2 text-lg font-semibold tracking-tight text-neutral-900 sm:text-xl",
                card.mono && "font-mono text-base sm:text-lg",
                card.tone,
              )}
            >
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <p className="max-w-2xl text-sm leading-relaxed text-neutral-600">
        Напишите в чат — команда ответит в порядке очереди. Справа — быстрые ссылки в кабинет, статус сервисов и почта.
      </p>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(260px,340px)] lg:items-start lg:gap-8">
        <div className="min-w-0">
          <SupportChatWidget className="lg:min-h-[min(520px,calc(100dvh-14rem))]" />
        </div>

        <aside className="flex min-w-0 flex-col gap-4 lg:max-w-[360px] lg:gap-5">
          <section className={cn(cardSurface)}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">Кабинет</p>
            <h2 className="mt-2 text-base font-semibold tracking-tight text-neutral-900">Быстрые ссылки</h2>
            <p className="mt-1.5 text-xs leading-relaxed text-neutral-500">
              Те же разделы, что и в ленте выплат — для перехода к экрану.
            </p>
            <ul className="mt-4 space-y-2.5">
              {usefulLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group flex items-center justify-between gap-2 rounded-xl py-1 text-xs font-medium text-neutral-800 transition hover:text-neutral-950"
                  >
                    <span>{item.label}</span>
                    <ExternalLink className="size-3 shrink-0 opacity-0 transition group-hover:opacity-70" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href={ROUTES.guideSelection}
              className="mt-5 inline-flex h-10 items-center rounded-xl bg-neutral-900 px-4 text-xs font-semibold text-white transition hover:bg-neutral-800"
            >
              Гиды по сделкам
            </Link>
          </section>

          <section className={cn(cardSurface)}>
            <div className="flex items-center gap-2.5">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-neutral-100 text-neutral-600">
                <Shield className="size-4" aria-hidden />
              </span>
              <h2 className="text-base font-semibold tracking-tight text-neutral-900">Статус сервисов</h2>
            </div>
            <ul className="mt-4 space-y-2">
              {SUPPORT_SERVICE_STATUS_ROWS.map((row) => (
                <li
                  key={row.id}
                  className="flex items-center justify-between gap-2 rounded-2xl bg-neutral-50/95 px-3.5 py-2.5 ring-1 ring-neutral-100"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-neutral-900">{row.label}</p>
                    {row.hint ? <p className="truncate text-[10px] text-neutral-500">{row.hint}</p> : null}
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                      statusPillClass(row.status),
                    )}
                  >
                    {statusLabel(row.status)}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[10px] leading-relaxed text-neutral-500">
              Демо-индикаторы; фактический статус подключится позже.
            </p>
          </section>

          <section className={cn(cardSurface)}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">Почта</p>
            <h2 className="mt-2 text-base font-semibold tracking-tight text-neutral-900">Дополнительно</h2>
            <p className="mt-1.5 text-xs leading-relaxed text-neutral-500">
              Для вложений и длинных описаний. Не присылайте пароли и seed.
            </p>
            <a
              href={`mailto:${SUPPORT_HELPDESK_EMAIL}`}
              className="mt-4 inline-flex items-center gap-2 rounded-xl text-xs font-semibold text-neutral-800 ring-1 ring-neutral-200/80 px-3 py-2 transition hover:bg-neutral-50 hover:text-neutral-950"
            >
              <Mail className="size-3.5 text-neutral-500" aria-hidden />
              {SUPPORT_HELPDESK_EMAIL}
            </a>
            <p className="mt-3 text-[11px] text-neutral-500">Среднее время ответа: до 24 часов.</p>
          </section>
        </aside>
      </div>
    </div>
  );
}
