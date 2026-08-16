"use client";

import * as React from "react";
import { RotateCcw } from "@/lib/lucide";

import { useI18n } from "@/components/providers/i18n-provider";
import { SecondaryMarketResponsiveSheet } from "@/components/dashboard/secondary-market/secondary-market-responsive-sheet";
import { SplitonCtaPill } from "@/components/ui/spliton-cta-pill";
import { smExchange } from "@/components/dashboard/secondary-market/secondary-market-exchange-styles";
import { tf } from "@/lib/i18n/financial-messages";
import { cn } from "@/lib/utils";

export type MyOrdersStatusFilter =
  | "all"
  | "active"
  | "partial"
  | "filled"
  | "cancelled"
  | "expired"
  | "failed";

export type MyOrdersSideFilter = "all" | "buy" | "sell";
export type MyOrdersModeFilter = "all" | "limit" | "market";

export type MyOrdersFiltersState = {
  status: MyOrdersStatusFilter;
  side: MyOrdersSideFilter;
  mode: MyOrdersModeFilter;
  query: string;
};

export const DEFAULT_MY_ORDERS_FILTERS: MyOrdersFiltersState = {
  status: "all",
  side: "all",
  mode: "all",
  query: "",
};

export const MY_ORDERS_STATUS_CHIPS: { id: MyOrdersStatusFilter; key: string }[] = [
  { id: "all", key: "secondaryMarket.filters.all" },
  { id: "active", key: "secondaryMarket.filters.statusActive" },
  { id: "partial", key: "secondaryMarket.filters.statusPartial" },
  { id: "filled", key: "secondaryMarket.filters.statusFilled" },
  { id: "cancelled", key: "secondaryMarket.filters.statusCancelled" },
  { id: "expired", key: "secondaryMarket.filters.statusExpired" },
  { id: "failed", key: "secondaryMarket.filters.statusFailed" },
];

function FilterChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(smExchange.chipBase, active ? smExchange.chipActive : smExchange.chipIdle)}
    >
      {label}
    </button>
  );
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: MyOrdersFiltersState;
  onChange: (patch: Partial<MyOrdersFiltersState>) => void;
  onReset: () => void;
  resultCount: number;
  totalCount: number;
};

export function countActiveMyOrdersFilters(filters: MyOrdersFiltersState): number {
  let n = 0;
  if (filters.status !== DEFAULT_MY_ORDERS_FILTERS.status) n += 1;
  if (filters.side !== DEFAULT_MY_ORDERS_FILTERS.side) n += 1;
  if (filters.mode !== DEFAULT_MY_ORDERS_FILTERS.mode) n += 1;
  if (filters.query.trim()) n += 1;
  return n;
}

export function SecondaryMarketMyOrdersFiltersSheet({
  open,
  onOpenChange,
  filters,
  onChange,
  onReset,
  resultCount,
  totalCount,
}: Props) {
  const { t } = useI18n();

  const sideOptions = React.useMemo(
    (): { id: MyOrdersSideFilter; label: string }[] => [
      { id: "all", label: t("secondaryMarket.filters.all") },
      { id: "buy", label: t("secondaryMarket.side.buy") },
      { id: "sell", label: t("secondaryMarket.side.sell") },
    ],
    [t],
  );

  const modeOptions = React.useMemo(
    (): { id: MyOrdersModeFilter; label: string }[] => [
      { id: "all", label: t("secondaryMarket.filters.all") },
      { id: "limit", label: t("secondaryMarket.forms.limit") },
      { id: "market", label: t("secondaryMarket.forms.market") },
    ],
    [t],
  );

  return (
    <SecondaryMarketResponsiveSheet
      open={open}
      onOpenChange={onOpenChange}
      side="right"
      headerVideo
      title={t("secondaryMarket.orders.filtersTitle")}
      description={tf(t("secondaryMarket.orders.shownOfOrders"), {
        shown: String(resultCount),
        total: String(totalCount),
      })}
      footer={
        <div className="flex w-full items-center gap-2">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-white/[0.06] px-4 text-[13px] font-medium text-zinc-300 transition hover:bg-white/[0.1] hover:text-white"
          >
            <RotateCcw className="size-3.5 opacity-70" aria-hidden />
            {t("secondaryMarket.filters.resetFilters")}
          </button>
          <SplitonCtaPill
            type="button"
            tone="onDark"
            onClick={() => onOpenChange(false)}
            className="h-11 min-w-0 flex-[1.2] justify-between gap-2 pl-4 pr-1.5 text-[13px] font-semibold"
          >
            {tf(t("secondaryMarket.orders.showOrdersCount"), { count: String(resultCount) })}
          </SplitonCtaPill>
        </div>
      }
    >
      <div className="space-y-6 pb-2">
        <section>
          <p className="mb-2.5 text-[13px] font-medium text-zinc-300">{t("secondaryMarket.orders.columnStatus")}</p>
          <div className="flex flex-wrap gap-1.5">
            {MY_ORDERS_STATUS_CHIPS.map((opt) => (
              <FilterChip
                key={opt.id}
                active={filters.status === opt.id}
                label={t(opt.key)}
                onClick={() => onChange({ status: opt.id })}
              />
            ))}
          </div>
        </section>

        <section>
          <p className="mb-2.5 text-[13px] font-medium text-zinc-300">{t("secondaryMarket.filters.side")}</p>
          <div className="flex flex-wrap gap-1.5">
            {sideOptions.map((opt) => (
              <FilterChip
                key={opt.id}
                active={filters.side === opt.id}
                label={opt.label}
                onClick={() => onChange({ side: opt.id })}
              />
            ))}
          </div>
        </section>

        <section>
          <p className="mb-2.5 text-[13px] font-medium text-zinc-300">{t("secondaryMarket.filters.type")}</p>
          <div className="flex flex-wrap gap-1.5">
            {modeOptions.map((opt) => (
              <FilterChip
                key={opt.id}
                active={filters.mode === opt.id}
                label={opt.label}
                onClick={() => onChange({ mode: opt.id })}
              />
            ))}
          </div>
        </section>
      </div>
    </SecondaryMarketResponsiveSheet>
  );
}
