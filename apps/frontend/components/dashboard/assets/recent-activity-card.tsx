"use client";

import Link from "next/link";

import type { AssetsActivity } from "@/components/dashboard/assets/assets-mock-data";
import { recentActivity } from "@/components/dashboard/assets/assets-mock-data";
import { assetsMutedCardClass } from "@/components/dashboard/assets/assets-ui";
import { useI18n } from "@/components/providers/i18n-provider";
import { ReadOnlySectionError } from "@/components/shared/data-states/read-only-section-error";
import { ROUTES } from "@/constants/routes";
import { Activity } from "@/lib/lucide";
import { cn } from "@/lib/utils";

export function RecentActivityCard({
  preview = false,
  live = false,
  items,
  loading = false,
  error = null,
  onRetry,
  variant = "default",
}: {
  preview?: boolean;
  live?: boolean;
  items?: AssetsActivity[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  variant?: "default" | "statement";
}) {
  const { t } = useI18n();
  const resolvedItems = items ?? (live ? [] : preview ? recentActivity.slice(0, 4) : recentActivity);
  const isStatement = variant === "statement";
  const sectionClass = cn(
    assetsMutedCardClass,
    isStatement && "flex h-full min-h-0 flex-col",
  );

  if (live && loading && resolvedItems.length === 0) {
    return (
      <section className={sectionClass}>
        <div className="h-28 animate-pulse rounded-xl bg-neutral-100/80" />
      </section>
    );
  }

  if (live && error && resolvedItems.length === 0) {
    return (
      <section className={sectionClass}>
        <ReadOnlySectionError
          sectionId="recent-activity-card"
          error={error}
          onRetry={onRetry}
          compact
        />
      </section>
    );
  }

  const title = isStatement ? t("overview.statementTitle") : t("activity.recent.title");
  const emptyMessage = live ? t("assets.overview.activityHistoryHint") : t("activity.recent.empty");

  return (
    <section className={sectionClass}>
      {isStatement ? (
        <h3 className="truncate whitespace-nowrap text-base font-semibold tracking-tight text-neutral-900">
          {title}
        </h3>
      ) : (
        <div className="flex items-center justify-between gap-3">
          <h3 className="min-w-0 text-base font-semibold text-neutral-900 sm:text-lg">{title}</h3>
          {preview || live ? (
            <Link
              href={ROUTES.dashboardActivity}
              className="shrink-0 text-sm font-medium text-neutral-500 transition hover:text-neutral-900"
            >
              {t("activity.recent.viewAll")}
            </Link>
          ) : null}
        </div>
      )}

      {resolvedItems.length === 0 ? (
        <div className={cn("flex flex-1 flex-col items-center justify-center px-2", isStatement ? "py-6" : "mt-4 py-4")}>
          {isStatement ? (
            <>
              <span className="inline-flex size-11 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
                <Activity className="size-5" strokeWidth={1.85} aria-hidden />
              </span>
              <p className="mt-3 text-center text-sm text-neutral-500">{emptyMessage}</p>
              <Link
                href={ROUTES.dashboardActivity}
                className="mt-4 inline-flex h-9 items-center justify-center rounded-full bg-neutral-900 px-4 text-[13px] font-medium text-white transition hover:bg-neutral-800 active:scale-[0.98]"
              >
                {t("activity.recent.viewAllShort")}
              </Link>
            </>
          ) : (
            <p className="text-sm text-neutral-500">{emptyMessage}</p>
          )}
        </div>
      ) : (
        <>
          <ul className={cn("divide-y divide-neutral-100", isStatement ? "mt-3" : "mt-3")}>
            {resolvedItems.map((item) => (
              <li key={item.id} className="flex items-start justify-between gap-3 py-2.5 text-sm">
                <div className="min-w-0">
                  <p className="font-medium text-neutral-900">{item.type}</p>
                  <p className="truncate text-xs text-neutral-500">{item.detail}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-mono font-medium tabular-nums text-neutral-900">{item.amount}</p>
                  <p className="text-xs text-neutral-500">{item.date}</p>
                </div>
              </li>
            ))}
          </ul>
          {isStatement ? (
            <div className="mt-auto flex flex-col items-center pt-4">
              <span className="inline-flex size-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
                <Activity className="size-[1.15rem]" strokeWidth={1.85} aria-hidden />
              </span>
              <Link
                href={ROUTES.dashboardActivity}
                className="mt-2.5 inline-flex h-9 items-center justify-center rounded-full bg-neutral-900 px-4 text-[13px] font-medium text-white transition hover:bg-neutral-800 active:scale-[0.98]"
              >
                {t("activity.recent.viewAllShort")}
              </Link>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
