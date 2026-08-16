import type { Metadata } from "next";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { FeesCtaBand } from "@/components/fees/fees-cta-band";
import { FeesLiveRatesBanner } from "@/components/fees/fees-live-rates-banner";
import { FeesPageContent } from "@/components/fees/fees-page-content";
import { FeesPageHero } from "@/components/fees/fees-page-hero";
import { FeesVisualBand } from "@/components/fees/fees-visual-band";
import { feesPageMetaAsync } from "@/lib/i18n/page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return feesPageMetaAsync("meta.fees.title", "meta.fees.description");
}

export default function FeesPage() {
  return (
    <div className="relative flex min-h-dvh flex-col bg-white text-neutral-900" data-scheme="light">
      <DashboardHeader />
      <main className="relative z-10 flex-1">
        <div className="mx-auto w-full max-w-[1100px] space-y-10 px-4 pb-20 pt-6 sm:space-y-12 sm:px-6 sm:pt-8 lg:px-8">
          <FeesPageHero />
          <FeesLiveRatesBanner />
          <FeesPageContent />
          <FeesVisualBand />
          <FeesCtaBand />
        </div>
      </main>
    </div>
  );
}
