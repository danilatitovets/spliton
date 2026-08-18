"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Search } from "@/lib/lucide";

import { LocaleFlag } from "@/components/i18n/locale-flag";
import { useAuthUi } from "@/hooks/use-auth-ui";
import { useI18n } from "@/components/providers/i18n-provider";
import {
  ProfileOkxBanner,
  ProfileOkxRow,
  ProfileOkxSection,
  ProfileOkxSetupLink,
} from "@/components/dashboard/profile/profile-okx";
import { ProfileUnderlineTabs } from "@/components/dashboard/profile/profile-underline-tabs";
import {
  ProfileSecurityModal,
  ProfileSecurityModalField,
  ProfileSecurityModalFieldList,
} from "@/components/dashboard/profile/profile-security-modal";
import { ProfileMusicAvatar } from "@/components/dashboard/profile/profile-music-avatar";
import { ProfileSectionSkeleton } from "@/components/dashboard/profile/profile-section-skeleton";
import { ProfileSignInRequired } from "@/components/dashboard/profile/profile-sign-in-required";
import {
  isKycApproved,
  maskProfileEmail,
} from "@/components/dashboard/profile/profile-overview-identity";
import { SplitonCtaPill } from "@/components/ui/spliton-cta-pill";
import { AnimatedList } from "@/components/ui/animated-list";
import { profileModalBareInputClass } from "@/components/dashboard/profile/profile-ui";
import { SplitonDarkSurface } from "@/components/dashboard/assets/spliton-dark-surface";
import { VERIFY_VIDEO } from "@/components/dashboard/profile/profile-verification-steps";
import { profileDashboardHref } from "@/constants/dashboard/profile-page";

const ACCOUNT_HERO_VIDEO = "/videos/profile-account-hero.mp4";
import { SETTINGS_LANGUAGE_OPTIONS } from "@/constants/dashboard/profile-settings";
import { copyTextToClipboard } from "@/lib/copy-to-clipboard";
import { securityLevelBadgeLabel } from "@/lib/profile/security-labels";
import { formatApiError } from "@/lib/i18n/format-api-error";
import { listTimezoneOptions, resolveTimezoneLabel } from "@/lib/i18n/timezones";
import { LOCALE_OPTIONS, type AppLocale } from "@/lib/i18n/types";
import { isLiveAccountEnabled } from "@/lib/public-env";
import { cn } from "@/lib/utils";
import {
  fetchUserMe,
  patchUserPreferences,
  type AccountCenterSummary,
} from "@/services/user-me.service";

type AccountModal = "displayName" | "timezone" | "language" | null;
type AccountTab = "personal" | "status";

function optionLabel(
  options: readonly { value: string; label: string }[],
  value: string,
): string {
  return options.find((o) => o.value === value)?.label ?? value;
}

export function ProfileAccountContent() {
  const { user, authorizedFetch, authenticated, pending, anonymous } = useAuthUi();
  const { locale, setLocale, t } = useI18n();
  const live = isLiveAccountEnabled() && authenticated;
  const demo = !isLiveAccountEnabled();
  const localeRef = useRef(locale);
  localeRef.current = locale;

  const [email, setEmail] = useState<string | null>(user?.email ?? null);
  const [userId, setUserId] = useState<string | null>(user?.id ?? null);
  const [displayName, setDisplayName] = useState(user?.profile?.displayName?.trim() ?? "");
  const [draftName, setDraftName] = useState(user?.profile?.displayName?.trim() ?? "");
  const [timezone, setTimezone] = useState("Europe/Moscow");
  const [draftTimezone, setDraftTimezone] = useState("Europe/Moscow");
  const [timezoneQuery, setTimezoneQuery] = useState("");
  const [summary, setSummary] = useState<AccountCenterSummary | null>(null);
  const [copied, setCopied] = useState(false);

  const [accountTab, setAccountTab] = useState<AccountTab>("personal");
  const [modal, setModal] = useState<AccountModal>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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

  const nick = displayName.trim() || maskProfileEmail(email) || t("profile.overview.displayNameFallback");
  const verified = isKycApproved(summary?.verification.status);
  const securityLevel = summary?.security.level ?? "MEDIUM";
  const levelKey = `profile.overview.identity.level.${securityLevel.toLowerCase()}`;
  const levelLabel = t(levelKey);

  const applyMe = useCallback(
    (me: {
      id?: string | null;
      email?: string | null;
      accountCenter?: AccountCenterSummary | null;
      profile?: { displayName?: string | null; timezone?: string | null; preferredLocale?: string | null } | null;
    }) => {
      setEmail(me.email ?? null);
      setUserId(me.id ?? null);
      setSummary(me.accountCenter ?? null);
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
    },
    [setLocale],
  );

  useEffect(() => {
    if (!user) return;
    setEmail((prev) => prev ?? user.email ?? null);
    setUserId((prev) => prev ?? user.id ?? null);
    const name = user.profile?.displayName?.trim() ?? "";
    if (name) {
      setDisplayName((prev) => prev || name);
      setDraftName((prev) => prev || name);
    }
  }, [user]);

  const loadAccount = useCallback(async () => {
    if (pending) return;
    if (!live) {
      if (demo && authenticated) {
        setEmail(user?.email ?? "demo@spliton.io");
        setUserId(user?.id ?? "demo-user");
      }
      setLoading(false);
      return;
    }

    if (!user?.email) {
      setLoading(true);
    }
    setLoadError(null);
    try {
      const me = await fetchUserMe(authorizedFetch);
      applyMe(me);
    } catch (err) {
      if (!user?.email) {
        setLoadError(formatApiError(err, locale) || t("profile.account.loadError"));
      }
    } finally {
      setLoading(false);
    }
  }, [applyMe, authenticated, authorizedFetch, demo, live, locale, pending, t, user]);

  useEffect(() => {
    void loadAccount();
  }, [loadAccount]);

  const openName = useCallback(() => {
    setDraftName(displayName);
    setModal("displayName");
  }, [displayName]);

  const openTimezone = useCallback(() => {
    setDraftTimezone(timezone);
    setTimezoneQuery("");
    setModal("timezone");
  }, [timezone]);

  const openLanguage = useCallback(() => setModal("language"), []);

  const confirmName = useCallback(() => {
    const next = draftName.trim();
    if (!live) {
      setDisplayName(next);
      setModal(null);
      return;
    }
    void patchUserPreferences(authorizedFetch, { displayName: next || undefined })
      .then(() => {
        setDisplayName(next);
        setModal(null);
      })
      .catch(() => setLoadError(t("profile.account.saveError")));
  }, [authorizedFetch, draftName, live, t]);

  const confirmTimezone = useCallback(() => {
    if (!live) {
      setTimezone(draftTimezone);
      setModal(null);
      return;
    }
    void patchUserPreferences(authorizedFetch, { timezone: draftTimezone })
      .then(() => {
        setTimezone(draftTimezone);
        setModal(null);
      })
      .catch(() => setLoadError(t("profile.account.saveError")));
  }, [authorizedFetch, draftTimezone, live, t]);

  const selectLanguage = useCallback(
    (next: AppLocale) => {
      setLocale(next);
      if (!live) {
        setModal(null);
        return;
      }
      void patchUserPreferences(authorizedFetch, { preferredLocale: next })
        .then(() => setModal(null))
        .catch(() => setLoadError(t("profile.account.saveError")));
    },
    [authorizedFetch, live, setLocale, t],
  );

  async function onCopyId() {
    if (!userId) return;
    const result = await copyTextToClipboard(userId);
    if (result !== "ok") return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  if (pending && !user) {
    return <ProfileSectionSkeleton variant="form" />;
  }

  if (anonymous && !demo) {
    return <ProfileSignInRequired titleKey="profile.legal.signInRequired" />;
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <SplitonDarkSurface
        className="min-h-0 px-5 py-10 shadow-none sm:px-8 sm:py-12"
        contentClassName="relative z-[1] min-h-[4.5rem] sm:min-h-[5.5rem]"
        watermarkCentered
        watermarkText={nick}
        backgroundVideo={ACCOUNT_HERO_VIDEO}
        videoClarity="crisp"
        aria-label={t("profile.account.title")}
      >
        <span className="sr-only">{t("profile.account.title")}</span>
      </SplitonDarkSurface>

      {loadError ? (
        <div className="flex flex-col gap-3 rounded-2xl bg-red-500/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-red-300" role="alert">
            {loadError}
          </p>
          <SplitonCtaPill type="button" tone="onDark" variant="ghost" withArrow={false} onClick={() => void loadAccount()}>
            {t("actions.retry")}
          </SplitonCtaPill>
        </div>
      ) : null}

      <section className="rounded-[1.35rem] bg-white/[0.04] p-4 ring-1 ring-white/[0.08] sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
          <ProfileMusicAvatar userId={userId} email={email} className="size-20 sm:size-[5.5rem]" />
          <div className="min-w-0 flex-1">
            <h1 className="text-[clamp(1.5rem,4vw,2.25rem)] font-semibold leading-[1.05] tracking-[-0.035em] text-white break-words">
              {nick}
            </h1>
            {email ? (
              <p className="mt-2 text-[14px] text-zinc-300">{email}</p>
            ) : null}
            {userId ? (
              <div className="mt-2 flex min-w-0 flex-wrap items-center gap-1">
                <p className="min-w-0 text-[10px] leading-snug text-zinc-600 sm:text-[11px]">
                  <span className="uppercase tracking-[0.08em]">{t("profile.overview.identity.idPrefix")}</span>{" "}
                  <span className="font-mono text-[10px] text-zinc-500 sm:text-[11px]">{userId}</span>
                </p>
                <button
                  type="button"
                  onClick={() => void onCopyId()}
                  className="inline-flex size-5 shrink-0 items-center justify-center rounded-md text-zinc-600 transition hover:bg-white/[0.06] hover:text-zinc-300"
                  aria-label={t("profile.overview.copyId")}
                >
                  {copied ? <Check className="size-3 text-[#B7F500]" /> : <Copy className="size-3" />}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <ProfileOkxBanner
        title={t("profile.account.bannerTitle")}
        description={t("profile.account.bannerBody")}
        action={
          <SplitonCtaPill href={profileDashboardHref("settings")} tone="onDark" className="min-w-[10rem]">
            {t("profile.account.notificationsLink")}
          </SplitonCtaPill>
        }
      />

      <ProfileUnderlineTabs
        value={accountTab}
        onChange={setAccountTab}
        items={[
          { id: "personal", label: t("profile.account.tab.personal") },
          { id: "status", label: t("profile.account.tab.status") },
        ]}
        ariaLabel={t("profile.account.tabsAria")}
      />

      {accountTab === "personal" ? (
        <ProfileOkxSection title={t("profile.account.personalHeading")}>
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
            title={t("profile.account.emailLabel")}
            description={email ?? t("profile.account.emailEmpty")}
            action={
              <span className="rounded-full bg-white/[0.06] px-3 py-1.5 text-[11px] font-medium text-zinc-400">
                {t("profile.account.emailLocked")}
              </span>
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
      ) : (
        <ProfileOkxSection title={t("profile.account.statusHeading")}>
          <ProfileOkxRow
            title={t("profile.account.verificationLabel")}
            description={
              verified ? t("profile.overview.identity.verified") : t("profile.overview.identity.unverified")
            }
            action={
              <ProfileOkxSetupLink href={profileDashboardHref("verification")}>
                {t("profile.okx.setup")}
              </ProfileOkxSetupLink>
            }
          />
          <ProfileOkxRow
            title={t("profile.account.securityLevelLabel")}
            description={levelLabel}
            action={
              <ProfileOkxSetupLink href={profileDashboardHref("security")}>
                {t("profile.okx.setup")}
              </ProfileOkxSetupLink>
            }
          />
        </ProfileOkxSection>
      )}

      {loading && !email ? (
        <p className="text-[13px] text-zinc-500" aria-live="polite">
          {t("profile.account.loading")}
        </p>
      ) : null}

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
        <ProfileSecurityModalFieldList bare>
          <ProfileSecurityModalField bare label={t("profile.settings.displayName.label")} htmlFor="account-display-name">
            <input
              id="account-display-name"
              type="text"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              autoComplete="nickname"
              autoFocus
              className={profileModalBareInputClass}
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
        <AnimatedList
          showGradients={false}
          enableArrowNavigation
          displayScrollbar={false}
          gradientFrom="#0c0c0c"
          onItemSelect={(_, index) => {
            const option = LOCALE_OPTIONS[index];
            if (option) selectLanguage(option.code as AppLocale);
          }}
        >
          {LOCALE_OPTIONS.map((option) => {
            const selected = option.code === locale;
            return (
              <button
                key={option.code}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => selectLanguage(option.code as AppLocale)}
                className={cn(
                  "mb-1.5 flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-left transition last:mb-0",
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
            );
          })}
        </AnimatedList>
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
        footer={
          <SplitonCtaPill type="button" tone="onDark" onClick={confirmTimezone} className="w-full min-w-0">
            {t("profile.settings.done")}
          </SplitonCtaPill>
        }
      >
        <ProfileSecurityModalFieldList bare>
          <ProfileSecurityModalField bare label={t("profile.settings.timezone.search")} htmlFor="account-timezone-search">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
              <input
                id="account-timezone-search"
                type="search"
                value={timezoneQuery}
                onChange={(e) => setTimezoneQuery(e.target.value)}
                className={cn(profileModalBareInputClass, "pl-10")}
              />
            </div>
          </ProfileSecurityModalField>
        </ProfileSecurityModalFieldList>
        <AnimatedList
          showGradients={false}
          enableArrowNavigation
          displayScrollbar={false}
          gradientFrom="#0c0c0c"
          onItemSelect={(_, index) => {
            const option = filteredTimezones[index];
            if (option) setDraftTimezone(option.value);
          }}
        >
          {filteredTimezones.length === 0 ? (
            <p className="px-2 py-3 text-[13px] text-zinc-500">{t("profile.settings.timezone.empty")}</p>
          ) : (
            filteredTimezones.map((option) => {
              const selected = option.value === draftTimezone;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => setDraftTimezone(option.value)}
                  className={cn(
                    "mb-1.5 flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-left transition last:mb-0",
                    selected
                      ? "bg-white/[0.1] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.14)]"
                      : "text-zinc-300 hover:bg-white/[0.05] hover:text-white",
                  )}
                >
                  <span className="min-w-0 flex-1 truncate text-[15px] font-medium">{option.label}</span>
                </button>
              );
            })
          )}
        </AnimatedList>
      </ProfileSecurityModal>
    </div>
  );
}
