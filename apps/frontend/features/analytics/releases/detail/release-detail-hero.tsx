import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { ROUTES } from "@/constants/routes";
import type { ReleaseAnalyticsRow, ReleaseRowGenre } from "@/types/analytics/releases";
import type { ReleaseDetailPageData } from "@/types/analytics/release-detail";

import { ReleaseDetailBreadcrumb } from "./release-detail-breadcrumb";
import { ReleaseDetailCover } from "./release-detail-cover";

const genreLabel: Record<ReleaseRowGenre, string> = {
  electronic: "Electronic",
  hiphop: "Hip-Hop",
  pop: "Pop",
};

function statusRu(status: ReleaseAnalyticsRow["status"]): string {
  if (status === "Active") return "Активен";
  if (status === "Paused") return "Пауза";
  return "Закрыт";
}

export function ReleaseDetailHero({
  data,
  source,
  backHrefOverride,
  backLabelOverride,
}: {
  data: ReleaseDetailPageData;
  source?: string;
  /** Перебивает вычисленный «назад» (например с экрана ledger → карточка релиза). */
  backHrefOverride?: string;
  backLabelOverride?: string;
}) {
  const { row } = data;
  const backHrefDefault =
    source === "catalog"
      ? ROUTES.dashboardCatalog
      : source === "secondary"
        ? ROUTES.dashboardSecondaryMarket
        : ROUTES.analyticsReleases;
  const backLabelDefault =
    source === "catalog" ? "Рекомендации" : source === "secondary" ? "Вторичный рынок" : "Аналитика релизов";
  const backHref = backHrefOverride ?? backHrefDefault;
  const backLabel = backLabelOverride ?? backLabelDefault;
  return (
    <header className="pb-10">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-[12px] font-medium text-zinc-500 transition-colors hover:text-zinc-300"
      >
        {backLabel}
        <ChevronRight className="size-3.5" strokeWidth={1.8} aria-hidden />
        <span className="font-mono text-[13px] font-semibold text-white">{row.symbol}</span>
      </Link>
      <div className="mt-5">
        <ReleaseDetailBreadcrumb data={data} />
      </div>

      <div className="mt-8 min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500">RevShare · release details</p>
        <h1 className="mt-2 text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl">{row.release}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-400">
          <span className="text-zinc-300">{row.artist}</span>
          <span className="text-zinc-700" aria-hidden>
            ·
          </span>
          <span className="font-mono text-zinc-400">{row.symbol}</span>
          <span className="text-zinc-700" aria-hidden>
            ·
          </span>
          <span>{genreLabel[row.genre]}</span>
          <span className="text-zinc-700" aria-hidden>
            ·
          </span>
          <span className="rounded-lg bg-[#0a0a0a] px-2 py-0.5 text-[11px] font-medium text-zinc-400">
            {statusRu(row.status)}
          </span>
        </div>
        <p className="mt-5 max-w-[62ch] text-sm leading-relaxed text-zinc-400">{data.heroBlurb}</p>
        <ReleaseDetailCover cover={data.cover} releaseTitle={row.release} />
      </div>
    </header>
  );
}
