import type { Metadata } from "next";

import { PayoutDepositCard } from "@/components/dashboard/assets/payout-deposit-card";
import { PayoutsSectionHeader } from "@/components/dashboard/assets/payouts-section-header";

export const metadata: Metadata = {
  title: "Пополнить USDT",
  description: "Пополнение баланса USDT (TRC20) для выплат и операций в RevShare.",
};

export default function AssetsPayoutsDepositPage() {
  return (
    <div className="space-y-10 pb-8 sm:space-y-12">
      <PayoutsSectionHeader />
      <PayoutDepositCard />
    </div>
  );
}
