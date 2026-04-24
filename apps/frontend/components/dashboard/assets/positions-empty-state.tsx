import Link from "next/link";

import { ROUTES } from "@/constants/routes";

export function PositionsEmptyState() {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-6">
      <h2 className="text-2xl font-semibold text-neutral-900">Позиции</h2>

      <div className="flex min-h-[280px] flex-col items-center justify-center text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-full border border-neutral-300 text-neutral-500">
          !
        </div>
        <p className="text-xl font-semibold text-neutral-900">У вас пока нет позиций в релизах</p>
        <p className="mt-1.5 max-w-xl text-sm text-neutral-500">
          Когда появятся данные, здесь будет таблица releases, units и payouts.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <Link
            href={`${ROUTES.dashboard}#deposit`}
            className="inline-flex h-10 items-center rounded-full bg-lime-600 px-4 text-sm font-semibold text-white transition hover:bg-lime-700"
          >
            Пополнить USDT
          </Link>
          <Link
            href={ROUTES.dashboardCatalog}
            className="inline-flex h-10 items-center rounded-full border border-neutral-300 bg-white px-4 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50"
          >
            Открыть каталог
          </Link>
        </div>
      </div>
    </section>
  );
}
