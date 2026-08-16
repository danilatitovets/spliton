"use client";

/** Состояние для прототипа: `?tab=verification&verifyStatus=in_progress` (см. `VERIFICATION_STATUS_QUERY`). */

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

import {
  VERIFICATION_STATUS_QUERY,
  parseVerificationUiStatus,
  type VerificationUiStatus,
} from "@/constants/dashboard/profile-verification";
import { ProfileVerificationLiveContent } from "@/components/dashboard/profile/profile-verification-live-content";
import {
  ProfileOkxAlert,
  ProfileOkxBanner,
  ProfileOkxLink,
  ProfileOkxRecommended,
  ProfileOkxRow,
  ProfileOkxSection,
  ProfileOkxSpotlight,
  profileOkxGhostClass,
} from "@/components/dashboard/profile/profile-okx";
import { PROFILE_GLASS, profileLineIcon } from "@/components/dashboard/profile/profile-shared";
import { ProfileVerificationStatusHero } from "@/components/dashboard/profile/profile-verification-status-hero";
import { profilePrimaryButtonClass } from "@/components/dashboard/profile/profile-ui";
import { useAuth } from "@/components/providers/auth-provider";
import { useI18n } from "@/components/providers/i18n-provider";
import { SplitonCtaPill } from "@/components/ui/spliton-cta-pill";
import { isAccountCenterPrototypeAllowed, isLiveAccountEnabled } from "@/lib/public-env";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

function VerificationHref(next: VerificationUiStatus) {
  const u = new URLSearchParams();
  u.set("tab", "verification");
  u.set(VERIFICATION_STATUS_QUERY, next);
  return `${ROUTES.dashboardProfile}?${u.toString()}`;
}

const ACCESS_ROW_DEFS = [
  { id: "deposit", labelKey: "verification.access.deposit", before: "limited" as const, after: "full" as const },
  { id: "withdraw", labelKey: "verification.access.withdraw", before: "limited" as const, after: "full" as const },
  { id: "secondary", labelKey: "verification.access.secondary", before: "limited" as const, after: "full" as const },
  { id: "limits", labelKey: "verification.access.limits", before: "limited" as const, after: "full" as const },
];

function accessLabel(level: "full" | "limited" | "none", t: (k: string) => string) {
  if (level === "full") return t("verification.access.full");
  if (level === "limited") return t("verification.access.limited");
  return t("verification.access.none");
}

export function ProfileVerificationContent() {
  const { isAuthenticated } = useAuth();
  const { t } = useI18n();
  const live = isLiveAccountEnabled() && isAuthenticated;
  const prototype = isAccountCenterPrototypeAllowed();

  if (live) {
    return <ProfileVerificationLiveContent />;
  }

  if (!prototype) {
    return (
      <div className="rounded-2xl bg-[#111111] px-4 py-6 text-center">
        <p className="text-sm font-medium text-white">{t("verification.signInRequiredTitle")}</p>
        <p className="mt-1 text-sm text-zinc-500">{t("verification.signInRequiredBody")}</p>
        <Link href={ROUTES.login} className={cn(profilePrimaryButtonClass, "mt-4")}>
          {t("verification.signInCta")}
        </Link>
      </div>
    );
  }

  return <ProfileVerificationDemoContent />;
}

function ProfileVerificationDemoContent() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const status = useMemo(
    () => parseVerificationUiStatus(searchParams.get(VERIFICATION_STATUS_QUERY)),
    [searchParams],
  );
  const idOk = status === "pending_review" || status === "approved" || status === "in_progress";
  const addrOk = status === "pending_review" || status === "approved";
  const selfieOk = status === "pending_review" || status === "approved";

  const heroAction =
    status === "not_started" || status === "rejected"
      ? {
          label: status === "rejected" ? t("verification.formAndContinue") : t("verification.manualFormOpen"),
          href: VerificationHref("in_progress"),
        }
      : status === "in_progress"
        ? {
            label: t("verification.manualFormOpen"),
            href: VerificationHref("pending_review"),
          }
        : status === "approved"
          ? {
              label: t("verification.goPayouts", "История выплат"),
              href: ROUTES.dashboardPayoutsHistory,
            }
          : null;

  const spotlightCta =
    status === "not_started" || status === "rejected" ? (
      <SplitonCtaPill href={VerificationHref("in_progress")} tone="onDark" className="w-full min-w-0">
        {status === "rejected" ? t("verification.formAndContinue") : t("verification.start")}
      </SplitonCtaPill>
    ) : status === "in_progress" ? (
      <SplitonCtaPill href={VerificationHref("pending_review")} tone="onDark" className="w-full min-w-0">
        {t("verification.manualFormOpen")}
      </SplitonCtaPill>
    ) : null;

  return (
    <div className="space-y-4 sm:space-y-5">
      <ProfileVerificationStatusHero action={heroAction} />

      {status === "not_started" || status === "rejected" ? (
        <ProfileOkxSpotlight
          icon={profileLineIcon("verification", "xl")}
          headline={t("profile.okx.spotlight.verification.headline")}
          body={t("profile.okx.spotlight.verification.body")}
          detailsHref={ROUTES.dashboardSupport}
          detailsLabel={t("profile.okx.details")}
          cta={spotlightCta}
        />
      ) : null}

      {status === "rejected" ? (
        <ProfileOkxAlert title={t("verification.rejectionTitle")}>
          <p>{t("verification.rejectionPhoto")}</p>
          <p className="mt-1">{t("verification.rejectionAddress")}</p>
          <p className="mt-2">{t("verification.rejectionResubmit")}</p>
        </ProfileOkxAlert>
      ) : null}

      <ProfileOkxSection title={t("verification.documents.prepare")}>
        <ProfileOkxRow
          icon={profileLineIcon("id")}
          title={t("verification.doc.idTitle")}
          description={t("verification.doc.idSub")}
          action={
            <span className={profileOkxGhostClass}>
              {idOk ? t("verification.step.done", "Пройден") : t("profile.okx.setup")}
            </span>
          }
        />
        <ProfileOkxRow
          icon={profileLineIcon("address")}
          title={t("verification.doc.addrTitle")}
          description={t("verification.doc.addrSub")}
          badge={<ProfileOkxRecommended>{t("profile.okx.recommended")}</ProfileOkxRecommended>}
          action={
            <span className={profileOkxGhostClass}>
              {addrOk ? t("verification.step.done", "Пройден") : t("profile.okx.setup")}
            </span>
          }
        />
        <ProfileOkxRow
          icon={profileLineIcon("selfie")}
          title={t("verification.doc.selfieTitle")}
          description={t("verification.doc.selfieSub")}
          action={
            <span className={profileOkxGhostClass}>
              {selfieOk ? t("verification.step.done", "Пройден") : t("profile.okx.setup")}
            </span>
          }
        />
      </ProfileOkxSection>

      <ProfileOkxSection title={t("verification.accessTitle")}>
        {ACCESS_ROW_DEFS.map((row) => {
          const before = status === "approved" ? "full" : row.before;
          return (
            <ProfileOkxRow
              key={row.id}
              icon={profileLineIcon("verification")}
              title={t(row.labelKey)}
              description={`${t("verification.table.now")}: ${accessLabel(before, t)}. ${t("verification.table.after")}: ${accessLabel(row.after, t)}`}
            />
          );
        })}
      </ProfileOkxSection>

      {status === "in_progress" || status === "pending_review" || status === "approved" || status === "rejected" ? (
        <ProfileOkxSection title={t("verification.submitted.title", "Кратко о данных")}>
          <ProfileOkxRow
            icon={profileLineIcon("profile")}
            title={t("verification.submitted.name", "ФИО")}
            description="Иванов И. И."
          />
          <ProfileOkxRow
            icon={profileLineIcon("id")}
            title={t("verification.submitted.doc", "Документ")}
            description="Паспорт 4512"
          />
          <ProfileOkxRow
            icon={profileLineIcon("address")}
            title={t("verification.submitted.country", "Страна")}
            description="Россия"
          />
        </ProfileOkxSection>
      ) : null}

      {status === "in_progress" ? (
        <div className="flex flex-wrap gap-2">
          <button type="button" className={profileOkxGhostClass}>
            {t("verification.saveDraft")}
          </button>
        </div>
      ) : null}

      <ProfileOkxBanner
        icon={PROFILE_GLASS.support}
        iconSize="lg"
        title={t("verification.helpTitle")}
        description={t("verification.helpBody")}
        action={<ProfileOkxLink href={ROUTES.dashboardSupport}>{t("profile.okx.use")}</ProfileOkxLink>}
      />
    </div>
  );
}
