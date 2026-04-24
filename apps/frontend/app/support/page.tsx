import type { Metadata } from "next";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { SupportCenterPage } from "@/components/support/support-center-page";
import { SupportSectionHeader } from "@/components/support/support-section-header";

export const metadata: Metadata = {
  title: "Поддержка",
  description:
    "Чат с поддержкой RevShare: вопросы по балансу, USDT (TRC20), выплатам и аккаунту. Дополнительно — почта и статус сервисов.",
};

/** Тот же каркас, что у `/dashboard/profile` и `/assets/*`. */
export default function SupportRoutePage() {
  return (
    <div className="flex min-h-dvh flex-col bg-[#f6f7f9]">
      <DashboardHeader />
      <main className="scheme-light flex-1 text-neutral-900">
        <div className="mx-auto w-full max-w-[1320px] px-4 pb-5 sm:px-6 lg:px-8">
          <div className="space-y-4 pb-2">
            <SupportSectionHeader />
            <section className="scroll-mt-24">
              <SupportCenterPage />
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
