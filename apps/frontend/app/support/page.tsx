import type { Metadata } from "next";
import Image from "next/image";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { SupportCenterPage } from "@/components/support/support-center-page";

export const metadata: Metadata = {
  title: "Поддержка",
  description:
    "Чат с поддержкой RevShare: вопросы по балансу, USDT (TRC20), выплатам и аккаунту. Дополнительно — почта и статус сервисов.",
};

/** Каркас как у `/fees`: фон-герой, затем светлая зона с навигацией и контентом. */
export default function SupportRoutePage() {
  return (
    <div className="relative flex min-h-dvh flex-col bg-[#f6f7f9]">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[min(48vh,480px)] overflow-hidden" aria-hidden>
        <Image
          src="/images/assetsunt/backgraund.png"
          alt=""
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
        />
      </div>
      <DashboardHeader elevatedOnScroll={false} />
      <main className="scheme-light relative z-10 flex-1 text-neutral-900">
        <div className="mx-auto w-full max-w-[1320px] px-4 pb-8 sm:px-6 sm:pb-10 lg:px-8">
          <div className="space-y-6 pb-2 sm:space-y-8">
            <div className="min-h-[200px] sm:min-h-[240px] lg:min-h-[280px]">
              <div className="flex min-h-[inherit] flex-col items-center justify-center gap-3 px-2 py-8 text-center sm:gap-4 sm:py-10">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/85 [text-shadow:0_1px_12px_rgba(0,0,0,0.35)]">
                  Помощь · USDT (TRC20)
                </p>
                <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl [text-shadow:0_2px_24px_rgba(0,0,0,0.55)]">
                  Поддержка
                </h1>
                <p className="max-w-xl text-sm leading-relaxed text-white/90 [text-shadow:0_1px_16px_rgba(0,0,0,0.45)]">
                  Чат с оператором, почта и быстрые переходы в кабинет — в одном месте.
                </p>
              </div>
            </div>

            <div className="pt-2 sm:pt-4">
              <section className="scroll-mt-24">
                <SupportCenterPage />
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
