import type { Metadata } from "next";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { TrustCenterContent } from "@/components/trust/trust-center-content";
import { TrustPageHero } from "@/components/trust/trust-page-hero";
import { trustPageMetaAsync } from "@/lib/i18n/page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return trustPageMetaAsync("meta.trust.title", "meta.trust.description");
}

export default function TrustPage() {
  return (
    <div className="relative flex min-h-dvh flex-col bg-white">
      <DashboardHeader />
      <main className="scheme-light relative z-10 flex-1 text-neutral-900">
        <div className="mx-auto w-full max-w-[1120px] space-y-10 px-4 pb-16 pt-8 sm:space-y-12 sm:px-6 sm:pt-10 lg:px-8">
          <TrustPageHero />
          <TrustCenterContent />
        </div>
      </main>
    </div>
  );
}
