"use client";

import { useEffect, useState } from "react";

import { LegalPolicyContentDisplay } from "@/components/legal/legal-policy-content-display";
import { useI18n } from "@/components/providers/i18n-provider";
import { tf } from "@/lib/i18n/financial-messages";
import type { AppLocale } from "@/lib/i18n/types";
import { cn } from "@/lib/utils";
import { fetchActivePolicies, type LegalPolicyPublic } from "@/services/legal.service";

const LOCALE_DATE: Record<AppLocale, string> = {
  ru: "ru-RU",
  en: "en-US",
  es: "es-ES",
  pt: "pt-BR",
};

function normalizeTypeParam(param: string): string {
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
  return param.toUpperCase().replace(/-/g, "_");
}

const proseClass = cn(
  "mt-8 text-[16px] leading-[1.7] text-[#24292f]",
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

export function LegalPolicyPublicView({ typeParam }: { typeParam: string }) {
  const { t, locale } = useI18n();
  const [policy, setPolicy] = useState<LegalPolicyPublic | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  const apiType = normalizeTypeParam(typeParam);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL ?? ""}/api/v1/legal/policies/${encodeURIComponent(apiType)}/active`, {
      credentials: "include",
    })
      .then(async (res) => {
        if (!res.ok) {
          // Soft miss — fall through to list lookup; do not throw (avoids pageerror noise).
          return null;
        }
        return res.json() as Promise<LegalPolicyPublic>;
      })
      .then(async (direct) => {
        if (direct) {
          setPolicy(direct);
          return;
        }
        const all = await fetchActivePolicies();
        const hit = all.find((p) => p.type === apiType);
        if (hit) setPolicy(hit);
        else setNotFound(true);
      })
      .catch(() => {
        setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [apiType]);

  if (loading) {
    return <p className="text-sm text-[#656d76]">{t("legal.policy.loading")}</p>;
  }

  if (notFound || !policy) {
    return (
      <div className="rounded-xl border border-[#d0d7de] bg-white p-6 text-sm text-[#424a53]">
        {notFound ? t("legal.policy.notFound") : t("legal.policy.unavailable")}
        <p className="mt-2 text-xs text-[#656d76]">{t("legal.policy.adminHint")}</p>
      </div>
    );
  }

  const title = t(`legal.policy.type.${policy.type}`, policy.title);
  const publishedDate = policy.publishedAt
    ? new Date(policy.publishedAt).toLocaleDateString(LOCALE_DATE[locale])
    : "";

  return (
    <article>
      <h1 className="text-[28px] font-semibold tracking-tight text-[#1f2328] sm:text-[34px]">{title}</h1>
      <p className="mt-3 text-[14px] text-[#656d76]">
        {publishedDate
          ? tf(t("legal.policy.versionPublished"), {
              version: policy.version,
              date: publishedDate,
            })
          : tf(t("legal.policy.versionOnly"), { version: policy.version })}
      </p>
      <p className="mt-5 rounded-lg border border-[#d0d7de] bg-[#f6f8fa] px-4 py-3 text-[13px] leading-relaxed text-[#424a53]">
        {t("legal.notice.lawyerReview")}
      </p>
      <LegalPolicyContentDisplay
        content={policy.content}
        contentFormat={policy.contentFormat}
        className={proseClass}
      />
    </article>
  );
}
