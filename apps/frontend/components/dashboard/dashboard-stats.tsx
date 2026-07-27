"use client";

import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpRight } from "@/lib/lucide";

import {
  landingLiveCard,
  landingSectionStack,
  landingSectionTitle,
  landingStatGrid,
  landingStatTile,
} from "@/components/dashboard/dashboard-landing-tokens";
import { useI18n } from "@/components/providers/i18n-provider";
import { ReadOnlySectionError } from "@/components/shared/data-states/read-only-section-error";
import { ROUTES } from "@/constants/routes";
import { useDashboardLandingStats } from "@/hooks/use-dashboard-landing-stats";
import { cn } from "@/lib/utils";

export {
  landingSectionStack,
  landingSectionTitle,
  landingStatGrid,
  landingStatTile,
} from "@/components/dashboard/dashboard-landing-tokens";

function StatTrendBadge({
  trend,
  change,
  t,
}: {
  trend: "up" | "down" | "flat";
  change?: string;
  t: (key: string) => string;
}) {
  if (!change) return null;
  const up = trend === "up";
  const down = trend === "down";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-xs font-medium tabular-nums tracking-[0.05em]",
        up ? "text-[#3fe280]" : down ? "text-[#9b9b9b]" : "text-[#62666d]",
      )}
      aria-label={up ? t("dashboard.stats.trend.up") : down ? t("dashboard.stats.trend.down") : change}
    >
      {up ? (
        <ArrowUp className="size-3.5 shrink-0" strokeWidth={2.5} aria-hidden />
      ) : down ? (
        <ArrowDown className="size-3.5 shrink-0" strokeWidth={2.5} aria-hidden />
      ) : null}
      {change}
    </span>
  );
}

function StatsSkeleton() {
  return (
    <div className={landingStatGrid}>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className={cn(landingStatTile, "min-h-[120px] animate-pulse sm:min-h-[156px]")}>
          <div className="h-2.5 w-24 rounded bg-white/5" />
          <div className="mt-4 h-7 w-32 rounded bg-white/5" />
          <div className="mt-auto h-8 w-full rounded bg-white/[0.03]" />
        </div>
      ))}
    </div>
  );
}

export function DashboardStats({ className }: { className?: string }) {
  const { t } = useI18n();
  const { stats, loading, live, fetchError, reload } = useDashboardLandingStats(
    ROUTES.dashboardPayoutsHistory,
    t("dashboard.stats.withdrawLink"),
  );

  return (
    <section id="holdings" className={cn("relative z-10 scroll-mt-24", landingSectionStack, className)}>
      <header>
        <h2 className={landingSectionTitle}>{t("dashboard.stats.title")}</h2>
      </header>

      {!live ? (
        <p className="text-xs tracking-[0.05em] text-[#9b9b9b]" role="status">
          {t("dashboard.stats.demoNotice")}
        </p>
      ) : null}

      {fetchError ? (
        <ReadOnlySectionError
          sectionId="dashboard-landing-stats"
          error={fetchError}
          onRetry={reload}
          retryLabel={t("dashboard.stats.retry")}
          variant="dark"
        />
      ) : null}

      {loading ? (
        <StatsSkeleton />
      ) : fetchError ? null : stats.length === 0 ? (
        <p className="text-sm tracking-[0.05em] text-[#9b9b9b]">{t("dashboard.stats.empty")}</p>
      ) : (
        <div className={landingStatGrid} aria-label={t("dashboard.stats.ariaLabel")}>
          {stats.map((s, index) => (
            <article
              key={s.id}
              className={cn(
                index === 0 ? landingLiveCard : landingStatTile,
                "flex min-h-[120px] flex-col px-4 py-4 sm:min-h-[156px] sm:px-6 sm:py-6",
              )}
            >
              <p className="text-[14px] font-normal uppercase tracking-[0.05em] text-[#9b9b9b]">{s.label}</p>
              <div className="mt-2 flex flex-col gap-1 sm:mt-3 sm:flex-row sm:flex-wrap sm:items-baseline sm:justify-between sm:gap-x-2 sm:gap-y-1">
                <p className="font-mono text-[24px] font-medium tabular-nums tracking-tight text-white sm:text-[36px] sm:leading-[1.11]">
                  {s.value}
                </p>
                <StatTrendBadge trend={s.trend} change={s.change} t={t} />
              </div>
              <p className="mt-auto pt-3 text-[14px] leading-[1.43] tracking-[0.05em] text-[#9b9b9b]">{s.hint}</p>
              {s.href && s.hrefLabel ? (
                <Link
                  href={s.href}
                  className="mt-3 inline-flex items-center gap-1 text-[14px] font-medium tracking-[0.05em] text-white underline-offset-4 hover:underline"
                >
                  {s.hrefLabel}
                  <ArrowUpRight className="size-3.5" strokeWidth={2} aria-hidden />
                </Link>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}