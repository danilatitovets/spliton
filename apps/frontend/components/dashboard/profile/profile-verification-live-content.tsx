"use client";

import { useMemo, useState } from "react";

import { profileDashboardHref } from "@/constants/dashboard/profile-page";
import type { VerificationUiStatus } from "@/constants/dashboard/profile-verification";
import { ROUTES } from "@/constants/routes";
import { ProfileEligibilityRows } from "@/components/dashboard/profile/profile-eligibility-rows";
import {
  ProfileOkxAlert,
  ProfileOkxBanner,
  ProfileOkxLink,
  ProfileOkxRecommended,
  ProfileOkxRow,
  ProfileOkxSection,
  ProfileOkxSpotlight,
  profileOkxGhostClass,
  profileOkxPillClass,
} from "@/components/dashboard/profile/profile-okx";
import {
  ProfileSecurityModal,
  ProfileSecurityModalField,
  ProfileSecurityModalFieldList,
  ProfileSecurityModalHints,
  ProfileSecurityModalSupportNote,
} from "@/components/dashboard/profile/profile-security-modal";
import { PROFILE_GLASS, profileLineIcon } from "@/components/dashboard/profile/profile-shared";
import { ProfileSectionSkeleton } from "@/components/dashboard/profile/profile-section-skeleton";
import { ProfileVerificationTimeline } from "@/components/dashboard/profile/profile-verification-timeline";
import { ProfileVerificationStatusHero } from "@/components/dashboard/profile/profile-verification-status-hero";
import { VERIFY_VIDEO } from "@/components/dashboard/profile/profile-verification-steps";
import { profileModalInputClass } from "@/components/dashboard/profile/profile-ui";
import { useEligibilitySummary } from "@/hooks/use-eligibility-summary";
import { useKycStatus } from "@/hooks/use-kyc-status";
import { useI18n } from "@/components/providers/i18n-provider";
import { SplitonCtaPill } from "@/components/ui/spliton-cta-pill";
import { StyledSelect } from "@/components/ui/styled-select";
import { mapEligibilityToAccess } from "@/lib/profile/eligibility-access";
import { mapKycStatusToUi } from "@/lib/kyc/kyc-status-adapter";
import { cn } from "@/lib/utils";

export function ProfileVerificationLiveContent() {
  const { t } = useI18n();
  const { data, loading, error, submitting, reload, start, submitManual } = useKycStatus();
  const {
    data: eligibility,
    loading: eligibilityLoading,
    error: eligibilityError,
  } = useEligibilitySummary();

  const [countryCode, setCountryCode] = useState("RU");
  const [documentType, setDocumentType] = useState("passport");
  const [documentRef, setDocumentRef] = useState("");
  const [formOpen, setFormOpen] = useState(false);

  const status = useMemo(
    () => (data ? mapKycStatusToUi(data.status) : "not_started"),
    [data],
  );
  const eligibilityRows = useMemo(() => {
    if (!eligibility) return [];
    return [
      mapEligibilityToAccess("deposit", "verification.access.deposit", eligibility.deposit),
      mapEligibilityToAccess("withdraw", "verification.access.withdraw", eligibility.withdraw),
      mapEligibilityToAccess("primary", "verification.access.primary", eligibility.primary),
      mapEligibilityToAccess("secondary", "verification.access.secondary", eligibility.secondary),
      {
        id: "payouts",
        labelKey: "verification.access.payouts",
        status: eligibility.withdraw.allowed ? ("allowed" as const) : ("limited" as const),
        message: eligibility.withdraw.userMessage,
        ctaHref: eligibility.withdraw.allowed ? ROUTES.dashboardPayoutsHistory : profileDashboardHref("verification"),
        ctaLabelKey: eligibility.withdraw.allowed
          ? "verification.eligibility.cta.viewPayouts"
          : "verification.eligibility.cta.completeKyc",
      },
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

  if (loading && !data) {
    return <ProfileSectionSkeleton variant="cards" />;
  }

  if (error && !data) {
    return (
      <div className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-300" role="alert">
        {error.startsWith("verification.") ? t(error) : error}
        <button type="button" className="ml-3 font-semibold underline" onClick={() => void reload()}>
          {t("actions.retry")}
        </button>
      </div>
    );
  }

  const idOk = status === "pending_review" || status === "approved" || status === "in_progress";
  const addrOk = status === "pending_review" || status === "approved";
  const selfieOk = status === "pending_review" || status === "approved";

  const canFillForm = status === "not_started" || status === "in_progress" || status === "rejected";
  const canSubmitManual = countryCode.trim().length >= 2 && documentRef.trim().length > 0;

  const heroCtaLabel =
    status === "rejected" ? t("verification.fixAndContinue") : t("verification.manualFormOpen");

  const heroAction = canFillForm
    ? {
        label: heroCtaLabel,
        onClick: () => setFormOpen(true),
      }
    : status === "approved"
      ? {
          label: t("verification.goPayouts"),
          href: ROUTES.dashboardPayoutsHistory,
        }
      : null;

  const spotlightCta = canFillForm ? (
    <SplitonCtaPill type="button" tone="onDark" onClick={() => setFormOpen(true)} className="w-full min-w-0">
      {heroCtaLabel}
    </SplitonCtaPill>
  ) : status === "approved" ? (
    <SplitonCtaPill href={ROUTES.dashboardPayoutsHistory} tone="onDark" className="w-full min-w-0">
      {t("verification.goPayouts")}
    </SplitonCtaPill>
  ) : (
    <SplitonCtaPill type="button" tone="onDark" disabled className="w-full min-w-0 opacity-50">
      {t("verification.reviewing")}
    </SplitonCtaPill>
  );

  const handleFormSubmit = async () => {
    const country = countryCode.trim() || undefined;
    if (status === "not_started" || status === "rejected") {
      const started = await start(country);
      if (!started) return;
      if (!documentRef.trim()) return;
      const submitted = await submitManual({
        countryCode: countryCode.trim(),
        documentType,
        documentReference: documentRef.trim(),
      });
      if (submitted) setFormOpen(false);
      return;
    }
    if (status === "in_progress") {
      const submitted = await submitManual({
        countryCode: countryCode.trim(),
        documentType,
        documentReference: documentRef.trim(),
      });
      if (submitted) setFormOpen(false);
    }
  };

  const formFooterLabel =
    submitting
      ? t("verification.submitting")
      : status === "rejected" && !documentRef.trim()
        ? t("verification.fixAndContinue")
        : status === "in_progress" || documentRef.trim()
          ? t("verification.submit")
          : t("verification.start");

  const formFooterDisabled =
    submitting ||
    countryCode.trim().length < 2 ||
    (status === "in_progress" && !canSubmitManual);

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

      {status === "rejected" && data?.rejectionReasonSafe ? (
        <ProfileOkxAlert title={t("verification.rejectionTitle")}>
          <p>{data.rejectionReasonSafe}</p>
        </ProfileOkxAlert>
      ) : null}

      <ProfileOkxSection title={t("verification.documents.prepare")}>
        {canFillForm ? (
          <ProfileOkxRow
            icon={profileLineIcon("verification")}
            title={t("verification.manualFormTitle")}
            action={
              <button type="button" onClick={() => setFormOpen(true)} className={profileOkxGhostClass}>
                {t("verification.manualFormOpen")}
              </button>
            }
          />
        ) : null}
        <ProfileOkxRow
          icon={profileLineIcon("id")}
          title={t("verification.doc.idTitle")}
          description={t("verification.doc.idSub")}
          action={
            canFillForm && !idOk ? (
              <button type="button" onClick={() => setFormOpen(true)} className={profileOkxGhostClass}>
                {t("profile.okx.setup")}
              </button>
            ) : (
              <span className={profileOkxGhostClass}>
                {idOk ? t("verification.step.done", "Пройден") : t("profile.okx.setup")}
              </span>
            )
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

      <ProfileSecurityModal
        open={formOpen}
        onOpenChange={setFormOpen}
        title={t("verification.manualFormTitle")}
        description={t("verification.manualFormHint")}
        headerVideo
        headerVideoSrc={VERIFY_VIDEO}
        footer={
          <div className="space-y-3">
            {error ? (
              <p className="text-center text-sm text-red-400" role="alert">
                {error.startsWith("verification.") ? t(error) : error}
              </p>
            ) : null}
            <button
              type="button"
              disabled={formFooterDisabled}
              onClick={() => void handleFormSubmit()}
              className={cn(profileOkxPillClass, "disabled:opacity-60")}
            >
              {formFooterLabel}
            </button>
          </div>
        }
      >
        <ProfileSecurityModalFieldList>
          <ProfileSecurityModalField label={t("verification.countryCode")} htmlFor="kyc-country">
            <input
              id="kyc-country"
              type="text"
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value.toUpperCase())}
              placeholder="RU"
              className={profileModalInputClass}
              autoComplete="country"
            />
          </ProfileSecurityModalField>
          <ProfileSecurityModalField label={t("verification.documentType")} htmlFor="kyc-doc-type">
            <StyledSelect
              id="kyc-doc-type"
              value={documentType}
              options={[
                { value: "passport", label: t("verification.docPassport") },
                { value: "id_card", label: t("verification.docId") },
              ]}
              onChange={setDocumentType}
              aria-label={t("verification.documentType")}
              tone="dark"
              fullWidth
              className="[&_button]:h-11 [&_button]:rounded-xl [&_button]:border-white/[0.14] [&_button]:bg-black/35 [&_button]:px-3.5 [&_button]:hover:bg-black/45"
            />
          </ProfileSecurityModalField>
          <ProfileSecurityModalField label={t("verification.documentRef")} htmlFor="kyc-doc-ref">
            <input
              id="kyc-doc-ref"
              type="text"
              value={documentRef}
              onChange={(e) => setDocumentRef(e.target.value)}
              placeholder="****1234"
              className={cn(profileModalInputClass, "font-mono tracking-wide")}
              autoComplete="off"
            />
          </ProfileSecurityModalField>
        </ProfileSecurityModalFieldList>
        <ProfileSecurityModalHints items={[t("verification.manualProviderHint")]} />
        <ProfileSecurityModalSupportNote
          iconSrc={PROFILE_GLASS.support}
          title={t("verification.helpTitle")}
          body={t("verification.helpBody")}
        />
      </ProfileSecurityModal>

      {status === "pending_review" ? (
        <ProfileOkxAlert title={t("verification.status.pendingReview")}>
          <p>{t("verification.pendingHint")}</p>
        </ProfileOkxAlert>
      ) : null}

      <ProfileOkxSection title={t("verification.timeline.title")}>
        <div className="px-4 pb-2 sm:px-5">
          <ProfileVerificationTimeline status={status} />
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
        action={<ProfileOkxLink href={ROUTES.dashboardSupport}>{t("profile.okx.use")}</ProfileOkxLink>}
      />
    </div>
  );
}
