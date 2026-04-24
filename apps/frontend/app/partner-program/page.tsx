import type { Metadata } from "next";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { PartnerProgramScreen } from "@/components/partner-program/partner-program-screen";

export const metadata: Metadata = {
  title: "Партнёрская программа",
  description:
    "Партнёрство RevShare для медиа, сообществ, лейблов и стратегических игроков: форматы, преимущества, заявка и FAQ.",
};

export default function PartnerProgramPage() {
  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-black">
      <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain">
        <DashboardHeader sticky={false} />
        <PartnerProgramScreen />
      </div>
    </div>
  );
}
