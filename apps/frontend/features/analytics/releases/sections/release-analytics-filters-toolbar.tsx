"use client";

import type { ReactNode } from "react";
import { Search } from "@/lib/lucide";

import { MetricsGptToggle } from "@/components/dashboard/assets/metrics-gpt-toggle";
import { useI18n } from "@/components/providers/i18n-provider";
import { cn } from "@/lib/utils";
import type {
  ReleaseAnalyticsChipPreset,
  ReleaseRowGenre,
  ReleaseRowStatus,
} from "@/types/analytics/releases";

const FILTER_HEADER_VIDEO = "/videos/position-holding-bg.mp4";

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full px-3 py-1.5 text-[12px] font-semibold tracking-tight transition",
        active
          ? "bg-white text-black"
          : "bg-white/[0.06] text-zinc-400 hover:bg-white/[0.1] hover:text-zinc-200",
      )}
    >
      {children}
    </button>
  );
}

export function ReleaseAnalyticsFiltersToolbar({
  statusTab,
  onStatusTab,
  chipPreset,
  onChipPreset,
  query,
  onQuery,
  genre,
  onGenre,
  resultCount,
  totalCount,
}: {
  statusTab: "all" | ReleaseRowStatus;
  onStatusTab: (t: "all" | ReleaseRowStatus) => void;
  chipPreset: ReleaseAnalyticsChipPreset;
  onChipPreset: (p: ReleaseAnalyticsChipPreset) => void;
  query: string;
  onQuery: (q: string) => void;
  genre: "all" | ReleaseRowGenre;
  onGenre: (g: "all" | ReleaseRowGenre) => void;
  resultCount?: number;
  totalCount?: number;
}) {
  const { t } = useI18n();
  const showCount = typeof resultCount === "number" && typeof totalCount === "number";

  return (
    <section
      className="sticky top-0 z-[60] isolate shrink-0 overflow-hidden border-b border-white/[0.06] bg-black"
      aria-label="Фильтры релизов"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <video
          className="absolute inset-0 h-full w-full scale-110 object-cover opacity-25 blur-[10px] motion-reduce:hidden"
          src={FILTER_HEADER_VIDEO}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
        <div className="absolute inset-0 bg-black/88 motion-reduce:bg-black" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1400px] space-y-3 px-4 py-3.5 md:px-6 lg:px-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-wrap items-center gap-2.5">
            <h2 className="text-[15px] font-semibold tracking-tight text-white">Релизы</h2>
            {showCount ? (
              <span className="rounded-full bg-white/[0.08] px-2.5 py-1 font-mono text-[11px] font-medium tabular-nums text-zinc-300">
                {resultCount.toLocaleString("ru-RU")}
                <span className="text-zinc-500"> / {totalCount.toLocaleString("ru-RU")}</span>
              </span>
            ) : null}
            <MetricsGptToggle
              size="sm"
              ariaLabel="Статус"
              value={statusTab}
              onChange={onStatusTab}
              options={[
                { id: "all", label: "Все" },
                { id: "Active", label: "Активные" },
                { id: "Paused", label: "Пауза" },
                { id: "Closed", label: "Закрыты" },
              ]}
            />
          </div>

          <div className="relative w-full max-w-md lg:w-[280px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-zinc-500" />
            <input
              value={query}
              onChange={(e) => onQuery(e.target.value)}
              placeholder={t("analytics.releases.searchPlaceholder")}
              className="h-9 w-full rounded-full border-0 bg-white/[0.06] py-2 pl-9 pr-3 text-[12px] text-zinc-100 outline-none ring-1 ring-white/[0.08] placeholder:text-zinc-600 focus:bg-white/[0.09] focus:ring-white/20"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-1.5">
            <Pill active={chipPreset === "all"} onClick={() => onChipPreset("all")}>
              Все
            </Pill>
            <Pill active={chipPreset === "top"} onClick={() => onChipPreset("top")}>
              Топ доходность
            </Pill>
            <Pill active={chipPreset === "stable"} onClick={() => onChipPreset("stable")}>
              Стабильные
            </Pill>
            <Pill active={chipPreset === "growth"} onClick={() => onChipPreset("growth")}>
              С ростом
            </Pill>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <Pill active={genre === "all"} onClick={() => onGenre("all")}>
              Все жанры
            </Pill>
            <Pill active={genre === "electronic"} onClick={() => onGenre("electronic")}>
              Electronic
            </Pill>
            <Pill active={genre === "hiphop"} onClick={() => onGenre("hiphop")}>
              Hip-hop
            </Pill>
            <Pill active={genre === "pop"} onClick={() => onGenre("pop")}>
              Pop
            </Pill>
          </div>
        </div>
      </div>
    </section>
  );
}
