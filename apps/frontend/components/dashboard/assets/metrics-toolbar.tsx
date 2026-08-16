"use client";

import { useMemo, useState } from "react";

import { assetsMutedCardClass, assetsSegmentActiveClass, assetsSegmentIdleClass } from "@/components/dashboard/assets/assets-ui";
import { useI18n } from "@/components/providers/i18n-provider";
import { cn } from "@/lib/utils";

const FILTER_IDS = ["all", "active", "openRound", "secondary"] as const;
const MODE_IDS = ["overview", "composition", "slice"] as const;
const CURRENCIES = ["USD", "USDT"] as const;

export function MetricsToolbar() {
  const { t } = useI18n();
  const [activeFilter, setActiveFilter] = useState<(typeof FILTER_IDS)[number]>("all");
  const [modeIndex, setModeIndex] = useState(0);
  const [currencyIndex, setCurrencyIndex] = useState(1);
  const [fromDate, setFromDate] = useState("20.03.2026");
  const [toDate, setToDate] = useState("18.04.2026");

  const filterLabels: Record<(typeof FILTER_IDS)[number], string> = {
    all: t("assets.metrics.toolbarFilterAll"),
    active: t("positions.widgets.status.active"),
    openRound: t("positions.widgets.status.openRound"),
    secondary: t("positions.widgets.status.secondary"),
  };

  const modeLabels: Record<(typeof MODE_IDS)[number], string> = {
    overview: t("assets.metrics.toolbarModeOverview"),
    composition: t("assets.metrics.toolbarModeComposition"),
    slice: t("assets.metrics.toolbarModeSlice"),
  };

  const mode = useMemo(() => MODE_IDS[modeIndex % MODE_IDS.length], [modeIndex]);
  const currency = useMemo(() => CURRENCIES[currencyIndex % CURRENCIES.length], [currencyIndex]);

  return (
    <section className={cn(assetsMutedCardClass, "sm:px-6 sm:py-4")}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap rounded-xl bg-neutral-100/80 p-1">
          {FILTER_IDS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => setActiveFilter(chip)}
              className={cn(
                "rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors",
                activeFilter === chip ? assetsSegmentActiveClass : assetsSegmentIdleClass,
              )}
            >
              {filterLabels[chip]}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => setModeIndex((i) => i + 1)}
            className="inline-flex h-10 items-center rounded-xl bg-white/80 px-3.5 font-semibold text-neutral-800 transition hover:bg-white"
          >
            {modeLabels[mode]}
          </button>
          <button
            type="button"
            onClick={() => setFromDate((prev) => (prev === "20.03.2026" ? "01.03.2026" : "20.03.2026"))}
            className="inline-flex h-10 items-center rounded-xl bg-white/80 px-3.5 font-semibold text-neutral-800 transition hover:bg-white"
          >
            {fromDate}
          </button>
          <span className="text-neutral-400">→</span>
          <button
            type="button"
            onClick={() => setToDate((prev) => (prev === "18.04.2026" ? "30.04.2026" : "18.04.2026"))}
            className="inline-flex h-10 items-center rounded-xl bg-white/80 px-3.5 font-semibold text-neutral-800 transition hover:bg-white"
          >
            {toDate}
          </button>
          <button
            type="button"
            onClick={() => setCurrencyIndex((i) => i + 1)}
            className="inline-flex h-10 items-center rounded-xl bg-white/80 px-3.5 font-semibold text-neutral-800 transition hover:bg-white"
          >
            {currency}
          </button>
        </div>
      </div>
    </section>
  );
}
