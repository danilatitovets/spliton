import type { Metadata } from "next";
import Link from "next/link";

import { CalculatorPageContent } from "@/components/dashboard/assets/calculator-page-content";
import { ROUTES } from "@/constants/routes";

export const metadata: Metadata = {
  title: "Калькулятор",
  description: "Инструменты RevShare: покупка и продажа units, вывод USDT (TRC20) и иллюстративная оценка начислений.",
};

export default function AssetsCalculatorPage() {
  return (
    <div className="space-y-8 pb-8 sm:space-y-10 sm:pb-10">
      <section className="rounded-3xl bg-white px-5 py-7 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.08)] sm:px-8 sm:py-9">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">RevShare · Calculator</p>
        <h1 className="mt-2 text-[1.9rem] font-bold leading-[1.1] tracking-tight text-zinc-950 sm:text-[2.3rem]">
          Калькулятор операций
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-600 sm:text-[15px]">
          Оценка покупки и продажи UNT, вывода USDT (TRC20) и примерного начисления по доле. Интерфейс и логика в стиле
          страницы покупки из каталога.
        </p>
        <p className="mt-3 text-[14px] md:text-[15px]">
          <Link
            href={ROUTES.assetsUnt}
            className="font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-4 transition-colors hover:text-zinc-700 hover:decoration-zinc-500"
          >
            Что такое UNT?
          </Link>
        </p>
      </section>

      <CalculatorPageContent />
    </div>
  );
}
