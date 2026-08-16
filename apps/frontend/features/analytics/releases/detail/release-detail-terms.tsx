"use client";

import { useI18n } from "@/components/providers/i18n-provider";
import { filterTermRows, isEmptyDisplayValue } from "@/lib/analytics/display-value";
import { analyticsTermLabel } from "@/lib/i18n/analytics-messages";
import { detailPageText } from "@/lib/i18n/analytics-detail-page-messages";
import type { ReleaseDetailPageData } from "@/types/analytics/release-detail";
import { cn } from "@/lib/utils";

function looksLikeAccentValue(value: string): boolean {
  return /USDT|\$|€|%|актив|active|paused|closed|раунд/i.test(value) || /\d/.test(value);
}

function isStatusRow(key: string): boolean {
  return /статус|status/i.test(key);
}

export function ReleaseDetailTerms({ data }: { data: ReleaseDetailPageData }) {
  const { locale } = useI18n();
  const rows = filterTermRows(data.terms.rows);
  if (rows.length === 0) return null;

  const title =
    data.terms.title?.trim() || detailPageText(locale, "analytics.detail.terms.title");

  return (
    <section className="mt-10 space-y-4 md:mt-12" aria-label={title}>
      <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">{title}</h2>
      <div className="flex flex-col gap-2.5">
        {rows.map((r) => {
          const accent = looksLikeAccentValue(r.val);
          const emphasize = isStatusRow(r.key);
          return (
            <article key={r.key} className="rounded-2xl bg-[#171717] px-5 py-4 sm:py-[1.125rem]">
              <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                <div className="min-w-0">
                  <h3 className="text-[15px] font-semibold tracking-tight text-white sm:text-base">
                    {analyticsTermLabel(r.key, locale)}
                  </h3>
                  {!isEmptyDisplayValue(r.note) ? (
                    <p className="mt-1 text-[13px] leading-relaxed tracking-normal text-white/55">
                      {r.note}
                    </p>
                  ) : null}
                </div>
                {emphasize ? (
                  <span className="inline-flex shrink-0 items-center self-start rounded-full bg-[#B7F500] px-3.5 py-1.5 font-mono text-[13px] font-semibold text-black sm:self-center">
                    {r.val}
                  </span>
                ) : (
                  <p
                    className={cn(
                      "min-w-0 shrink font-mono text-[1.35rem] font-semibold leading-none tracking-tight tabular-nums break-all sm:shrink-0 sm:text-[1.65rem]",
                      accent ? "text-[#B7F500]" : "text-white",
                    )}
                  >
                    {r.val}
                  </p>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
