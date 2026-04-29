import type { Metadata } from "next";
import Image from "next/image";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { NewsPageContent } from "@/components/news/news-page-content";

export const metadata: Metadata = {
  title: "Новости",
  description: "Новости и обновления RevShare: продукт, выплаты USDT (TRC20) и вторичный рынок.",
};

export default function NewsPage() {
  return (
    <div className="relative min-h-dvh bg-[#f5f5f5]">
      <DashboardHeader />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[min(46vh,430px)] overflow-hidden" aria-hidden>
        <Image
          src="/images/fees/back.png"
          alt=""
          fill
          className="object-cover object-center"
          sizes="100vw"
          quality={100}
          priority
        />
      </div>

      <main className="relative z-10">
        <section className="mx-auto flex h-[min(46vh,430px)] w-full max-w-[1320px] items-center justify-center px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">Новости</h1>
        </section>
        <section className="bg-[#f5f5f5]">
          <div className="mx-auto w-full max-w-[1320px] px-4 pb-10 pt-6 sm:px-6 lg:px-8">
            <NewsPageContent />
          </div>
        </section>
      </main>
    </div>
  );
}
