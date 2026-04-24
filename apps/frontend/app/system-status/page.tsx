import type { Metadata } from "next";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { PayoutsSubpageHero } from "@/components/dashboard/assets/payouts-subpage-hero";
import { SystemStatusPageContent } from "@/components/system-status/system-status-page-content";

export const metadata: Metadata = {
  title: "Статус системы",
  description:
    "Состояние сервисов RevShare: пополнения и вывод USDT (TRC20), выплаты, вторичный рынок, ордера и поддержка.",
};

export default function SystemStatusPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-[#f6f7f9]">
      <DashboardHeader />
      <main className="scheme-light flex-1 text-neutral-900">
        <div className="mx-auto w-full max-w-[1320px] px-4 pb-5 sm:px-6 lg:px-8">
          <div className="space-y-8 pb-8 sm:space-y-10 sm:pb-10">
            <PayoutsSubpageHero
              eyebrow="RevShare · USDT · TRC20"
              title="Статус системы"
              description="Пополнения, выводы, выплаты, вторичный рынок и смежные сервисы — в пользовательском контуре, без инженерного шума. Обновления ориентировочные до подключения live-статуса."
            />
            <SystemStatusPageContent />
          </div>
        </div>
      </main>
    </div>
  );
}
