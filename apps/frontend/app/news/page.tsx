import type { Metadata } from "next";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { PayoutsSubpageHero } from "@/components/dashboard/assets/payouts-subpage-hero";
import { NewsPageContent } from "@/components/news/news-page-content";

export const metadata: Metadata = {
  title: "Новости",
  description: "Новости и обновления RevShare: продукт, выплаты USDT (TRC20) и вторичный рынок.",
};

export default function NewsPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-[#f6f7f9]">
      <DashboardHeader />
      <main className="scheme-light flex-1 text-neutral-900">
        <div className="mx-auto w-full max-w-[1320px] px-4 pb-5 sm:px-6 lg:px-8">
          <div className="space-y-8 pb-8 sm:space-y-10 sm:pb-10">
            <PayoutsSubpageHero
              eyebrow="RevShare · Product · Operations"
              title="Новости"
              description="Релизы интерфейса, выплаты и вторичный рынок — короткими заметками, в том же светлом макете, что профиль и раздел активов. Ниже мок-лента для превью страницы."
            />
            <NewsPageContent />
          </div>
        </div>
      </main>
    </div>
  );
}
