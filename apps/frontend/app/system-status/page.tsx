import type { Metadata } from "next";
import Image from "next/image";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { SystemStatusPageContent } from "@/components/system-status/system-status-page-content";

export const metadata: Metadata = {
  title: "Статус системы",
  description:
    "Состояние сервисов RevShare: пополнения и вывод USDT (TRC20), выплаты, вторичный рынок, ордера и поддержка.",
};

export default function SystemStatusPage() {
  return (
    <div className="relative min-h-dvh bg-[#0b0b0b] text-white">
      <DashboardHeader />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[min(44vh,380px)] overflow-hidden" aria-hidden>
        <Image src="/images/fees/back.png" alt="" fill className="object-cover object-top opacity-35" priority />
      </div>
      <main className="relative z-10 pb-10">
        <section className="mx-auto flex h-[min(34vh,300px)] w-full max-w-[1320px] items-center justify-center px-4 text-center sm:px-6 lg:px-8">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">Статус системы</h1>
            <p className="mt-3 text-sm text-zinc-300 sm:text-base">
              Пополнения, выводы, выплаты и вторичный рынок - в одном статус-контуре.
            </p>
          </div>
        </section>
        <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <div className="pb-8 sm:pb-10">
            <SystemStatusPageContent />
          </div>
        </div>
      </main>
    </div>
  );
}
