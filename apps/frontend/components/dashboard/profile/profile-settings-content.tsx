"use client";

import { useEffect, useState } from "react";

import { useAuthUi } from "@/hooks/use-auth-ui";
import { ProfileSectionSkeleton } from "@/components/dashboard/profile/profile-section-skeleton";
import { ProfileSignInRequired } from "@/components/dashboard/profile/profile-sign-in-required";
import { ProfileUnderlineTabs } from "@/components/dashboard/profile/profile-underline-tabs";
import { useI18n } from "@/components/providers/i18n-provider";
import {
  ProfileOkxBanner,
  ProfileOkxRow,
  ProfileOkxSection,
  ProfileOkxSetupLink,
  ProfileOkxToggle,
} from "@/components/dashboard/profile/profile-okx";
import { SplitonDarkSurface } from "@/components/dashboard/assets/spliton-dark-surface";
import { VERIFY_VIDEO } from "@/components/dashboard/profile/profile-verification-steps";
import { profileDashboardHref } from "@/constants/dashboard/profile-page";
import { ROUTES } from "@/constants/routes";
import { isLiveAccountEnabled } from "@/lib/public-env";
import {
  fetchNotificationPreferences,
  patchNotificationPreferences,
  type NotificationPreferences,
} from "@/services/notifications.service";

type NotifToggleKey = Exclude<keyof NotificationPreferences, "userId" | "emailSecurity">;
type SettingsTab = "email" | "inApp" | "privacy";

export function ProfileSettingsContent() {
  const { authorizedFetch, authenticated, pending, anonymous } = useAuthUi();
  const { t } = useI18n();
  const live = isLiveAccountEnabled() && authenticated;

  const [settingsTab, setSettingsTab] = useState<SettingsTab>("email");
  const [emailFinance, setEmailFinance] = useState(true);
  const [emailMarket, setEmailMarket] = useState(false);
  const [emailNews, setEmailNews] = useState(true);
  const [emailSecurity, setEmailSecurity] = useState(true);
  const [emailSupport, setEmailSupport] = useState(true);
  const [inAppFinance, setInAppFinance] = useState(true);
  const [inAppMarket, setInAppMarket] = useState(true);
  const [inAppSupport, setInAppSupport] = useState(true);
  const [inAppNews, setInAppNews] = useState(true);

  const [loadError, setLoadError] = useState<string | null>(null);
  const [savingNotif, setSavingNotif] = useState<NotifToggleKey | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (pending) return;
    if (!live) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setLoadError(null);

    void fetchNotificationPreferences(authorizedFetch)
      .then((prefs) => {
        if (cancelled) return;
        setEmailFinance(prefs.emailFinance);
        setEmailMarket(prefs.emailMarket);
        setEmailNews(prefs.emailNews);
        setEmailSecurity(prefs.emailSecurity);
        setEmailSupport(prefs.emailSupport);
        setInAppFinance(prefs.inAppFinance);
        setInAppMarket(prefs.inAppMarket);
        setInAppSupport(prefs.inAppSupport);
        setInAppNews(prefs.inAppNews);
      })
      .catch(() => {
        if (!cancelled) setLoadError(t("profile.settings.loadError"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [authorizedFetch, live, pending, t]);

  const changeNotif =
    (key: NotifToggleKey, setter: (value: boolean) => void, previous: boolean) =>
    (value: boolean) => {
      setter(value);
      if (!live) return;
      setSavingNotif(key);
      setLoadError(null);
      void patchNotificationPreferences(authorizedFetch, { [key]: value })
        .catch(() => {
          setter(previous);
          setLoadError(t("profile.settings.saveError"));
        })
        .finally(() => {
          setSavingNotif((current) => (current === key ? null : current));
        });
    };

  if (pending && !authenticated) {
    return <ProfileSectionSkeleton variant="form" />;
  }

  if (anonymous) {
    return <ProfileSignInRequired titleKey="profile.legal.signInRequired" />;
  }

  if (live && loading) {
    return <ProfileSectionSkeleton variant="form" />;
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <SplitonDarkSurface
        className="min-h-0 px-5 py-10 shadow-none sm:px-8 sm:py-12"
        contentClassName="relative z-[1] min-h-[4.5rem] sm:min-h-[5.5rem]"
        watermarkCentered
        backgroundVideo={VERIFY_VIDEO}
        videoClarity="crisp"
        aria-label={t("profile.overview.placeholder.titleSettings")}
      >
        <span className="sr-only">{t("profile.overview.placeholder.titleSettings")}</span>
      </SplitonDarkSurface>

      {loadError ? (
        <p className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-300" role="alert">
          {loadError}
        </p>
      ) : null}

      <ProfileOkxBanner
        title={t("profile.okx.spotlight.settings.headline")}
        description={t("profile.okx.spotlight.settings.body")}
        action={
          <ProfileOkxSetupLink href={profileDashboardHref("account")}>
            {t("profile.settings.accountLink")}
          </ProfileOkxSetupLink>
        }
      />

      <ProfileUnderlineTabs
        value={settingsTab}
        onChange={setSettingsTab}
        items={[
          { id: "email", label: t("profile.settings.tab.email") },
          { id: "inApp", label: t("profile.settings.tab.inApp") },
          { id: "privacy", label: t("profile.settings.tab.privacy") },
        ]}
        ariaLabel={t("profile.settings.tabsAria")}
      />

      {settingsTab === "email" ? (
        <ProfileOkxSection title={t("profile.settings.emailGroup")}>
          <ProfileOkxRow
            title={t("profile.settings.payouts.title")}
            description={t("profile.settings.payouts.description")}
            action={
              <ProfileOkxToggle
                checked={emailFinance}
                onChange={changeNotif("emailFinance", setEmailFinance, emailFinance)}
                disabled={loading || !live || savingNotif === "emailFinance"}
              />
            }
          />
          <ProfileOkxRow
            title={t("profile.settings.market.title")}
            description={t("profile.settings.market.description")}
            action={
              <ProfileOkxToggle
                checked={emailMarket}
                onChange={changeNotif("emailMarket", setEmailMarket, emailMarket)}
                disabled={loading || !live || savingNotif === "emailMarket"}
              />
            }
          />
          <ProfileOkxRow
            title={t("profile.settings.product.title")}
            description={t("profile.settings.product.description")}
            action={
              <ProfileOkxToggle
                checked={emailNews}
                onChange={changeNotif("emailNews", setEmailNews, emailNews)}
                disabled={loading || !live || savingNotif === "emailNews"}
              />
            }
          />
          <ProfileOkxRow
            title={t("profile.settings.support.title")}
            description={t("profile.settings.support.description")}
            action={
              <ProfileOkxToggle
                checked={emailSupport}
                onChange={changeNotif("emailSupport", setEmailSupport, emailSupport)}
                disabled={loading || !live || savingNotif === "emailSupport"}
              />
            }
          />
          <ProfileOkxRow
            title={t("profile.settings.securityEmail.title")}
            description={t("profile.settings.securityEmail.locked")}
            action={<ProfileOkxToggle checked={emailSecurity} disabled />}
          />
        </ProfileOkxSection>
      ) : null}

      {settingsTab === "inApp" ? (
        <ProfileOkxSection title={t("profile.settings.inAppGroup")}>
          <ProfileOkxRow
            title={t("profile.settings.inAppFinance.title")}
            description={t("profile.settings.inAppFinance.description")}
            action={
              <ProfileOkxToggle
                checked={inAppFinance}
                onChange={changeNotif("inAppFinance", setInAppFinance, inAppFinance)}
                disabled={loading || !live || savingNotif === "inAppFinance"}
              />
            }
          />
          <ProfileOkxRow
            title={t("profile.settings.inAppMarket.title")}
            description={t("profile.settings.inAppMarket.description")}
            action={
              <ProfileOkxToggle
                checked={inAppMarket}
                onChange={changeNotif("inAppMarket", setInAppMarket, inAppMarket)}
                disabled={loading || !live || savingNotif === "inAppMarket"}
              />
            }
          />
          <ProfileOkxRow
            title={t("profile.settings.inAppSupport.title")}
            description={t("profile.settings.inAppSupport.description")}
            action={
              <ProfileOkxToggle
                checked={inAppSupport}
                onChange={changeNotif("inAppSupport", setInAppSupport, inAppSupport)}
                disabled={loading || !live || savingNotif === "inAppSupport"}
              />
            }
          />
          <ProfileOkxRow
            title={t("profile.settings.digest.title")}
            description={t("profile.settings.digest.description")}
            action={
              <ProfileOkxToggle
                checked={inAppNews}
                onChange={changeNotif("inAppNews", setInAppNews, inAppNews)}
                disabled={loading || !live || savingNotif === "inAppNews"}
              />
            }
          />
        </ProfileOkxSection>
      ) : null}

      {settingsTab === "privacy" ? (
        <ProfileOkxSection title={t("profile.settings.privacyHeading")}>
          <ProfileOkxRow
            title={t("profile.settings.privacy.title")}
            description={t("profile.settings.privacy.description")}
            action={
              <ProfileOkxSetupLink href={ROUTES.dashboardSupport}>
                {t("profile.settings.support.title")}
              </ProfileOkxSetupLink>
            }
          />
          <ProfileOkxRow
            title={t("profile.settings.verificationLink")}
            description={t("profile.okx.spotlight.verification.body")}
            action={
              <ProfileOkxSetupLink href={profileDashboardHref("verification")}>
                {t("profile.okx.setup")}
              </ProfileOkxSetupLink>
            }
          />
        </ProfileOkxSection>
      ) : null}
    </div>
  );
}
