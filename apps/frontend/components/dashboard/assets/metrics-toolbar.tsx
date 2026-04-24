"use client";

import { useMemo, useState } from "react";

import { cn } from "@/lib/utils";

const FILTERS = ["Все позиции", "Active", "Open round", "Secondary"] as const;
const MODES = ["Обзор", "Состав", "Срез"] as const;
const CURRENCIES = ["USD", "USDT"] as const;

export function MetricsToolbar() {
  const [activeFilter, setActiveFilter] = useState<(typeof FILTERS)[number]>("Все позиции");
  const [modeIndex, setModeIndex] = useState(0);
  const [currencyIndex, setCurrencyIndex] = useState(1);
  const [fromDate, setFromDate] = useState("20.03.2026");
  const [toDate, setToDate] = useState("18.04.2026");

  const mode = useMemo(() => MODES[modeIndex % MODES.length], [modeIndex]);
  const currency = useMemo(() => CURRENCIES[currencyIndex % CURRENCIES.length], [currencyIndex]);

  return (
    <section className="rounded-3xl border border-neutral-200 bg-white px-4 py-4 shadow-sm ring-1 ring-neutral-100/80 sm:px-6 sm:py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap rounded-xl bg-neutral-100 p-1">
          {FILTERS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => setActiveFilter(chip)}
              className={cn(
                "rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors",
                activeFilter === chip ? "bg-white text-neutral-900 ring-1 ring-neutral-200/80" : "font-medium text-neutral-500 hover:text-neutral-800",
              )}
            >
              {chip}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => setModeIndex((i) => i + 1)}
            className="inline-flex h-10 items-center rounded-xl border border-neutral-200 bg-neutral-50/90 px-3.5 font-semibold text-neutral-800 transition hover:bg-neutral-100"
          >
            {mode}
          </button>
          <button
            type="button"
            onClick={() => setFromDate((prev) => (prev === "20.03.2026" ? "01.03.2026" : "20.03.2026"))}
            className="inline-flex h-10 items-center rounded-xl border border-neutral-200 bg-neutral-50/90 px-3.5 font-semibold text-neutral-800 transition hover:bg-neutral-100"
          >
            {fromDate}
          </button>
          <span className="text-neutral-400">→</span>
          <button
            type="button"
            onClick={() => setToDate((prev) => (prev === "18.04.2026" ? "30.04.2026" : "18.04.2026"))}
            className="inline-flex h-10 items-center rounded-xl border border-neutral-200 bg-neutral-50/90 px-3.5 font-semibold text-neutral-800 transition hover:bg-neutral-100"
          >
            {toDate}
          </button>
          <button
            type="button"
            onClick={() => setCurrencyIndex((i) => i + 1)}
            className="inline-flex h-10 items-center rounded-xl border border-neutral-200 bg-neutral-50/90 px-3.5 font-semibold text-neutral-800 transition hover:bg-neutral-100"
          >
            {currency}
          </button>
        </div>
      </div>
    </section>
  );
}
