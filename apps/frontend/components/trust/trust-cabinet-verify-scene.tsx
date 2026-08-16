"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "@/lib/lucide";
import { useMemo } from "react";

import { useI18n } from "@/components/providers/i18n-provider";
import { ROUTES } from "@/constants/routes";

const STEP_ICONS = [
  "/images/partner/partner-step-01.png",
  "/images/partner/partner-step-02.png",
  "/images/partner/partner-step-03.png",
  "/images/partner/partner-step-04.png",
] as const;

const STEPS = [
  {
    id: "history",
    titleKey: "trust.verify.step1.title",
    titleFallback: "История пополнений, сделок и выводов",
    descriptionKey: "trust.verify.step1.text",
    descriptionFallback: "Тип, сумма, дата и ссылка на транзакцию.",
    href: ROUTES.dashboardPayoutsHistory,
    hrefLabelKey: "trust.verify.step1.href",
    hrefLabelFallback: "История операций",
  },
  {
    id: "statements",
    titleKey: "trust.verify.step2.title",
    titleFallback: "Выписки и квитанции",
    descriptionKey: "trust.verify.step2.text",
    descriptionFallback: "Периодические выписки для учёта и самопроверки.",
    href: ROUTES.dashboardStatements,
    hrefLabelKey: "trust.verify.step2.href",
    hrefLabelFallback: "Выписки",
  },
  {
    id: "withdrawals",
    titleKey: "trust.verify.step3.title",
    titleFallback: "Статус заявок на вывод",
    descriptionKey: "trust.verify.step3.text",
    descriptionFallback: "Проверка, одобрение и очередь отправки.",
    href: ROUTES.dashboardPayoutsHistory,
    hrefLabelKey: "trust.verify.step3.href",
    hrefLabelFallback: "Заявки на вывод",
  },
  {
    id: "documents",
    titleKey: "trust.verify.step4.title",
    titleFallback: "Документы релиза",
    descriptionKey: "trust.verify.step4.text",
    descriptionFallback: "Term sheet и материалы до входа в сделку.",
    href: ROUTES.dashboardDocuments,
    hrefLabelKey: "trust.verify.step4.href",
    hrefLabelFallback: "Документы",
  },
] as const;

export function TrustCabinetVerifyScene() {
  const { t } = useI18n();

  const steps = useMemo(
    () =>
      STEPS.map((step) => ({
        id: step.id,
        title: t(step.titleKey, step.titleFallback),
        description: t(step.descriptionKey, step.descriptionFallback),
        href: step.href,
        hrefLabel: t(step.hrefLabelKey, step.hrefLabelFallback),
      })),
    [t],
  );

  return (
    <div>
      <ol className="divide-y divide-black/[0.06] border-t border-black/[0.06]">
        {steps.map((step, index) => {
          const icon = STEP_ICONS[index];
          const label = String(index + 1).padStart(2, "0");
          return (
            <li key={step.id} className="grid gap-3 py-5 first:pt-4 sm:grid-cols-[4.25rem_1fr] sm:gap-4">
              <div className="relative size-12 shrink-0 sm:size-14" aria-hidden>
                <Image
                  src={`${icon}?v=1`}
                  alt=""
                  fill
                  sizes="56px"
                  className="object-contain"
                  unoptimized
                />
                <span className="sr-only">{label}</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-neutral-950 sm:text-[15px]">{step.title}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-neutral-500">{step.description}</p>
                <Link
                  href={step.href}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-900 underline decoration-neutral-300 underline-offset-4 transition hover:decoration-neutral-600"
                >
                  {step.hrefLabel}
                  <ChevronRight className="size-3.5" aria-hidden />
                </Link>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mt-5 sm:mt-6">
        <Link
          href={ROUTES.dashboardPayoutsHistory}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-neutral-950 px-5 text-sm font-semibold text-white transition hover:bg-neutral-800 sm:w-auto"
        >
          {t("trust.verify.cta", "История операций")}
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
