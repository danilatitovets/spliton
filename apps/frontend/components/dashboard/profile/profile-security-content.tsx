"use client";

import { SplitonLoadingView } from "@/components/ui/spliton-loader";
import { useCallback, useEffect, useState } from "react";

import { ProductDemoBanner } from "@/components/shared/product-demo-banner";
import { ReadOnlySectionError } from "@/components/shared/data-states/read-only-section-error";
import { ROUTES } from "@/constants/routes";
import { ProfilePasswordChangePanel } from "@/components/dashboard/profile/profile-password-change-panel";
import {
  ProfileOkxHeader,
  ProfileOkxRecommended,
  ProfileOkxRow,
  ProfileOkxSection,
  ProfileOkxSpotlight,
  ProfileOkxToggle,
} from "@/components/dashboard/profile/profile-okx";
import { PROFILE_GLASS, profileLineIcon } from "@/components/dashboard/profile/profile-shared";
import { SplitonCtaPill } from "@/components/ui/spliton-cta-pill";
import { ProfileSecurityEventsList } from "@/components/dashboard/profile/profile-security-events-list";
import { ProfileSessionsList } from "@/components/dashboard/profile/profile-sessions-list";
import { ProfileTwoFactorPanel } from "@/components/dashboard/profile/profile-two-factor-panel";
import { useAuth } from "@/components/providers/auth-provider";
import { useI18n } from "@/components/providers/i18n-provider";
import { formatDate } from "@/lib/i18n/formatters";
import { profileSecurityLastActive } from "@/lib/i18n/profile-messages";
import {
  formatSecurityEventIp,
  parseUserAgentShort,
  securityLevelBadgeLabel,
  securityRecommendationText,
} from "@/lib/profile/security-labels";
import { isAccountCenterDemoMode, isLiveAccountEnabled } from "@/lib/public-env";
import {
  fetchNotificationPreferences,
  patchNotificationPreferences,
} from "@/services/notifications.service";
import {
  fetchSecurityEvents,
  fetchSecurityPreferences,
  fetchUserMe,
  fetchUserSessions,
  logoutAllUserSessions,
  patchSecurityPreferences,
  revokeUserSession,
  type AccountCenterSummary,
  type SecurityEventItem,
  type UserSecurityPreferences,
} from "@/services/user-me.service";
import type { SecuritySessionRow } from "@/constants/dashboard/profile-security";

function maskEmail(email: string | undefined | null): string {
  if (!email) return "—";
  const [user, domain] = email.split("@");
  if (!user || !domain) return email;
  const visible = user.slice(0, Math.min(3, user.length));
  return `${visible}***@${domain}`;
}

function looksLikeUserAgent(value: string): boolean {
  return /mozilla\/|applewebkit|chrome\/|safari\/|gecko\//i.test(value) || value.length > 64;
}

function mapApiSessions(
  items: Awaited<ReturnType<typeof fetchUserSessions>>["items"],
  locale: import("@/lib/i18n/types").AppLocale,
  browserLabel: string,
): SecuritySessionRow[] {
  if (items.length === 0) return [];
  const active = items.filter((s) => s.active);
  const sorted = [...active].sort(
    (a, b) => new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime(),
  );
  return sorted.map((row, index) => {
    const rawDevice = row.device?.trim() ?? "";
    const device =
      rawDevice && !looksLikeUserAgent(rawDevice)
        ? rawDevice
        : parseUserAgentShort(row.userAgent || rawDevice, locale) || browserLabel;
    const anyCurrent = sorted.some((s) => s.isCurrent);
    return {
      id: row.id,
      device,
      location: "—",
      ip: formatSecurityEventIp(row.ip, locale) ?? "—",
      lastActive: profileSecurityLastActive(row.lastActiveAt, locale),
      current: anyCurrent ? Boolean(row.isCurrent) : index === 0,
    };
  });
}

export function ProfileSecurityContent() {
  const { user, authorizedFetch, isAuthenticated, resendEmail } = useAuth();
  const { locale, t } = useI18n();
  const live = isLiveAccountEnabled() && isAuthenticated;
  const demo = isAccountCenterDemoMode();

  const [loading, setLoading] = useState(live);
  const [loadError, setLoadError] = useState<unknown>(null);
  const [accountCenter, setAccountCenter] = useState<AccountCenterSummary | null>(null);
  const [emailVerified, setEmailVerified] = useState(true);
  const [twoFaEnabled, setTwoFaEnabled] = useState(false);
  const [passwordChangedAt, setPasswordChangedAt] = useState<string | null>(null);
  const [passwordSet, setPasswordSet] = useState(true);

  const [sessions, setSessions] = useState<SecuritySessionRow[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEventItem[]>([]);
  const [prefs, setPrefs] = useState<UserSecurityPreferences | null>(null);
  const [emailSecurityEnabled, setEmailSecurityEnabled] = useState(true);
  const [prefsSaving, setPrefsSaving] = useState<string | null>(null);
  const [prefsError, setPrefsError] = useState<string | null>(null);

  const [passwordPanelOpen, setPasswordPanelOpen] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [resendBusy, setResendBusy] = useState(false);
  const [resendMsg, setResendMsg] = useState<string | null>(null);
  const [sessionsError, setSessionsError] = useState<string | null>(null);
  const [userTimezone, setUserTimezone] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    if (!live) {
      setLoading(false);
      setSessions([]);
      setTwoFaEnabled(false);
      setEmailVerified(true);
      return;
    }
    setLoading(true);
    setLoadError(null);
    setSessionsError(null);
    try {
      const [me, sessionData, events, secPrefs, notifPrefs] = await Promise.all([
        fetchUserMe(authorizedFetch),
        fetchUserSessions(authorizedFetch),
        fetchSecurityEvents(authorizedFetch),
        fetchSecurityPreferences(authorizedFetch),
        fetchNotificationPreferences(authorizedFetch),
      ]);
      const ac = me.accountCenter ?? null;
      setAccountCenter(ac);
      setEmailVerified(Boolean(ac?.security.emailVerified ?? me.emailVerified));
      setTwoFaEnabled(Boolean(ac?.security.twoFactorEnabled ?? me.security?.twoFaEnabled));
      setPasswordChangedAt(ac?.security.passwordChangedAt ?? null);
      setPasswordSet(Boolean(ac?.security.passwordSet ?? true));
      setUserTimezone(me.profile?.timezone?.trim() || "Europe/Moscow");
      setSessions(mapApiSessions(sessionData.items, locale, t("profile.security.session.browser")));
      setSecurityEvents(events.items);
      setPrefs(secPrefs);
      setEmailSecurityEnabled(Boolean(notifPrefs.emailSecurity ?? true));
    } catch (err) {
      setLoadError(err);
      setAccountCenter(null);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, [authorizedFetch, live, locale, t]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const security = accountCenter?.security;
  const level = security?.level ?? "LOW";
  const topRec = security?.recommendations?.find((r) => !r.isCompleted);
  const score = security?.score ?? (demo ? 55 : 0);
  const maxScore = security?.maxScore ?? 100;

  const patchPref = useCallback(
    async (key: keyof UserSecurityPreferences | "emailSecurity", value: boolean) => {
      if (!live) return;
      setPrefsError(null);
      setPrefsSaving(key);
      try {
        if (key === "emailSecurity") {
          const updated = await patchNotificationPreferences(authorizedFetch, { emailSecurity: value });
          setEmailSecurityEnabled(Boolean(updated.emailSecurity));
        } else {
          const updated = await patchSecurityPreferences(authorizedFetch, { [key]: value });
          setPrefs(updated);
        }
        await loadAll();
      } catch {
        setPrefsError(t("profile.security.preferences.saveError"));
      } finally {
        setPrefsSaving(null);
      }
    },
    [authorizedFetch, live, loadAll, t],
  );

  const handleResendEmail = useCallback(async () => {
    if (!user?.email) return;
    setResendBusy(true);
    setResendMsg(null);
    try {
      await resendEmail(user.email);
      setResendMsg(t("profile.security.email.resendSuccess"));
    } catch {
      setResendMsg(t("profile.security.email.resendError"));
    } finally {
      setResendBusy(false);
    }
  }, [resendEmail, t, user?.email]);

  const revoke = useCallback(
    (id: string) => {
      if (!live) return;
      void revokeUserSession(authorizedFetch, id)
        .then(() => loadAll())
        .catch(() => setSessionsError(t("profile.security.revokeError")));
    },
    [authorizedFetch, live, loadAll, t],
  );

  const logoutOthers = useCallback(() => {
    if (!live) return;
    void logoutAllUserSessions(authorizedFetch)
      .then(() => loadAll())
      .catch(() => setSessionsError(t("profile.security.revokeAllError")));
  }, [authorizedFetch, live, loadAll, t]);

  const passwordMeta = passwordChangedAt
    ? t("profile.security.password.changedAt").replace(
        "{date}",
        formatDate(new Date(passwordChangedAt), locale, {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }),
      )
    : t("profile.security.password.neverChanged");

  const statusText =
    live && security
      ? `${securityLevelBadgeLabel(level, locale)}${topRec ? ` / ${securityRecommendationText(topRec.code, locale).title}` : ""}`
      : t("profile.security.demoDescription");

  const emailDescription = [maskEmail(user?.email), resendMsg].filter(Boolean).join(". ");

  if (live && loading) {
    return (
      <SplitonLoadingView
        variant="dark"
        size="lg"
        minHeight="min-h-[40vh]"
        label={t("common.loading")}
        className="bg-transparent"
      />
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      {demo ? <ProductDemoBanner messageKey="profile.security.demoBanner" /> : null}

      {loadError ? (
        <ReadOnlySectionError
          sectionId="profile-security"
          error={loadError}
          onRetry={() => void loadAll()}
        />
      ) : null}

      {passwordSuccess ? (
        <p className="rounded-xl bg-[#B7F500]/12 px-4 py-3 text-sm text-[#B7F500]" role="status">
          {t("profile.security.password.success")}
        </p>
      ) : null}

      <ProfileOkxHeader
        score={score}
        scoreMax={maxScore}
        title={t("profile.security.protectionLevel")}
        subtitle={statusText}
        cta={
          <SplitonCtaPill
            type="button"
            tone="onDark"
            className="min-w-[12rem]"
            onClick={() =>
              document.getElementById("security-auth")?.scrollIntoView({ behavior: "smooth", block: "start" })
            }
          >
            {t("profile.okx.increase")}
          </SplitonCtaPill>
        }
      />

      <ProfileOkxSpotlight
        icon={PROFILE_GLASS.securitySpotlight}
        headline={t("profile.okx.spotlight.security.headline")}
        body={t("profile.okx.spotlight.security.body")}
        detailsHref={ROUTES.trust}
        detailsLabel={t("profile.okx.details")}
        cta={
          <SplitonCtaPill
            type="button"
            tone="onDark"
            className="w-full min-w-0"
            onClick={() =>
              document.getElementById("security-2fa")?.scrollIntoView({ behavior: "smooth", block: "start" })
            }
          >
            {t("profile.okx.setup")}
          </SplitonCtaPill>
        }
      />

      <ProfileOkxSection id="security-auth" title={t("profile.okx.authMethods")}>
        <ProfileOkxRow
          icon={profileLineIcon("email")}
          title={t("profile.security.email.title")}
          description={emailDescription}
          badge={
            emailVerified ? (
              <ProfileOkxRecommended>{t("profile.security.email.verified")}</ProfileOkxRecommended>
            ) : undefined
          }
          action={
            live && !emailVerified ? (
              <SplitonCtaPill
                type="button"
                tone="onDark"
                disabled={resendBusy}
                onClick={() => void handleResendEmail()}
                className="min-w-[9.5rem]"
              >
                {resendBusy ? t("profile.security.email.resendSending") : t("profile.okx.setup")}
              </SplitonCtaPill>
            ) : undefined
          }
        />
        <ProfileOkxRow
          icon={profileLineIcon("password")}
          title={t("profile.security.password.title")}
          description={passwordMeta}
          action={
            live && passwordSet ? (
              <SplitonCtaPill
                type="button"
                tone="onDark"
                onClick={() => setPasswordPanelOpen(true)}
                className="min-w-[9.5rem]"
              >
                {t("profile.okx.change")}
              </SplitonCtaPill>
            ) : undefined
          }
        />
        <ProfileOkxRow
          id="security-2fa"
          icon={profileLineIcon("twoFa")}
          title={t("profile.security.twoFa.title")}
          description={t("profile.security.twoFa.descriptionShort")}
          badge={
            twoFaEnabled ? undefined : (
              <ProfileOkxRecommended>{t("profile.okx.new")}</ProfileOkxRecommended>
            )
          }
          action={
            live ? (
              <ProfileTwoFactorPanel
                enabled={twoFaEnabled}
                onEnabledChange={(v) => {
                  setTwoFaEnabled(v);
                  void loadAll();
                }}
              />
            ) : (
              <span className="text-xs font-medium text-zinc-500">{t("profile.security.twoFa.disabled")}</span>
            )
          }
        />
      </ProfileOkxSection>

      <ProfilePasswordChangePanel
        open={passwordPanelOpen}
        onOpenChange={setPasswordPanelOpen}
        onSuccess={() => {
          setPasswordSuccess(true);
          void loadAll();
        }}
      />

      <ProfileOkxSection id="security-advanced" title={t("profile.okx.advanced")}>
        <ProfileOkxRow
          icon={profileLineIcon("email")}
          title={t("profile.security.withdrawEmail.title")}
          description={t("profile.security.withdrawEmail.descriptionShort")}
          action={
            <ProfileOkxToggle
              id="withdraw-email"
              checked={prefs?.withdrawalEmailConfirmationEnabled ?? false}
              onChange={live ? (v) => void patchPref("withdrawalEmailConfirmationEnabled", v) : undefined}
              disabled={!live || prefsSaving === "withdrawalEmailConfirmationEnabled"}
            />
          }
        />
        <ProfileOkxRow
          icon={profileLineIcon("whitelist")}
          title={t("profile.security.whitelist.title")}
          description={t("profile.security.whitelist.descriptionShort")}
          badge={<ProfileOkxRecommended>{t("profile.okx.recommended")}</ProfileOkxRecommended>}
          action={
            <ProfileOkxToggle
              id="whitelist"
              checked={prefs?.withdrawalAddressWhitelistEnabled ?? false}
              onChange={live ? (v) => void patchPref("withdrawalAddressWhitelistEnabled", v) : undefined}
              disabled={!live || prefsSaving === "withdrawalAddressWhitelistEnabled"}
            />
          }
        />
        <ProfileOkxRow
          icon={profileLineIcon("alert")}
          title={t("profile.security.alertNewDevice.title")}
          description={t("profile.security.alertNewDevice.descriptionShort")}
          action={
            <ProfileOkxToggle
              id="al-dev"
              checked={prefs?.suspiciousLoginAlertsEnabled ?? true}
              onChange={live ? (v) => void patchPref("suspiciousLoginAlertsEnabled", v) : undefined}
              disabled={!live || prefsSaving === "suspiciousLoginAlertsEnabled"}
            />
          }
        />
        <ProfileOkxRow
          icon={profileLineIcon("email")}
          title={t("profile.security.preferences.emailSecurity.title")}
          description={t("profile.security.preferences.emailSecurity.descriptionShort")}
          action={
            <ProfileOkxToggle
              id="email-sec"
              checked={emailSecurityEnabled}
              onChange={live ? (v) => void patchPref("emailSecurity", v) : undefined}
              disabled={!live || prefsSaving === "emailSecurity"}
            />
          }
        />
        <ProfileOkxRow
          icon={profileLineIcon("withdraw")}
          title={t("profile.security.withdrawManageLink")}
          description={t("profile.security.balance.descriptionShort")}
          action={
            <SplitonCtaPill href={ROUTES.dashboardPayouts} tone="onDark" className="min-w-[9.5rem]">
              {t("profile.okx.manage")}
            </SplitonCtaPill>
          }
        />
        {prefsError ? (
          <p className="px-4 py-3 text-xs text-red-400 sm:px-5" role="alert">
            {prefsError}
          </p>
        ) : null}
      </ProfileOkxSection>

      <ProfileOkxSection
        title={t("profile.okx.devices")}
        description={t("profile.security.access.descriptionShort")}
      >
        {sessionsError ? (
          <p className="px-5 py-3 text-xs text-red-300 sm:px-6" role="alert">
            {String(sessionsError)}
          </p>
        ) : null}
        <ProfileSessionsList sessions={sessions} onRevoke={revoke} live={live} />
        {live ? (
          <div className="px-5 py-4 sm:px-6">
            <SplitonCtaPill type="button" tone="onDark" onClick={logoutOthers} className="w-full min-w-0 sm:w-auto">
              {t("profile.security.revokeAll")}
            </SplitonCtaPill>
          </div>
        ) : null}
      </ProfileOkxSection>

      {live ? (
        <ProfileOkxSection title={t("profile.security.events.title")}>
          <ProfileSecurityEventsList events={securityEvents} timeZone={userTimezone} />
        </ProfileOkxSection>
      ) : null}

      <ProfileOkxSection title={t("profile.okx.account")}>
        <ProfileOkxRow
          icon={profileLineIcon("password")}
          title={t("profile.security.recoverAccess")}
          action={
            <SplitonCtaPill href={ROUTES.forgotPassword} tone="onDark" className="min-w-[9.5rem]">
              {t("profile.okx.manage")}
            </SplitonCtaPill>
          }
        />
        <ProfileOkxRow
          icon={profileLineIcon("support")}
          title={t("profile.security.reportSuspicious")}
          action={
            <SplitonCtaPill href={ROUTES.dashboardSupport} tone="onDark" className="min-w-[9.5rem]">
              {t("profile.okx.use")}
            </SplitonCtaPill>
          }
        />
      </ProfileOkxSection>
    </div>
  );
}
