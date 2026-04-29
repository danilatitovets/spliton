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
    success: "border-white/25 bg-white/5 text-white",
    warning: "border-white/25 bg-white/5 text-white",
    maintenance: "border-white/25 bg-white/5 text-white",
    danger: "border-white/25 bg-white/5 text-white",
  };
  return map[tone];
}

function serviceBadgeClass(s: ServiceHealthStatus) {
  const map: Record<ServiceHealthStatus, string> = {
    operational: "border-white/12 bg-white/8 text-zinc-100",
    degraded: "border-white/12 bg-white/8 text-zinc-100",
    delayed: "border-white/12 bg-white/8 text-zinc-100",
    maintenance: "border-white/12 bg-white/8 text-zinc-100",
    incident: "border-white/12 bg-white/8 text-zinc-100",
  };
  return map[s];
}

function incidentStateClass(state: IncidentRow["state"]) {
  const map: Record<IncidentRow["state"], string> = {
    resolved: "border-white/12 bg-white/8 text-zinc-100",
    monitoring: "border-white/12 bg-white/8 text-zinc-100",
    investigating: "border-white/12 bg-white/8 text-zinc-100",
  };
  return map[state];
}

function OverallIcon({ tone }: { tone: OverallTone }) {
  if (tone === "success") return <CheckCircle2 className="size-9 text-white" aria-hidden />;
  if (tone === "maintenance") return <Wrench className="size-9 text-white" aria-hidden />;
  if (tone === "danger") return <AlertCircle className="size-9 text-white" aria-hidden />;
  return <Clock className="size-9 text-white" aria-hidden />;
}

export function SystemStatusPageContent() {
  const data = getSystemStatusPageData();
  const pulse =
    data.overall.tone === "danger" || data.overall.tone === "warning" || data.overall.tone === "maintenance";

  return (
    <div className="space-y-8 sm:space-y-10">
      <section className="rounded-3xl bg-[#111111]/96 px-5 py-8 sm:px-8 sm:py-10" aria-labelledby="health-overview">
        <div className="text-center">
          <p id="health-overview" className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Общий статус
          </p>
          <div className="mt-6 flex justify-center">
            <div
              className={cn(
                "animate-revshare-status-breathe relative flex size-36 items-center justify-center rounded-full border-2 sm:size-40",
                toneRingClass(data.overall.tone),
              )}
            >
              <span className="pointer-events-none absolute inset-2 rounded-full border border-white/10" aria-hidden />
              <span
                className="animate-revshare-status-orbit pointer-events-none absolute inset-0"
                aria-hidden
              >
                <span
                  className={cn(
                    "absolute left-1/2 top-1.5 inline-flex size-3.5 -translate-x-1/2 rounded-full shadow-[0_0_18px_rgba(255,255,255,0.35)]",
                    data.overall.tone === "success" && "bg-emerald-400",
                    data.overall.tone === "warning" && "bg-amber-400",
                    data.overall.tone === "maintenance" && "bg-sky-400",
                    data.overall.tone === "danger" && "bg-rose-400",
                  )}
                />
              </span>
              <span
                className={cn(
                  "absolute inline-flex size-4 rounded-full opacity-55",
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
                  "absolute left-1/2 top-2 inline-flex size-2.5 -translate-x-1/2 rounded-full",
                  data.overall.tone === "success" && "bg-emerald-500",
                  data.overall.tone === "warning" && "bg-amber-500",
                  data.overall.tone === "maintenance" && "bg-sky-500",
                  data.overall.tone === "danger" && "bg-rose-500",
                )}
              />
              <OverallIcon tone={data.overall.tone} />
            </div>
          </div>
          <h2 className="mt-6 text-2xl font-semibold tracking-tight text-white sm:text-3xl">{data.overall.headline}</h2>
          <p className="mx-auto mt-3 max-w-3xl text-sm leading-relaxed text-zinc-300">{data.overall.subline}</p>
          <p className="mx-auto mt-2 max-w-3xl text-xs leading-relaxed text-zinc-500">{data.overall.explanation}</p>
          <div className="mx-auto mt-6 w-fit rounded-xl bg-zinc-900/80 px-4 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Обновлено</p>
            <p className="mt-1 font-mono text-xs text-zinc-300">{data.overall.lastUpdatedLabel}</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="services-title">
        <h2 id="services-title" className="text-lg font-semibold tracking-tight text-white sm:text-xl">
          Сервисы
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          Состояние продуктовых потоков — только пользовательский контур.
        </p>
        <ul className="mt-5 space-y-2" role="list">
          {data.services.map((s: ServiceStatusRow) => (
            <li key={s.id} className="rounded-2xl bg-zinc-900/70 px-4 py-4 transition-colors hover:bg-zinc-900 sm:px-5 sm:py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-medium text-white">{s.name}</h3>
                    <span
                      className={cn(
                        "inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
                        serviceBadgeClass(s.status),
                      )}
                    >
                      {s.statusLabel}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-zinc-300">{s.note}</p>
                </div>
                <p className="shrink-0 font-mono text-[11px] text-zinc-500 sm:text-right">{s.lastUpdatedLabel}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="maintenance-title">
        <h2 id="maintenance-title" className="text-lg font-semibold tracking-tight text-white sm:text-xl">
          Плановые работы
        </h2>
        <p className="mt-1 text-sm text-zinc-400">Ближайшие окна и влияние на операции.</p>
        {data.maintenance ? (
          <div className="mt-5 rounded-3xl bg-zinc-900/75 px-5 py-6 sm:px-7 sm:py-7">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">План</p>
            <h3 className="mt-2 text-lg font-semibold text-white">{data.maintenance.title}</h3>
            <p className="mt-1 font-mono text-sm text-zinc-300">{data.maintenance.windowLabel}</p>
            <p className="mt-4 text-sm text-zinc-300">{data.maintenance.impactNote}</p>
            <div className="mt-4 border-t border-white/10 pt-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Затронутые сервисы</p>
              <ul className="mt-2 list-inside list-disc text-sm text-zinc-300">
                {data.maintenance.affectedServices.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-3xl bg-zinc-900/70 px-6 py-12 text-center">
            <p className="text-sm font-medium text-white">Запланированных работ нет</p>
            <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-zinc-400">
              Когда появится окно профилактики, здесь будут дата, сервисы и ожидаемое влияние на пополнения, выводы и торги.
            </p>
          </div>
        )}
      </section>

      <section aria-labelledby="incidents-title">
        <h2 id="incidents-title" className="text-lg font-semibold tracking-tight text-white sm:text-xl">
          Недавние события
        </h2>
        <p className="mt-1 text-sm text-zinc-400">Инциденты и закрытые кейсы для прозрачности.</p>
        <div className="mt-5 overflow-hidden rounded-2xl bg-zinc-900/70">
          <ul role="list">
            {data.incidents.map((inc: IncidentRow, idx: number) => (
              <li
                key={inc.id}
                className={cn(
                  "border-t border-white/8 px-4 py-4 first:border-t-0 sm:px-5",
                  idx === 0 && "bg-white/3",
                )}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-zinc-500">{inc.date}</span>
                  <span className="text-zinc-500">·</span>
                  <span className="text-sm font-medium text-white">{inc.service}</span>
                  <span
                    className={cn(
                      "inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                      incidentStateClass(inc.state),
                    )}
                  >
                    {inc.stateLabel}
                  </span>
                </div>
                <p className="mt-2 text-sm text-zinc-300">{inc.summary}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="rounded-3xl bg-zinc-900/70 px-5 py-6 sm:px-7" aria-labelledby="legend-title">
        <h2 id="legend-title" className="text-sm font-semibold text-white">
          Как читать статусы
        </h2>
        <ul className="mt-4 space-y-3 text-xs leading-relaxed text-zinc-300 sm:text-sm">
          <li>
            <span className="font-medium text-white">Работает штатно</span> — задержки в пределах SLA, операции без
            ограничений.
          </li>
          <li>
            <span className="font-medium text-white">Пониженная производительность</span> — сервис доступен, часть
            действий дольше обычного.
          </li>
          <li>
            <span className="font-medium text-white">Задержки</span> — очередь длиннее нормы; средства не теряются,
            статус виден в форме.
          </li>
          <li>
            <span className="font-medium text-white">Техработы</span> — запланированное окно, часть операций может
            быть недоступна.
          </li>
          <li>
            <span className="font-medium text-white">Инцидент</span> — расследование; следите за обновлениями здесь и в
            кабинете.
          </li>
        </ul>
      </section>

      <section className="rounded-3xl bg-[#111111]/96 px-5 py-8 sm:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-zinc-100">
              <LifeBuoy className="size-5" aria-hidden />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-white">Нужна помощь?</h2>
              <p className="mt-1 max-w-xl text-sm text-zinc-400">
                Если операция длится дольше, чем в интерфейсе, откройте поддержку или раздел с тарифами.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <Link
              href={ROUTES.support}
              className={cn(
                buttonVariants({ size: "lg" }),
                "inline-flex h-10 border-0 bg-white px-6 text-sm font-semibold text-neutral-950 hover:bg-zinc-200",
              )}
            >
              Центр поддержки
              <ArrowRight className="ml-1.5 size-4" aria-hidden />
            </Link>
            <Link
              href={ROUTES.fees}
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "inline-flex h-10 border-white/15 bg-zinc-900 text-zinc-100 hover:bg-zinc-800",
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
