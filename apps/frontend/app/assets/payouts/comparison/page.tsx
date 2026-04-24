import type { Metadata } from "next";

import { PayoutsBalanceScale } from "@/components/dashboard/assets/payouts-balance-scale";
import { PayoutsSectionHeader } from "@/components/dashboard/assets/payouts-section-header";
import { PayoutsSubpageHero } from "@/components/dashboard/assets/payouts-subpage-hero";

export const metadata: Metadata = {
  title: "Сравнение выплат",
  description: "Сравнение периодов: начисления и выводы USDT.",
};

export default function AssetsPayoutsComparisonPage() {
  return (
    <div className="space-y-10 pb-8 sm:space-y-12">
      <PayoutsSectionHeader />

      <div className="space-y-8 sm:space-y-10">
        <PayoutsSubpageHero eyebrow="USDT · TRC20 · Compare" title="Сравнение периодов" />

        <section className="scroll-mt-24">
          <PayoutsBalanceScale />
        </section>
      </div>
    </div>
  );
}