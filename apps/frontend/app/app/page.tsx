import { DashboardCatalogSection } from "@/components/dashboard/dashboard-catalog";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import {
  DashboardMarketsRow,
  DashboardUnifiedJourneyBlock,
} from "@/components/dashboard/dashboard-landing-sections";
import { DashboardLandingTrust } from "@/components/dashboard/dashboard-landing-trust";
import { LandingReveal, LandingScrollRoot } from "@/components/dashboard/landing-motion";
import { DashboardMarketScale } from "@/components/dashboard/dashboard-market-scale";
import { landingVoid } from "@/components/dashboard/dashboard-landing-tokens";
import { dashboardPageMetaAsync } from "@/lib/i18n/page-metadata";

export async function generateMetadata() {
  return dashboardPageMetaAsync("meta.dashboard.title", "meta.dashboard.description");
}

export default function DashboardMainPage() {
  return (
    <LandingScrollRoot>
      <div
        className={`relative flex min-h-dvh w-full max-w-full flex-col font-sans text-white antialiased *:font-sans ${landingVoid}`}
      >
        <DashboardHeader />

        <main className="relative mx-auto w-full max-w-[1400px] px-0 sm:px-6 lg:px-8">
          <DashboardHero />
        </main>

        <LandingReveal>
          <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
            <DashboardMarketsRow />
          </div>
        </LandingReveal>

        <DashboardMarketScale />

        <div className="relative z-0 pb-6 sm:pb-14 md:pb-16 lg:pb-20">
          <LandingReveal delay={0.05}>
            <DashboardCatalogSection />
          </LandingReveal>
          <LandingReveal delay={0.08}>
            <div className="mx-auto w-full max-w-[1200px] px-4 pb-0 sm:px-6 lg:px-8">
              <DashboardUnifiedJourneyBlock className="pt-10 sm:pt-12 md:pt-16" />
            </div>
          </LandingReveal>
          <LandingReveal delay={0.1}>
            <DashboardLandingTrust />
          </LandingReveal>
        </div>
      </div>
    </LandingScrollRoot>
  );
}
