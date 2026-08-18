"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Share2 } from "@/lib/lucide";
import { SplitonLoader } from "@/components/ui/spliton-loader";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import {
  extractLegalDocumentHeadings,
  LegalPolicyContentDisplay,
} from "@/components/legal/legal-policy-content-display";
import { LegalDocumentInPageNav } from "@/components/legal/legal-document-in-page-nav";
import { useAuthUi } from "@/hooks/use-auth-ui";
import { useI18n } from "@/components/providers/i18n-provider";
import { profileDashboardHref } from "@/constants/dashboard/profile-page";
import { ROUTES } from "@/constants/routes";
import { copyTextToClipboard } from "@/lib/copy-to-clipboard";
import { formatDate } from "@/lib/i18n/formatters";
import { isConfirmControlReached } from "@/lib/legal/is-confirm-control-reached";
import { cn } from "@/lib/utils";
import {
  acceptLegalConsents,
  fetchLegalCenter,
  getAllMissingConsents,
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
  "pb-2 text-[15px] leading-[1.75] text-neutral-700",
  "[&_h1]:mb-4 [&_h1]:mt-10 [&_h1]:scroll-mt-28 [&_h1]:text-[22px] [&_h1]:font-semibold [&_h1]:tracking-tight [&_h1]:text-neutral-950 sm:[&_h1]:text-[26px]",
  "[&_h2]:mb-3 [&_h2]:mt-10 [&_h2]:scroll-mt-28 [&_h2]:border-b [&_h2]:border-neutral-200 [&_h2]:pb-2 [&_h2]:text-[18px] [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-neutral-950 sm:[&_h2]:text-[22px]",
  "[&_h3]:mb-2 [&_h3]:mt-7 [&_h3]:scroll-mt-28 [&_h3]:text-[15px] [&_h3]:font-semibold [&_h3]:text-neutral-900 sm:[&_h3]:text-[17px]",
  "[&_p]:mb-4 [&_p]:text-neutral-700",
  "[&_ul]:mb-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6",
  "[&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6",
  "[&_li]:text-neutral-700",
  "[&_a]:font-medium [&_a]:text-neutral-950 [&_a]:underline [&_a]:decoration-neutral-300 [&_a]:underline-offset-2 hover:[&_a]:decoration-neutral-950",
  "[&_strong]:font-semibold [&_strong]:text-neutral-950",
  "[&_code]:rounded [&_code]:bg-neutral-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[0.9em] [&_code]:text-neutral-900",
);

export function profileLegalDocumentHref(policyId: string, requireConfirm = true): string {
  return ROUTES.dashboardProfileLegalDoc(policyId, requireConfirm);
}

type Props = {
  policyId: string;
  requireConfirm: boolean;
};

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

export function ProfileLegalDocumentPageContent({ policyId, requireConfirm }: Props) {
  const router = useRouter();
  const { authorizedFetch, authenticated, pending } = useAuthUi();
  const { t, locale } = useI18n();
  const [policy, setPolicy] = useState<LegalPolicyPublic | null>(null);
  const [needsAccept, setNeedsAccept] = useState(requireConfirm);
  const [nextConfirmPolicyId, setNextConfirmPolicyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reachedEnd, setReachedEnd] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [acceptError, setAcceptError] = useState<string | null>(null);
  const confirmControlRef = useRef<HTMLDivElement>(null);

  const backHref = profileDashboardHref("legal");
  const showConfirm = requireConfirm || needsAccept;

  const load = useCallback(async () => {
    if (pending) return;
    if (!authenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const center = await fetchLegalCenter(authorizedFetch);
      const policies = center.activePolicies;
      const missingIds = getAllMissingConsents(center)
        .map((item) => item.policyId)
        .filter((id): id is string => Boolean(id));
      const key = normalizePolicyParam(policyId);
      const hit =
        policies.find((p) => p.id === policyId) ??
        policies.find((p) => p.id === key) ??
        policies.find((p) => p.type === key) ??
        policies.find((p) => p.type === policyId) ??
        null;
      if (!hit) {
        setError(t("profile.legal.documentEmpty"));
        setPolicy(null);
        setNeedsAccept(false);
        setNextConfirmPolicyId(null);
      } else {
        setPolicy(hit);
        const stillMissing = missingIds.includes(hit.id) && hit.requiresUserConsent;
        setNeedsAccept(stillMissing);
        setNextConfirmPolicyId(missingIds.find((id) => id !== hit.id) ?? null);
      }
    } catch {
      setError(t("profile.legal.loadError"));
      setPolicy(null);
      setNeedsAccept(false);
      setNextConfirmPolicyId(null);
    } finally {
      setLoading(false);
    }
  }, [authorizedFetch, authenticated, pending, policyId, t]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setReachedEnd(false);
    setAcceptError(null);
    if (!showConfirm || !policy) return;

    const check = () => {
      if (isConfirmControlReached(confirmControlRef.current)) setReachedEnd(true);
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

  const headings = useMemo(
    () => (policy?.content?.trim() ? extractLegalDocumentHeadings(policy.content) : []),
    [policy?.content],
  );

  const handleShare = useCallback(async () => {
    if (!policy) return;
    const url = typeof window !== "undefined" ? window.location.href : ROUTES.dashboardProfileLegalDoc(policy.id, false);
    const shareText = `${policy.title || t("profile.legal.readDocument")} — Spliton`;
    const shareData = { title: shareText, text: shareText, url };

    try {
      if (typeof navigator !== "undefined" && navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
        return;
      }
    } catch {
      /* cancelled */
    }

    await copyTextToClipboard(url);
  }, [policy, t]);

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

  if (pending || (authenticated && loading && !policy && !error)) {
    return (
      <div className="flex min-h-dvh flex-col bg-white text-neutral-950 antialiased">
        <DashboardHeader />
        <main className="mx-auto flex w-full max-w-[760px] flex-1 flex-col items-center justify-center px-4 py-10">
          <SplitonLoader />
        </main>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="flex min-h-dvh flex-col bg-white text-neutral-950 antialiased">
        <DashboardHeader />
        <main className="mx-auto flex w-full max-w-[760px] flex-1 flex-col justify-center px-4 py-10 sm:px-6">
          <p className="text-sm text-neutral-600">{t("profile.legal.signInRequired")}</p>
          <Link href={ROUTES.login} className="mt-4 inline-flex text-sm font-semibold text-neutral-950 underline">
            {t("auth.login.submit")}
          </Link>
        </main>
      </div>
    );
  }

  const title = policy?.title || t("profile.legal.readDocument");
  const updatedLabel =
    policy?.publishedAt || policy?.effectiveAt
      ? formatDate(new Date(policy.publishedAt ?? policy.effectiveAt), locale, {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : null;

  return (
    <div className="flex min-h-dvh flex-col bg-white text-neutral-950 antialiased">
      <DashboardHeader />

      <main className="mx-auto w-full max-w-[1180px] flex-1 px-4 py-8 sm:px-6 sm:py-10 [--profile-sticky-offset:4.75rem]">
        <nav aria-label={t("profile.legal.breadcrumbAria")} className="mb-6">
          <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[12px] text-neutral-500">
            <li>
              <Link href={ROUTES.dashboardProfile} className="transition hover:text-neutral-950">
                {t("profile.legal.breadcrumbProfile")}
              </Link>
            </li>
            <li className="flex items-center gap-1.5">
              <ChevronRight className="size-3 shrink-0 text-neutral-300" aria-hidden />
              <Link href={backHref} className="transition hover:text-neutral-950">
                {t("profile.legal.breadcrumbLegal")}
              </Link>
            </li>
            {policy ? (
              <li className="flex min-w-0 max-w-full items-center gap-1.5">
                <ChevronRight className="size-3 shrink-0 text-neutral-300" aria-hidden />
                <span aria-current="page" className="truncate font-medium text-neutral-800">
                  {title}
                </span>
              </li>
            ) : null}
          </ol>
        </nav>

        {loading ? (
          <div className="flex justify-center py-24">
            <SplitonLoader size="sm" variant="light" />
          </div>
        ) : error || !policy ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-8 text-center text-sm text-red-700">
            {error ?? t("profile.legal.documentEmpty")}
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(220px,280px)] md:items-start md:gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(240px,300px)]">
            <div className="min-w-0">
              <LegalDocumentInPageNav headings={headings} variant="mobile" />
              <article>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  {policy.version ? (
                    <p className="text-[12px] font-medium text-neutral-500">
                      {t("profile.legal.version")} {policy.version}
                    </p>
                  ) : null}
                  <h1 className="mt-2 text-[clamp(1.75rem,4vw,2.35rem)] font-semibold leading-tight tracking-tight text-neutral-950">
                    {title}
                  </h1>
                </div>
                <button
                  type="button"
                  onClick={() => void handleShare()}
                  className="inline-flex shrink-0 items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-2 text-[13px] font-medium text-neutral-700 transition hover:border-neutral-300 hover:text-neutral-950"
                >
                  <Share2 className="size-4" aria-hidden />
                  {t("profile.legal.share")}
                </button>
              </div>

              {updatedLabel ? (
                <p className="mt-3 text-[13px] text-neutral-500">
                  {t("profile.legal.updated")} {updatedLabel}
                </p>
              ) : null}

              {policy.content?.trim() ? (
                <LegalPolicyContentDisplay
                  content={policy.content}
                  contentFormat={policy.contentFormat}
                  className={cn(proseClass, "mt-8")}
                />
              ) : (
                <p className="mt-8 text-[15px] leading-relaxed text-neutral-600">{t("profile.legal.documentEmpty")}</p>
              )}

              {showConfirm ? (
                <section className="mt-12 border-t border-neutral-200 pt-8">
                  {!reachedEnd ? (
                    <p className="text-[14px] text-neutral-500">{t("profile.legal.scrollToEnd")}</p>
                  ) : (
                    <p className="text-[14px] font-medium text-neutral-900">{t("profile.legal.confirmRead")}</p>
                  )}
                  <div
                    ref={confirmControlRef}
                    id="legal-confirm"
                    className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center"
                  >
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
                      <p className="text-[13px] text-red-600" role="alert">
                        {acceptError}
                      </p>
                    ) : null}
                  </div>
                </section>
              ) : null}
            </article>
            </div>

            <LegalDocumentInPageNav headings={headings} variant="desktop" />
          </div>
        )}
      </main>
    </div>
  );
}
