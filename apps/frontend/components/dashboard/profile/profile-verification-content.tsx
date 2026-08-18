"use client";

/** Состояние для прототипа: `?tab=verification&verifyStatus=in_progress` (см. `VERIFICATION_STATUS_QUERY`). */

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import {
  VERIFICATION_STATUS_QUERY,
  parseVerificationUiStatus,
} from "@/constants/dashboard/profile-verification";
import { ProfileVerificationLiveContent } from "@/components/dashboard/profile/profile-verification-live-content";
import {
  ProfileOkxAlert,
  ProfileOkxBanner,
  ProfileOkxLink,
  ProfileOkxRow,
  ProfileOkxSection,
  ProfileOkxSpotlight,
} from "@/components/dashboard/profile/profile-okx";
import {
  ProfileVerificationDocsSection,
  type VerificationDocDrafts,
} from "@/components/dashboard/profile/profile-verification-docs-section";
import { PROFILE_GLASS, profileLineIcon } from "@/components/dashboard/profile/profile-shared";
import { ProfileVerificationStatusHero } from "@/components/dashboard/profile/profile-verification-status-hero";
import { profilePrimaryButtonClass } from "@/components/dashboard/profile/profile-ui";
import { useAuthUi } from "@/hooks/use-auth-ui";
import { ProfileSectionSkeleton } from "@/components/dashboard/profile/profile-section-skeleton";
import { useI18n } from "@/components/providers/i18n-provider";
import { SplitonCtaPill } from "@/components/ui/spliton-cta-pill";
import { isAccountCenterPrototypeAllowed, isLiveAccountEnabled } from "@/lib/public-env";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

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
  const { authenticated, pending } = useAuthUi();
  const { t } = useI18n();
  const live = isLiveAccountEnabled() && authenticated;
  const prototype = isAccountCenterPrototypeAllowed();

  if (pending) {
    return <ProfileSectionSkeleton variant="form" />;
  }

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
  const [done, setDone] = useState({ identity: false, address: false, selfie: false });
  const [requestedModal, setRequestedModal] = useState<"details" | null>(null);
  const [drafts, setDrafts] = useState<VerificationDocDrafts>({
    countryCode: "",
    documentType: "passport",
    documentRef: "",
    city: "",
    street: "",
    postalCode: "",
  });

  const heroAction = {
    label: t("verification.manualFormOpen"),
    onClick: () => setRequestedModal("details"),
  };

  const spotlightCta = (
    <SplitonCtaPill type="button" tone="onDark" className="w-full min-w-0" onClick={() => setRequestedModal("details")}>
      {t("verification.start")}
    </SplitonCtaPill>
  );

  return (
    <div className="space-y-4 sm:space-y-5">
      <ProfileVerificationStatusHero action={heroAction} />

      <ProfileOkxSpotlight
        icon={profileLineIcon("verification", "xl")}
        headline={t("profile.okx.spotlight.verification.headline")}
        body={t("profile.okx.spotlight.verification.body")}
        detailsHref={ROUTES.dashboardSupport}
        detailsLabel={t("profile.okx.details")}
        cta={spotlightCta}
      />

      {status === "rejected" ? (
        <ProfileOkxAlert title={t("verification.rejectionTitle")}>
          <p>{t("verification.rejectionPhoto")}</p>
          <p className="mt-1">{t("verification.rejectionAddress")}</p>
          <p className="mt-2">{t("verification.rejectionResubmit")}</p>
        </ProfileOkxAlert>
      ) : null}

      <ProfileVerificationDocsSection
        identityDone={done.identity}
        addressDone={done.address}
        selfieDone={done.selfie}
        canEdit
        showDetailsRow
        drafts={drafts}
        onDraftsChange={setDrafts}
        onSaveIdentity={() => {
          setDone((prev) => ({ ...prev, identity: true }));
          return true;
        }}
        onSaveAddress={() => {
          setDone((prev) => ({ ...prev, address: true }));
          return true;
        }}
        onSaveSelfie={() => {
          setDone((prev) => ({ ...prev, selfie: true }));
          return true;
        }}
        requireSelfieFile={false}
        requestedModal={requestedModal}
        onRequestedModalHandled={() => setRequestedModal(null)}
      />

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

      <ProfileOkxBanner
        icon={PROFILE_GLASS.support}
        iconSize="lg"
        title={t("verification.helpTitle")}
        description={t("verification.helpBody")}
        action={<ProfileOkxLink href={ROUTES.dashboardSupport}>{t("verification.contactSupport")}</ProfileOkxLink>}
      />
    </div>
  );
}
