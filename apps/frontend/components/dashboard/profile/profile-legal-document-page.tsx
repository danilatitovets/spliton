"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "@/lib/lucide";
import { SplitonLoader } from "@/components/ui/spliton-loader";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { LegalPolicyContentDisplay } from "@/components/legal/legal-policy-content-display";
import { useAuth } from "@/components/providers/auth-provider";
import { useI18n } from "@/components/providers/i18n-provider";
import { profileDashboardHref } from "@/constants/dashboard/profile-page";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import {
  acceptLegalConsents,
  buildProfileLegalFallback,
  fetchLegalCenter,
  getAllMissingConsents,
  isFallbackPolicyId,
  type LegalPolicyPublic,
} from "@/services/legal.service";
import { SplitonCtaPill } from "@/components/ui/spliton-cta-pill";

export const LEGAL_READ_STORAGE_PREFIX = "profile-legal-read:";

export function markLegalPolicyRead(policyId: string) {
  try {
    sessionStorage.setItem(`${LEGAL_READ_STORAGE_PREFIX}${policyId}`, "1");
  } catch {
    /* ignore */
  }
}

export function consumeLegalPolicyReads(): string[] {
  const ids: string[] = [];
  const keys: string[] = [];
  try {
    for (let i = 0; i < sessionStorage.length; i += 1) {
      const key = sessionStorage.key(i);
      if (!key?.startsWith(LEGAL_READ_STORAGE_PREFIX)) continue;
      keys.push(key);
      ids.push(key.slice(LEGAL_READ_STORAGE_PREFIX.length));
    }
    for (const key of keys) sessionStorage.removeItem(key);
  } catch {
    /* ignore */
  }
  return ids;
}

const proseClass = cn(
  "mt-8 pb-4 text-[16px] leading-[1.7] text-[#24292f]",
  "[&_h1]:mb-4 [&_h1]:border-b [&_h1]:border-[#d0d7de] [&_h1]:pb-3 [&_h1]:text-[28px] [&_h1]:font-semibold [&_h1]:tracking-tight [&_h1]:text-[#1f2328]",
  "[&_h2]:mb-3 [&_h2]:mt-10 [&_h2]:border-b [&_h2]:border-[#d8dee4] [&_h2]:pb-2 [&_h2]:text-[22px] [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-[#1f2328]",
  "[&_h3]:mb-2 [&_h3]:mt-7 [&_h3]:text-[17px] [&_h3]:font-semibold [&_h3]:text-[#1f2328]",
  "[&_p]:mb-4 [&_p]:text-[#424a53]",
  "[&_ul]:mb-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6",
  "[&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6",
  "[&_li]:text-[#424a53]",
  "[&_a]:font-medium [&_a]:text-[#0969da] [&_a]:underline-offset-2 hover:[&_a]:underline",
  "[&_strong]:font-semibold [&_strong]:text-[#1f2328]",
  "[&_code]:rounded [&_code]:bg-[#eff1f3] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[0.9em] [&_code]:text-[#1f2328]",
);

export function profileLegalDocumentHref(policyId: string, requireConfirm = true): string {
  return ROUTES.dashboardProfileLegalDoc(policyId, requireConfirm);
}

type Props = {
  policyId: string;
  requireConfirm: boolean;
};

/** Align slug-like URLs with LegalPolicyType enum values. */
function normalizePolicyParam(param: string): string {
  const raw = param.trim().toLowerCase().replace(/-/g, "_");
  if (raw === "terms" || raw === "tos" || raw === "terms_of_service") {
    return "TERMS_OF_SERVICE";
  }
  if (raw === "privacy" || raw === "privacy_policy") {
    return "PRIVACY_POLICY";
  }
  if (raw === "risk" || raw === "risk_disclosure" || raw === "risk_disclosures") {
    return "RISK_DISCLOSURE";
  }
  if (raw.includes("_") || /^[a-z0-9-]+$/.test(raw)) {
    return param.toUpperCase().replace(/-/g, "_");
  }
  return param;
}

function isDocumentScrolledToEnd() {
  const doc = document.documentElement;
  return window.scrollY + window.innerHeight >= doc.scrollHeight - 48;
}

export function ProfileLegalDocumentPageContent({ policyId, requireConfirm }: Props) {
  const router = useRouter();
  const { authorizedFetch, isAuthenticated } = useAuth();
  const { t } = useI18n();
  const [policy, setPolicy] = useState<LegalPolicyPublic | null>(null);
  const [needsAccept, setNeedsAccept] = useState(requireConfirm);
  const [nextConfirmPolicyId, setNextConfirmPolicyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reachedEnd, setReachedEnd] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [acceptError, setAcceptError] = useState<string | null>(null);

  const backHref = profileDashboardHref("legal");
  const showConfirm = requireConfirm || needsAccept;

  const load = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      let policies: LegalPolicyPublic[] = [];
      let missingIds: string[] = [];
      try {
        const center = await fetchLegalCenter(authorizedFetch);
        policies = center.activePolicies;
        missingIds = getAllMissingConsents(center)
          .map((item) => item.policyId)
          .filter((id): id is string => Boolean(id && !isFallbackPolicyId(id)));
      } catch {
        policies = buildProfileLegalFallback(t).activePolicies;
        missingIds = [];
      }
      const key = normalizePolicyParam(policyId);
      const hit =
        policies.find((p) => p.id === policyId) ??
        policies.find((p) => p.id === key) ??
        policies.find((p) => p.type === key) ??
        policies.find((p) => p.type === policyId) ??
        null;
      if (!hit || isFallbackPolicyId(hit.id)) {
        setError(t("profile.legal.documentEmpty"));
        setPolicy(null);
        setNeedsAccept(false);
        setNextConfirmPolicyId(null);
      } else {
        setPolicy(hit);
        const stillMissing = missingIds.includes(hit.id) && hit.requiresUserConsent;
        setNeedsAccept(stillMissing);
        setNextConfirmPolicyId(
          missingIds.find((id) => id !== hit.id) ?? null,
        );
      }
    } catch {
      setError(t("profile.legal.loadError"));
      setPolicy(null);
      setNeedsAccept(false);
      setNextConfirmPolicyId(null);
    } finally {
      setLoading(false);
    }
  }, [authorizedFetch, isAuthenticated, policyId, t]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setReachedEnd(false);
    setAcceptError(null);
    if (!showConfirm || !policy) return;

    const check = () => {
      if (isDocumentScrolledToEnd()) setReachedEnd(true);
    };

    const frame = window.requestAnimationFrame(check);
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [policy?.id, showConfirm, policy]);

  const acceptFromDocument = async () => {
    if (!policy || !reachedEnd || accepting) return;
    setAccepting(true);
    setAcceptError(null);
    try {
      await acceptLegalConsents([policy.id], "PROFILE", authorizedFetch);
      markLegalPolicyRead(policy.id);
      if (nextConfirmPolicyId) {
        router.push(ROUTES.dashboardProfileLegalDoc(nextConfirmPolicyId, true));
      } else {
        router.push(backHref);
      }
    } catch {
      setAcceptError(t("profile.legal.acceptError"));
    } finally {
      setAccepting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-dvh flex-col bg-white text-[#1f2328] antialiased [color-scheme:light]">
        <DashboardHeader />
        <main className="mx-auto flex w-full max-w-[760px] flex-1 flex-col justify-center px-4 py-10 sm:px-6">
          <p className="text-sm text-[#656d76]">{t("profile.legal.signInRequired")}</p>
          <Link href={ROUTES.login} className="mt-4 inline-flex text-sm font-semibold text-[#0969da] underline">
            {t("auth.login.submit")}
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex min-h-dvh flex-col bg-white text-[#1f2328] antialiased [color-scheme:light]",
        showConfirm && "pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))]",
      )}
    >
      <DashboardHeader />

      <main className="mx-auto w-full max-w-[760px] flex-1 px-4 py-8 sm:px-6 sm:py-12">
        <Link
          href={backHref}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#656d76] transition hover:text-[#1f2328]"
        >
          <ArrowLeft className="size-4" aria-hidden />
          {t("profile.legal.backToLegal")}
        </Link>

        {loading ? (
          <div className="flex justify-center py-24">
            <SplitonLoader size="sm" variant="dark" />
          </div>
        ) : error || !policy ? (
          <div className="rounded-xl border border-[#ffcecb] bg-[#ffebe9] px-5 py-8 text-center text-sm text-[#82071e]">
            {error ?? t("profile.legal.documentEmpty")}
          </div>
        ) : (
          <article>
            {policy.version ? (
              <p className="text-[13px] font-medium text-[#656d76]">
                {t("profile.legal.version")} {policy.version}
              </p>
            ) : null}
            <h1 className="mt-2 text-[28px] font-semibold tracking-tight text-[#1f2328] sm:text-[34px]">
              {policy.title || t("profile.legal.readDocument")}
            </h1>
            {showConfirm ? (
              <p className="mt-3 text-[14px] leading-relaxed text-[#656d76]">{t("profile.legal.scrollToEnd")}</p>
            ) : null}

            {policy.content?.trim() ? (
              <LegalPolicyContentDisplay
                content={policy.content}
                contentFormat={policy.contentFormat}
                className={proseClass}
              />
            ) : (
              <p className="mt-8 text-[15px] leading-relaxed text-[#59636e]">{t("profile.legal.documentEmpty")}</p>
            )}
          </article>
        )}
      </main>

      {showConfirm && policy && !loading && !error ? (
        <footer className="fixed inset-x-0 bottom-0 z-[100] bg-white/95 backdrop-blur-sm">
          <div className="mx-auto flex max-w-[760px] flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6 sm:py-4">
            {!reachedEnd ? (
              <p className="text-center text-[12px] text-[#656d76] sm:text-left">{t("profile.legal.scrollToEnd")}</p>
            ) : (
              <p className="text-center text-[13px] font-medium text-[#1f2328] sm:text-left">
                {t("profile.legal.confirmRead")}
              </p>
            )}
            <SplitonCtaPill
              type="button"
              tone="onLight"
              disabled={!reachedEnd || accepting}
              onClick={() => void acceptFromDocument()}
              className="w-full disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:min-w-[14rem]"
            >
              {accepting ? t("profile.legal.accepting") : t("profile.legal.acceptCheckbox")}
            </SplitonCtaPill>
            {acceptError ? (
              <p className="text-center text-[12px] text-[#cf222e] sm:basis-full" role="alert">
                {acceptError}
              </p>
            ) : null}
          </div>
        </footer>
      ) : null}
    </div>
  );
}
