"use client";

import { useI18n } from "@/components/providers/i18n-provider";
import { SplitonCtaPill } from "@/components/ui/spliton-cta-pill";
import { ROUTES } from "@/constants/routes";

export function FeesCtaBand() {
  const { t } = useI18n();

  return (
    <section className="border-t border-neutral-200/90 pt-12">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 max-w-xl">
          <h2 className="text-xl font-semibold tracking-tight text-neutral-900 sm:text-2xl">
            {t("fees.cta.title")}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-neutral-500 sm:text-[15px]">{t("fees.cta.subtitle")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SplitonCtaPill href={ROUTES.dashboardCatalog} tone="onLight" className="h-10 min-w-0 px-4 text-[13px]">
            {t("fees.cta.buy")}
          </SplitonCtaPill>
          <SplitonCtaPill
            href={ROUTES.calculator}
            tone="onLight"
            variant="ghost"
            withArrow={false}
            className="h-10 min-w-0 px-4 text-[13px]"
          >
            {t("fees.cta.calculator")}
          </SplitonCtaPill>
          <SplitonCtaPill
            href={`${ROUTES.dashboardPayouts}/deposit`}
            tone="onLight"
            variant="ghost"
            withArrow={false}
            className="h-10 min-w-0 px-4 text-[13px]"
          >
            {t("fees.cta.deposit")}
          </SplitonCtaPill>
        </div>
      </div>
    </section>
  );
}
