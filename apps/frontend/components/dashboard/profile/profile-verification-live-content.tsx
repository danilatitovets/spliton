"use client";

import { useEffect, useMemo, useState } from "react";

import { ROUTES } from "@/constants/routes";
import { ProfileEligibilityRows } from "@/components/dashboard/profile/profile-eligibility-rows";
import {
  ProfileOkxAlert,
  ProfileOkxBanner,
  ProfileOkxLink,
  ProfileOkxSection,
  ProfileOkxSpotlight,
} from "@/components/dashboard/profile/profile-okx";
import { PROFILE_GLASS, profileLineIcon } from "@/components/dashboard/profile/profile-shared";
import { ProfileSectionSkeleton } from "@/components/dashboard/profile/profile-section-skeleton";
import { ProfileVerificationTimeline } from "@/components/dashboard/profile/profile-verification-timeline";
import { ProfileVerificationStatusHero } from "@/components/dashboard/profile/profile-verification-status-hero";
import {
  ProfileVerificationDocsSection,
  type VerificationDocDrafts,
  type VerificationDocModal,
} from "@/components/dashboard/profile/profile-verification-docs-section";
import { SplitonCtaPill } from "@/components/ui/spliton-cta-pill";
import { useEligibilitySummary } from "@/hooks/use-eligibility-summary";
import { useKycStatus } from "@/hooks/use-kyc-status";
import { useI18n } from "@/components/providers/i18n-provider";
import { mapEligibilityToAccess } from "@/lib/profile/eligibility-access";
import { emptyKycSteps } from "@/lib/kyc/kyc-status-adapter";
import { cn } from "@/lib/utils";

const emptyDrafts = (): VerificationDocDrafts => ({
  countryCode: "",
  documentType: "passport",
  documentRef: "",
  city: "",
  street: "",
  postalCode: "",
});

export function ProfileVerificationLiveContent() {
  const { t } = useI18n();
  const kyc = useKycStatus();
  const {
    data,
    loading,
    error,
    submitting,
    reload,
    start,
    saveDetails,
    submitManual,
    saveAddress,
    uploadDocument,
  } = kyc;
  const {
    data: eligibility,
    loading: eligibilityLoading,
    error: eligibilityError,
  } = useEligibilitySummary();

  const [drafts, setDrafts] = useState<VerificationDocDrafts>(emptyDrafts);
  const [requestedModal, setRequestedModal] = useState<VerificationDocModal>(null);

  useEffect(() => {
    if (!data) return;
    setDrafts((prev) => ({
      countryCode: data.countryCode || data.profileCountryCode || prev.countryCode || "",
      documentType: data.documentType || prev.documentType || "passport",
      documentRef: data.documentReference || prev.documentRef,
      city: data.address?.city || prev.city,
      street: data.address?.street || prev.street,
      postalCode: data.address?.postalCode || prev.postalCode,
    }));
  }, [data]);

  const steps = data?.steps ?? emptyKycSteps();
  const apiStatus = data?.status;
  const reviewLocked = apiStatus === "IN_REVIEW" || apiStatus === "MANUAL_REVIEW_REQUIRED";
  const canFillForm =
    apiStatus === "NOT_STARTED" ||
    apiStatus === "PENDING" ||
    apiStatus === "REJECTED" ||
    apiStatus === "EXPIRED";

  const canSubmit = Boolean(data?.canSubmit);

  const eligibilityRows = useMemo(() => {
    if (!eligibility) return [];
    return [
      mapEligibilityToAccess("deposit", "verification.access.deposit", eligibility.deposit),
      mapEligibilityToAccess("withdraw", "verification.access.withdraw", eligibility.withdraw),
      mapEligibilityToAccess("primary", "verification.access.primary", eligibility.primary),
      mapEligibilityToAccess("secondary", "verification.access.secondary", eligibility.secondary),
      mapEligibilityToAccess("payouts", "verification.access.payouts", eligibility.withdraw),
      {
        id: "documents",
        labelKey: "verification.access.documents",
        status: "allowed" as const,
        ctaHref: ROUTES.dashboardDocuments,
        ctaLabelKey: "verification.eligibility.cta.openDocuments",
      },
      {
        id: "statements",
        labelKey: "verification.access.statements",
        status: "allowed" as const,
        ctaHref: ROUTES.dashboardStatements,
        ctaLabelKey: "verification.eligibility.cta.openStatements",
      },
    ];
  }, [eligibility]);

  if ((loading && !data) || (!data && !error)) {
    return <ProfileSectionSkeleton variant="cards" />;
  }

  if (error && !data) {
    return (
      <div className="rounded-2xl bg-[#111111] px-4 py-6 text-sm text-zinc-300" role="alert">
        <p className="font-medium text-white">{t("verification.loadError")}</p>
        <button type="button" className="mt-4 font-semibold text-white underline" onClick={() => void reload()}>
          {t("actions.retry")}
        </button>
      </div>
    );
  }

  if (!data || !apiStatus) return null;

  const heroAction = heroActionFor(
    apiStatus,
    canSubmit,
    canFillForm,
    submitting,
    t,
    () => setRequestedModal("details"),
    () => void handleFinalSubmit(),
  );

  const showSpotlight = apiStatus === "NOT_STARTED" || apiStatus === "REJECTED";
  const spotlightCta = canFillForm ? (
    <SplitonCtaPill type="button" tone="onDark" className="w-full min-w-0" onClick={() => setRequestedModal("details")}>
      {apiStatus === "REJECTED" ? t("verification.fixAndContinue") : t("verification.start")}
    </SplitonCtaPill>
  ) : null;

  async function saveIdentity(file: File | null) {
    const country = drafts.countryCode.trim();
    if (apiStatus === "NOT_STARTED" || apiStatus === "REJECTED" || apiStatus === "EXPIRED") {
      const started = await start(country || undefined);
      if (!started) return false;
    }
    const saved = await saveDetails({
      countryCode: country,
      documentType: drafts.documentType,
      documentReference: drafts.documentRef.trim(),
    });
    if (!saved) return false;
    if (file) return uploadDocument("identity", file);
    return true;
  }

  async function handleSaveAddress(file: File | null) {
    const ok = await saveAddress({
      city: drafts.city.trim(),
      street: drafts.street.trim(),
      postalCode: drafts.postalCode.trim(),
      countryCode: drafts.countryCode.trim() || undefined,
    });
    if (!ok) return false;
    if (file) return uploadDocument("address", file);
    return true;
  }

  async function saveSelfie(file: File | null) {
    if (!file) return steps.selfie;
    return uploadDocument("selfie", file);
  }

  async function handleFinalSubmit() {
    if (submitting || !canSubmit) return;
    await submitManual();
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      <ProfileVerificationStatusHero action={heroAction} />

      {showSpotlight ? (
        <ProfileOkxSpotlight
          icon={profileLineIcon("verification", "xl")}
          headline={t("profile.okx.spotlight.verification.headline")}
          body={t("profile.okx.spotlight.verification.body")}
          detailsHref={ROUTES.dashboardSupport}
          detailsLabel={t("profile.okx.details")}
          cta={spotlightCta}
        />
      ) : null}

      {apiStatus === "REJECTED" && data.rejectionReasonSafe ? (
        <ProfileOkxAlert title={t("verification.rejectionTitle")}>
          <p>{data.rejectionReasonSafe}</p>
        </ProfileOkxAlert>
      ) : null}

      {reviewLocked ? (
        <ProfileOkxAlert title={t("verification.status.pendingReview")}>
          <p>{t("verification.pendingHint")}</p>
        </ProfileOkxAlert>
      ) : null}

      <ProfileVerificationDocsSection
        identityDone={steps.identity || apiStatus === "APPROVED"}
        addressDone={steps.address}
        selfieDone={steps.selfie}
        canEdit={canFillForm}
        showDetailsRow
        submitting={submitting}
        error={error}
        drafts={drafts}
        onDraftsChange={setDrafts}
        onSaveIdentity={saveIdentity}
        onSaveAddress={handleSaveAddress}
        onSaveSelfie={saveSelfie}
        requestedModal={requestedModal}
        onRequestedModalHandled={() => setRequestedModal(null)}
      />

      {canFillForm ? (
        <div className="px-1">
          <button
            type="button"
            disabled={submitting || !canSubmit}
            onClick={() => void handleFinalSubmit()}
            className={cn(
              "inline-flex h-11 min-h-11 items-center justify-center rounded-full px-6 text-[13px] font-semibold",
              canSubmit ? "bg-white text-black" : "cursor-not-allowed bg-white/10 text-white/40",
            )}
          >
            {submitting ? t("verification.submitting") : t("verification.submit")}
          </button>
        </div>
      ) : null}

      <ProfileOkxSection title={t("verification.timeline.title")}>
        <div className="px-4 py-5 sm:px-6 sm:py-6">
          <ProfileVerificationTimeline
            status={apiStatus}
            submittedAt={data.submittedAt}
            reviewedAt={data.reviewedAt}
          />
        </div>
      </ProfileOkxSection>

      <ProfileOkxSection title={t("verification.accessTitle")}>
        {eligibilityLoading ? (
          <div className="px-4 py-4 sm:px-5">
            <ProfileSectionSkeleton variant="table" rows={4} />
          </div>
        ) : eligibilityError ? (
          <p className="px-4 py-4 text-sm text-red-400 sm:px-5">{t(eligibilityError)}</p>
        ) : (
          <ProfileEligibilityRows rows={eligibilityRows} />
        )}
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

function heroActionFor(
  status: NonNullable<ReturnType<typeof useKycStatus>["data"]>["status"],
  canSubmit: boolean,
  canFillForm: boolean,
  submitting: boolean,
  t: (k: string) => string,
  openDetails: () => void,
  onSubmit: () => void,
) {
  if (status === "APPROVED") {
    return { label: t("verification.goPayouts"), href: ROUTES.dashboardPayoutsHistory };
  }
  if (status === "IN_REVIEW" || status === "MANUAL_REVIEW_REQUIRED") {
    return { label: t("verification.reviewing"), disabled: true };
  }
  if (status === "REJECTED") {
    return { label: t("verification.fixAndContinue"), onClick: openDetails };
  }
  if (status === "EXPIRED") {
    return { label: t("verification.expired.cta"), onClick: openDetails };
  }
  if (canSubmit) {
    return { label: t("verification.submit"), onClick: onSubmit, disabled: submitting };
  }
  if (canFillForm) {
    return { label: status === "NOT_STARTED" ? t("verification.start") : t("verification.manualFormOpen"), onClick: openDetails };
  }
  return null;
}
