"use client";

import { useCallback, useState } from "react";
import { SplitonLoader } from "@/components/ui/spliton-loader";

import {
  ProfileSecurityModal,
  ProfileSecurityModalField,
  ProfileSecurityModalFieldList,
  ProfileSecurityModalHints,
} from "@/components/dashboard/profile/profile-security-modal";
import {
  profileOkxDangerPillClass,
  profileOkxGhostClass,
  profileOkxPillClass,
} from "@/components/dashboard/profile/profile-okx";
import { PROFILE_GLASS } from "@/components/dashboard/profile/profile-shared";
import { profileModalInputClass } from "@/components/dashboard/profile/profile-ui";
import { useAuth } from "@/components/providers/auth-provider";
import { useI18n } from "@/components/providers/i18n-provider";
import { ROUTES } from "@/constants/routes";
import { localizedApiError } from "@/lib/api/localized-error";
import { cn } from "@/lib/utils";
import {
  disableTwoFactor,
  extractTotpSecret,
  setupTwoFactor,
  verifyTwoFactorSetup,
} from "@/services/two-factor.service";

type Props = {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
};

type Step = "idle" | "setup" | "backup" | "disable";

export function ProfileTwoFactorPanel({ enabled, onEnabledChange }: Props) {
  const { authorizedFetch } = useAuth();
  const { t, locale } = useI18n();
  const [step, setStep] = useState<Step>("idle");
  const [otpauthUrl, setOtpauthUrl] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const secret = otpauthUrl ? extractTotpSecret(otpauthUrl) : null;

  const resetFlow = useCallback(() => {
    setStep("idle");
    setOtpauthUrl(null);
    setCode("");
    setPassword("");
    setBackupCodes([]);
    setError(null);
  }, []);

  const startSetup = useCallback(async () => {
    setError(null);
    setBusy(true);
    try {
      const result = await setupTwoFactor(authorizedFetch);
      setOtpauthUrl(result.otpauthUrl);
      setStep("setup");
    } catch (e) {
      setError(localizedApiError(e, locale));
    } finally {
      setBusy(false);
    }
  }, [authorizedFetch, locale]);

  const confirmSetup = useCallback(async () => {
    setError(null);
    setBusy(true);
    try {
      const result = await verifyTwoFactorSetup(authorizedFetch, code.trim());
      setBackupCodes(result.backupCodes);
      onEnabledChange(true);
      setStep("backup");
      setCode("");
    } catch (e) {
      setError(localizedApiError(e, locale));
    } finally {
      setBusy(false);
    }
  }, [authorizedFetch, code, locale, onEnabledChange]);

  const confirmDisable = useCallback(async () => {
    setError(null);
    setBusy(true);
    try {
      await disableTwoFactor(authorizedFetch, {
        password,
        code: code.trim(),
        method: "totp",
      });
      onEnabledChange(false);
      resetFlow();
    } catch (e) {
      setError(localizedApiError(e, locale));
    } finally {
      setBusy(false);
    }
  }, [authorizedFetch, code, locale, onEnabledChange, password, resetFlow]);

  const setupHints = [
    t("profile.security.twoFa.hint.scan"),
    t("profile.security.twoFa.hint.code"),
    t("profile.security.twoFa.hint.backup"),
  ];

  return (
    <>
      <div className="flex shrink-0 flex-col items-end gap-1">
        {!enabled && step === "idle" ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => void startSetup()}
            className={profileOkxGhostClass}
          >
            {busy ? (
              <>
                <SplitonLoader size="xxs" variant="dark" className="mr-1.5 inline" />
                {t("profile.security.twoFa.preparing")}
              </>
            ) : (
              t("profile.okx.setup")
            )}
          </button>
        ) : null}
        {enabled && step !== "disable" ? (
          <button
            type="button"
            onClick={() => {
              setStep("disable");
              setError(null);
            }}
            className={profileOkxGhostClass}
          >
            {t("profile.okx.manage")}
          </button>
        ) : null}
        {error && step === "idle" ? (
          <p className="max-w-[16rem] text-right text-xs text-red-400" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      <ProfileSecurityModal
        open={step === "setup"}
        onOpenChange={(open) => {
          if (!open) resetFlow();
        }}
        title={t("profile.security.twoFa.title")}
        headline={t("profile.security.twoFa.setupHeadline")}
        description={t("profile.security.twoFa.setupBody")}
        hero={PROFILE_GLASS.twoFa}
        detailsHref={ROUTES.trust}
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
              disabled={busy || code.length !== 6}
              onClick={() => void confirmSetup()}
              className={cn(profileOkxPillClass, "disabled:opacity-60")}
            >
              {busy ? (
                <>
                  <SplitonLoader size="xxs" variant="dark" className="mr-2 inline" />
                  {t("profile.security.twoFa.confirming")}
                </>
              ) : (
                t("profile.security.twoFa.confirm")
              )}
            </button>
          </div>
        }
      >
        {secret ? (
          <p className="mb-3 break-all rounded-xl bg-white/[0.05] px-3 py-2 font-mono text-xs text-zinc-300">
            {t("profile.security.twoFa.secret")}: {secret}
          </p>
        ) : null}
        {otpauthUrl ? (
          <a
            href={otpauthUrl}
            className="mb-1 inline-block text-[13px] font-medium text-white underline decoration-white/45 underline-offset-[5px]"
          >
            {t("profile.security.twoFa.openOtpauth")}
          </a>
        ) : null}
        <ProfileSecurityModalFieldList>
          <ProfileSecurityModalField label={t("profile.security.twoFa.codeLabel")} htmlFor="twofa-setup-code">
            <input
              id="twofa-setup-code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              className={cn(profileModalInputClass, "font-mono tracking-widest")}
              autoComplete="one-time-code"
            />
          </ProfileSecurityModalField>
        </ProfileSecurityModalFieldList>
        <ProfileSecurityModalHints items={setupHints} />
      </ProfileSecurityModal>

      <ProfileSecurityModal
        open={step === "backup" && backupCodes.length > 0}
        onOpenChange={(open) => {
          if (!open) resetFlow();
        }}
        title={t("profile.security.twoFa.title")}
        headline={t("profile.security.twoFa.backupTitle")}
        description={t("profile.security.twoFa.backupHint")}
        hero={PROFILE_GLASS.twoFa}
        footer={
          <button type="button" onClick={() => resetFlow()} className={profileOkxPillClass}>
            {t("profile.security.twoFa.done")}
          </button>
        }
      >
        <ul className="mt-6 grid gap-2 sm:grid-cols-2">
          {backupCodes.map((item) => (
            <li key={item} className="rounded-xl bg-white/[0.05] px-3 py-2.5 font-mono text-xs text-zinc-200">
              {item}
            </li>
          ))}
        </ul>
      </ProfileSecurityModal>

      <ProfileSecurityModal
        open={step === "disable"}
        onOpenChange={(open) => {
          if (!open) {
            setPassword("");
            setCode("");
            setError(null);
            setStep("idle");
          }
        }}
        title={t("profile.security.twoFa.title")}
        headline={t("profile.security.twoFa.disableTitle")}
        hero={PROFILE_GLASS.twoFa}
        footer={
          <div className="space-y-3">
            {error ? (
              <p className="text-center text-sm text-red-400" role="alert">
                {error}
              </p>
            ) : null}
            <button
              type="button"
              disabled={busy || !password || code.length !== 6}
              onClick={() => void confirmDisable()}
              className={cn(profileOkxDangerPillClass, "disabled:opacity-60")}
            >
              {busy ? (
                <>
                  <SplitonLoader size="xxs" variant="dark" className="mr-2 inline" />
                  {t("profile.security.twoFa.disabling")}
                </>
              ) : (
                t("profile.security.twoFa.disableConfirm")
              )}
            </button>
          </div>
        }
      >
        <ProfileSecurityModalFieldList>
          <ProfileSecurityModalField label={t("profile.security.password.current")} htmlFor="twofa-disable-pwd">
            <input
              id="twofa-disable-pwd"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className={profileModalInputClass}
            />
          </ProfileSecurityModalField>
          <ProfileSecurityModalField label={t("profile.security.twoFa.codeLabel")} htmlFor="twofa-disable-code">
            <input
              id="twofa-disable-code"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              className={cn(profileModalInputClass, "font-mono tracking-widest")}
              autoComplete="one-time-code"
            />
          </ProfileSecurityModalField>
        </ProfileSecurityModalFieldList>
      </ProfileSecurityModal>
    </>
  );
}
