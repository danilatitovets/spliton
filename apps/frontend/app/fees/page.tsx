import type { Metadata } from "next";
import Image from "next/image";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { FeesPageContent } from "@/components/fees/fees-page-content";

export const metadata: Metadata = {
  title: "Комиссии",
  description:
    "Platform fee, secondary fee, вывод USDT (TRC20): таблица тарифов, примеры расчёта и ответы на частые вопросы RevShare.",
};

export default function FeesPage() {
  return (
    <div className="relative flex min-h-dvh flex-col bg-[#f6f7f9]">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[min(52vh,520px)] overflow-hidden" aria-hidden>
        <Image src="/images/assetsunt/backgraund.png" alt="" fill className="object-cover object-center" priority />
      </div>
      <DashboardHeader />
      <main className="scheme-light relative z-10 flex-1 text-neutral-900">
        <div className="mx-auto w-full max-w-[1320px] px-4 pb-5 sm:px-6 lg:px-8">
          <div className="space-y-8 pb-8 sm:space-y-10 sm:pb-10">
            <div className="min-h-[220px] sm:min-h-[260px] lg:min-h-[300px]">
              <div className="flex min-h-[inherit] items-center justify-center text-center">
                <h1 className="text-[56px] font-semibold leading-tight tracking-tight text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.55)]">
                  Комиссии и удержания
                </h1>
              </div>
            </div>
            <div className="pt-4 sm:pt-6">
              <FeesPageContent />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
