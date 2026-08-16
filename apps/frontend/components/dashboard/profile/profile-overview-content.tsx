"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Eye, EyeOff } from "@/lib/lucide";

import { ProductDemoBanner } from "@/components/shared/product-demo-banner";
import { ReadOnlySectionError } from "@/components/shared/data-states/read-only-section-error";
import { ACCOUNT_CENTER_RELATED_ROUTES } from "@/constants/dashboard/account-center";
import { ROUTES } from "@/constants/routes";
import { ProfileHoldingsEmpty, ProfileHoldingsList } from "@/components/dashboard/profile/profile-holdings-list";
import { ProfileOverviewIdentity } from "@/components/dashboard/profile/profile-overview-identity";
import { ProfileOverviewRates } from "@/components/dashboard/profile/profile-overview-rates";
import { ProfileOverviewSidebar } from "@/components/dashboard/profile/profile-overview-sidebar";
import { ProfileSectionSkeleton } from "@/components/dashboard/profile/profile-section-skeleton";
import {
  ProfileOkxSection,
  profileOkxGhostClass,
} from "@/components/dashboard/profile/profile-okx";
import { SplitonCtaPill } from "@/components/ui/spliton-cta-pill";
import { PAYOUTS_OVERVIEW_ICONS } from "@/constants/assets/payouts-overview-icons";
import { useAuth } from "@/components/providers/auth-provider";
import { useI18n } from "@/components/providers/i18n-provider";
import { formatUsdtRu } from "@/lib/wallet/format-money";
import {
  fetchUserMe,
  type AccountCenterSummary,
  type UserMeProfile,
} from "@/services/user-me.service";
import {
  fetchWalletSummary,
  listUserHoldings,
  type UserHoldingItem,
} from "@/services/wallet.service";
import {
  PROFILE_DEMO_BALANCE,
  PROFILE_DEMO_HOLDINGS,
} from "@/lib/demo/cabinet-demo-preview";
import { useCabinetDemoPreview } from "@/hooks/use-cabinet-demo-preview";
import { isAccountCenterDemoMode, isLiveAccountEnabled } from "@/lib/public-env";

function stripUsdtSuffix(value: string): string {
  return value.replace(/\s*USDT\s*$/i, "").trim();
}

function OverviewSkeleton() {
  return (
    <div className="grid gap-3 sm:gap-4 lg:grid-cols-[minmax(0,1fr)_min(18.75rem,28vw)]" aria-busy="true">
      <div className="space-y-3 sm:space-y-4">
        <div className="h-20 animate-pulse rounded-2xl bg-white/[0.06]" />
        <div className="h-56 animate-pulse rounded-2xl bg-white/[0.06]" />
      </div>
      <div className="hidden space-y-3 lg:block">
        <div className="h-32 animate-pulse rounded-2xl bg-white/[0.06]" />
        <div className="h-28 animate-pulse rounded-2xl bg-white/[0.06]" />
      </div>
    </div>
  );
}

export function ProfileOverviewContent() {
  const { user, authorizedFetch, isAuthenticated } = useAuth();
  const { t, locale } = useI18n();
  const preferDemo = useCabinetDemoPreview();
  const live = isLiveAccountEnabled() && isAuthenticated && !preferDemo;
  const demo = isAccountCenterDemoMode() || preferDemo;

  const [meProfile, setMeProfile] = useState<UserMeProfile | null>(null);
  const [accountCenter, setAccountCenter] = useState<AccountCenterSummary | null>(null);
  const [profileLoading, setProfileLoading] = useState(live);
  const [profileError, setProfileError] = useState<unknown>(null);

  const [balanceHidden, setBalanceHidden] = useState(false);
  const [availableBalance, setAvailableBalance] = useState<string | null>(null);
  const [holdings, setHoldings] = useState<UserHoldingItem[]>([]);
  const [holdingsLoading, setHoldingsLoading] = useState(false);
  const [walletLoadError, setWalletLoadError] = useState<unknown>(null);

  useEffect(() => {
    if (!live) {
      setProfileLoading(false);
      return;
    }
    setProfileLoading(true);
    setProfileError(null);
    void fetchUserMe(authorizedFetch)
      .then((me) => {
        setMeProfile(me);
        setAccountCenter(me.accountCenter ?? null);
      })
      .catch((e) => {
        setMeProfile(null);
        setAccountCenter(null);
        setProfileError(e);
      })
      .finally(() => setProfileLoading(false));
  }, [authorizedFetch, live, t]);

  useEffect(() => {
    if (!live) return;
    setWalletLoadError(null);
    setHoldingsLoading(true);
    void Promise.all([
      fetchWalletSummary(authorizedFetch),
      listUserHoldings(authorizedFetch),
    ])
      .then(([s, h]) => {
        setAvailableBalance(s.availableBalance);
        setHoldings(h.items);
      })
      .catch((e) => {
        setAvailableBalance(null);
        setHoldings([]);
        setWalletLoadError(e);
      })
      .finally(() => setHoldingsLoading(false));
  }, [authorizedFetch, live, t]);

  if (live && profileLoading) {
    return <OverviewSkeleton />;
  }

  const displayName =
    meProfile?.profile?.displayName?.trim() || user?.profile?.displayName?.trim() || null;
  const email = meProfile?.email?.trim() || user?.email?.trim() || null;
  const userId = meProfile?.id?.trim() || user?.id?.trim() || null;

  const balanceDisplay = balanceHidden
    ? "••••••"
    : live && availableBalance
      ? stripUsdtSuffix(formatUsdtRu(availableBalance, "USDT", locale))
      : live && walletLoadError
        ? "—"
        : demo
          ? stripUsdtSuffix(PROFILE_DEMO_BALANCE)
          : "—";
  const showUsdt = balanceDisplay !== "—";

  return (
    <div className="flex min-w-0 flex-col gap-3 sm:gap-4 [--profile-sticky-offset:7rem]">
      {demo ? <ProductDemoBanner messageKey="profile.overview.demoBanner" /> : null}

      {profileError ? (
        <ReadOnlySectionError
          sectionId="profile-overview"
          error={profileError}
          onRetry={() => {
            setProfileLoading(true);
            setProfileError(null);
            void fetchUserMe(authorizedFetch)
              .then((me) => {
                setMeProfile(me);
                setAccountCenter(me.accountCenter ?? null);
              })
              .catch((e) => {
                setMeProfile(null);
                setAccountCenter(null);
                setProfileError(e);
              })
              .finally(() => setProfileLoading(false));
          }}
        />
      ) : null}

      {live && !accountCenter && !profileError ? (
        <p className="rounded-2xl bg-amber-500/10 px-4 py-3 text-sm text-amber-200" role="status">
          {t("profile.overview.accountSummaryUnavailable")}
        </p>
      ) : null}

      <div className="grid gap-3 sm:gap-4 lg:grid-cols-[minmax(0,1fr)_min(18.75rem,28vw)] lg:items-start">
        <div className="flex min-w-0 flex-col gap-3 sm:gap-4">
          <ProfileOverviewIdentity
            displayName={displayName}
            email={email}
            userId={userId}
            kycStatus={accountCenter?.verification.status ?? (demo ? "APPROVED" : null)}
            securityLevel={accountCenter?.security.level ?? (demo ? "MEDIUM" : null)}
            fallbackName={t("profile.overview.displayNameFallback")}
          />

          <section
            className="relative isolate overflow-hidden rounded-[1.35rem] bg-black px-5 py-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.14)] sm:rounded-[1.75rem] sm:px-8 sm:py-8"
            aria-label={t("profile.overview.valuationLabel")}
          >
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage: `url('${PAYOUTS_OVERVIEW_ICONS.compareTexture}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                opacity: 0.88,
              }}
              aria-hidden
            />
            <div className="pointer-events-none absolute inset-0 bg-black/60" aria-hidden />

            <div className="relative z-10">
              <div className="flex items-center gap-2">
                <p className="text-[13px] font-medium text-white/55">
                  {t("profile.overview.valuationLabel")}
                </p>
                <button
                  type="button"
                  onClick={() => setBalanceHidden((v) => !v)}
                  className="inline-flex size-7 items-center justify-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white"
                  aria-label={balanceHidden ? t("profile.overview.showBalance") : t("profile.overview.hideBalance")}
                >
                  {balanceHidden ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              <p className="mt-2 font-mono text-[2rem] font-semibold leading-none tracking-tight text-white sm:text-[2.5rem]">
                {balanceDisplay}
                {showUsdt ? (
                  <span className="ml-2 text-[1rem] font-medium text-white/45 sm:text-[1.15rem]">USDT</span>
                ) : null}
              </p>
              {walletLoadError ? (
                <div className="mt-3">
                  <ReadOnlySectionError
                    sectionId="profile-overview-wallet"
                    error={walletLoadError}
                    onRetry={() => {
                      setWalletLoadError(null);
                      setHoldingsLoading(true);
                      void Promise.all([
                        fetchWalletSummary(authorizedFetch),
                        listUserHoldings(authorizedFetch),
                      ])
                        .then(([s, h]) => {
                          setAvailableBalance(s.availableBalance);
                          setHoldings(h.items);
                        })
                        .catch((e) => {
                          setAvailableBalance(null);
                          setHoldings([]);
                          setWalletLoadError(e);
                        })
                        .finally(() => setHoldingsLoading(false));
                    }}
                    compact
                  />
                </div>
              ) : null}

              <div className="mt-6 flex flex-wrap gap-2">
                <SplitonCtaPill
                  href={`${ROUTES.dashboardPayouts}/deposit`}
                  tone="onDark"
                  variant="accent"
                  withArrow={false}
                  className="h-10 min-w-0 px-4 text-[13px]"
                >
                  {t("profile.overview.quickActions.deposit")}
                </SplitonCtaPill>
                <SplitonCtaPill
                  href={ROUTES.dashboardPayoutsHistory}
                  tone="onDark"
                  variant="ghost"
                  withArrow={false}
                  className="h-10 min-w-0 px-4 text-[13px]"
                >
                  {t("profile.overview.withdraw")}
                </SplitonCtaPill>
                <SplitonCtaPill
                  href={ROUTES.dashboardCatalog}
                  tone="onDark"
                  variant="ghost"
                  withArrow={false}
                  className="h-10 min-w-0 px-4 text-[13px]"
                >
                  {t("profile.overview.quickActions.buy")}
                </SplitonCtaPill>
              </div>

              <div className="mt-6 flex flex-col gap-4 border-t border-white/[0.08] pt-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 max-w-md">
                  <p className="text-[15px] font-semibold text-white">{t("profile.overview.assetsOverviewLink")}</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-white/45">
                    {t("profile.overview.chartComingSoonHint")}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <SplitonCtaPill
                    href={ACCOUNT_CENTER_RELATED_ROUTES.walletOverview}
                    tone="onDark"
                    variant="primary"
                    withArrow={false}
                    className="h-10 min-w-0 px-4 text-[13px]"
                  >
                    {t("profile.overview.assetsOverviewLink")}
                  </SplitonCtaPill>
                  <SplitonCtaPill
                    href={ROUTES.dashboardPositions}
                    tone="onDark"
                    variant="ghost"
                    withArrow={false}
                    className="h-10 min-w-0 px-4 text-[13px]"
                  >
                    {t("profile.overview.holdingsViewAll")}
                  </SplitonCtaPill>
                </div>
              </div>
            </div>
          </section>

          {live || demo ? (
            <ProfileOkxSection
              title={live ? t("profile.overview.holdingsLiveTitle") : t("profile.overview.holdingsDemoTitle")}
              action={
                <Link href={ROUTES.dashboardPositions} className={profileOkxGhostClass}>
                  {t("profile.overview.holdingsViewAll")}
                </Link>
              }
            >
              {live && holdingsLoading ? (
                <div className="px-5 py-4 sm:px-6">
                  <ProfileSectionSkeleton variant="list" rows={3} />
                </div>
              ) : live && holdings.length === 0 ? (
                <ProfileHoldingsEmpty liveWallet />
              ) : (
                <ProfileHoldingsList
                  liveWallet={live && holdings.length > 0}
                  holdings={holdings}
                  demoRows={PROFILE_DEMO_HOLDINGS}
                />
              )}
            </ProfileOkxSection>
          ) : null}
        </div>

        <ProfileOverviewSidebar accountCenter={accountCenter} live={live} demo={demo} />
      </div>

      <ProfileOverviewRates />
    </div>
  );
}
