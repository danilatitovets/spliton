"use client";

import Link from "next/link";
import { ArrowRight } from "@/lib/lucide";
import { useMemo } from "react";

import { CatalogTrackCard } from "@/components/dashboard/catalog-track-card";
import { useI18n } from "@/components/providers/i18n-provider";
import { ROUTES } from "@/constants/routes";
import { catalogLandingDemoItems } from "@/lib/catalog-mock";
import { localizeCatalogItem } from "@/lib/catalog/catalog-adapter";
import { cn } from "@/lib/utils";

export function DashboardCatalogSection({ className }: { className?: string }) {
  const { locale, t } = useI18n();

  const items = useMemo(
    () => catalogLandingDemoItems.map((item) => localizeCatalogItem(item, locale)),
    [locale],
  );

  return (
    <section
      id="catalog"
      className={cn("scroll-mt-24 pb-12 md:pb-16 lg:pb-24", className)}
      aria-labelledby="dash-catalog-heading"
    >
      <div className="mx-auto w-full max-w-[1200px] px-4 pt-12 sm:px-6 sm:pt-16 md:pt-20 lg:px-8">
        <div className="mb-8 max-w-2xl sm:mb-10 lg:mb-12">
          <h2
            id="dash-catalog-heading"
            className="text-3xl font-medium tracking-[-0.022em] text-white md:text-4xl lg:text-[2.75rem] lg:leading-[1.08] [font-feature-settings:'cv01'_on,'ss03'_on,'zero'_on]"
          >
            {t("dashboard.catalogPreview.heading")}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-[#8a8f98] md:text-base md:leading-7">
            {t("dashboard.catalogPreview.body")}
          </p>
        </div>

        <div className="min-w-0">
          <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:mx-0 sm:grid sm:snap-none sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3 [&::-webkit-scrollbar]:hidden">
            {items.map((item) => (
              <Link
                key={item.id}
                href={ROUTES.dashboardCatalog}
                className="block w-[min(88vw,340px)] shrink-0 snap-center rounded-2xl outline-offset-2 transition hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/40 sm:w-auto sm:shrink"
                aria-label={`${item.title} — ${t("dashboard.catalogPreview.openCta")}`}
              >
                <div className="pointer-events-none">
                  <CatalogTrackCard item={item} variant="card" size="default" />
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4 sm:mt-10">
            <Link
              href={ROUTES.dashboardCatalog}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white pl-6 pr-1.5 text-[14px] font-[510] tracking-[-0.011em] text-black transition hover:bg-[#e8e8e8] active:scale-[0.98]"
            >
              {t("dashboard.catalogPreview.openCta")}
              <span className="inline-flex size-8 items-center justify-center rounded-full bg-black text-white">
                <ArrowRight className="size-4" strokeWidth={2} aria-hidden />
              </span>
            </Link>
            <Link
              href={ROUTES.dashboardCatalog}
              className="inline-flex items-center gap-1 text-[14px] font-[510] tracking-[-0.011em] text-[#71717a] transition hover:text-white"
            >
              {t("dashboard.catalogPreview.fullCatalog")}
              <ArrowRight className="size-3.5" strokeWidth={1.75} aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/** @deprecated Используйте DashboardCatalogSection на лендинге кабинета. */
export function DashboardCatalog({ className }: { className?: string }) {
  return <DashboardCatalogSection className={className} />;
}
