"use client";

import NextImage from "next/image";
import Link from "next/link";
import { ArrowRight } from "@/lib/lucide";
import { useMemo } from "react";

import { DashboardJourneyReadyPanel } from "@/components/dashboard/dashboard-journey-ready-panel";
import { DashboardJourneyTimeline } from "@/components/dashboard/dashboard-journey-timeline";
import { LandingReveal, LandingRevealFromLeft } from "@/components/dashboard/landing-motion";
import { DashboardMiniOrderBook } from "@/components/dashboard/dashboard-mini-order-book";
import { DashboardRegisterOrCabinetLink } from "@/components/dashboard/dashboard-register-or-cabinet-link";
import { useI18n } from "@/components/providers/i18n-provider";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

export { DashboardValueGrid } from "@/components/dashboard/dashboard-value-grid";

export function DashboardTrustStrip({ className }: { className?: string }) {
  const { t } = useI18n();

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 border-b border-[#222222] py-4 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-[#62666d]",
        className,
      )}
    >
      <p className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5">
        <span className="text-[#8a8f98]">{t("dashboard.trustStrip.spliton")}</span>
        <span className="text-[#383b3f]" aria-hidden>
          ·
        </span>
        <span className="text-[#8a8f98]">{t("dashboard.trustStrip.cabinet")}</span>
        <span className="text-[#383b3f]" aria-hidden>
          ·
        </span>
        <span className="text-[#8a8f98]">{t("dashboard.trustStrip.usdt")}</span>
      </p>
    </div>
  );
}

export function DashboardUnifiedJourneyBlock({ className }: { className?: string }) {
  const { t } = useI18n();

  const journeySteps = useMemo(
    () => [
      { n: "1", title: t("dashboard.journey.step1.title"), text: t("dashboard.journey.step1.text") },
      { n: "2", title: t("dashboard.journey.step2.title"), text: t("dashboard.journey.step2.text") },
      { n: "3", title: t("dashboard.journey.step3.title"), text: t("dashboard.journey.step3.text") },
      { n: "4", title: t("dashboard.journey.step4.title"), text: t("dashboard.journey.step4.text") },
    ],
    [t],
  );

  return (
    <section
      className={cn("scroll-mt-[5.5rem] py-10 sm:scroll-mt-24 sm:py-12 md:py-16", className)}
      aria-labelledby="dash-unified-journey-heading"
    >
      <div className="relative">
        <div className="mx-auto flex max-w-3xl flex-col items-center overflow-hidden text-center">
          <LandingRevealFromLeft>
            <NextImage
              src="/images/LOGO/mini-logo.png"
              alt="Spliton"
              width={280}
              height={56}
              className="h-8 w-auto max-w-[200px] object-contain sm:h-10 sm:max-w-[240px]"
              priority={false}
            />
          </LandingRevealFromLeft>
          <LandingReveal delay={0.1} className="w-full">
            <h2
              id="dash-unified-journey-heading"
              className="mt-5 max-w-[20ch] text-balance text-3xl font-medium tracking-[-0.022em] text-white sm:mt-6 sm:max-w-none md:text-4xl lg:text-[2.75rem] lg:leading-[1.08] [font-feature-settings:'cv01'_on,'ss03'_on,'zero'_on]"
            >
              {t("dashboard.journey.title")}
            </h2>
          </LandingReveal>
          <LandingReveal delay={0.18} className="w-full">
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[#8a8f98] md:text-base md:leading-7">
              {t("dashboard.journey.subtitle")}
            </p>
          </LandingReveal>
          <LandingReveal delay={0.26} className="w-full">
            <Link
              href={ROUTES.dashboardSecondaryMarket}
              className="mt-7 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white pl-6 pr-1.5 text-[14px] font-[510] tracking-[-0.011em] text-black transition hover:bg-[#e8e8e8] active:scale-[0.98] sm:mt-8"
            >
              {t("dashboard.journey.ctaMarket")}
              <span className="inline-flex size-8 items-center justify-center rounded-full bg-black text-white">
                <ArrowRight className="size-4" strokeWidth={2} aria-hidden />
              </span>
            </Link>
          </LandingReveal>
        </div>

        <div className="mt-10 sm:mt-12 md:mt-14">
          <DashboardJourneyTimeline
            steps={journeySteps}
            ariaLabel={t("dashboard.journey.timelineAria")}
          />
        </div>

        <DashboardJourneyReadyPanel>
          <div className="relative grid gap-6 md:grid-cols-[1fr_0.95fr] md:items-center md:gap-8">
            <div className="text-left">
              <h3 className="text-xl font-medium tracking-[-0.022em] text-white sm:text-2xl md:text-[1.75rem] md:leading-tight">
                {t("dashboard.journey.readyTitle")}
              </h3>
              <p className="mt-2 max-w-xl text-sm leading-relaxed tracking-[-0.01em] text-[#8a8f98] md:text-[15px] md:leading-7">
                {t("dashboard.journey.readyText")}
              </p>
              <div className="mt-5 flex flex-wrap gap-2.5 sm:mt-6">
                <Link
                  href={ROUTES.dashboardCatalog}
                  className="inline-flex h-10 items-center justify-center rounded-full bg-white px-5 text-sm font-[510] tracking-[-0.011em] text-black transition hover:bg-[#e8e8e8]"
                >
                  {t("dashboard.journey.toCatalog")}
                </Link>
                <DashboardRegisterOrCabinetLink
                  className="inline-flex h-10 items-center justify-center rounded-full px-5 text-sm font-[510] tracking-[-0.011em] text-[#d0d6e0] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.14)] transition hover:bg-white/[0.04]"
                  guestLabel={t("dashboard.journey.register")}
                  authLabel={t("dashboard.journey.portfolio")}
                />
                <Link
                  href={ROUTES.support}
                  className="inline-flex h-10 items-center justify-center rounded-full px-4 text-sm font-[510] tracking-[-0.011em] text-[#71717a] transition hover:text-white"
                >
                  {t("dashboard.journey.support")}
                </Link>
              </div>
            </div>

            <DashboardMiniOrderBook
              demo
              className="max-lg:max-h-[min(42vw,200px)] max-lg:overflow-hidden rounded-[18px] border border-white/[0.12] bg-black/45 backdrop-blur-sm"
            />
          </div>
        </DashboardJourneyReadyPanel>
      </div>
    </section>
  );
}

export function DashboardMarketsRow({ className }: { className?: string }) {
  const { t } = useI18n();

  const marketTiles = useMemo(
    () =>
      [
        {
          key: "secondary",
          href: ROUTES.dashboardSecondaryMarket,
          imageSrc: "/images/Сервисы площадки/1.png",
        },
        {
          key: "analytics",
          href: ROUTES.analyticsReleases,
          imageSrc: "/images/Сервисы площадки/2.png",
        },
        {
          key: "news",
          href: ROUTES.news,
          imageSrc: "/images/Сервисы площадки/3.png",
        },
        {
          key: "fees",
          href: ROUTES.fees,
          imageSrc: "/images/Сервисы площадки/4.png",
        },
      ] as const,
    [],
  );

  return (
    <section
      className={cn("scroll-mt-[5.5rem] py-10 sm:scroll-mt-24 sm:py-16 md:py-24", className)}
      aria-labelledby="dash-markets-heading"
    >
      <h2
        id="dash-markets-heading"
        className="mx-auto max-w-4xl text-balance text-center text-[1.65rem] font-semibold leading-[1.2] tracking-[-0.022em] text-white sm:text-3xl md:text-4xl [font-feature-settings:'cv01'_on,'ss03'_on,'zero'_on]"
      >
        <span className="sr-only">{t("dashboard.markets.title")}</span>
        <span aria-hidden className="inline-flex flex-wrap items-center justify-center gap-x-1.5 gap-y-2">
          <span>{t("dashboard.markets.titleBefore")}</span>
          <span className="inline-flex rounded-full border border-[#3fe280]/45 bg-[#3fe280]/12 px-3 py-0.5 text-[0.92em] font-[510] tracking-[-0.03em] text-[#3fe280] sm:px-4 sm:py-1">
            {t("dashboard.markets.titleHighlight")}
          </span>
          {t("dashboard.markets.titleAfter") ? (
            <span>{t("dashboard.markets.titleAfter")}</span>
          ) : null}
        </span>
      </h2>

      <div className="mt-8 grid gap-8 sm:mt-14 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-12 lg:mt-16 lg:grid-cols-4 lg:gap-10">
        {marketTiles.map(({ key, href, imageSrc }) => {
          const title = t(`dashboard.markets.${key}.title`);
          const description = t(`dashboard.markets.${key}.description`);
          const linkLabel = t(`dashboard.markets.${key}.link`);

          return (
            <div key={href} className="flex flex-col items-center text-center sm:items-start sm:text-left">
              <div className="relative mb-6 size-[7.5rem] shrink-0 sm:mb-7 sm:size-32 md:size-36">
                <NextImage src={imageSrc} alt="" fill className="object-contain opacity-95" sizes="144px" unoptimized />
              </div>
              <h3 className="text-lg font-semibold tracking-[-0.014em] text-white md:text-xl">{title}</h3>
              <p className="mt-3 max-w-[280px] text-sm leading-relaxed text-[#9ca3af] sm:max-w-none">
                {description}{" "}
                <Link
                  href={href}
                  className="font-medium text-white underline decoration-white/70 underline-offset-[3px] transition hover:decoration-white"
                >
                  {linkLabel}
                </Link>
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function DashboardLandingCta({ className }: { className?: string }) {
  const { t } = useI18n();

  return (
    <section
      className={cn(
        "scroll-mt-[5.5rem] py-12 sm:scroll-mt-24 sm:py-16 md:py-24",
        className,
      )}
      aria-labelledby="dash-cta-heading"
    >
      <div className="relative overflow-hidden rounded-[12px] bg-[#171717] px-5 py-12 border border-[#222222] sm:px-10 sm:py-16 md:px-12 md:py-20">
        <NextImage
          src="/images/landing/cta-anime-building.png"
          alt=""
          fill
          className="object-cover object-[center_35%] opacity-50"
          sizes="(max-width: 1200px) 100vw, 1200px"
          priority={false}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/90 via-black/75 to-black/55" aria-hidden />
        <div className="relative max-w-2xl">
          <h2
            id="dash-cta-heading"
            className="text-xl font-medium tracking-[-0.022em] text-white sm:text-2xl md:text-3xl [font-feature-settings:'cv01'_on,'ss03'_on,'zero'_on]"
          >
            {t("dashboard.cta.title")}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#8a8f98] sm:mt-4 md:text-base">{t("dashboard.cta.text")}</p>
          <div className="mt-6 flex flex-col gap-2.5 sm:mt-8 sm:flex-row sm:flex-wrap sm:gap-3">
            <Link
              href={ROUTES.dashboardCatalog}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[16px] bg-[#3fe280] px-6 text-sm font-medium tracking-[-0.011em] text-[#0a0a0a] transition hover:bg-[#55e992] active:scale-[0.98] sm:w-auto"
            >
              {t("dashboard.journey.toCatalog")}
              <ArrowRight className="size-4" strokeWidth={2} aria-hidden />
            </Link>
            <DashboardRegisterOrCabinetLink
              className="inline-flex h-11 w-full items-center justify-center rounded-[16px] px-6 text-sm font-medium text-[#d0d6e0] border border-[#222222] transition hover:bg-white/[0.03] active:scale-[0.98] sm:w-auto"
              guestLabel={t("dashboard.journey.register")}
              authLabel={t("dashboard.journey.portfolio")}
            />
            <Link
              href={ROUTES.support}
              className="inline-flex h-11 w-full items-center justify-center rounded-[16px] px-4 text-sm font-medium text-[#8a8f98] transition hover:text-[#d0d6e0] sm:w-auto"
            >
              {t("dashboard.journey.support")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
