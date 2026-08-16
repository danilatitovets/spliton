"use client";

import { useCallback, useEffect, useState } from "react";
import { SplitonLoader } from "@/components/ui/spliton-loader";

import {
  ProfileSecurityModal,
  ProfileSecurityModalField,
  ProfileSecurityModalFieldList,
  ProfileSecurityModalHints,
} from "@/components/dashboard/profile/profile-security-modal";
import { profileOkxPillClass } from "@/components/dashboard/profile/profile-okx";
import { PROFILE_GLASS } from "@/components/dashboard/profile/profile-shared";
import { profileModalInputClass } from "@/components/dashboard/profile/profile-ui";
import { useAuth } from "@/components/providers/auth-provider";
import { useI18n } from "@/components/providers/i18n-provider";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { formatApiError } from "@/lib/i18n/format-api-error";
import { changeUserPassword } from "@/services/user-me.service";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

export function ProfilePasswordChangePanel({ open, onOpenChange, onSuccess }: Props) {
  const { authorizedFetch } = useAuth();
  const { t, locale } = useI18n();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const reset = useCallback(() => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError(null);
  }, []);

  const close = useCallback(
    (next: boolean) => {
      if (!next) reset();
      onOpenChange(next);
    },
    [onOpenChange, reset],
  );

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  const submit = useCallback(async () => {
    setError(null);
    if (newPassword.length < 8) {
      setError(t("profile.security.password.error.tooShort"));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t("profile.security.password.error.mismatch"));
      return;
    }
    setBusy(true);
    try {
      await changeUserPassword(authorizedFetch, { currentPassword, newPassword });
      reset();
      onOpenChange(false);
      onSuccess();
    } catch (e) {
      const raw = e instanceof Error ? e.message : "";
      if (raw.startsWith("profile.")) {
        setError(t(raw));
      } else {
        setError(formatApiError(e, locale));
      }
    } finally {
      setBusy(false);
    }
  }, [
    authorizedFetch,
    confirmPassword,
    currentPassword,
    locale,
    newPassword,
    onOpenChange,
    onSuccess,
    reset,
    t,
  ]);

  const hints = [
    t("profile.security.password.hint.minLength"),
    t("profile.security.password.hint.unique"),
    t("profile.security.password.hint.sessions"),
  ];

  return (
    <ProfileSecurityModal
      open={open}
      onOpenChange={close}
      title={t("profile.security.password.title")}
      headline={t("profile.security.password.changeHeadline")}
      description={t("profile.security.password.changeDescription")}
      hero={PROFILE_GLASS.password}
      detailsHref={ROUTES.dashboardSupport}
      detailsLabel={t("profile.okx.details")}
      footer={
        <div className="space-y-3">
          {error ? (
            <p className="text-center text-sm text-red-400" role="alert">
              {error}
            </p>
          ) : null}
          <button
            type="button"
            disabled={busy || !currentPassword || !newPassword || !confirmPassword}
            onClick={() => void submit()}
            className={cn(profileOkxPillClass, "disabled:opacity-60")}
          >
            {busy ? (
              <>
                <SplitonLoader size="xxs" variant="dark" className="mr-2 inline" />
                {t("profile.security.password.submitting")}
              </>
            ) : (
              t("profile.security.password.submit")
            )}
          </button>
        </div>
      }
    >
      <ProfileSecurityModalFieldList>
        <ProfileSecurityModalField label={t("profile.security.password.current")} htmlFor="pwd-current">
          <input
            id="pwd-current"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
            className={profileModalInputClass}
          />
        </ProfileSecurityModalField>
        <ProfileSecurityModalField label={t("profile.security.password.new")} htmlFor="pwd-new">
          <input
            id="pwd-new"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            className={profileModalInputClass}
          />
        </ProfileSecurityModalField>
        <ProfileSecurityModalField label={t("profile.security.password.confirm")} htmlFor="pwd-confirm">
          <input
            id="pwd-confirm"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            className={profileModalInputClass}
          />
        </ProfileSecurityModalField>
      </ProfileSecurityModalFieldList>
      <ProfileSecurityModalHints items={hints} />
    </ProfileSecurityModal>
  );
}
