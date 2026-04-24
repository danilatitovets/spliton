"use client";

import { GuideChecklistSection } from "./sections/guide-checklist-section";
import { GuideComparisonSection } from "./sections/guide-comparison-section";
import { GuideDealStructureSection } from "./sections/guide-deal-structure-section";
import { GuideEvaluationFactorsSection } from "./sections/guide-evaluation-factors-section";
import { GuideFaqSection } from "./sections/guide-faq-section";
import { GuideHeroSection } from "./sections/guide-hero-section";
import { GuidePayoutsSection } from "./sections/guide-payouts-section";
import { GuideReleaseCardBridgeSection } from "./sections/guide-release-card-bridge-section";
import { GuideRisksSection } from "./sections/guide-risks-section";
import { GuideTopicGridSection } from "./sections/guide-topic-grid-section";
import { GuideInPageNav } from "./ui/guide-in-page-nav";

export function GuideSelectionScreen() {
  return (
    <div className="h-full min-h-0 overflow-auto scroll-smooth bg-black font-sans tabular-nums">
      <div className="mx-auto w-full max-w-[1400px] px-4 pb-20 pt-2 md:px-6 lg:px-8">
        <div className="flex gap-10 lg:gap-14 xl:gap-16">
          <div className="min-w-0 flex-1 space-y-16 md:space-y-20 lg:space-y-24">
            <GuideHeroSection />
            <GuideTopicGridSection />
            <GuideChecklistSection />
            <GuideReleaseCardBridgeSection />
            <GuideEvaluationFactorsSection />
            <GuideDealStructureSection />
            <GuidePayoutsSection />
            <GuideRisksSection />
            <GuideComparisonSection />
            <GuideFaqSection />
          </div>

          <aside className="hidden w-52 shrink-0 xl:block">
            <GuideInPageNav />
          </aside>
        </div>
      </div>
    </div>
  );
}
