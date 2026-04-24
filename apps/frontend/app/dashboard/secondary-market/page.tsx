import type { Metadata } from "next";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { SecondaryMarketScreen } from "@/components/dashboard/secondary-market/secondary-market-screen";

export const metadata: Metadata = {
  title: "Вторичный рынок",
  description:
    "Внутренний secondary market RevShare: стакан заявок, ордера, история сделок и избранное в USDT (TRC20).",
};

export default function SecondaryMarketPage() {
  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-black">
      <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain">
        <DashboardHeader sticky={false} />
        <SecondaryMarketScreen />
      </div>
    </div>
  );
}
