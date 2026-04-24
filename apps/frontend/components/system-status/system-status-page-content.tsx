"use client";

import { AlertCircle, ArrowRight, CheckCircle2, Clock, LifeBuoy, Wrench } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import {
  getSystemStatusPageData,
  type IncidentRow,
  type OverallTone,
  type ServiceHealthStatus,
  type ServiceStatusRow,
} from "@/constants/system-status-mock";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

function toneRingClass(tone: OverallTone) {
  const map: Record<OverallTone, string> = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    warning: "border-amber-200 bg-amber-50 text-amber-800",
    maintenance: "border-sky-200 bg-sky-50 text-sky-800",
    danger: "border-rose-200 bg-rose-50 text-rose-800",
  };
  return map[tone];
}

function serviceBadgeClass(s: ServiceHealthStatus) {
  const map: Record<ServiceHealthStatus, string> = {
    operational: "border-emerald-200/80 bg-emerald-50 text-emerald-900",
    degraded: "border-amber-200/80 bg-amber-50 text-amber-900",
    delayed: "border-orange-200/80 bg-orange-50 text-orange-900",
    maintenance: "border-sky-200/80 bg-sky-50 text-sky-900",
    incident: "border-rose-200/80 bg-rose-50 text-rose-900",
  };
  return map[s];
}

function incidentStateClass(state: IncidentRow["state"]) {
  const map: Record<IncidentRow["state"], string> = {
    resolved: "border-emerald-200/80 bg-emerald-50 text-emerald-900",
    monitoring: "border-sky-200/80 bg-sky-50 text-sky-900",
    investigating: "border-rose-200/80 bg-rose-50 text-rose-900",
  };
  return map[state];
}

function OverallIcon({ tone }: { tone: OverallTone }) {
  if (tone === "success") return <CheckCircle2 className="size-8 text-emerald-600" aria-hidden />;
  if (tone === "maintenance") return <Wrench className="size-8 text-sky-600" aria-hidden />;
  if (tone === "danger") return <AlertCircle className="size-8 text-rose-600" aria-hidden />;
  return <Clock className="size-8 text-amber-600" aria-hidden />;
}

export function SystemStatusPageContent() {
  const data = getSystemStatusPageData();
  const pulse =
    data.overall.tone === "danger" || data.overall.tone === "warning" || data.overall.tone === "maintenance";

  return (
    <div className="space-y-8 sm:space-y-10">
      <section className="rounded-3xl bg-white px-5 py-7 sm:px-8 sm:py-9" aria-labelledby="health-overview">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <span className="relative mt-1 flex size-2.5 shrink-0">
              <span
                className={cn(
                  "absolute inline-flex size-full rounded-full opacity-50",
                  pulse && "animate-ping bg-current",
                  data.overall.tone === "success" && "text-emerald-500",
                  data.overall.tone === "warning" && "text-amber-500",
                  data.overall.tone === "maintenance" && "text-sky-500",
                  data.overall.tone === "danger" && "text-rose-500",
                )}
                aria-hidden
              />
              <span
                className={cn(
                  "relative inline-flex size-2.5 rounded-full",
                  data.overall.tone === "success" && "bg-emerald-500",
                  data.overall.tone === "warning" && "bg-amber-500",
                  data.overall.tone === "maintenance" && "bg-sky-500",
                  data.overall.tone === "danger" && "bg-rose-500",
                )}
              />
            </span>
            <div className="min-w-0">
              <p id="health-overview" className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                Общий статус
              </p>
              <p className="mt-1 text-lg font-semibold tracking-tight text-neutral-900 sm:text-xl">{data.overall.headline}</p>
            </div>
          </div>
          <div className="rounded-2xl bg-neutral-50 px-4 py-3 sm:px-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">Обновлено</p>
            <p className="mt-1 font-mono text-xs text-neutral-600">{data.overall.lastUpdatedLabel}</p>
          </div>
        </div>

        <div className="mt-8 border-t border-neutral-100 pt-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-10">
            <div
              className={cn(
                "relative flex size-28 shrink-0 items-center justify-center rounded-full border-2 sm:size-32",
                toneRingClass(data.overall.tone),
              )}
            >
              <OverallIcon tone={data.overall.tone} />
            </div>
            <div className="min-w-0 flex-1 space-y-3">
              <h2 className="text-xl font-semibold tracking-tight text-neutral-900 sm:text-2xl">{data.overall.headline}</h2>
              <p className="text-sm leading-relaxed text-neutral-600">{data.overall.subline}</p>
              <p className="text-xs leading-relaxed text-neutral-500">{data.overall.explanation}</p>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="services-title">
        <h2 id="services-title" className="text-lg font-semibold tracking-tight text-neutral-900 sm:text-xl">
          Сервисы
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          Состояние продуктовых потоков — только пользовательский контур.
        </p>
        <ul className="mt-5 space-y-2" role="list">
          {data.services.map((s: ServiceStatusRow) => (
            <li key={s.id} className="rounded-2xl bg-neutral-50/90 px-4 py-4 transition-colors hover:bg-neutral-100/80 sm:px-5 sm:py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-medium text-neutral-900">{s.name}</h3>
                    <span
                      className={cn(
                        "inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
                        serviceBadgeClass(s.status),
                      )}
                    >
                      {s.statusLabel}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-neutral-600">{s.note}</p>
                </div>
                <p className="shrink-0 font-mono text-[11px] text-neutral-500 sm:text-right">{s.lastUpdatedLabel}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="maintenance-title">
        <h2 id="maintenance-title" className="text-lg font-semibold tracking-tight text-neutral-900 sm:text-xl">
          Плановые работы
        </h2>
        <p className="mt-1 text-sm text-neutral-500">Ближайшие окна и влияние на операции.</p>
        {data.maintenance ? (
          <div className="mt-5 rounded-3xl bg-sky-50 px-5 py-6 sm:px-7 sm:py-7">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-700/90">План</p>
            <h3 className="mt-2 text-lg font-semibold text-neutral-900">{data.maintenance.title}</h3>
            <p className="mt-1 font-mono text-sm text-sky-900/90">{data.maintenance.windowLabel}</p>
            <p className="mt-4 text-sm text-neutral-700">{data.maintenance.impactNote}</p>
            <div className="mt-4 border-t border-sky-100/80 pt-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500">Затронутые сервисы</p>
              <ul className="mt-2 list-inside list-disc text-sm text-neutral-600">
                {data.maintenance.affectedServices.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-3xl bg-neutral-50 px-6 py-12 text-center">
            <p className="text-sm font-medium text-neutral-800">Запланированных работ нет</p>
            <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-neutral-500">
              Когда появится окно профилактики, здесь будут дата, сервисы и ожидаемое влияние на пополнения, выводы и торги.
            </p>
          </div>
        )}
      </section>

      <section aria-labelledby="incidents-title">
        <h2 id="incidents-title" className="text-lg font-semibold tracking-tight text-neutral-900 sm:text-xl">
          Недавние события
        </h2>
        <p className="mt-1 text-sm text-neutral-500">Инциденты и закрытые кейсы для прозрачности.</p>
        <div className="mt-5 overflow-hidden rounded-2xl bg-neutral-50">
          <ul role="list">
            {data.incidents.map((inc: IncidentRow, idx: number) => (
              <li
                key={inc.id}
                className={cn(
                  "border-t border-neutral-100/90 px-4 py-4 first:border-t-0 sm:px-5",
                  idx === 0 && "bg-white/70",
                )}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-neutral-500">{inc.date}</span>
                  <span className="text-neutral-400">·</span>
                  <span className="text-sm font-medium text-neutral-900">{inc.service}</span>
                  <span
                    className={cn(
                      "inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                      incidentStateClass(inc.state),
                    )}
                  >
                    {inc.stateLabel}
                  </span>
                </div>
                <p className="mt-2 text-sm text-neutral-600">{inc.summary}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="rounded-3xl bg-neutral-50 px-5 py-6 sm:px-7" aria-labelledby="legend-title">
        <h2 id="legend-title" className="text-sm font-semibold text-neutral-900">
          Как читать статусы
        </h2>
        <ul className="mt-4 space-y-3 text-xs leading-relaxed text-neutral-600 sm:text-sm">
          <li>
            <span className="font-medium text-neutral-900">Работает штатно</span> — задержки в пределах SLA, операции без
            ограничений.
          </li>
          <li>
            <span className="font-medium text-neutral-900">Пониженная производительность</span> — сервис доступен, часть
            действий дольше обычного.
          </li>
          <li>
            <span className="font-medium text-neutral-900">Задержки</span> — очередь длиннее нормы; средства не теряются,
            статус виден в форме.
          </li>
          <li>
            <span className="font-medium text-neutral-900">Техработы</span> — запланированное окно, часть операций может
            быть недоступна.
          </li>
          <li>
            <span className="font-medium text-neutral-900">Инцидент</span> — расследование; следите за обновлениями здесь и в
            кабинете.
          </li>
        </ul>
      </section>

      <section className="rounded-3xl bg-white px-5 py-8 sm:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-blue-800">
              <LifeBuoy className="size-5" aria-hidden />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-neutral-900">Нужна помощь?</h2>
              <p className="mt-1 max-w-xl text-sm text-neutral-500">
                Если операция длится дольше, чем в интерфейсе, откройте поддержку или раздел с тарифами.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <Link
              href={ROUTES.support}
              className={cn(
                buttonVariants({ size: "lg" }),
                "inline-flex h-10 border-0 bg-lime-400 px-6 text-sm font-semibold text-neutral-950 hover:bg-lime-300",
              )}
            >
              Центр поддержки
              <ArrowRight className="ml-1.5 size-4" aria-hidden />
            </Link>
            <Link
              href={ROUTES.fees}
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "inline-flex h-10 border-0 bg-neutral-100 text-neutral-900 hover:bg-neutral-200/80",
              )}
            >
              Комиссии и условия
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
