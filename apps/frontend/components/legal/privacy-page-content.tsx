"use client";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { LegalPolicyPublicView } from "@/components/legal/legal-policy-public-view";

export function PrivacyPageContent() {
  return (
    <div className="flex min-h-dvh flex-col bg-white text-[#1f2328] antialiased [color-scheme:light]">
      <DashboardHeader />
      <main className="mx-auto w-full max-w-[760px] flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <LegalPolicyPublicView typeParam="privacy_policy" />
      </main>
    </div>
  );
}
