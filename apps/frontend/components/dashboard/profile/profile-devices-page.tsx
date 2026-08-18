"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { ProductDemoBanner } from "@/components/shared/product-demo-banner";
import { ProfileOkxDetails } from "@/components/dashboard/profile/profile-okx";
import {
  ProfileSessionGroup,
  ProfileSessionsList,
} from "@/components/dashboard/profile/profile-sessions-list";
import { PROFILE_GLASS, ProfileGlassIcon } from "@/components/dashboard/profile/profile-shared";
import { profileDashboardSecurityHref } from "@/constants/dashboard/profile-page";
import { MOCK_SECURITY_SESSIONS, type SecuritySessionRow } from "@/constants/dashboard/profile-security";
import { ROUTES } from "@/constants/routes";
import { useAuthUi } from "@/hooks/use-auth-ui";
import { ProfileSectionSkeleton } from "@/components/dashboard/profile/profile-section-skeleton";
import { ProfileSignInRequired } from "@/components/dashboard/profile/profile-sign-in-required";
import { useI18n } from "@/components/providers/i18n-provider";
import { AlertTriangle, ChevronRight } from "@/lib/lucide";
import { mapUserSessionsToRows } from "@/lib/profile/user-sessions";
import { isAccountCenterDemoMode, isLiveAccountEnabled } from "@/lib/public-env";
import { fetchUserSessions, logoutAllUserSessions, revokeUserSession } from "@/services/user-me.service";
import { SplitonCtaPill } from "@/components/ui/spliton-cta-pill";
import { SplitonLoadingView } from "@/components/ui/spliton-loader";

export function ProfileDevicesPageContent() {
  const { authorizedFetch, authenticated, pending } = useAuthUi();
  const { locale, t } = useI18n();
  const live = isLiveAccountEnabled() && authenticated;
  const demo = isAccountCenterDemoMode();

  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<SecuritySessionRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const securityHref = profileDashboardSecurityHref();
  const browserLabel = t("profile.security.session.browser");
  const current = sessions.filter((row) => row.current);
  const others = sessions.filter((row) => !row.current);

  const load = useCallback(async () => {
    if (pending) return;
    if (!live) {
      if (demo && authenticated) setSessions(MOCK_SECURITY_SESSIONS);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await fetchUserSessions(authorizedFetch);
      setSessions(mapUserSessionsToRows(result.items, locale, browserLabel));
    } catch {
      setError(t("profile.devices.loadError"));
    } finally {
      setLoading(false);
    }
  }, [authenticated, authorizedFetch, browserLabel, demo, live, locale, pending, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const revoke = (id: string) => {
    if (!live) return;
    void revokeUserSession(authorizedFetch, id)
      .then(() => {
        setSessions((prev) => prev.filter((row) => row.id !== id));
      })
      .catch(() => setActionError(t("profile.security.revokeError")));
  };

  const logoutOthers = () => {
    if (!live) return;
    void logoutAllUserSessions(authorizedFetch)
      .then(() => void load())
      .catch(() => setActionError(t("profile.security.revokeAllError")));
  };

  if (pending || (live && loading)) {
    return <ProfileSectionSkeleton variant="list" rows={4} />;
  }

  if (!authenticated && !demo) {
    return <ProfileSignInRequired titleKey="profile.devices.signInRequired" />;
  }

  return (
    <div className="space-y-6 pb-8 sm:space-y-8">
      {demo ? <ProductDemoBanner messageKey="profile.security.demoBanner" /> : null}

      <nav aria-label={t("profile.devices.breadcrumbAria")}>
        <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[12px] text-zinc-500">
          <li>
            <Link href={ROUTES.dashboardProfile} className="transition hover:text-white">
              {t("profile.devices.breadcrumbProfile")}
            </Link>
          </li>
          <li className="flex items-center gap-1.5">
            <ChevronRight className="size-3 shrink-0 text-zinc-600" aria-hidden />
            <Link href={securityHref} className="transition hover:text-white">
              {t("profile.devices.breadcrumbSecurity")}
            </Link>
          </li>
          <li className="flex items-center gap-1.5">
            <ChevronRight className="size-3 shrink-0 text-zinc-600" aria-hidden />
            <span aria-current="page" className="font-medium text-zinc-300">
              {t("profile.devices.title")}
            </span>
          </li>
        </ol>
      </nav>

      <section className="px-2 py-4 text-center sm:py-6">
        <div className="mx-auto flex justify-center">
          <ProfileGlassIcon src={PROFILE_GLASS.device} size="xl" />
        </div>
        <h1 className="mt-5 text-[clamp(1.5rem,3.5vw,2rem)] font-semibold tracking-tight text-white">
          {t("profile.devices.title")}
        </h1>
        <p className="mx-auto mt-2 max-w-[42ch] text-[14px] leading-relaxed text-zinc-400">
          {t("profile.security.sessions.intro")}
        </p>
        {live && others.length > 0 ? (
          <div className="mx-auto mt-6 max-w-[22rem]">
            <SplitonCtaPill type="button" tone="onDark" onClick={logoutOthers} className="w-full">
              {t("profile.security.revokeAll")}
            </SplitonCtaPill>
          </div>
        ) : null}
      </section>

      <div
        className="flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/[0.08] px-4 py-3.5 sm:px-5"
        role="status"
      >
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-300" aria-hidden />
        <p className="text-[13px] leading-relaxed text-amber-100/90">
          {t("profile.devices.alertPrefix")}{" "}
          <Link href={`${securityHref}#security-auth`} className="font-medium text-white underline underline-offset-2">
            {t("profile.devices.alertChangePassword")}
          </Link>{" "}
          {t("profile.devices.alertMiddle")}{" "}
          <Link href={ROUTES.dashboardSupport} className="font-medium text-white underline underline-offset-2">
            {t("profile.devices.alertSupport")}
          </Link>
          .
        </p>
      </div>

      {error ? (
        <div className="flex flex-col gap-3 rounded-2xl bg-red-500/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-red-300" role="alert">
            {error}
          </p>
          <SplitonCtaPill type="button" tone="onDark" variant="ghost" withArrow={false} onClick={() => void load()}>
            {t("actions.retry")}
          </SplitonCtaPill>
        </div>
      ) : null}

      {actionError ? (
        <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300" role="alert">
          {actionError}
        </p>
      ) : null}

      {loading ? (
        <SplitonLoadingView
          variant="dark"
          size="md"
          minHeight="min-h-[24vh]"
          label={t("profile.security.sessionsLoading")}
          className="bg-transparent"
        />
      ) : sessions.length === 0 ? (
        <p className="rounded-2xl bg-[#1c1c1c] px-5 py-10 text-center text-[14px] text-zinc-500">
          {t("profile.security.sessions.empty")}
        </p>
      ) : (
        <div className="space-y-6">
          {current.length > 0 ? (
            <ProfileSessionGroup title={t("profile.security.sessions.thisDevice")}>
              <ProfileSessionsList sessions={current} onRevoke={revoke} live={live} showIp />
            </ProfileSessionGroup>
          ) : null}
          {others.length > 0 ? (
            <ProfileSessionGroup title={t("profile.security.sessions.otherDevices")}>
              <ProfileSessionsList sessions={others} onRevoke={revoke} live={live} showIp />
            </ProfileSessionGroup>
          ) : null}
        </div>
      )}

      <p className="px-1 text-[13px] leading-relaxed text-zinc-500">
        {t("profile.security.sessions.help")}{" "}
        <ProfileOkxDetails href={ROUTES.dashboardSupport}>{t("profile.okx.details")}</ProfileOkxDetails>
      </p>
    </div>
  );
}
