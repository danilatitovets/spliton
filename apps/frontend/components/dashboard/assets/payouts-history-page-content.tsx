"use client";

import { useMemo, useState } from "react";

import { AssetsEmptyIllustration } from "@/components/dashboard/assets/assets-empty-illustration";
import { AssetsBuyReleaseCta } from "@/components/dashboard/assets/positions-buy-release-cta";
import { AssetsSearchField } from "@/components/dashboard/assets/assets-search-field";
import {
  assetsCardClass,
  assetsMutedCardClass,
  assetsOutlineButtonClass,
} from "@/components/dashboard/assets/assets-ui";
import { MetricsGptToggle } from "@/components/dashboard/assets/metrics-gpt-toggle";
import { PayoutHistoryTable } from "@/components/dashboard/assets/payout-history-table";
import type { PayoutHistoryRow } from "@/components/dashboard/assets/payouts-mock-data";
import { payoutHistory } from "@/components/dashboard/assets/payouts-mock-data";
import { useI18n } from "@/components/providers/i18n-provider";
import { ReadOnlySectionError } from "@/components/shared/data-states/read-only-section-error";
import { SplitonCtaPill } from "@/components/ui/spliton-cta-pill";
import { ROUTES } from "@/constants/routes";
import { usePayoutsHistoryPage } from "@/hooks/use-payouts-history-page";
import { cn } from "@/lib/utils";

export function PayoutsHistoryPageContent() {
  const { t } = useI18n();
  const {
    live,
    demoPreview,
    rows: payoutHistoryRows,
    loading,
    error,
    reload,
  } = usePayoutsHistoryPage({ pageSize: 100 });

  const useDemo = !live || demoPreview;
  const sourceRows = live ? (payoutHistoryRows ?? []) : payoutHistory;

  const typeFilters: Array<{ id: "all" | PayoutHistoryRow["type"]; label: string }> = [
    { id: "all", label: t("activity.tab.all") },
    { id: "accrual", label: t("payouts.history.type.accrual") },
    { id: "payout", label: t("payouts.history.type.payout") },
    { id: "withdrawal", label: t("payouts.history.type.withdrawal") },
    { id: "adjustment", label: t("payouts.history.type.adjustment") },
  ];

  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<(typeof typeFilters)[number]["id"]>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sourceRows.filter((row) => {
      if (typeFilter !== "all" && row.type !== typeFilter) return false;
      if (!q) return true;
      return (
        row.release.toLowerCase().includes(q) ||
        row.date.includes(q) ||
        row.type.toLowerCase().includes(q)
      );
    });
  }, [query, typeFilter, sourceRows]);

  if (live && loading && !payoutHistoryRows) {
    return (
      <div className="space-y-3">
        <div className="h-12 animate-pulse rounded-2xl bg-neutral-100" />
        <div className="h-72 animate-pulse rounded-2xl bg-neutral-100" />
      </div>
    );
  }

  if (live && error && !payoutHistoryRows) {
    return (
      <ReadOnlySectionError
        sectionId="payouts-history"
        error={error}
        onRetry={() => void reload()}
      />
    );
  }

  const isEmpty = sourceRows.length === 0;

  return (
    <div className="space-y-4 pb-2 sm:space-y-5">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-[1.75rem]">
          {t("meta.payouts.history.title")}
        </h1>
      </header>

      {useDemo ? (
        <p className="rounded-xl bg-amber-50 px-3.5 py-2.5 text-sm text-amber-900" role="status">
          {t("assets.overview.demoBanner")}
        </p>
      ) : null}

      {isEmpty ? (
        <section className={cn(assetsCardClass, "py-12 text-center sm:py-14")}>
          <AssetsEmptyIllustration situation="activityEmpty" size="lg" />
          <p className="mt-5 text-base font-semibold text-neutral-900">{t("history.table.emptyTitle")}</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500">{t("history.table.emptyBody")}</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <SplitonCtaPill href={`${ROUTES.dashboardPayouts}/deposit`} tone="onLight" variant="accent">
              {t("payouts.nav.deposit")}
            </SplitonCtaPill>
            <SplitonCtaPill href={ROUTES.dashboardCatalog} tone="onLight" variant="ghost" withArrow={false}>
              {t("activity.openCatalog")}
            </SplitonCtaPill>
          </div>
        </section>
      ) : (
        <>
          <section className={cn(assetsMutedCardClass, "space-y-3 sm:px-5 sm:py-4")}>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <MetricsGptToggle
                value={typeFilter}
                onChange={setTypeFilter}
                options={typeFilters}
                ariaLabel={t("payouts.history.typeFilterAria")}
                size="sm"
              />
              <AssetsSearchField
                value={query}
                onSubmit={setQuery}
                placeholder={t("payouts.history.searchPlaceholder")}
                aria-label={t("payouts.history.searchAria")}
                size="md"
                className="w-full max-w-md lg:ml-auto"
                inputClassName="bg-white focus:bg-white"
              />
            </div>
          </section>

          {filtered.length === 0 ? (
            <section className={cn(assetsCardClass, "py-10 text-center")}>
              <p className="text-sm font-medium text-neutral-800">{t("payouts.history.filteredEmptyTitle")}</p>
              <p className="mt-1 text-xs text-neutral-500">{t("payouts.history.filteredEmptyBody")}</p>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setTypeFilter("all");
                }}
                className={cn(assetsOutlineButtonClass, "mt-4")}
              >
                {t("positions.resetFilters")}
              </button>
            </section>
          ) : (
            <PayoutHistoryTable rows={filtered} showCaption={false} />
          )}
        </>
      )}

      <div className="pt-2 sm:pt-3">
        <AssetsBuyReleaseCta ns="history" />
      </div>
    </div>
  );
}
