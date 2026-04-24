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

/** Типографика и сетка как на `/assets/payouts/history` (PayoutsHistoryPageContent). */
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
    <div className="space-y-6 pb-4">
      <header className="space-y-1">
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-400">Помощь · USDT TRC20</p>
        <h1 className="text-xl font-semibold tracking-tight text-neutral-900 sm:text-2xl">Поддержка</h1>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-2xl bg-neutral-50 px-4 py-4 sm:px-5 sm:py-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">{card.label}</p>
            <p
              className={cn(
                "mt-1.5 text-lg font-semibold tracking-tight text-neutral-900 sm:text-xl",
                card.mono && "font-mono text-base sm:text-lg",
                card.tone,
              )}
            >
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <p className="max-w-2xl text-sm leading-relaxed text-neutral-500">
        Напишите в чат — команда ответит в порядке очереди. Справа — быстрые ссылки в кабинет, статус сервисов и почта.
      </p>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(260px,340px)] lg:items-start lg:gap-8">
        <div className="min-w-0">
          <SupportChatWidget className="lg:min-h-[min(520px,calc(100dvh-14rem))]" />
        </div>

        <aside className="flex min-w-0 flex-col gap-4 lg:max-w-[360px] lg:gap-5">
          <section className="rounded-2xl bg-neutral-50 px-4 py-4 sm:px-5 sm:py-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">Кабинет</p>
            <h2 className="mt-1.5 text-sm font-semibold tracking-tight text-neutral-900">Быстрые ссылки</h2>
            <p className="mt-1 text-xs leading-relaxed text-neutral-500">
              Те же разделы, что и в ленте выплат — для перехода к экрану.
            </p>
            <ul className="mt-3 space-y-2">
              {usefulLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group flex items-center justify-between gap-2 text-xs font-medium text-neutral-800 transition hover:text-neutral-950"
                  >
                    <span>{item.label}</span>
                    <ExternalLink className="size-3 shrink-0 opacity-0 transition group-hover:opacity-70" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href={ROUTES.guideSelection}
              className="mt-4 inline-flex h-9 items-center rounded-xl bg-neutral-100 px-3 text-xs font-semibold text-neutral-800 transition hover:bg-neutral-200/90"
            >
              Гиды по сделкам
            </Link>
          </section>

          <section className="rounded-2xl bg-neutral-50 px-4 py-4 sm:px-5 sm:py-4">
            <div className="flex items-center gap-2">
              <Shield className="size-4 text-neutral-500" aria-hidden />
              <h2 className="text-sm font-semibold tracking-tight text-neutral-900">Статус сервисов</h2>
            </div>
            <ul className="mt-3 space-y-2">
              {SUPPORT_SERVICE_STATUS_ROWS.map((row) => (
                <li
                  key={row.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-neutral-200/80 bg-white/80 px-3 py-2"
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
            <p className="mt-2 text-[10px] leading-relaxed text-neutral-500">
              Демо-индикаторы; фактический статус подключится позже.
            </p>
          </section>

          <section className="rounded-2xl bg-neutral-50 px-4 py-4 sm:px-5 sm:py-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">Почта</p>
            <h2 className="mt-1.5 text-sm font-semibold tracking-tight text-neutral-900">Дополнительно</h2>
            <p className="mt-1 text-xs leading-relaxed text-neutral-500">
              Для вложений и длинных описаний. Не присылайте пароли и seed.
            </p>
            <a
              href={`mailto:${SUPPORT_HELPDESK_EMAIL}`}
              className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-neutral-800 hover:text-neutral-950"
            >
              <Mail className="size-3.5 text-neutral-500" aria-hidden />
              {SUPPORT_HELPDESK_EMAIL}
            </a>
            <p className="mt-2 text-[11px] text-neutral-500">Среднее время ответа: до 24 часов.</p>
          </section>
        </aside>
      </div>
    </div>
  );
}
