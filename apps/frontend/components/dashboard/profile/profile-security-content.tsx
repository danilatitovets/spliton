"use client";

import { SplitonLoadingView } from "@/components/ui/spliton-loader";
import { useCallback, useEffect, useMemo, useState } from "react";

import { SplitonDarkSurface } from "@/components/dashboard/assets/spliton-dark-surface";
import { ProductDemoBanner } from "@/components/shared/product-demo-banner";
import { ROUTES } from "@/constants/routes";
import { MOCK_SECURITY_SESSIONS, type SecuritySessionRow } from "@/constants/dashboard/profile-security";
import { ProfilePasswordChangePanel } from "@/components/dashboard/profile/profile-password-change-panel";
import {
  ProfileOkxBanner,
  ProfileOkxRecommended,
  ProfileOkxRow,
  ProfileOkxSection,
  ProfileOkxToggle,
} from "@/components/dashboard/profile/profile-okx";
import { BRAND } from "@/constants/brand";
import { profileLineIcon } from "@/components/dashboard/profile/profile-shared";
import { SplitonCtaPill } from "@/components/ui/spliton-cta-pill";
import { ProfileSessionsPanel } from "@/components/dashboard/profile/profile-sessions-panel";
import { ProfileTwoFactorPanel } from "@/components/dashboard/profile/profile-two-factor-panel";
import { useAuthUi } from "@/hooks/use-auth-ui";
import { ProfileSignInRequired } from "@/components/dashboard/profile/profile-sign-in-required";
import { ProfileApiOrGenericError } from "@/components/dashboard/profile/profile-support-copy";
import { ProfileUnderlineTabs } from "@/components/dashboard/profile/profile-underline-tabs";
import { useI18n } from "@/components/providers/i18n-provider";
import { formatDate } from "@/lib/i18n/formatters";
import { formatApiError } from "@/lib/i18n/format-api-error";
import { mapUserSessionsToRows } from "@/lib/profile/user-sessions";
import { securityRecommendationText } from "@/lib/profile/security-labels";
import { isAccountCenterDemoMode, isLiveAccountEnabled } from "@/lib/public-env";
import { fetchNotificationPreferences } from "@/services/notifications.service";
import {
  fetchSecurityPreferences,
  fetchUserMe,
  fetchUserSessions,
  logoutAllUserSessions,
  patchSecurityPreferences,
  revokeUserSession,
  type AccountCenterSummary,
  type UserSecurityPreferences,
} from "@/services/user-me.service";

const SECURITY_HERO_VIDEO = "/videos/position-holding-bg.mp4";

type SecurityTab = "login" | "sessions" | "withdraw";
const SECURITY_TABS: SecurityTab[] = ["login", "sessions", "withdraw"];

function maskEmail(email: string | undefined | null): string {
  if (!email) return "—";
  const [user, domain] = email.split("@");
  if (!user || !domain) return email;
  const visible = user.slice(0, Math.min(3, user.length));
  return `${visible}***@${domain}`;
}

function demoAccountCenter(): AccountCenterSummary {
  return {
    accountCompleteness: {
      score: 55,
      maxScore: 100,
      level: "MEDIUM",
      completedItems: [],
      missingItems: [],
    },
    security: {
      score: 62,
      maxScore: 100,
      level: "MEDIUM",
      recommendations: [
        {
          code: "ENABLE_2FA",
          title: "",
          description: "",
          severity: "HIGH",
          isCompleted: false,
        },
      ],
      emailVerified: true,
      twoFactorEnabled: false,
      passwordSet: true,
      passwordChangedAt: null,
    },
    verification: { status: "NOT_STARTED" },
    legal: { missingRequiredConsentsCount: 0, hasAcceptedCurrentRequiredPolicies: true },
    activity: {},
    securityPreferences: {
      withdrawalEmailConfirmationEnabled: true,
      withdrawalAddressWhitelistEnabled: false,
      suspiciousLoginAlertsEnabled: true,
      emailSecurityNotificationsEnabled: true,
      enforcementReady: false,
    },
    recentSecurityEvents: [],
  };
}

function fallbackAccountCenter(emailVerified: boolean): AccountCenterSummary {
  const demo = demoAccountCenter();
  return {
    ...demo,
    security: {
      ...demo.security,
      emailVerified,
      level: emailVerified ? "MEDIUM" : "LOW",
      score: emailVerified ? 50 : 35,
      recommendations: emailVerified
        ? demo.security.recommendations
        : [
            {
              code: "VERIFY_EMAIL",
              title: "",
              description: "",
              severity: "HIGH",
              isCompleted: false,
            },
            ...demo.security.recommendations,
          ],
    },
  };
}

export function ProfileSecurityContent() {
  const { user, authorizedFetch, authenticated, pending, resendEmail, requiresEmailVerification } = useAuthUi();
  const { locale, t } = useI18n();
  const live = isLiveAccountEnabled() && authenticated;
  const demo = isAccountCenterDemoMode();

  const [activeTab, setActiveTab] = useState<SecurityTab>("login");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [accountCenter, setAccountCenter] = useState<AccountCenterSummary | null>(
    demo ? demoAccountCenter() : null,
  );
  const [emailVerified, setEmailVerified] = useState(true);
  const [twoFaEnabled, setTwoFaEnabled] = useState(false);
  const [passwordChangedAt, setPasswordChangedAt] = useState<string | null>(null);
  const [passwordSet, setPasswordSet] = useState(true);

  const [sessions, setSessions] = useState<SecuritySessionRow[]>(demo ? MOCK_SECURITY_SESSIONS : []);
  const [prefs, setPrefs] = useState<UserSecurityPreferences | null>(null);
  const [emailSecurityEnabled, setEmailSecurityEnabled] = useState(true);
  const [prefsSaving, setPrefsSaving] = useState<string | null>(null);
  const [prefsError, setPrefsError] = useState<string | null>(null);

  const [passwordPanelOpen, setPasswordPanelOpen] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [resendBusy, setResendBusy] = useState(false);
  const [resendMsg, setResendMsg] = useState<string | null>(null);
  const [sessionsError, setSessionsError] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    if (pending) return;
    if (!live) {
      setLoading(false);
      if (demo && authenticated) {
        setAccountCenter(demoAccountCenter());
        setSessions(MOCK_SECURITY_SESSIONS);
        setEmailVerified(true);
        setTwoFaEnabled(false);
        setPasswordSet(true);
        setLoadError(null);
      }
      return;
    }

    setLoading(true);
    setSessionsError(null);
    try {
      const [meResult, sessionResult, secPrefsResult, notifPrefsResult] =
        await Promise.allSettled([
          fetchUserMe(authorizedFetch),
          fetchUserSessions(authorizedFetch),
          fetchSecurityPreferences(authorizedFetch),
          fetchNotificationPreferences(authorizedFetch),
        ]);

      if (meResult.status === "fulfilled") {
        const me = meResult.value;
        const ac = me.accountCenter ?? null;
        setAccountCenter(ac ?? fallbackAccountCenter(Boolean(me.emailVerified)));
        setEmailVerified(Boolean(ac?.security?.emailVerified ?? me.emailVerified));
        setTwoFaEnabled(Boolean(ac?.security?.twoFactorEnabled ?? me.security?.twoFaEnabled));
        setPasswordChangedAt(ac?.security?.passwordChangedAt ?? null);
        setPasswordSet(Boolean(ac?.security?.passwordSet ?? true));
        setLoadError(null);
      } else if (user || authenticated) {
        const verified = !requiresEmailVerification;
        setAccountCenter(fallbackAccountCenter(verified));
        setEmailVerified(verified);
        setTwoFaEnabled(false);
        setPasswordSet(true);
        setLoadError(null);
      } else {
        setAccountCenter(null);
        setLoadError(formatApiError(meResult.reason, locale) || t("profile.security.loadError"));
      }

      setSessions(
        sessionResult.status === "fulfilled"
          ? mapUserSessionsToRows(sessionResult.value.items, locale, t("profile.security.session.browser"))
          : [],
      );
      setPrefs(secPrefsResult.status === "fulfilled" ? secPrefsResult.value : null);
      setEmailSecurityEnabled(
        notifPrefsResult.status === "fulfilled"
          ? Boolean(notifPrefsResult.value.emailSecurity ?? true)
          : true,
      );
    } finally {
      setLoading(false);
    }
  }, [authenticated, authorizedFetch, demo, live, locale, pending, requiresEmailVerification, t, user?.id]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const security = accountCenter?.security;
  const topRec = security?.recommendations?.find((r) => !r.isCompleted);

  const patchPref = useCallback(
    async (key: keyof UserSecurityPreferences, value: boolean) => {
      if (!live) return;
      setPrefsError(null);
      setPrefsSaving(key);
      setPrefs((current) => ({
        withdrawalEmailConfirmationEnabled: current?.withdrawalEmailConfirmationEnabled ?? false,
        withdrawalAddressWhitelistEnabled: current?.withdrawalAddressWhitelistEnabled ?? false,
        suspiciousLoginAlertsEnabled: current?.suspiciousLoginAlertsEnabled ?? true,
        [key]: value,
      }));
      try {
        const updated = await patchSecurityPreferences(authorizedFetch, { [key]: value });
        setPrefs(updated);
      } catch (err) {
        setPrefs((current) =>
          current ? { ...current, [key]: !value } : current,
        );
        setPrefsError(formatApiError(err, locale) || t("profile.security.preferences.saveError"));
      } finally {
        setPrefsSaving(null);
      }
    },
    [authorizedFetch, live, locale, t],
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

  const topRecText = topRec ? securityRecommendationText(topRec.code, locale) : null;

  const emailDescription = [maskEmail(user?.email), resendMsg].filter(Boolean).join(". ");

  const tabPanel = useMemo(() => {
    if (activeTab === "login") {
      return (
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
      );
    }

    if (activeTab === "sessions") {
      return (
        <ProfileSessionsPanel
          sessions={sessions}
          error={sessionsError}
          live={live}
          onRevoke={revoke}
          onLogoutOthers={logoutOthers}
        />
      );
    }

    return (
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
          description={t("profile.settings.securityEmail.locked")}
          action={
            <ProfileOkxToggle
              id="email-sec"
              checked={emailSecurityEnabled}
              disabled
              aria-label={t("profile.security.preferences.emailSecurity.title")}
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
    );
  }, [
    activeTab,
    emailDescription,
    emailSecurityEnabled,
    emailVerified,
    handleResendEmail,
    live,
    loadAll,
    logoutOthers,
    passwordMeta,
    passwordSet,
    patchPref,
    prefs,
    prefsError,
    prefsSaving,
    resendBusy,
    revoke,
    sessions,
    sessionsError,
    t,
    twoFaEnabled,
  ]);

  if (pending || (live && loading && !accountCenter)) {
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

  if (!authenticated && !demo) {
    return <ProfileSignInRequired titleKey="profile.legal.signInRequired" />;
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {demo ? <ProductDemoBanner messageKey="profile.security.demoBanner" /> : null}

      <SplitonDarkSurface
        className="relative min-h-0 px-5 py-14 shadow-none sm:px-10 sm:py-16"
        contentClassName="relative min-h-[7.5rem] sm:min-h-[8.5rem]"
        watermarkCentered
        watermarkText={`${BRAND.name} Security`}
        backgroundVideo={SECURITY_HERO_VIDEO}
        videoClarity="crisp"
        aria-label={t("profile.overview.securityCard.title")}
      >
        <h1 className="sr-only">{t("profile.overview.securityCard.title")}</h1>
      </SplitonDarkSurface>

      {loadError ? (
        <div className="flex flex-col gap-3 rounded-2xl bg-red-500/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-red-300" role="alert">
            <ProfileApiOrGenericError message={loadError} />
          </p>
          <SplitonCtaPill type="button" tone="onDark" variant="ghost" withArrow={false} onClick={() => void loadAll()}>
            {t("actions.retry")}
          </SplitonCtaPill>
        </div>
      ) : null}

      {passwordSuccess ? (
        <p className="rounded-xl bg-[#B7F500]/12 px-4 py-3 text-sm text-[#B7F500]" role="status">
          {t("profile.security.password.success")}
        </p>
      ) : null}

      {topRecText ? (
        <ProfileOkxBanner
          title={topRecText.title}
          description={topRecText.description}
          action={
            <SplitonCtaPill
              type="button"
              tone="onDark"
              className="min-w-[9.5rem]"
              onClick={() => {
                if (topRec?.code === "REVIEW_SESSIONS") setActiveTab("sessions");
                else setActiveTab("login");
              }}
            >
              {t("profile.okx.setup")}
            </SplitonCtaPill>
          }
        />
      ) : null}

      <ProfileUnderlineTabs
        value={activeTab}
        onChange={setActiveTab}
        items={SECURITY_TABS.map((id) => ({ id, label: t(`profile.security.tab.${id}`) }))}
        ariaLabel={t("profile.overview.securityLabel")}
      />

      {tabPanel}

      <ProfilePasswordChangePanel
        open={passwordPanelOpen}
        onOpenChange={setPasswordPanelOpen}
        onSuccess={() => {
          setPasswordSuccess(true);
          void loadAll();
        }}
      />

      {activeTab !== "sessions" ? (
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
      ) : null}
    </div>
  );
}
