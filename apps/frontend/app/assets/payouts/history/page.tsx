import type { Metadata } from "next";

import { PayoutsHistoryPageContent } from "@/components/dashboard/assets/payouts-history-page-content";
import { PayoutsSectionHeader } from "@/components/dashboard/assets/payouts-section-header";

export const metadata: Metadata = {
  title: "История выплат",
  description: "Лента начислений, выплат и выводов USDT (TRC20).",
};

export default function AssetsPayoutsHistoryPage() {
  return (
    <div className="space-y-4 pb-2">
      <PayoutsSectionHeader />

      <section className="scroll-mt-24">
        <PayoutsHistoryPageContent />
      </section>
    </div>
  );
}
