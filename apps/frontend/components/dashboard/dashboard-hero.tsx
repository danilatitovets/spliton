"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, TrendingUp } from "@/lib/lucide";

import { DashboardHeroProductStage } from "@/components/dashboard/dashboard-hero-product-stage";
import { DashboardLandingLogoStrip } from "@/components/dashboard/dashboard-landing-logo-strip";
import { landingPageMax } from "@/components/dashboard/dashboard-landing-tokens";
import { UsdtMark } from "@/components/shared/asset-marks";
import { useI18n } from "@/components/providers/i18n-provider";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

function HeroHeadlineBadge({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center rounded-full sm:size-10 md:size-11",
        className,
      )}
      aria-hidden
    >
      {children}
    </span>
  );
}

export function DashboardHero({ className }: { className?: string }) {
  const { t } = useI18n();
  const reduceMotion = useReducedMotion();
  const easeOut = [0.22, 1, 0.36, 1] as const;

  return (
    <section
      id="deposit"
      className={cn(
        "scroll-mt-[5.5rem] relative z-1 w-full px-4 pb-12 pt-12 sm:scroll-mt-24 sm:px-0 sm:pb-16 sm:pt-16 lg:pb-20 lg:pt-20",
        className,
      )}
    >
      <div className={cn(landingPageMax, "sm:px-6 lg:px-8")}>
        <motion.div
          className="mx-auto flex max-w-[980px] flex-col items-center text-center"
          initial={reduceMotion ? false : { opacity: 0, y: 32 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.85, ease: easeOut }}
        >
          <Link
            href={ROUTES.dashboardSecondaryMarket}
            className="inline-flex items-center gap-2 rounded-full bg-white/[0.04] py-1 pl-1.5 pr-2 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] transition hover:bg-white/[0.06]"
          >
            <span className="rounded-full bg-[#3fe280]/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#3fe280]">
              {t("dashboard.hero.chipNew")}
            </span>
            <span className="text-[13px] font-[510] tracking-[-0.011em] text-[#d0d6e0] [font-feature-settings:'cv01'_on,'ss03'_on,'zero'_on]">
              {t("dashboard.hero.chipSessions")}
            </span>
            <span
              className="inline-flex size-5 items-center justify-center rounded-full bg-white/[0.06] text-white/70"
              aria-hidden
            >
              <ArrowRight className="size-3" strokeWidth={2} />
            </span>
          </Link>

          <h1
            className={cn(
              "mt-7 flex max-w-[22ch] flex-wrap items-center justify-center gap-x-2 gap-y-2 text-balance text-[2rem] font-[510] leading-[1.12] tracking-[-0.035em] text-white sm:mt-8 sm:max-w-none sm:gap-x-2.5 sm:gap-y-3 sm:text-[2.75rem] md:text-[3.35rem] lg:text-[3.85rem] lg:leading-[1.08]",
              "[font-feature-settings:'cv01'_on,'ss03'_on,'zero'_on]",
            )}
          >
            <span>{t("dashboard.hero.headline.lead1")}</span>
            <HeroHeadlineBadge className="bg-transparent p-0">
              <UsdtMark className="size-9 sm:size-10 md:size-11" />
            </HeroHeadlineBadge>
            <span>{t("dashboard.hero.headline.lead2")}</span>
            <HeroHeadlineBadge className="bg-[#f0762b] text-white">
              <TrendingUp className="size-[1.05rem] sm:size-5" strokeWidth={2.25} />
            </HeroHeadlineBadge>
            <span>{t("dashboard.hero.headline.lead3")}</span>
            <span className="inline-flex rounded-full border border-white/30 px-3 py-0.5 text-[0.92em] tracking-[-0.03em] sm:px-4 sm:py-1">
              {t("dashboard.hero.headline.pill")}
            </span>
          </h1>

          <p className="mt-6 max-w-[640px] text-[15px] leading-relaxed tracking-[-0.011em] text-[#8a8f98] sm:mt-7 sm:text-base md:text-[17px] md:leading-8">
            {t("dashboard.hero.subtitle")}
          </p>

          <div className="mt-8 flex w-full flex-col items-stretch justify-center gap-3 sm:mt-9 sm:w-auto sm:flex-row sm:items-center">
            <Link
              href={ROUTES.dashboardCatalog}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white pl-6 pr-1.5 text-[14px] font-[510] tracking-[-0.011em] text-black transition hover:bg-[#e8e8e8] active:scale-[0.98]"
            >
              {t("dashboard.hero.ctaCatalog")}
              <span className="inline-flex size-8 items-center justify-center rounded-full bg-black text-white">
                <ArrowRight className="size-4" strokeWidth={2} aria-hidden />
              </span>
            </Link>
            <Link
              href={ROUTES.dashboardSecondaryMarket}
              className="inline-flex h-11 items-center justify-center rounded-full px-6 text-[14px] font-[510] tracking-[-0.011em] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)] transition hover:bg-white/[0.04] active:scale-[0.98]"
            >
              {t("dashboard.hero.ctaSecondary")}
            </Link>
          </div>
        </motion.div>

        <motion.div
          className="relative mt-14 w-full sm:mt-16 lg:mt-20"
          initial={reduceMotion ? false : { opacity: 0, y: 40 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: easeOut, delay: 0.12 }}
        >
          <DashboardHeroProductStage className="relative z-1 w-full" />
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={reduceMotion ? undefined : { opacity: 1 }}
          transition={{ duration: 0.7, ease: easeOut, delay: 0.22 }}
        >
          <DashboardLandingLogoStrip className="mt-14 sm:mt-16" />
        </motion.div>
      </div>
    </section>
  );
}
