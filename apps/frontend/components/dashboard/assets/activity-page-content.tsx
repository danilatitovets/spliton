"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { ActivityFiltersBar, type ActivityFilterTab } from "@/components/dashboard/assets/activity-filters-bar";
import { activityRecords } from "@/components/dashboard/assets/activity-mock-data";
import { ActivitySummaryCards } from "@/components/dashboard/assets/activity-summary-cards";
import { ActivityTableCard } from "@/components/dashboard/assets/activity-table-card";
import { ActivityTimelineCard } from "@/components/dashboard/assets/activity-timeline-card";
import { ROUTES } from "@/constants/routes";

function matchTab(tab: ActivityFilterTab, kind: string) {
  if (tab === "all") return true;
  if (tab === "deposits") return kind === "deposit";
  if (tab === "buys") return kind === "purchase";
  if (tab === "sells") return kind === "sale";
  if (tab === "transfers") return kind === "transfer";
  if (tab === "withdrawals") return kind === "withdrawal";
  return true;
}

export function ActivityPageContent() {
  const [activeTab, setActiveTab] = useState<ActivityFilterTab>("all");
  const [period, setPeriod] = useState("Последние 30 дней");
  const [release, setRelease] = useState("Все релизы");
  const [status, setStatus] = useState("Все статусы");
  const [query, setQuery] = useState("");
  const [isLoading] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return activityRecords.filter((row) => {
      if (!matchTab(activeTab, row.kind)) return false;
      if (release !== "Все релизы" && row.release !== release) return false;
      if (status !== "Все статусы" && row.status !== status) return false;
      if (!q) return true;
      return (
        row.txId.toLowerCase().includes(q) ||
        row.release.toLowerCase().includes(q) ||
        row.type.toLowerCase().includes(q) ||
        row.details.toLowerCase().includes(q)
      );
    });
  }, [activeTab, query, release, status]);

  const tableState: "default" | "empty" | "loading" = isLoading ? "loading" : filtered.length === 0 ? "empty" : "default";

  const summary = {
    totalOps: String(filtered.length),
    deposits: String(filtered.filter((r) => r.kind === "deposit").length),
    secondaryTrades: String(filtered.filter((r) => r.kind === "secondary").length),
    latest: filtered[0]?.relative ?? "n/a",
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <ActivityFiltersBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        period={period}
        onPeriodChange={setPeriod}
        release={release}
        onReleaseChange={setRelease}
        status={status}
        onStatusChange={setStatus}
        query={query}
        onQueryChange={setQuery}
      />

      <ActivitySummaryCards
        totalOps={summary.totalOps}
        deposits={summary.deposits}
        secondaryTrades={summary.secondaryTrades}
        latest={summary.latest}
      />

      {tableState === "empty" ? (
        <section className="rounded-3xl bg-white px-5 py-10 text-center sm:px-8 sm:py-12">
          <p className="text-lg font-semibold tracking-tight text-neutral-900">Пока нет активности</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-neutral-500">
            История действий появится после первых пополнений, входа в релизы или операций на secondary market.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={ROUTES.dashboardCatalog}
              className="inline-flex h-10 items-center rounded-xl bg-blue-700 px-5 text-sm font-semibold text-white transition hover:bg-blue-800"
            >
              Открыть каталог
            </Link>
            <Link
              href={`${ROUTES.dashboard}#deposit`}
              className="inline-flex h-10 items-center rounded-xl border border-neutral-200 bg-neutral-50/90 px-5 text-sm font-semibold text-neutral-800 ring-1 ring-neutral-100 transition hover:bg-neutral-100"
            >
              Пополнить USDT
            </Link>
          </div>
        </section>
      ) : (
        <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)] lg:gap-8">
          <ActivityTableCard rows={filtered} state={tableState} />
          <ActivityTimelineCard rows={filtered} />
        </section>
      )}
    </div>
  );
}
