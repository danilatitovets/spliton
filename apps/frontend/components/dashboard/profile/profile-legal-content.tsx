"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw } from "@/lib/lucide";

import { useAuth } from "@/components/providers/auth-provider";
import { useI18n } from "@/components/providers/i18n-provider";
import { ProfileSectionSkeleton } from "@/components/dashboard/profile/profile-section-skeleton";
import {
  ProfileOkxAlert,
  ProfileOkxBanner,
  ProfileOkxHeader,
  ProfileOkxLink,
  ProfileOkxRecommended,
  ProfileOkxRow,
  ProfileOkxSection,
  ProfileOkxSpotlight,
  profileOkxGhostClass,
  profileOkxPillClass,
  profileOkxPrimaryClass,
} from "@/components/dashboard/profile/profile-okx";
import { SplitonCtaPill } from "@/components/ui/spliton-cta-pill";
import {
  PROFILE_GLASS,
  ProfileGlassIcon,
  profileLineIcon,
  type ProfileLineIconName,
} from "@/components/dashboard/profile/profile-shared";
import { ROUTES } from "@/constants/routes";
import { formatDate } from "@/lib/i18n/formatters";
import { cn } from "@/lib/utils";
import {
  buildProfileLegalFallback,
  fetchLegalCenter,
  getAllMissingConsents,
  isFallbackPolicyId,
  policyPublicHref,
  policyTypeLabel,
  type LegalCenterResponse,
  type LegalPolicyPublic,
  type MissingConsentItem,
} from "@/services/legal.service";

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
  const { authorizedFetch, isAuthenticated } = useAuth();
  const { t, locale } = useI18n();
  const [data, setData] = useState<LegalCenterResponse | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      const center = await fetchLegalCenter(authorizedFetch);
      if (center.activePolicies.length === 0) {
        setData(buildProfileLegalFallback(t));
        setOffline(true);
      } else {
        setData(center);
        setOffline(false);
      }
    } catch {
      setData(buildProfileLegalFallback(t));
      setOffline(true);
      setLoadError(t("profile.legal.loadError"));
    } finally {
      setLoading(false);
    }
  }, [authorizedFetch, isAuthenticated, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const allMissing = useMemo(
    () =>
      data && !offline
        ? getAllMissingConsents(data).filter(
            (item): item is MissingConsentItem & { policyId: string } =>
              Boolean(item.policyId && !isFallbackPolicyId(item.policyId)),
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
    const items = [...data.activePolicies];
    for (const fallback of buildProfileLegalFallback(t).activePolicies) {
      if (!items.some((p) => p.type === fallback.type)) {
        items.push(fallback);
      }
    }
    return items.filter((p) => {
      if (seen.has(p.type)) return false;
      seen.add(p.type);
      return true;
    });
  }, [data, t]);

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

  if (!isAuthenticated) {
    return (
      <div className="rounded-2xl bg-[#111111] px-4 py-6 text-center">
        <p className="text-sm text-zinc-400">{t("profile.legal.signInRequired")}</p>
        <Link href={ROUTES.login} className={cn(profileOkxPrimaryClass, "mt-4")}>
          {t("auth.login.submit")}
        </Link>
      </div>
    );
  }

  if (loading) {
    return <ProfileSectionSkeleton variant="list" rows={3} />;
  }

  if (!data) {
    return <p className="text-sm text-zinc-400">{t("profile.legal.empty")}</p>;
  }

  const requiredPolicies = displayPolicies.filter(
    (p) => p.requiresUserConsent && !isFallbackPolicyId(p.id),
  );
  const acceptedRequired = requiredPolicies.filter((p) =>
    acceptedSet.has(`${p.type}:${p.version}`),
  );
  const showScore = !offline && requiredPolicies.length > 0;
  const statusLabel = offline
    ? t("profile.legal.offlineStatus")
    : allMissing.length > 0
      ? t("profile.legal.missingBanner").replace("{count}", String(allMissing.length))
      : t("profile.legal.allAccepted");

  return (
    <div className="space-y-4 sm:space-y-5">
      <ProfileOkxHeader
        icon={showScore ? undefined : profileLineIcon("legal", "lg")}
        score={showScore ? acceptedRequired.length : undefined}
        scoreMax={showScore ? requiredPolicies.length : undefined}
        scoreLabel={
          showScore
            ? t("profile.legal.scoreRing").replace("{max}", String(requiredPolicies.length))
            : undefined
        }
        title={t("profile.legal.title")}
        subtitle={statusLabel}
        cta={
          loadError ? (
            <button type="button" onClick={() => void load()} className={profileOkxGhostClass}>
              <RefreshCw className="mr-1.5 size-3.5" aria-hidden />
              {t("profile.legal.retry")}
            </button>
          ) : allMissing.length > 0 ? (
            <button
              type="button"
              className={profileOkxPrimaryClass}
              onClick={() =>
                document
                  .getElementById("legal-accept")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
            >
              {t("profile.okx.setup")}
            </button>
          ) : (
            <ProfileOkxLink href={ROUTES.trust}>{t("profile.okx.use")}</ProfileOkxLink>
          )
        }
      />

      {allMissing.length > 0 ? (
        <ProfileOkxSpotlight
          icon={profileLineIcon("legal", "xl")}
          headline={t("profile.okx.spotlight.legal.headline")}
          body={t("profile.okx.spotlight.legal.body")}
          detailsHref={ROUTES.trust}
          detailsLabel={t("profile.okx.details")}
          cta={
            <button
              type="button"
              className={profileOkxPillClass}
              onClick={() =>
                document
                  .getElementById("legal-accept")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
            >
              {t("profile.okx.setup")}
            </button>
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
        {displayPolicies.map((p) => {
          const accepted = acceptedSet.has(`${p.type}:${p.version}`) && !isFallbackPolicyId(p.id);
          const title = p.title || policyTypeLabel(p.type, t);
          const version =
            !isFallbackPolicyId(p.id) && p.version !== "—"
              ? `${t("profile.legal.version")} ${p.version}`
              : t("profile.legal.documentsHint");
          const needsReadConfirm =
            !offline && p.requiresUserConsent && !accepted && !isFallbackPolicyId(p.id);
          return (
            <ProfileOkxRow
              key={p.type}
              icon={profileLineIcon(policyIcon(p.type))}
              title={title}
              description={version}
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
                isFallbackPolicyId(p.id) ? (
                  <Link href={policyPublicHref(p.type)} target="_blank" className={profileOkxGhostClass}>
                    {t("profile.okx.manage")}
                  </Link>
                ) : (
                  <SplitonCtaPill
                    type="button"
                    tone="onDark"
                    onClick={() => openPolicyDocument(p, needsReadConfirm)}
                    className="min-w-[11.5rem] shrink-0"
                  >
                    {t("profile.legal.readDocument")}
                  </SplitonCtaPill>
                )
              }
            />
          );
        })}
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
