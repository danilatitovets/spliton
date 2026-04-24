import type { Metadata } from "next";

import { ActivityPageContent } from "@/components/dashboard/assets/activity-page-content";
import { OverviewSectionTabs } from "@/components/dashboard/assets/overview-section-tabs";
import { PayoutsSubpageHero } from "@/components/dashboard/assets/payouts-subpage-hero";

export const metadata: Metadata = {
  title: "Активность",
  description: "История действий по positions, units и activity аккаунта.",
};

export default function AssetsActivityPage() {
  return (
    <div className="space-y-10 pb-8 sm:space-y-12">
      <OverviewSectionTabs />

      <div className="space-y-8 sm:space-y-10">
        <PayoutsSubpageHero eyebrow="USDT · Holdings · Activity" title="Активность" />
        <ActivityPageContent />
      </div>
    </div>
  );
}
