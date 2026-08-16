import type { Metadata } from "next";

import { ProfileLegalDocumentPageContent } from "@/components/dashboard/profile/profile-legal-document-page";
import { profilePageMetaAsync } from "@/lib/i18n/page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return profilePageMetaAsync("meta.profile.title", "meta.profile.description");
}

export default async function ProfileLegalDocumentPage({
  params,
  searchParams,
}: {
  params: Promise<{ policyId: string }>;
  searchParams: Promise<{ confirm?: string }>;
}) {
  const { policyId: rawPolicyId } = await params;
  let policyId = rawPolicyId;
  try {
    policyId = decodeURIComponent(rawPolicyId);
  } catch {
    policyId = rawPolicyId;
  }
  const sp = await searchParams;
  const requireConfirm = sp.confirm === "1" || sp.confirm === "true";

  return (
    <ProfileLegalDocumentPageContent
      policyId={policyId}
      requireConfirm={requireConfirm}
    />
  );
}
