"use client";

import Image from "next/image";
import { useMemo } from "react";

import { useI18n } from "@/components/providers/i18n-provider";

const STEP_ICONS = [
  "/images/partner/partner-step-01.png",
  "/images/partner/partner-step-02.png",
  "/images/partner/partner-step-03.png",
  "/images/partner/partner-step-04.png",
  "/images/partner/partner-step-05.png",
] as const;

const STEPS = [
  {
    id: "deposit",
    titleKey: "trust.flow.step1.title",
    titleFallback: "Пополнение USDT (TRC20)",
    descriptionKey: "trust.flow.step1.text",
    descriptionFallback: "Зачисление после подтверждения сети и проверки.",
  },
  {
    id: "ledger",
    titleKey: "trust.flow.step2.title",
    titleFallback: "Запись в ledger",
    descriptionKey: "trust.flow.step2.text",
    descriptionFallback: "Тип операции, сумма и ссылка на транзакцию.",
  },
  {
    id: "trade",
    titleKey: "trust.flow.step3.title",
    titleFallback: "Покупка или торговля",
    descriptionKey: "trust.flow.step3.text",
    descriptionFallback: "Первичный или вторичный рынок по правилам релиза.",
  },
  {
    id: "accrual",
    titleKey: "trust.flow.step4.title",
    titleFallback: "Распределение дохода",
    descriptionKey: "trust.flow.step4.text",
    descriptionFallback: "Доход распределяется пропорционально юнитам.",
  },
  {
    id: "withdraw",
    titleKey: "trust.flow.step5.title",
    titleFallback: "Вывод средств",
    descriptionKey: "trust.flow.step5.text",
    descriptionFallback: "Treasury и compliance; статус — в истории выплат.",
  },
] as const;

export function TrustOperationFlowScene() {
  const { t } = useI18n();
  const title = t("trust.flow.title", "Как проходят операции");
  const subtitle = t(
    "trust.flow.subtitle",
    "От пополнения до вывода — каждый этап в ledger и кабинете.",
  );

  const steps = useMemo(
    () =>
      STEPS.map((item) => ({
        id: item.id,
        title: t(item.titleKey, item.titleFallback),
        description: t(item.descriptionKey, item.descriptionFallback),
      })),
    [t],
  );

  return (
    <section
      aria-labelledby="trust-flow-heading"
      className="rounded-2xl bg-black px-5 py-7 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] sm:rounded-[1.35rem] sm:px-8 sm:py-9"
    >
      <div className="max-w-2xl">
        <h2
          id="trust-flow-heading"
          className="text-2xl font-semibold tracking-tight text-white sm:text-3xl"
        >
          {title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400 sm:text-[15px]">{subtitle}</p>
      </div>

      <ol className="mt-8 space-y-0 divide-y divide-white/[0.08] border-t border-white/[0.08]">
        {steps.map((item, index) => {
          const icon = STEP_ICONS[index];
          const label = String(index + 1).padStart(2, "0");
          return (
            <li
              key={item.id}
              className="grid gap-3 py-6 sm:grid-cols-[5.5rem_1fr] sm:items-start sm:gap-6 sm:py-7"
            >
              <div className="relative size-14 shrink-0 sm:size-[4.5rem]" aria-hidden>
                <Image
                  src={`${icon}?v=1`}
                  alt=""
                  fill
                  sizes="72px"
                  className="object-contain"
                  unoptimized
                />
                <span className="sr-only">{label}</span>
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-semibold tracking-tight text-white sm:text-xl">
                  {item.title}
                </h3>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">{item.description}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
