import type { Metadata } from "next";

import { PayoutsSectionHeader } from "@/components/dashboard/assets/payouts-section-header";
import { PayoutWithdrawCard } from "@/components/dashboard/assets/payout-withdraw-card";

export const metadata: Metadata = {
  title: "Вывод USDT",
  description: "Заявка на вывод USDT (TRC20), реквизиты и история выводов.",
};

export default function AssetsPayoutsWithdrawPage() {
  return (
    <div className="space-y-10 pb-8 sm:space-y-12">
      <PayoutsSectionHeader />
      <PayoutWithdrawCard />
    </div>
  );
}
