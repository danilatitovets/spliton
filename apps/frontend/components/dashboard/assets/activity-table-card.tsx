"use client";

import type { ActivityRecord, ActivityStatus } from "@/components/dashboard/assets/activity-mock-data";
import { MetricsInfoTip } from "@/components/dashboard/assets/metrics-info-tip";
import { assetsCardClass } from "@/components/dashboard/assets/assets-ui";
import { useI18n } from "@/components/providers/i18n-provider";
import { cn } from "@/lib/utils";

const STATUS_KEYS: Record<ActivityStatus, string> = {
  Completed: "activity.widgets.status.completed",
  Pending: "activity.widgets.status.pending",
  Processing: "activity.widgets.status.processing",
  Cancelled: "activity.widgets.status.cancelled",
};

const statusPill: Record<ActivityStatus, string> = {
  Completed: "bg-neutral-100 text-neutral-700",
  Pending: "bg-amber-50 text-amber-800",
  Processing: "bg-neutral-100 text-neutral-700",
  Cancelled: "bg-neutral-100 text-neutral-400",
};

function activityTypeLabel(row: ActivityRecord, t: (key: string) => string) {
  return row.typeKey ? t(`activity.widgets.type.${row.typeKey}`) : (row.type ?? "");
}

function activityDetailsLabel(row: ActivityRecord, t: (key: string) => string) {
  return row.detailsKey ? t(`activity.widgets.details.${row.detailsKey}`) : (row.details ?? "");
}

function amountTone(amount: string): string {
  if (amount === "—" || amount === "-") return "text-neutral-400";
  if (amount.startsWith("+")) return "text-neutral-900";
  if (amount.startsWith("-") || amount.startsWith("−")) return "text-red-600";
  return "text-neutral-900";
}

function formatActivityAmount(amount: string, t: (key: string) => string): string {
  if (amount === "—" || amount === "-") return t("activity.widgets.amountNone");
  return amount;
}

export function ActivityTableCard({
  rows,
  state,
  compact = false,
  hideHeader = false,
}: {
  rows: ActivityRecord[];
  state: "default" | "empty" | "loading";
  compact?: boolean;
  hideHeader?: boolean;
}) {
  const { t } = useI18n();

  return (
    <section
      className={cn(assetsCardClass, "flex h-full min-w-0 flex-col", compact && "py-4 sm:py-5")}
      aria-label={t("activity.widgets.historyAria")}
    >
      {!hideHeader ? (
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-base font-semibold tracking-tight text-neutral-900 sm:text-lg">
                {t("activity.widgets.historyTitle")}
              </h3>
              <MetricsInfoTip label={t("activity.widgets.infoLabel")}>
                {t("activity.widgets.historyInfo")}
              </MetricsInfoTip>
            </div>
          </div>
        </div>
      ) : null}

      {state === "loading" ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-white/70" />
          ))}
        </div>
      ) : state === "empty" ? (
        <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
          <p className="text-base font-semibold text-neutral-900">{t("activity.emptyTitle")}</p>
          <p className="mt-1 text-sm text-neutral-500">{t("activity.emptyBody")}</p>
        </div>
      ) : (
        <ul className="divide-y divide-neutral-200/70">
          {rows.map((row) => {
            const details = activityDetailsLabel(row, t);
            return (
              <li
                key={row.id}
                className="flex items-start justify-between gap-3 py-3.5 first:pt-1 last:pb-1 sm:items-center"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-semibold text-neutral-900">
                      {activityTypeLabel(row, t)}
                    </p>
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide",
                        statusPill[row.status],
                      )}
                    >
                      {t(STATUS_KEYS[row.status])}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-neutral-500">
                    {row.date}
                    {row.release && row.release !== "—" ? ` · ${row.release}` : ""}
                    {details ? ` · ${details}` : ""}
                  </p>
                </div>
                <p
                  className={cn(
                    "shrink-0 text-sm font-semibold tabular-nums sm:text-[15px]",
                    row.amount === "—" || row.amount === "-" ? "font-sans" : "font-mono",
                    amountTone(row.amount),
                  )}
                >
                  {formatActivityAmount(row.amount, t)}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
