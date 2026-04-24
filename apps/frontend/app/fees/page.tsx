import type { Metadata } from "next";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { PayoutsSubpageHero } from "@/components/dashboard/assets/payouts-subpage-hero";
import { FeesPageContent } from "@/components/fees/fees-page-content";

export const metadata: Metadata = {
  title: "Комиссии",
  description:
    "Platform fee, secondary fee, вывод USDT (TRC20): таблица тарифов, примеры расчёта и ответы на частые вопросы RevShare.",
};

export default function FeesPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-[#f6f7f9]">
      <DashboardHeader />
      <main className="scheme-light flex-1 text-neutral-900">
        <div className="mx-auto w-full max-w-[1320px] px-4 pb-5 sm:px-6 lg:px-8">
          <div className="space-y-8 pb-8 sm:space-y-10 sm:pb-10">
            <PayoutsSubpageHero
              eyebrow="RevShare · USDT · TRC20"
              title="Комиссии и удержания"
              description="Единая картина по операциям в кабинете: первичная покупка units, вторичный рынок, пополнение и вывод. Тарифы зависят от типа действия; перед подтверждением вы видите сумму, комиссию и итог. Без терминов вроде maker/taker — только продукт RevShare."
            />
            <FeesPageContent />
          </div>
        </div>
      </main>
    </div>
  );
}
