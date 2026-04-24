import type { Metadata } from "next";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { ReferralProgramScreen } from "@/components/referral/referral-program-screen";

export const metadata: Metadata = {
  title: "Реферальная программа",
  description:
    "Персональная ссылка и код RevShare, статистика приглашений, награды в USDT (TRC20) и история начислений.",
};

export default function ReferralProgramPage() {
  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-black">
      <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain">
        <DashboardHeader sticky={false} />
        <ReferralProgramScreen />
      </div>
    </div>
  );
}
