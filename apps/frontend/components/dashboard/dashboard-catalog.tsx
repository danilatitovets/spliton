"use client";

import Link from "next/link";
import { ArrowRight } from "@/lib/lucide";
import { useCallback, useEffect, useState } from "react";

import { CatalogTrackCard } from "@/components/dashboard/catalog-track-card";
import { useI18n } from "@/components/providers/i18n-provider";
import { ReadOnlySectionError } from "@/components/shared/data-states/read-only-section-error";
import { ROUTES } from "@/constants/routes";
import { catalogLandingDemoItems, type CatalogItem } from "@/lib/catalog-mock";
import { localizeCatalogItem } from "@/lib/catalog/catalog-adapter";
import { cn } from "@/lib/utils";
import { isLiveCatalogEnabled, loadLiveCatalogItems } from "@/services/catalog.service";

function CatalogCardGrid({ items }: { items: CatalogItem[] }) {
  return (
    <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:mx-0 sm:grid sm:snap-none sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3 [&::-webkit-scrollbar]:hidden">
      {items.map((item) => (
        <div
          key={item.id}
          className="w-[min(88vw,340px)] shrink-0 snap-center sm:w-auto sm:shrink"
        >
          <CatalogTrackCard item={item} variant="card" size="default" />
        </div>
      ))}
    </div>
  );
}

function CatalogCardsSkeleton() {
  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      aria-busy="true"
      aria-live="polite"
    >
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-72 animate-pulse rounded-2xl bg-white/[0.06]" />
      ))}
    </div>
  );
}

export function DashboardCatalogSection({ className }: { className?: string }) {
  const { locale, t } = useI18n();
  const live = isLiveCatalogEnabled();
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(live);
  const [fetchError, setFetchError] = useState<unknown>(null);

  const load = useCallback(() => {
    if (!live) return;
    setLoading(true);
    setFetchError(null);
    void loadLiveCatalogItems({ page: 1, pageSize: 6 }, locale)
      .then((res) => {
        setItems(res.items.slice(0, 6));
      })
      .catch((e) => {
        setItems([]);
        setFetchError(e);
      })
      .finally(() => setLoading(false));
  }, [live, locale]);

  useEffect(() => {
    if (!live) {
      setItems(catalogLandingDemoItems.map((item) => localizeCatalogItem(item, locale)));
      setLoading(false);
      setFetchError(null);
      return;
    }
    load();
  }, [live, locale, load]);

  return (
    <section
      id="catalog"
      className={cn("scroll-mt-24 pb-12 md:pb-16 lg:pb-24", className)}
      aria-labelledby="dash-catalog-heading"
    >
      <div className="mx-auto w-full max-w-[1200px] px-4 pt-12 sm:px-6 sm:pt-16 md:pt-20 lg:px-8">
        <div className="mb-8 max-w-2xl sm:mb-10 lg:mb-12">
          {!live ? (
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.08em] text-[#8a8f98]">
              {t("dashboard.catalogPreview.demoBanner")}
            </p>
          ) : null}
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
          {fetchError ? (
            <ReadOnlySectionError
              sectionId="dashboard-landing-catalog"
              error={fetchError}
              onRetry={load}
              variant="dark"
            />
          ) : loading ? (
            <CatalogCardsSkeleton />
          ) : items.length === 0 ? (
            <p className="text-sm leading-relaxed text-[#8a8f98]">{t("dashboard.catalogPreview.empty")}</p>
          ) : (
            <CatalogCardGrid items={items} />
          )}

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
