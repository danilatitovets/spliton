import Link from "next/link";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { ROUTES } from "@/constants/routes";

export default function CatalogReleaseAnalyticsNotFound() {
  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-black text-white">
      <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain">
        <DashboardHeader sticky={false} />
        <div className="flex flex-col items-center justify-center gap-4 px-4 pb-24 pt-16">
      
          <h1 className="text-center text-2xl font-semibold tracking-tight md:text-3xl">Релиз не найден</h1>
          <p className="max-w-md text-center text-sm leading-relaxed text-zinc-500 md:text-[15px]">
            Нет mock-данных для этого id. Вернитесь к обзору рынка и выберите строку из таблицы.
          </p>
          <Link
            href={ROUTES.catalogMarketOverview}
            className="rounded-md bg-[#0a0a0a] px-4 py-2 text-sm font-medium text-zinc-200 ring-1 ring-white/8 transition-colors hover:bg-white/[0.04] hover:text-white"
          >
            Обзор рынка
          </Link>
        </div>
      </div>
    </div>
  );
}
