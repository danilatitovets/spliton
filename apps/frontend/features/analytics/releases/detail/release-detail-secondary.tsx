"use client";

import { SplitonCtaPill } from "@/components/ui/spliton-cta-pill";
import { useI18n } from "@/components/providers/i18n-provider";
import { RELEASE_DETAIL_ANALYTICS_ICONS } from "@/constants/analytics/release-detail-analytics-icons";
import type { ReleaseDetailPageData } from "@/types/analytics/release-detail";
import { filterMetricRows } from "@/lib/analytics/display-value";
import { detailPageText } from "@/lib/i18n/analytics-detail-page-messages";
import { cn } from "@/lib/utils";

import { DetailEmptyState } from "./detail-empty-state";
import { ReleaseDetailOrderBook } from "./release-detail-order-book";

function parseMidPrice(rows: { label: string; value: string }[]): number {
  const priceRow =
    rows.find((r) => /цена|price|ask|bid/i.test(r.label) && /usdt|\$|\d/i.test(r.value)) ??
    rows.find((r) => /usdt/i.test(r.value));
  if (!priceRow) return 18.4;
  const n = Number.parseFloat(
    priceRow.value.replace(/\s/g, "").replace(",", ".").replace(/[^\d.]/g, ""),
  );
  return Number.isFinite(n) && n > 0 ? n : 18.4;
}

function looksLikeAccentValue(value: string): boolean {
  return /USDT|\$|€|%|Deep|Mid|Thin/i.test(value) || /\d/.test(value);
}

export function ReleaseDetailSecondary({
  data,
  className,
  sectionTitleClassName,
}: {
  data: ReleaseDetailPageData;
  className?: string;
  sectionTitleClassName?: string;
}) {
  const { locale } = useI18n();
  const t = (key: Parameters<typeof detailPageText>[1]) => detailPageText(locale, key);
  const rows = filterMetricRows(data.secondary.rows);
  const secondaryEnabled = data.pageState.secondaryEnabled;
  const marketHref = data.secondary.marketHref;
  const description = t("analytics.detail.secondary.description");
  const mid = parseMidPrice(rows);

  return (
    <section
      className={cn("mt-10 space-y-5 md:mt-12 md:space-y-6", className)}
      aria-labelledby="release-secondary-title"
    >
      <div className="max-w-[54rem]">
        <h2
          id="release-secondary-title"
          className={cn(
            "text-balance text-2xl font-semibold tracking-tight text-white sm:text-3xl",
            sectionTitleClassName,
          )}
        >
          {data.secondary.title}
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed tracking-normal text-white/55 sm:text-base sm:leading-relaxed">
          {description}
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="overflow-hidden rounded-2xl bg-[#171717]">
          <DetailEmptyState
            imageSrc={RELEASE_DETAIL_ANALYTICS_ICONS.secondaryEmpty}
            title={
              secondaryEnabled
                ? t("analytics.detail.secondary.emptyStatus")
                : t("analytics.detail.secondary.unavailable")
            }
            body={
              secondaryEnabled
                ? t("analytics.detail.secondary.emptyHint")
                : t("analytics.detail.secondary.description")
            }
            action={
              marketHref ? (
                <SplitonCtaPill href={marketHref} tone="onDark" className="min-w-[10rem]">
                  {t("analytics.detail.secondary.openMarket")}
                </SplitonCtaPill>
              ) : undefined
            }
          />
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)] lg:items-start lg:gap-5">
          <div className="min-w-0 space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
              {rows.map((r) => {
                const accent = looksLikeAccentValue(r.value);
                return (
                  <article
                    key={r.label}
                    className="flex min-h-0 flex-col rounded-2xl bg-[#171717] px-4 py-4 sm:min-h-[140px] sm:px-5 sm:py-5"
                  >
                    <p
                      className={cn(
                        "font-mono text-[1.45rem] font-semibold leading-none tracking-tight tabular-nums sm:text-[1.75rem]",
                        accent ? "text-[#B7F500]" : "text-white",
                      )}
                    >
                      {r.value}
                    </p>
                    <h3 className="mt-3 text-[15px] font-semibold tracking-tight text-white sm:text-base">
                      {r.label}
                    </h3>
                  </article>
                );
              })}
            </div>

            {marketHref ? (
              <SplitonCtaPill href={marketHref} tone="onDark" className="w-full sm:w-auto">
                {t("analytics.detail.secondary.openMarket")}
              </SplitonCtaPill>
            ) : null}
          </div>

          <ReleaseDetailOrderBook
            midPrice={mid}
            locale={locale}
            className="min-h-[300px] overflow-hidden rounded-2xl border-0 bg-[#171717]"
            labels={{
              title: locale === "ru" ? "Стакан" : "Order book",
              price: locale === "ru" ? "Цена" : "Price",
              qty: locale === "ru" ? "Объём" : "Qty",
              total: locale === "ru" ? "Сумма" : "Total",
            }}
          />
        </div>
      )}
    </section>
  );
}
