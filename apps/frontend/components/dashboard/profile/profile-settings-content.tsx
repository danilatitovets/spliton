"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Search } from "@/lib/lucide";

import { LocaleFlag } from "@/components/i18n/locale-flag";
import { useAuth } from "@/components/providers/auth-provider";
import { useI18n } from "@/components/providers/i18n-provider";
import {
  ProfileOkxBanner,
  ProfileOkxRow,
  ProfileOkxSection,
  ProfileOkxToggle,
} from "@/components/dashboard/profile/profile-okx";
import {
  ProfileSecurityModal,
  ProfileSecurityModalField,
  ProfileSecurityModalFieldList,
} from "@/components/dashboard/profile/profile-security-modal";
import { BRAND } from "@/constants/brand";
import { SplitonCtaPill } from "@/components/ui/spliton-cta-pill";
import { profileModalInputClass } from "@/components/dashboard/profile/profile-ui";
import { SplitonDarkSurface } from "@/components/dashboard/assets/spliton-dark-surface";
import { VERIFY_VIDEO } from "@/components/dashboard/profile/profile-verification-steps";
import { profileDashboardHref } from "@/constants/dashboard/profile-page";
import { SETTINGS_LANGUAGE_OPTIONS } from "@/constants/dashboard/profile-settings";
import { ROUTES } from "@/constants/routes";
import { listTimezoneOptions, resolveTimezoneLabel } from "@/lib/i18n/timezones";
import { LOCALE_OPTIONS, type AppLocale } from "@/lib/i18n/types";
import { isLiveAccountEnabled } from "@/lib/public-env";
import { cn } from "@/lib/utils";
import {
  fetchNotificationPreferences,
  patchNotificationPreferences,
  type NotificationPreferences,
} from "@/services/notifications.service";
import { fetchUserMe, patchUserPreferences } from "@/services/user-me.service";

type SettingsModal = "displayName" | "timezone" | "language" | null;
type NotifToggleKey = Exclude<keyof NotificationPreferences, "userId" | "emailSecurity">;

function optionLabel(
  options: readonly { value: string; label: string }[],
  value: string,
): string {
  return options.find((o) => o.value === value)?.label ?? value;
}

export function ProfileSettingsContent() {
  const { authorizedFetch, isAuthenticated } = useAuth();
  const { locale, setLocale, t } = useI18n();
  const live = isLiveAccountEnabled() && isAuthenticated;
  const localeRef = useRef(locale);
  localeRef.current = locale;

  const [displayName, setDisplayName] = useState("");
  const [draftName, setDraftName] = useState("");
  const [timezone, setTimezone] = useState("Europe/Moscow");
  const [draftTimezone, setDraftTimezone] = useState("Europe/Moscow");
  const [timezoneQuery, setTimezoneQuery] = useState("");
  const [emailFinance, setEmailFinance] = useState(true);
  const [emailMarket, setEmailMarket] = useState(false);
  const [emailNews, setEmailNews] = useState(true);
  const [emailSecurity, setEmailSecurity] = useState(true);
  const [emailSupport, setEmailSupport] = useState(true);
  const [inAppFinance, setInAppFinance] = useState(true);
  const [inAppMarket, setInAppMarket] = useState(true);
  const [inAppSupport, setInAppSupport] = useState(true);
  const [inAppNews, setInAppNews] = useState(true);

  const [modal, setModal] = useState<SettingsModal>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [savingNotif, setSavingNotif] = useState<NotifToggleKey | null>(null);
  const [loading, setLoading] = useState(live);

  const languageLabel = useMemo(
    () => optionLabel(SETTINGS_LANGUAGE_OPTIONS, locale),
    [locale],
  );
  const timezoneLabel = useMemo(() => resolveTimezoneLabel(timezone, locale), [timezone, locale]);
  const timezoneOptions = useMemo(() => listTimezoneOptions(locale), [locale]);
  const filteredTimezones = useMemo(() => {
    const q = timezoneQuery.trim().toLowerCase();
    if (!q) return timezoneOptions;
    return timezoneOptions.filter(
      (option) =>
        option.value.toLowerCase().includes(q) ||
        option.city.toLowerCase().includes(q) ||
        option.label.toLowerCase().includes(q),
    );
  }, [timezoneOptions, timezoneQuery]);

  useEffect(() => {
    if (!live) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setLoadError(null);

    void Promise.all([fetchUserMe(authorizedFetch), fetchNotificationPreferences(authorizedFetch)])
      .then(([me, prefs]) => {
        if (cancelled) return;
        const name = me.profile?.displayName?.trim() ?? "";
        const tz = me.profile?.timezone?.trim() || "Europe/Moscow";
        setDisplayName(name);
        setDraftName(name);
        setTimezone(tz);
        setDraftTimezone(tz);
        const preferred = me.profile?.preferredLocale?.trim().toLowerCase();
        if (
          (preferred === "ru" || preferred === "en" || preferred === "es" || preferred === "pt") &&
          preferred !== localeRef.current
        ) {
          setLocale(preferred as AppLocale);
        }
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
    // Intentionally omit `t` / `locale`: changing locale must not remount the loader loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once per auth session
  }, [authorizedFetch, live, setLocale]);

  const persistProfile = useCallback(
    async (body: { displayName?: string; timezone?: string }) => {
      if (!live) return;
      setLoadError(null);
      try {
        await patchUserPreferences(authorizedFetch, body);
      } catch {
        setLoadError(t("profile.settings.saveError"));
      }
    },
    [authorizedFetch, live, t],
  );

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

  const openName = () => {
    setDraftName(displayName);
    setModal("displayName");
  };
  const openLanguage = () => setModal("language");
  const openTimezone = () => {
    setDraftTimezone(timezone);
    setTimezoneQuery("");
    setModal("timezone");
  };

  const confirmName = () => {
    const next = draftName.trim();
    setDisplayName(next);
    setModal(null);
    if (next === displayName.trim()) return;
    void persistProfile({ displayName: next || undefined });
  };

  const selectTimezone = (value: string) => {
    setDraftTimezone(value);
    if (value === timezone) {
      setModal(null);
      return;
    }
    setTimezone(value);
    setModal(null);
    void persistProfile({ timezone: value });
  };

  const selectLanguage = (code: AppLocale) => {
    setLocale(code);
    setModal(null);
  };

  return (
    <div className="space-y-4 pb-8 sm:space-y-5">
      <h1 className="text-[1.55rem] font-semibold tracking-tight text-white sm:text-[1.75rem]">
        <span className="text-white">{BRAND.name}</span>
        <span className="font-medium text-white/75"> {t("profile.overview.placeholder.titleSettings")}</span>
      </h1>

      <SplitonDarkSurface
        className="min-h-0 px-5 py-10 shadow-none sm:px-8 sm:py-12"
        contentClassName="relative z-[1] min-h-[4.5rem] sm:min-h-[5.5rem]"
        watermarkCentered
        backgroundVideo={VERIFY_VIDEO}
        videoClarity="crisp"
        aria-label={t("profile.overview.placeholder.titleSettings")}
      >
        <span className="sr-only">{`${BRAND.name} ${t("profile.overview.placeholder.titleSettings")}`}</span>
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
          <SplitonCtaPill href={profileDashboardHref("security")} tone="onDark" className="min-w-[10rem]">
            {t("profile.settings.securityLink")}
          </SplitonCtaPill>
        }
      />

      <ProfileOkxSection title={t("profile.settings.profileHeading")}>
        <ProfileOkxRow
          title={t("profile.settings.displayName.label")}
          description={displayName.trim() || t("profile.settings.displayName.empty")}
          action={
            <SplitonCtaPill type="button" tone="onDark" onClick={openName} className="min-w-[9.5rem]">
              {t("profile.okx.change")}
            </SplitonCtaPill>
          }
        />
        <ProfileOkxRow
          title={t("language.label")}
          description={languageLabel}
          action={
            <SplitonCtaPill type="button" tone="onDark" onClick={openLanguage} className="min-w-[9.5rem]">
              {t("profile.okx.change")}
            </SplitonCtaPill>
          }
        />
        <ProfileOkxRow
          title={t("profile.settings.timezone.label")}
          description={timezoneLabel}
          action={
            <SplitonCtaPill type="button" tone="onDark" onClick={openTimezone} className="min-w-[9.5rem]">
              {t("profile.okx.change")}
            </SplitonCtaPill>
          }
        />
      </ProfileOkxSection>

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

      <ProfileOkxSection title={t("profile.settings.privacy.title")}>
        <ProfileOkxRow
          title={t("profile.settings.privacy.title")}
          description={t("profile.settings.privacy.description")}
          action={
            <SplitonCtaPill href={ROUTES.dashboardSupport} tone="onDark" className="min-w-[9.5rem]">
              {t("profile.settings.privacy.supportLink")}
            </SplitonCtaPill>
          }
        />
        <ProfileOkxRow
          title={t("profile.settings.verificationLink")}
          description={t("profile.okx.spotlight.verification.body")}
          action={
            <SplitonCtaPill href={profileDashboardHref("verification")} tone="onDark" className="min-w-[9.5rem]">
              {t("profile.okx.manage")}
            </SplitonCtaPill>
          }
        />
      </ProfileOkxSection>

      <ProfileSecurityModal
        open={modal === "displayName"}
        onOpenChange={(open) => {
          if (!open) setModal(null);
        }}
        title={t("profile.settings.displayName.label")}
        description={t("profile.settings.displayName.hint")}
        headerVideo
        headerVideoSrc={VERIFY_VIDEO}
        footer={
          <SplitonCtaPill type="button" tone="onDark" onClick={confirmName} className="w-full min-w-0">
            {t("profile.settings.done")}
          </SplitonCtaPill>
        }
      >
        <ProfileSecurityModalFieldList>
          <ProfileSecurityModalField
            label={t("profile.settings.displayName.label")}
            htmlFor="settings-display-name"
          >
            <input
              id="settings-display-name"
              type="text"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              autoComplete="nickname"
              autoFocus
              className={profileModalInputClass}
            />
          </ProfileSecurityModalField>
        </ProfileSecurityModalFieldList>
      </ProfileSecurityModal>

      <ProfileSecurityModal
        open={modal === "language"}
        onOpenChange={(open) => {
          if (!open) setModal(null);
        }}
        title={t("language.label")}
        description={t("language.select")}
        headerVideo
        headerVideoSrc={VERIFY_VIDEO}
        footer={
          <SplitonCtaPill type="button" tone="onDark" onClick={() => setModal(null)} className="w-full min-w-0">
            {t("profile.settings.done")}
          </SplitonCtaPill>
        }
      >
        <ul className="mt-2 space-y-1.5 pb-2" role="listbox" aria-label={t("language.select")}>
          {LOCALE_OPTIONS.map((option) => {
            const selected = option.code === locale;
            return (
              <li key={option.code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => selectLanguage(option.code as AppLocale)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-left transition",
                    selected
                      ? "bg-white/[0.1] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.14)]"
                      : "text-zinc-300 hover:bg-white/[0.05] hover:text-white",
                  )}
                >
                  <LocaleFlag locale={option.code} size="md" />
                  <span className="min-w-0 flex-1 truncate text-[15px] font-medium">{option.label}</span>
                  <span className="shrink-0 text-[11px] font-bold tracking-wide text-zinc-500">
                    {option.shortCode}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </ProfileSecurityModal>

      <ProfileSecurityModal
        open={modal === "timezone"}
        onOpenChange={(open) => {
          if (!open) setModal(null);
        }}
        title={t("profile.settings.timezone.label")}
        description={t("profile.settings.timezone.hint")}
        headerVideo
        headerVideoSrc={VERIFY_VIDEO}
        widthClassName="md:w-[min(100vw-1.5rem,520px)]"
        footer={
          <SplitonCtaPill type="button" tone="onDark" onClick={() => setModal(null)} className="w-full min-w-0">
            {t("profile.settings.done")}
          </SplitonCtaPill>
        }
      >
        <div className="relative mb-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" aria-hidden />
          <input
            type="search"
            value={timezoneQuery}
            onChange={(e) => setTimezoneQuery(e.target.value)}
            placeholder={t("profile.settings.timezone.search")}
            className={cn(profileModalInputClass, "pl-10")}
          />
        </div>
        <ul
          className="max-h-[min(48vh,360px)] space-y-1 overflow-y-auto overscroll-contain pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="listbox"
          aria-label={t("profile.settings.timezone.label")}
        >
          {filteredTimezones.map((option) => {
            const selected = option.value === draftTimezone;
            return (
              <li key={option.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => selectTimezone(option.value)}
                  className={cn(
                    "flex w-full flex-col rounded-2xl px-3.5 py-2.5 text-left transition",
                    selected
                      ? "bg-white/[0.1] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.14)]"
                      : "text-zinc-300 hover:bg-white/[0.05] hover:text-white",
                  )}
                >
                  <span className="text-[14px] font-medium">{option.label}</span>
                  <span className="mt-0.5 text-[12px] text-zinc-500">{option.value}</span>
                </button>
              </li>
            );
          })}
          {filteredTimezones.length === 0 ? (
            <li className="px-2 py-6 text-center text-sm text-zinc-500">
              {t("profile.settings.timezone.empty")}
            </li>
          ) : null}
        </ul>
      </ProfileSecurityModal>
    </div>
  );
}
