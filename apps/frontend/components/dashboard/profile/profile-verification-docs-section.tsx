"use client";

import { useState, useEffect, type ChangeEvent } from "react";

import {
  ProfileOkxRecommended,
  ProfileOkxRow,
  ProfileOkxSection,
  profileOkxGhostClass,
  profileOkxPillClass,
} from "@/components/dashboard/profile/profile-okx";
import {
  ProfileSecurityModal,
  ProfileSecurityModalField,
  ProfileSecurityModalFieldList,
  ProfileSecurityModalHints,
} from "@/components/dashboard/profile/profile-security-modal";
import { profileLineIcon } from "@/components/dashboard/profile/profile-shared";
import { VERIFY_VIDEO } from "@/components/dashboard/profile/profile-verification-steps";
import {
  profileModalBareInputClass,
  profileModalBareSurfaceClass,
} from "@/components/dashboard/profile/profile-ui";
import { StyledSelect } from "@/components/ui/styled-select";
import { useI18n } from "@/components/providers/i18n-provider";
import { cn } from "@/lib/utils";

export type VerificationDocModal = "details" | "identity" | "address" | "selfie" | null;

export type VerificationDocDrafts = {
  countryCode: string;
  documentType: string;
  documentRef: string;
  city: string;
  street: string;
  postalCode: string;
};

type Props = {
  identityDone: boolean;
  addressDone: boolean;
  selfieDone: boolean;
  canEdit: boolean;
  showDetailsRow?: boolean;
  submitting?: boolean;
  error?: string | null;
  drafts: VerificationDocDrafts;
  onDraftsChange: (next: VerificationDocDrafts) => void;
  onSaveIdentity: (file: File | null) => boolean | Promise<boolean>;
  onSaveAddress: (file: File | null) => boolean | Promise<boolean>;
  onSaveSelfie: (file: File | null) => boolean | Promise<boolean>;
  requireSelfieFile?: boolean;
  requestedModal?: VerificationDocModal;
  onRequestedModalHandled?: () => void;
  hideList?: boolean;
};

function SetupAction({
  done,
  canEdit,
  labelDone,
  labelSetup,
  onClick,
}: {
  done: boolean;
  canEdit: boolean;
  labelDone: string;
  labelSetup: string;
  onClick: () => void;
}) {
  if (!canEdit) {
    return <span className={profileOkxGhostClass}>{done ? labelDone : labelSetup}</span>;
  }
  return (
    <button type="button" onClick={onClick} className={profileOkxGhostClass}>
      {done ? labelDone : labelSetup}
    </button>
  );
}

function FileField({
  id,
  label,
  accept,
  file,
  onChange,
  emptyLabel,
  removeLabel,
}: {
  id: string;
  label: string;
  accept: string;
  file: File | null;
  onChange: (file: File | null) => void;
  emptyLabel: string;
  removeLabel: string;
}) {
  return (
    <ProfileSecurityModalField bare label={label} htmlFor={id}>
      <label
        htmlFor={id}
        className={cn(
          profileModalBareSurfaceClass,
          "flex min-h-11 cursor-pointer items-center justify-between gap-3 px-3.5 py-2 text-[15px] text-white",
        )}
      >
        <span className={cn("min-w-0 truncate", file ? "text-white" : "text-zinc-500")}>
          {file ? `${file.name} — ${(file.size / 1024).toFixed(0)} KB` : emptyLabel}
        </span>
        {file ? (
          <button
            type="button"
            className="shrink-0 text-[12px] font-medium text-zinc-400"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onChange(null);
            }}
          >
            {removeLabel}
          </button>
        ) : (
          <span className="shrink-0 text-[12px] font-medium text-zinc-400">+</span>
        )}
      </label>
      <input
        id={id}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.files?.[0] ?? null)}
      />
    </ProfileSecurityModalField>
  );
}

export function ProfileVerificationDocsSection({
  identityDone,
  addressDone,
  selfieDone,
  canEdit,
  showDetailsRow = true,
  submitting = false,
  error,
  drafts,
  onDraftsChange,
  onSaveIdentity,
  onSaveAddress,
  onSaveSelfie,
  requireSelfieFile = true,
  requestedModal = null,
  onRequestedModalHandled,
  hideList = false,
}: Props) {
  const { t } = useI18n();
  const [modal, setModal] = useState<VerificationDocModal>(null);

  useEffect(() => {
    if (!requestedModal) return;
    setModal(requestedModal);
    onRequestedModalHandled?.();
  }, [requestedModal, onRequestedModalHandled]);
  const [identityFile, setIdentityFile] = useState<File | null>(null);
  const [addressFile, setAddressFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);

  const doneLabel = t("verification.step.done");
  const setupLabel = t("profile.okx.setup");
  const patch = (partial: Partial<VerificationDocDrafts>) => onDraftsChange({ ...drafts, ...partial });

  const identityReady = drafts.countryCode.trim().length >= 2 && drafts.documentRef.trim().length > 0;
  const addressReady = drafts.city.trim().length >= 2 && drafts.street.trim().length >= 3;
  const selfieReady = Boolean(selfieFile) || selfieDone || !requireSelfieFile;

  return (
    <>
      {hideList ? null : (
      <ProfileOkxSection title={t("verification.documents.prepare")}>
        {showDetailsRow && canEdit ? (
          <ProfileOkxRow
            icon={profileLineIcon("verification")}
            title={t("verification.manualFormTitle")}
            description={t("verification.manualFormHint")}
            action={
              <button type="button" onClick={() => setModal("details")} className={profileOkxGhostClass}>
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
            <SetupAction
              done={identityDone}
              canEdit={canEdit}
              labelDone={doneLabel}
              labelSetup={setupLabel}
              onClick={() => setModal("identity")}
            />
          }
        />
        <ProfileOkxRow
          icon={profileLineIcon("address")}
          title={t("verification.doc.addrTitle")}
          description={t("verification.doc.addrSub")}
          badge={<ProfileOkxRecommended>{t("profile.okx.recommended")}</ProfileOkxRecommended>}
          action={
            <SetupAction
              done={addressDone}
              canEdit={canEdit}
              labelDone={doneLabel}
              labelSetup={setupLabel}
              onClick={() => setModal("address")}
            />
          }
        />
        <ProfileOkxRow
          icon={profileLineIcon("selfie")}
          title={t("verification.doc.selfieTitle")}
          description={t("verification.doc.selfieSub")}
          action={
            <SetupAction
              done={selfieDone}
              canEdit={canEdit}
              labelDone={doneLabel}
              labelSetup={setupLabel}
              onClick={() => setModal("selfie")}
            />
          }
        />
      </ProfileOkxSection>
      )}
      <ProfileSecurityModal
        open={modal === "details" || modal === "identity"}
        onOpenChange={(open) => {
          if (!open && !submitting) setModal(null);
        }}
        title={t("verification.manualFormTitle")}
        description={t("verification.manualFormHint")}
        headerVideo
        headerVideoSrc={VERIFY_VIDEO}
        widthClassName="md:w-[min(100vw-2rem,48rem)]"
        footer={
          <div className="space-y-3">
            {error ? (
              <p className="text-center text-sm text-red-400" role="alert">
                {error.startsWith("verification.") ? t(error) : error}
              </p>
            ) : null}
            <button
              type="button"
              disabled={submitting || !canEdit || !identityReady}
              onClick={() => {
                void Promise.resolve(onSaveIdentity(identityFile)).then((ok) => {
                  if (ok) setModal(null);
                });
              }}
              className={cn(profileOkxPillClass, "disabled:opacity-60")}
            >
              {submitting ? t("verification.submitting") : t("verification.doc.save")}
            </button>
          </div>
        }
      >
        <ProfileSecurityModalFieldList bare>
          <ProfileSecurityModalField bare label={t("verification.countryCode")} htmlFor="kyc-country">
            <input
              id="kyc-country"
              type="text"
              value={drafts.countryCode}
              onChange={(e) => patch({ countryCode: e.target.value.toUpperCase() })}
              placeholder="DE"
              className={profileModalBareInputClass}
              autoComplete="country"
            />
          </ProfileSecurityModalField>
          <ProfileSecurityModalField bare label={t("verification.documentType")} htmlFor="kyc-doc-type">
            <StyledSelect
              id="kyc-doc-type"
              value={drafts.documentType}
              options={[
                { value: "passport", label: t("verification.docPassport") },
                { value: "id_card", label: t("verification.docId") },
              ]}
              onChange={(value) => patch({ documentType: value })}
              aria-label={t("verification.documentType")}
              tone="dark"
              menuTone="light"
              fullWidth
              borderless
              className="[&_button]:h-11 [&_button]:w-full [&_button]:rounded-xl [&_button]:border-0 [&_button]:bg-[#1c1c1c] [&_button]:px-3.5 [&_button]:text-[15px] [&_button]:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)] [&_button]:hover:bg-[#1c1c1c]"
            />
          </ProfileSecurityModalField>
          <ProfileSecurityModalField bare label={t("verification.documentRef")} htmlFor="kyc-doc-ref">
            <input
              id="kyc-doc-ref"
              type="text"
              value={drafts.documentRef}
              onChange={(e) => patch({ documentRef: e.target.value })}
              placeholder="****1234"
              className={cn(profileModalBareInputClass, "font-mono tracking-wide")}
              autoComplete="off"
            />
          </ProfileSecurityModalField>
          <FileField
            id="kyc-identity-file"
            label={t("verification.doc.file")}
            accept="image/jpeg,image/png,image/webp,application/pdf"
            file={identityFile}
            onChange={setIdentityFile}
            emptyLabel={t("verification.doc.fileEmpty")}
            removeLabel={t("verification.doc.remove")}
          />
        </ProfileSecurityModalFieldList>
        <ProfileSecurityModalHints items={[t("verification.manualProviderHint")]} />
      </ProfileSecurityModal>

      <ProfileSecurityModal
        open={modal === "address"}
        onOpenChange={(open) => {
          if (!open && !submitting) setModal(null);
        }}
        title={t("verification.doc.addrTitle")}
        description={t("verification.address.hint")}
        headerVideo
        headerVideoSrc={VERIFY_VIDEO}
        widthClassName="md:w-[min(100vw-2rem,48rem)]"
        footer={
          <button
            type="button"
            disabled={submitting || !canEdit || !addressReady}
            onClick={() => {
              void Promise.resolve(onSaveAddress(addressFile)).then((ok) => {
                if (ok) setModal(null);
              });
            }}
            className={cn(profileOkxPillClass, "disabled:opacity-60")}
          >
            {submitting ? t("verification.submitting") : t("verification.doc.save")}
          </button>
        }
      >
        <ProfileSecurityModalFieldList bare>
          <ProfileSecurityModalField bare label={t("verification.address.city")} htmlFor="kyc-city">
            <input
              id="kyc-city"
              type="text"
              value={drafts.city}
              onChange={(e) => patch({ city: e.target.value })}
              className={profileModalBareInputClass}
              autoComplete="address-level2"
            />
          </ProfileSecurityModalField>
          <ProfileSecurityModalField bare label={t("verification.address.street")} htmlFor="kyc-street">
            <input
              id="kyc-street"
              type="text"
              value={drafts.street}
              onChange={(e) => patch({ street: e.target.value })}
              className={profileModalBareInputClass}
              autoComplete="street-address"
            />
          </ProfileSecurityModalField>
          <ProfileSecurityModalField bare label={t("verification.address.postal")} htmlFor="kyc-postal">
            <input
              id="kyc-postal"
              type="text"
              value={drafts.postalCode}
              onChange={(e) => patch({ postalCode: e.target.value })}
              className={profileModalBareInputClass}
              autoComplete="postal-code"
            />
          </ProfileSecurityModalField>
          <FileField
            id="kyc-address-file"
            label={t("verification.doc.file")}
            accept="image/jpeg,image/png,image/webp,application/pdf"
            file={addressFile}
            onChange={setAddressFile}
            emptyLabel={t("verification.doc.fileEmpty")}
            removeLabel={t("verification.doc.remove")}
          />
        </ProfileSecurityModalFieldList>
        <ProfileSecurityModalHints items={[t("verification.address.hint")]} />
      </ProfileSecurityModal>

      <ProfileSecurityModal
        open={modal === "selfie"}
        onOpenChange={(open) => {
          if (!open && !submitting) setModal(null);
        }}
        title={t("verification.doc.selfieTitle")}
        description={t("verification.selfie.hint")}
        headerVideo
        headerVideoSrc={VERIFY_VIDEO}
        widthClassName="md:w-[min(100vw-2rem,48rem)]"
        footer={
          <button
            type="button"
            disabled={submitting || !canEdit || !selfieReady}
            onClick={() => {
              void Promise.resolve(onSaveSelfie(selfieFile)).then((ok) => {
                if (ok) setModal(null);
              });
            }}
            className={cn(profileOkxPillClass, "disabled:opacity-60")}
          >
            {submitting ? t("verification.submitting") : t("verification.doc.save")}
          </button>
        }
      >
        <ProfileSecurityModalFieldList bare>
          <FileField
            id="kyc-selfie-file"
            label={t("verification.selfie.file")}
            accept="image/jpeg,image/png,image/webp"
            file={selfieFile}
            onChange={setSelfieFile}
            emptyLabel={t("verification.doc.fileEmpty")}
            removeLabel={t("verification.doc.remove")}
          />
        </ProfileSecurityModalFieldList>
        <ProfileSecurityModalHints items={[t("verification.doc.selfieSub")]} />
      </ProfileSecurityModal>
    </>
  );
}
