import Link from "next/link";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { ROUTES } from "@/constants/routes";

export default function AnalyticsReleaseNotFound() {
  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-black text-white">
      <div className="sticky top-0 z-120 shrink-0 bg-black">
        <DashboardHeader />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-12 text-center">
        <p className="text-sm text-zinc-500">Релиз не найден в демо-выборке.</p>
        <Link
          href={ROUTES.analyticsReleases}
          className="text-sm font-medium text-lime-400/90 underline-offset-4 hover:underline"
        >
          Вернуться к аналитике релизов
        </Link>
      </div>
    </div>
  );
}
