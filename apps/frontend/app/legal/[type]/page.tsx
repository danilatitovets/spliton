import type { Metadata } from "next";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { LegalPolicyPublicView } from "@/components/legal/legal-policy-public-view";
import { BRAND } from "@/constants/brand";
import { tf } from "@/lib/i18n/financial-messages";
import { LEGAL_MESSAGES } from "@/lib/i18n/legal-messages";
import { resolveServerLocale } from "@/lib/i18n/server-locale";

type Props = { params: Promise<{ type: string }> };

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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type } = await params;
  const locale = await resolveServerLocale();
  const m = LEGAL_MESSAGES[locale];
  const ru = LEGAL_MESSAGES.ru;
  const apiType = normalizeTypeParam(type);
  const typeLabel =
    m[`legal.policy.type.${apiType}`] ?? ru[`legal.policy.type.${apiType}`] ?? type.replace(/_/g, " ");
  const titleSuffix = m["legal.document.titleSuffix"] ?? ru["legal.document.titleSuffix"];
  const descriptionTemplate = m["legal.document.description"] ?? ru["legal.document.description"];

  return {
    title: `${typeLabel} · ${titleSuffix}`,
    description: tf(descriptionTemplate, { brand: BRAND.name }),
  };
}

export default async function LegalPolicyPage({ params }: Props) {
  const { type } = await params;

  return (
    <div className="flex min-h-dvh flex-col bg-white text-[#1f2328] antialiased [color-scheme:light]">
      <DashboardHeader />
      <main className="mx-auto w-full max-w-[760px] flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <LegalPolicyPublicView typeParam={type} />
      </main>
    </div>
  );
}
