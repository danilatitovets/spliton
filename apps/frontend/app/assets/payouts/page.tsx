import type { Metadata } from "next";

import { PayoutsAccrualChart } from "@/components/dashboard/assets/payouts-accrual-chart";
import { PayoutsSectionHeader } from "@/components/dashboard/assets/payouts-section-header";
import { PayoutsSubpageHero } from "@/components/dashboard/assets/payouts-subpage-hero";

export const metadata: Metadata = {
  title: "Выплаты",
  description: "Динамика начислений USDT по релизам.",
};

export default function AssetsPayoutsPage() {
  return (
    <div className="space-y-10 pb-8 sm:space-y-12">
      <PayoutsSectionHeader />

      <div className="space-y-8 sm:space-y-10">
        <PayoutsSubpageHero eyebrow="USDT · TRC20 · Payouts" title="Обзор выплат" />

        <section className="scroll-mt-24">
          <PayoutsAccrualChart />
        </section>
      </div>
    </div>
  );
}
