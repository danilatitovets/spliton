import type { Metadata } from "next";

import { AssetsInfoNote } from "@/components/dashboard/assets/assets-info-note";
import { AssetsStatRow } from "@/components/dashboard/assets/assets-stat-row";
import { OverviewHero } from "@/components/dashboard/assets/overview-hero";
import { OverviewSectionTabs } from "@/components/dashboard/assets/overview-section-tabs";
import { PositionsStructureCards } from "@/components/dashboard/assets/positions-structure-cards";
import { PayoutsSubpageHero } from "@/components/dashboard/assets/payouts-subpage-hero";
import { TopPositionsCard } from "@/components/dashboard/assets/top-positions-card";

export const metadata: Metadata = {
  title: "Сводка",
  description: "Сводка holdings: positions, units, релизы и структура позиций.",
};

export default function AssetsOverviewPage() {
  return (
    <div className="space-y-10 pb-8 sm:space-y-12">
      <OverviewSectionTabs />

      <div className="space-y-8 sm:space-y-10">
        <PayoutsSubpageHero eyebrow="USDT · Holdings · Overview" title="Сводка активов" />

        <section className="scroll-mt-24">
          <OverviewHero />
        </section>

        <section className="scroll-mt-24">
          <AssetsStatRow />
        </section>

        <section className="scroll-mt-24">
          <TopPositionsCard />
        </section>

        <section className="scroll-mt-24">
          <PositionsStructureCards />
        </section>

        <AssetsInfoNote />
      </div>
    </div>
  );
}
