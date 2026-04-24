import type { Metadata } from "next";

import { OverviewSectionTabs } from "@/components/dashboard/assets/overview-section-tabs";
import { PositionsPageContent } from "@/components/dashboard/assets/positions-page-content";
import { PayoutsSubpageHero } from "@/components/dashboard/assets/payouts-subpage-hero";

export const metadata: Metadata = {
  title: "Позиции",
  description: "Все текущие holdings по релизам.",
};

export default function AssetsPositionsPage() {
  return (
    <div className="space-y-10 pb-8 sm:space-y-12">
      <OverviewSectionTabs />

      <div className="space-y-8 sm:space-y-10">
        <PayoutsSubpageHero eyebrow="USDT · Holdings · Positions" title="Позиции" />
        <PositionsPageContent />
      </div>
    </div>
  );
}
