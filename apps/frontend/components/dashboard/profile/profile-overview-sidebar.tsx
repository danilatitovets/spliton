"use client";

import Link from "next/link";
import { ChevronRight, Headphones, Percent, TrendingUp } from "@/lib/lucide";

import { profileDashboardHref } from "@/constants/dashboard/profile-page";
import { ROUTES } from "@/constants/routes";
import { CabinetMobileQr } from "@/features/analytics/releases/detail/cabinet-mobile-qr";
import { PROFILE_DEMO_SECURITY_SCORE } from "@/lib/demo/cabinet-demo-preview";
import { useI18n } from "@/components/providers/i18n-provider";
import { kycStatusLabel } from "@/lib/profile/overview-labels";
import type { AccountCenterSummary } from "@/services/user-me.service";

import { PROFILE_METAL, ProfileGlassIcon, ProfileScoreRing } from "./profile-shared";
import { profileCardClass } from "./profile-ui";

const GEO_TEXTURE = "/images/profile/profile-sidebar-geo-texture.png";

const sidebarCardTitleClass =
  "text-[17px] font-bold leading-[1.2] tracking-[-0.02em] text-white";
const sidebarCardBodyClass = "mt-2 text-[14px] leading-[1.5] text-zinc-500";
const sidebarCardLinkClass =
  "mt-4 inline-flex items-center gap-0.5 text-[14px] font-semibold text-white transition hover:text-zinc-300";

function hasOpenSecurityGaps(
  security: AccountCenterSummary["security"] | undefined,
  demo: boolean,
): boolean {
  if (!security) return demo;
  return !security.twoFactorEnabled || !security.emailVerified || !security.passwordSet;
}

type Props = {
  accountCenter: AccountCenterSummary | null;
  live: boolean;
  demo?: boolean;
};

export function ProfileOverviewSidebar({ accountCenter, live, demo = false }: Props) {
  const { locale, t } = useI18n();
  const security = accountCenter?.security;
  const verification = accountCenter?.verification;

  const securityPending = live && !demo && !security;
  const securityScore = live && security ? (security.score ?? 0) : demo ? PROFILE_DEMO_SECURITY_SCORE : 0;
  const securityMax = live && security ? (security.maxScore ?? 100) : 100;
  const showVerification = Boolean((live && verification) || demo);

  const promo = [
    { href: ROUTES.fees, icon: Percent, label: t("profile.overview.promo.fees") },
    { href: ROUTES.dashboardPayouts, icon: TrendingUp, label: t("profile.overview.promo.yield") },
    { href: ROUTES.dashboardSupport, icon: Headphones, label: t("profile.overview.promo.support") },
  ];

  const news = [
    { date: t("profile.overview.sidebar.newsItem1Date"), title: t("profile.overview.sidebar.newsItem1Title") },
    { date: t("profile.overview.sidebar.newsItem2Date"), title: t("profile.overview.sidebar.newsItem2Title") },
    { date: t("profile.overview.sidebar.newsItem3Date"), title: t("profile.overview.sidebar.newsItem3Title") },
  ];

  return (
    <aside className="flex min-w-0 flex-col gap-3 sm:gap-4 lg:sticky lg:top-[calc(var(--profile-sticky-offset,7rem)+0.5rem)]">
      <section className={profileCardClass}>
        <div className="flex items-start gap-4 sm:gap-5">
          <div className="min-w-0 flex-1">
            <h3 className={sidebarCardTitleClass}>{t("profile.overview.securityCard.title")}</h3>
            <p className={sidebarCardBodyClass}>
              {securityPending ? (
                <span className="mt-0.5 inline-block h-4 w-40 animate-pulse rounded bg-white/[0.08]" />
              ) : hasOpenSecurityGaps(security, demo) ? (
                t("profile.overview.securityCard.remaining")
              ) : (
                t("profile.overview.securityCard.secured")
              )}
            </p>
            <Link href={profileDashboardHref("security")} className={sidebarCardLinkClass}>
              {t("profile.overview.securityCard.levelCta")}
              <ChevronRight className="size-4 shrink-0" aria-hidden />
            </Link>
          </div>
          <ProfileScoreRing
            score={securityScore}
            maxScore={securityMax}
            size="sm"
            tone="spliton"
            pending={securityPending}
          />
        </div>
      </section>

      <section className="relative isolate overflow-hidden rounded-[1.25rem] bg-[#111111] px-5 py-5 sm:px-6 sm:py-6">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.42]"
          style={{
            backgroundImage: `url('${GEO_TEXTURE}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          aria-hidden
        />
        <div className="pointer-events-none absolute inset-0 bg-[#111111]/45" aria-hidden />
        <div className="relative z-10">
          <Link
            href={ROUTES.dashboardCatalog}
            className="flex items-center justify-between gap-2 text-white transition hover:text-zinc-300"
          >
            <span className="text-[15px] font-semibold">{t("profile.overview.promo.title")}</span>
            <ChevronRight className="size-4 shrink-0" aria-hidden />
          </Link>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {promo.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center gap-2 rounded-xl px-1 py-2 text-center transition hover:bg-white/[0.04]"
                >
                  <span className="grid size-9 place-items-center rounded-full bg-white/[0.06] text-white">
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <span className="text-[11px] font-medium leading-snug text-zinc-300">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {showVerification ? (
        <section className={profileCardClass}>
          <div className="flex items-start gap-3.5 sm:gap-4">
            <ProfileGlassIcon src={PROFILE_METAL.id} size="lg" />
            <div className="min-w-0 flex-1">
              <h3 className={sidebarCardTitleClass}>
                {t("profile.overview.placeholder.titleVerification")}
              </h3>
              <p className={sidebarCardBodyClass}>
                {live && verification
                  ? kycStatusLabel(verification.status, locale)
                  : t("profile.overview.verificationCard.assistantBody")}
              </p>
              <Link href={profileDashboardHref("verification")} className={sidebarCardLinkClass}>
                {t("profile.overview.verificationCard.try")}
                <ChevronRight className="size-4 shrink-0" aria-hidden />
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      <section className={profileCardClass}>
        <div className="flex items-center justify-between gap-3">
          <p className="text-[15px] font-semibold text-white">{t("profile.overview.sidebar.newsTitle")}</p>
          <Link
            href={ROUTES.news}
            className="inline-flex shrink-0 items-center gap-0.5 text-[12px] text-zinc-500 transition hover:text-white"
          >
            {t("profile.overview.sidebar.newsMore")}
            <ChevronRight className="size-3.5" aria-hidden />
          </Link>
        </div>
        <ul className="mt-3 divide-y divide-white/[0.06]">
          {news.map((item) => (
            <li key={item.title} className="py-3 first:pt-2 last:pb-0">
              <p className="text-[12px] text-zinc-500">{item.date}</p>
              <p className="mt-1 text-[13px] leading-snug text-zinc-200">{item.title}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className={profileCardClass}>
        <div className="flex items-center gap-3.5 sm:gap-4">
          <CabinetMobileQr
            label={t("profile.overview.sidebar.appScan")}
            className="mx-0 mt-0 size-[4.75rem] w-[4.75rem] max-w-none shrink-0 p-1.5 sm:size-20 sm:w-20"
          />
          <div className="min-w-0">
            <p className="text-[15px] font-semibold text-white">{t("profile.overview.sidebar.appName")}</p>
            <p className="mt-1 text-[13px] leading-relaxed text-zinc-500">
              {t("profile.overview.sidebar.appScan")}
            </p>
          </div>
        </div>
      </section>
    </aside>
  );
}
