"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw } from "@/lib/lucide";

import { useAuthUi } from "@/hooks/use-auth-ui";
import { ProfileSignInRequired } from "@/components/dashboard/profile/profile-sign-in-required";
import { useI18n } from "@/components/providers/i18n-provider";
import { ProfileSectionSkeleton } from "@/components/dashboard/profile/profile-section-skeleton";
import {
  ProfileOkxAlert,
  ProfileOkxBanner,
  ProfileOkxLink,
  ProfileOkxRecommended,
  ProfileOkxRow,
  ProfileOkxSection,
  ProfileOkxSetupLink,
  ProfileOkxSpotlight,
  profileOkxGhostClass,
} from "@/components/dashboard/profile/profile-okx";
import { SplitonCtaPill } from "@/components/ui/spliton-cta-pill";
import {
  PROFILE_GLASS,
  ProfileGlassIcon,
  profileLineIcon,
  type ProfileLineIconName,
} from "@/components/dashboard/profile/profile-shared";
import { SplitonDarkSurface } from "@/components/dashboard/assets/spliton-dark-surface";
import { ROUTES } from "@/constants/routes";
import { formatDate } from "@/lib/i18n/formatters";
import { cn } from "@/lib/utils";
import {
  fetchLegalCenter,
  getAllMissingConsents,
  policyTypeLabel,
  type LegalCenterResponse,
  type LegalPolicyPublic,
  type MissingConsentItem,
} from "@/services/legal.service";
import { sortLegalPoliciesByType } from "@/constants/legal/policy-type-order";

const LEGAL_HERO_VIDEO = "/videos/documents-hero.mp4";

function policyIcon(type: string): ProfileLineIconName {
  switch (type) {
    case "PRIVACY_POLICY":
      return "id";
    case "RISK_DISCLOSURE":
      return "security";
    case "FEE_POLICY":
      return "fee";
    default:
      return "legal";
  }
}

export function ProfileLegalContent() {
  const router = useRouter();
  const { authorizedFetch, authenticated, pending } = useAuthUi();
  const { t, locale } = useI18n();
  const [data, setData] = useState<LegalCenterResponse | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (pending) return;
    if (!authenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      const center = await fetchLegalCenter(authorizedFetch);
      setData(center);
      setOffline(false);
    } catch {
      setData(null);
      setOffline(true);
      setLoadError(t("profile.legal.loadError"));
    } finally {
      setLoading(false);
    }
  }, [authorizedFetch, authenticated, pending, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const allMissing = useMemo(
    () =>
      data && !offline
        ? getAllMissingConsents(data).filter(
            (item): item is MissingConsentItem & { policyId: string } => Boolean(item.policyId),
          )
        : [],
    [data, offline],
  );

  const acceptedSet = useMemo(() => {
    if (!data) return new Set<string>();
    return new Set(data.acceptedConsents.map((c) => `${c.policyType}:${c.policyVersion}`));
  }, [data]);

  const displayPolicies = useMemo(() => {
    if (!data) return [];
    const seen = new Set<string>();
    const unique = data.activePolicies.filter((p) => {
      if (seen.has(p.type)) return false;
      seen.add(p.type);
      return true;
    });
    return sortLegalPoliciesByType(unique);
  }, [data]);

  const openPolicy = useCallback(
    (item: MissingConsentItem) => {
      if (!data || !item.policyId) return;
      const policy =
        data.activePolicies.find((p) => p.id === item.policyId) ??
        data.activePolicies.find((p) => p.type === item.type) ??
        null;
      if (!policy) return;
      router.push(ROUTES.dashboardProfileLegalDoc(policy.id, true));
    },
    [data, router],
  );

  const openPolicyDocument = useCallback(
    (policy: LegalPolicyPublic, requireConfirm: boolean) => {
      router.push(ROUTES.dashboardProfileLegalDoc(policy.id, requireConfirm));
    },
    [router],
  );

  if (pending || (authenticated && loading && !data && !loadError)) {
    return <ProfileSectionSkeleton variant="list" rows={3} />;
  }

  if (!authenticated) {
    return <ProfileSignInRequired titleKey="profile.legal.signInRequired" />;
  }

  if (loading) {
    return <ProfileSectionSkeleton variant="list" rows={3} />;
  }

  if (loadError || !data) {
    return (
      <div className="rounded-2xl bg-[#111111] px-4 py-8 text-center">
        <p className="text-sm text-zinc-300">{t("profile.legal.loadError")}</p>
        <p className="mt-2 text-sm text-zinc-500">{t("profile.legal.offlineHint")}</p>
        <button type="button" onClick={() => void load()} className={cn(profileOkxGhostClass, "mt-4")}>
          <RefreshCw className="mr-1.5 size-3.5" aria-hidden />
          {t("profile.legal.retry")}
        </button>
      </div>
    );
  }

  const statusLabel = offline
    ? t("profile.legal.offlineStatus")
    : allMissing.length > 0
      ? t("profile.legal.missingBanner").replace("{count}", String(allMissing.length))
      : t("profile.legal.allAccepted");

  const scrollToAccept = () => {
    document.getElementById("legal-accept")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      <SplitonDarkSurface
        className="relative min-h-0 px-5 py-12 shadow-none sm:px-8 sm:py-14"
        contentClassName="relative z-[1] flex min-h-[5.5rem] flex-col justify-end sm:min-h-[6.5rem]"
        overlay={
          <div className="pointer-events-auto absolute top-4 right-5 sm:top-5 sm:right-6">
            {loadError ? (
              <button type="button" onClick={() => void load()} className={profileOkxGhostClass}>
                <RefreshCw className="mr-1.5 size-3.5" aria-hidden />
                {t("profile.legal.retry")}
              </button>
            ) : allMissing.length > 0 ? (
              <ProfileOkxSetupLink onClick={scrollToAccept}>{t("profile.okx.setup")}</ProfileOkxSetupLink>
            ) : (
              <ProfileOkxSetupLink href={ROUTES.trust}>{t("profile.okx.use")}</ProfileOkxSetupLink>
            )}
          </div>
        }
        watermarkCentered
        watermarkSolid
        watermarkText={t("profile.legal.title")}
        backgroundVideo={LEGAL_HERO_VIDEO}
        videoClarity="crisp"
        aria-label={t("profile.legal.title")}
      >
        <h1 className="sr-only">{t("profile.legal.title")}</h1>
        <p className="text-center text-[13px] leading-relaxed text-white sm:text-[14px]">{statusLabel}</p>
      </SplitonDarkSurface>

      {allMissing.length > 0 ? (
        <ProfileOkxSpotlight
          icon={
            <div className="relative mx-auto size-32 sm:size-40" aria-hidden>
              <Image
                src={PROFILE_GLASS.legal}
                alt=""
                fill
                sizes="160px"
                className="object-contain mix-blend-screen"
                unoptimized
              />
            </div>
          }
          headline={t("profile.okx.spotlight.legal.headline")}
          body={t("profile.okx.spotlight.legal.body")}
          detailsHref={ROUTES.trust}
          detailsLabel={t("profile.okx.details")}
          cta={
            <div className="flex justify-center">
              <ProfileOkxSetupLink onClick={scrollToAccept}>{t("profile.okx.setup")}</ProfileOkxSetupLink>
            </div>
          }
        />
      ) : (
        <ProfileOkxBanner
          icon={profileLineIcon("support")}
          title={t("profile.legal.description")}
          action={<ProfileOkxLink href={ROUTES.trust}>{t("profile.okx.use")}</ProfileOkxLink>}
        />
      )}

      {loadError ? (
        <ProfileOkxAlert title={t("profile.legal.offlineStatus")}>
          <p>{t("profile.legal.offlineHint")}</p>
        </ProfileOkxAlert>
      ) : null}

      {allMissing.length > 0 ? (
        <ProfileOkxSection id="legal-accept" title={t("profile.legal.acceptSection.title")}>
          {allMissing.map((item) => (
            <ProfileOkxRow
              key={`${item.type}-${item.activeVersion}`}
              icon={profileLineIcon(policyIcon(item.type))}
              title={item.title}
              description={t("profile.legal.readRequiredHint")}
              action={
                <SplitonCtaPill
                  type="button"
                  tone="onDark"
                  onClick={() => openPolicy(item)}
                  className="min-w-[11.5rem] shrink-0"
                >
                  {t("profile.legal.readDocument")}
                </SplitonCtaPill>
              }
            />
          ))}
        </ProfileOkxSection>
      ) : null}

      <ProfileOkxSection title={t("profile.legal.activeTitle")}>
        {displayPolicies.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-zinc-500">{t("profile.legal.empty")}</p>
        ) : (
          displayPolicies.map((p) => {
          const accepted = acceptedSet.has(`${p.type}:${p.version}`);
          const title = p.title || policyTypeLabel(p.type, t);
          const version = `${t("profile.legal.version")} ${p.version}`;
          const updatedAt = p.publishedAt ?? p.effectiveAt;
          const updatedLine = updatedAt
            ? `${t("profile.legal.updated")} ${formatDate(new Date(updatedAt), locale, {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}`
            : null;
          const description = updatedLine ? `${version} · ${updatedLine}` : version;
          const needsReadConfirm = !offline && p.requiresUserConsent && !accepted;
          return (
            <ProfileOkxRow
              key={p.type}
              icon={profileLineIcon(policyIcon(p.type))}
              title={title}
              description={description}
              badge={
                !offline && p.requiresUserConsent ? (
                  accepted ? (
                    <ProfileOkxRecommended>{t("profile.legal.badge.accepted")}</ProfileOkxRecommended>
                  ) : (
                    <span className="rounded px-1.5 py-0.5 text-[11px] font-semibold text-amber-200 bg-amber-500/15">
                      {t("profile.legal.badge.missing")}
                    </span>
                  )
                ) : undefined
              }
              action={
                <SplitonCtaPill
                  type="button"
                  tone="onDark"
                  onClick={() => openPolicyDocument(p, needsReadConfirm)}
                  className="min-w-[11.5rem] shrink-0"
                >
                  {t("profile.legal.readDocument")}
                </SplitonCtaPill>
              }
            />
          );
        })
        )}
      </ProfileOkxSection>

      <ProfileOkxSection title={t("profile.legal.historyTitle")}>
        {data.acceptedConsents.length > 0 ? (
          data.acceptedConsents.map((row) => (
            <ProfileOkxRow
              key={`${row.policyType}-${row.policyVersion}-${row.acceptedAt}`}
              icon={profileLineIcon(policyIcon(row.policyType))}
              title={row.policy?.title ?? policyTypeLabel(row.policyType, t)}
              description={formatDate(new Date(row.acceptedAt), locale, {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
              badge={<ProfileOkxRecommended>{t("profile.legal.badge.accepted")}</ProfileOkxRecommended>}
            />
          ))
        ) : (
          <div className="flex flex-col items-center px-4 py-10 text-center sm:px-5 sm:py-12">
            <ProfileGlassIcon src={PROFILE_GLASS.consentHistoryEmpty} size="xl" />
            <p className="mt-5 text-[15px] font-semibold text-white">{t("profile.legal.historyEmpty")}</p>
            <p className="mt-2 max-w-[32ch] text-[13px] leading-relaxed text-zinc-500">
              {t("profile.legal.historyEmptyHint")}
            </p>
          </div>
        )}
      </ProfileOkxSection>
    </div>
  );
}
