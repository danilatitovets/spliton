"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { PayoutFlowFaqList } from "@/components/dashboard/assets/payout-flow-faq";
import {
  withdrawFaq,
  withdrawHistory,
  withdrawMeta,
  withdrawSteps,
} from "@/components/dashboard/assets/payout-flow-mock-data";
import {
  FlowContinueButton,
  FlowPanel,
  FlowSummaryRow,
} from "@/components/dashboard/assets/payout-flow-wizard-primitives";
import { cn } from "@/lib/utils";

export function PayoutWithdrawCard() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const s0 = withdrawSteps[0]!;
  const s1 = withdrawSteps[1]!;
  const s2 = withdrawSteps[2]!;

  return (
    <section className="space-y-12 sm:space-y-14">
      <header className="space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">USDT · TRC20 · Withdraw</p>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-[1.75rem]">Вывод</h1>
      </header>

      <div className="grid gap-10 xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)] xl:gap-12">
        <div className="flex flex-col gap-4">
          {step >= 2 ? (
            <FlowSummaryRow stepId={1} title={s0.title} value={s0.value} onEdit={() => setStep(1)} />
          ) : null}
          {step >= 3 ? (
            <FlowSummaryRow stepId={2} title={s1.title} value={s1.value} onEdit={() => setStep(2)} />
          ) : null}

          {step === 1 ? (
            <FlowPanel stepId={1} title={s0.title}>
              <button
                type="button"
                className="flex h-12 w-full items-center justify-between rounded-2xl bg-white/90 px-4 text-left text-sm font-medium text-neutral-800 transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              >
                <span>{s0.value}</span>
                <ChevronDown className="size-4 text-neutral-400" aria-hidden />
              </button>
              <FlowContinueButton label="Продолжить" onClick={() => setStep(2)} />
            </FlowPanel>
          ) : null}

          {step === 2 ? (
            <FlowPanel stepId={2} title={s1.title}>
              <div className="rounded-2xl bg-white/90 px-4 py-4 text-sm font-medium leading-relaxed text-neutral-800">
                <span className="text-neutral-500">Адрес вывода · </span>
                <span className="font-mono text-neutral-900">{s1.value}</span>
              </div>
              <FlowContinueButton label="Продолжить" onClick={() => setStep(3)} />
            </FlowPanel>
          ) : null}

          {step === 3 ? (
            <FlowPanel stepId={3} title={s2.title} tone="accent">
              <div className="flex min-h-12 flex-col justify-center gap-1 rounded-2xl bg-white/90 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm text-neutral-500">Доступно к выводу</span>
                <span className="font-mono text-base font-semibold tabular-nums text-neutral-900">{s2.value}</span>
              </div>

              <div className="space-y-2.5 border-t border-blue-200/50 pt-5">
                {withdrawMeta.map((row) => (
                  <div key={row.label} className="flex items-center justify-between gap-4 text-sm">
                    <span className="text-neutral-500">{row.label}</span>
                    <span className="font-mono font-medium text-neutral-900">{row.value}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-blue-700 text-sm font-semibold text-white transition hover:bg-blue-800 sm:w-auto sm:min-w-[220px]"
                >
                  Отправить заявку
                </button>
              </div>
              <p className="text-xs text-neutral-500">Мок: заявка не отправляется. После API здесь будет реальное создание вывода.</p>
            </FlowPanel>
          ) : null}
        </div>

        <aside className="h-fit rounded-3xl bg-neutral-50/90 px-6 py-7 sm:px-7 sm:py-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">FAQ</p>
          <h2 className="mt-2 text-lg font-semibold tracking-tight text-neutral-900">Вопросы и ответы</h2>
          <PayoutFlowFaqList items={withdrawFaq} defaultOpenId={withdrawFaq[0]?.id ?? null} />
        </aside>
      </div>

      <div className="space-y-6 pt-2">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex rounded-xl bg-neutral-900 px-3 py-2 text-xs font-semibold text-white">
              История выводов
            </span>
            <button
              type="button"
              className="inline-flex rounded-xl bg-neutral-100 px-3 py-2 text-xs font-semibold text-neutral-500 transition hover:bg-neutral-200/80 hover:text-neutral-700"
            >
              Заявки
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="inline-flex h-9 items-center rounded-xl bg-neutral-100 px-3.5 text-xs font-semibold text-neutral-800 transition hover:bg-neutral-200/90"
            >
              Экспорт
            </button>
            <button
              type="button"
              className="inline-flex h-9 items-center rounded-xl bg-neutral-100 px-3.5 text-xs font-semibold text-neutral-800 transition hover:bg-neutral-200/90"
            >
              Вся история
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-3xl bg-neutral-50/90">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead>
              <tr className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                <th className="px-4 py-3.5 pl-5">Время</th>
                <th className="px-4 py-3.5">Адрес</th>
                <th className="px-4 py-3.5">TxID</th>
                <th className="px-4 py-3.5">Актив</th>
                <th className="px-4 py-3.5">Сумма</th>
                <th className="px-4 py-3.5">Комиссия</th>
                <th className="px-4 py-3.5">Прогресс</th>
                <th className="px-4 py-3.5 pr-5">Статус</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {withdrawHistory.map((row, i) => (
                <tr key={row.id} className={cn(i !== withdrawHistory.length - 1 && "border-b border-neutral-100")}>
                  <td className="px-4 py-3.5 pl-5 align-top text-neutral-700">{row.time}</td>
                  <td className="px-4 py-3.5 align-top font-mono text-xs text-neutral-600">{row.address}</td>
                  <td className="px-4 py-3.5 align-top font-mono text-xs text-neutral-600">{row.txId}</td>
                  <td className="px-4 py-3.5 align-top text-neutral-700">{row.asset}</td>
                  <td className="px-4 py-3.5 align-top font-mono text-sm font-semibold tabular-nums text-neutral-900">{row.amount}</td>
                  <td className="px-4 py-3.5 align-top font-mono text-xs tabular-nums text-neutral-600">{row.fee}</td>
                  <td className="px-4 py-3.5 align-top text-neutral-600">{row.progress}</td>
                  <td className="px-4 py-3.5 pr-5 align-top">
                    <span className="inline-flex rounded-lg bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-950">
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
