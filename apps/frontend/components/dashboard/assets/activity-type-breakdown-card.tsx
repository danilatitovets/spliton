"use client";

import type { ActivityKind, ActivityRecord } from "@/components/dashboard/assets/activity-mock-data";
import { MetricsInfoTip } from "@/components/dashboard/assets/metrics-info-tip";
import { assetsCardClass } from "@/components/dashboard/assets/assets-ui";
import { useI18n } from "@/components/providers/i18n-provider";
import { cn } from "@/lib/utils";

const KIND_ORDER: ActivityKind[] = ["deposit", "purchase", "sale", "secondary", "transfer", "withdrawal"];

const KIND_LABEL_KEYS: Record<ActivityKind, string> = {
  deposit: "activity.tab.deposits",
  purchase: "activity.tab.buys",
  sale: "activity.tab.sells",
  secondary: "activity.widgets.summarySecondaryTrades",
  transfer: "activity.tab.transfers",
  withdrawal: "activity.tab.withdrawals",
};

const KIND_DOT: Record<ActivityKind, string> = {
  deposit: "bg-blue-500",
  purchase: "bg-neutral-800",
  sale: "bg-emerald-500",
  secondary: "bg-violet-500",
  transfer: "bg-amber-500",
  withdrawal: "bg-red-500",
};

function parseSignedAmount(amount: string): number {
  const cleaned = amount
    .replace(/USDT/gi, "")
    .replace(/\u00a0/g, "")
    .replace(/\s/g, "")
    .replace("\u2212", "-")
    .replace(",", ".");
  const n = Number.parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function formatSignedUsdt(n: number, locale: string, zeroLabel: string): string {
  if (n === 0) return zeroLabel;
  const abs = Math.abs(n);
  const fmt = new Intl.NumberFormat(locale === "ru" ? "ru-RU" : locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(abs);
  return `${n > 0 ? "+" : "\u2212"}${fmt} USDT`;
}

export function ActivityTypeBreakdownCard({
  rows,
  loading,
}: {
  rows: ActivityRecord[];
  loading?: boolean;
}) {
  const { t, locale } = useI18n();

  const buckets = KIND_ORDER.map((kind) => {
    const items = rows.filter((r) => r.kind === kind);
    const net = items.reduce((sum, r) => sum + parseSignedAmount(r.amount), 0);
    return { kind, count: items.length, net };
  }).filter((b) => b.count > 0);

  const maxAbs = Math.max(1, ...buckets.map((b) => Math.abs(b.net)));

  return (
    <section className={cn(assetsCardClass, "flex h-full flex-col")} aria-label={t("activity.widgets.byTypeAria")}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-1.5">
            <h3 className="text-base font-semibold tracking-tight text-neutral-900 sm:text-lg">
              {t("activity.widgets.byTypeTitle")}
            </h3>
            <MetricsInfoTip label={t("activity.widgets.infoLabel")}>
              {t("activity.widgets.byTypeHint")}
            </MetricsInfoTip>
          </div>

        </div>
      </div>

      {loading ? (
        <div className="mt-5 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-xl bg-white/70" />
          ))}
        </div>
      ) : buckets.length === 0 ? (
        <div className="mt-8 flex flex-1 flex-col items-center justify-center py-6 text-center">
          <p className="text-sm font-medium text-neutral-800">{t("activity.widgets.byTypeEmptyTitle")}</p>
          <p className="mt-1 text-xs text-neutral-500">{t("activity.widgets.byTypeEmptyBody")}</p>
        </div>
      ) : (
        <ul className="mt-5 space-y-3">
          {buckets.map((bucket) => {
            const width = `${Math.max(8, (Math.abs(bucket.net) / maxAbs) * 100)}%`;
            return (
              <li key={bucket.kind} className="rounded-xl bg-white/70 px-3.5 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className={cn("size-2.5 shrink-0 rounded-full", KIND_DOT[bucket.kind])} aria-hidden />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-neutral-900">
                        {t(KIND_LABEL_KEYS[bucket.kind])}
                      </p>
                      <p className="text-[11px] text-neutral-500">
                        {t("activity.widgets.byTypeCount").replace("{n}", String(bucket.count))}
                      </p>
                    </div>
                  </div>
                  <p
                    className={cn(
                      "shrink-0 text-sm font-semibold tabular-nums",
                      bucket.net === 0 ? "font-sans text-neutral-400" : "font-mono",
                      bucket.net > 0 ? "text-blue-600" : bucket.net < 0 ? "text-red-600" : "text-neutral-400",
                    )}
                  >
                    {formatSignedUsdt(bucket.net, locale, t("activity.widgets.byTypeNetZero"))}
                  </p>
                </div>
                <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className={cn(
                      "h-full rounded-full transition-[width]",
                      bucket.net >= 0 ? "bg-blue-500" : "bg-red-500",
                    )}
                    style={{ width }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
