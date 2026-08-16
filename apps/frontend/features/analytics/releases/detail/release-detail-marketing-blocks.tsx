"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, ChevronRight } from "@/lib/lucide";

import { SplitonCtaPill } from "@/components/ui/spliton-cta-pill";
import { useI18n } from "@/components/providers/i18n-provider";
import { ROUTES, catalogBuyUnitsPath, loginPathWithNext } from "@/constants/routes";
import { detailPageText } from "@/lib/i18n/analytics-detail-page-messages";
import type { ReleaseDetailPageData } from "@/types/analytics/release-detail";

import { DetailSection } from "./detail-section";

const CTA_CHART = "/images/analytics/release-detail-cta-chart.png";
const STEPS_ART = "/images/analytics/release-detail-steps-banner.png";

export function ReleaseDetailMarketingBlocks({ data }: { data: ReleaseDetailPageData }) {
  const { locale, t } = useI18n();
  const releaseTitle = data.row.release;
  const buyHref = data.pageState.primaryCta?.href ?? catalogBuyUnitsPath(data.row.id);
  const tryHref = data.pageState.isGuest ? loginPathWithNext(buyHref) : buyHref;

  const guides = [
    {
      title: detailPageText(locale, "analytics.detail.guides.card1Title"),
      body: detailPageText(locale, "analytics.detail.guides.card1Body"),
      href: ROUTES.guideSelection,
    },
    {
      title: detailPageText(locale, "analytics.detail.guides.card2Title"),
      body: detailPageText(locale, "analytics.detail.guides.card2Body"),
      href: ROUTES.guideDealStructure,
    },
    {
      title: detailPageText(locale, "analytics.detail.guides.card3Title"),
      body: detailPageText(locale, "analytics.detail.guides.card3Body"),
      href: ROUTES.assetsUnt,
    },
  ];

  const steps = [
    detailPageText(locale, "analytics.detail.steps.item1"),
    detailPageText(locale, "analytics.detail.steps.item2"),
    detailPageText(locale, "analytics.detail.steps.item3"),
  ];

  return (
    <div className="mt-10 space-y-12 md:mt-12 md:space-y-14">
      {/* Two full-width rows: chrome-style art only on the left */}
      <div className="grid gap-4">
        <section className="overflow-hidden rounded-2xl border border-white/15 bg-black">
          <div className="grid h-full items-center gap-2 p-4 sm:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] sm:gap-3 sm:p-5 lg:gap-2.5">
            <div className="relative aspect-[16/11] w-full min-h-[120px] sm:min-h-[132px]">
              <Image
                src={STEPS_ART}
                alt=""
                fill
                sizes="(max-width:1024px) 100vw, 420px"
                className="object-contain object-center sm:object-left"
                priority={false}
              />
            </div>
            <div className="min-w-0 sm:pl-0">
              <h3 className="text-balance text-xl font-semibold tracking-tight text-white sm:text-[1.35rem]">
                {detailPageText(locale, "analytics.detail.steps.title").replace(
                  "{release}",
                  releaseTitle,
                )}
              </h3>
              <ul className="mt-3.5 space-y-2">
                {steps.map((step) => (
                  <li
                    key={step}
                    className="flex items-start gap-2.5 text-[13px] tracking-normal text-white/85"
                  >
                    <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-[#B7F500] text-black">
                      <Check className="size-3" strokeWidth={3} aria-hidden />
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-5">
                <SplitonCtaPill href={buyHref} tone="onDark" className="w-full min-w-0 sm:w-auto sm:min-w-[10rem]">
                  {detailPageText(locale, "analytics.detail.steps.start")}
                </SplitonCtaPill>
              </div>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-white/15 bg-black">
          <div className="grid h-full items-center gap-2 p-4 sm:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] sm:gap-3 sm:p-5 lg:gap-2.5">
            <div className="relative aspect-[16/11] w-full min-h-[120px] sm:min-h-[132px]">
              <Image
                src={CTA_CHART}
                alt=""
                fill
                sizes="(max-width:1024px) 100vw, 420px"
                className="object-contain object-center sm:object-left"
              />
            </div>
            <div className="min-w-0">
              <h3 className="text-balance text-xl font-semibold tracking-tight text-white sm:text-[1.35rem]">
                {detailPageText(locale, "analytics.detail.market.ctaTitle")}
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed tracking-normal text-white/45">
                {detailPageText(locale, "analytics.detail.market.ctaBody")}
              </p>
              <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
                <SplitonCtaPill href={tryHref} tone="onDark" className="w-full min-w-0 sm:w-auto sm:min-w-[10rem]">
                  {detailPageText(locale, "analytics.detail.market.ctaTry")}
                </SplitonCtaPill>
                <SplitonCtaPill
                  href={ROUTES.dashboardCatalog}
                  tone="onDark"
                  variant="ghost"
                  withArrow={false}
                  className="w-full sm:w-auto"
                >
                  {t("positions.openCatalog")}
                </SplitonCtaPill>
              </div>
            </div>
          </div>
        </section>
      </div>

      <DetailSection
        className="mt-0 border-white/[0.06] pt-8"
        title={detailPageText(locale, "analytics.detail.guides.title")}
      >
        <div className="grid gap-4">
          {guides.slice(0, 2).map((g, index) => (
            <article
              key={g.title}
              className="flex flex-col overflow-hidden rounded-2xl border border-white/15 bg-black sm:flex-row sm:items-center"
            >
              <div className="relative aspect-[16/11] w-full shrink-0 bg-black sm:aspect-auto sm:h-[160px] sm:w-[220px] lg:w-[260px]">
                <Image
                  src={
                    index === 0
                      ? "/images/analytics/release-detail-trust-rings.png"
                      : "/images/analytics/release-detail-trust-sphere.png"
                  }
                  alt=""
                  fill
                  sizes="260px"
                  className="object-contain object-center p-4"
                />
              </div>
              <div className="min-w-0 flex-1 px-5 py-5 sm:py-6 sm:pr-6">
                <h3 className="text-[15px] font-semibold tracking-tight text-white sm:text-base">{g.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed tracking-normal text-white/45">{g.body}</p>
                <Link
                  href={g.href}
                  className="mt-4 inline-flex items-center gap-1 text-[13px] font-medium tracking-normal text-white transition hover:text-white/75"
                >
                  {detailPageText(locale, "analytics.detail.guides.start")}
                  <ChevronRight className="size-3.5 opacity-60" strokeWidth={2} aria-hidden />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </DetailSection>
    </div>
  );
}
