import Link from "next/link";

import { ROUTES } from "@/constants/routes";

export function OverviewHeader() {
  return (
    <section className="border-b border-neutral-200 pb-6 pt-7 sm:pb-7 sm:pt-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">МОИ АКТИВЫ</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900 sm:text-[2.1rem]">Обзор</h1>
          <p className="mt-2 text-sm text-neutral-600 sm:text-[15px]">
            Все позиции, начисления, выплаты и документы в одном кабинете.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`${ROUTES.dashboard}#deposit`}
            className="inline-flex h-10 items-center rounded-full bg-lime-500 px-4 text-xs font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-lime-600"
          >
            Пополнить USDT
          </Link>
          <Link
            href={ROUTES.myAssetsPayouts}
            className="inline-flex h-10 items-center rounded-full border border-neutral-300 bg-white px-4 text-xs font-semibold uppercase tracking-[0.08em] text-neutral-900 transition hover:border-neutral-400 hover:bg-neutral-50"
          >
            Вывести
          </Link>
        </div>
      </div>
    </section>
  );
}
