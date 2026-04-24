"use client";

import { CalendarDays, ChevronDown, Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export type ActivityFilterTab = "all" | "deposits" | "buys" | "sells" | "transfers" | "withdrawals";

const tabs: { id: ActivityFilterTab; label: string }[] = [
  { id: "all", label: "Все" },
  { id: "deposits", label: "Пополнения" },
  { id: "buys", label: "Покупки units" },
  { id: "sells", label: "Продажи units" },
  { id: "transfers", label: "Переводы" },
  { id: "withdrawals", label: "Выводы" },
];

const periodOptions = ["Последние 7 дней", "Последние 30 дней", "Последние 90 дней", "Этот год"];
const releaseOptions = ["Все релизы", "Offset", "Midnight Drive", "Glass Echo", "Low Horizon"];
const statusOptions = ["Все статусы", "Completed", "Pending", "Processing", "Cancelled"];

function FancyDropdown({
  value,
  options,
  onSelect,
  icon,
  className,
}: {
  value: string;
  options: string[];
  onSelect: (value: string) => void;
  icon?: ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const items = useMemo(() => options, [options]);

  return (
    <div
      ref={rootRef}
      className={cn("relative", className)}
      onBlur={(e) => {
        if (!rootRef.current?.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex h-10 items-center gap-1.5 whitespace-nowrap rounded-xl border border-neutral-200 bg-neutral-50/90 px-3.5 text-xs font-semibold text-neutral-800 ring-1 ring-neutral-100 transition",
          open ? "border-neutral-300 bg-white" : "hover:bg-neutral-100",
        )}
      >
        {icon}
        {value}
        <ChevronDown className={cn("size-3.5 text-neutral-400 transition-transform", open && "rotate-180")} />
      </button>

      {open ? (
        <div className="absolute left-0 top-[calc(100%+6px)] z-50 min-w-full overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-[0_12px_30px_-18px_rgba(15,23,42,0.35)]">
          <ul className="max-h-64 overflow-auto py-1">
            {items.map((item) => (
              <li key={item}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(item);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center px-3 py-2 text-left text-xs transition",
                    item === value
                      ? "bg-neutral-100 font-semibold text-neutral-900"
                      : "text-neutral-700 hover:bg-neutral-50"
                  )}
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export function ActivityFiltersBar({
  activeTab,
  onTabChange,
  period,
  onPeriodChange,
  release,
  onReleaseChange,
  status,
  onStatusChange,
  query,
  onQueryChange,
}: {
  activeTab: ActivityFilterTab;
  onTabChange: (tab: ActivityFilterTab) => void;
  period: string;
  onPeriodChange: (value: string) => void;
  release: string;
  onReleaseChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  query: string;
  onQueryChange: (value: string) => void;
}) {
  return (
    <section className="rounded-3xl border border-neutral-200 bg-white px-4 py-4 shadow-sm ring-1 ring-neutral-100/80 sm:px-6 sm:py-4">
      <div className="overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex min-w-max flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-2.5">
          <div className="inline-flex shrink-0 rounded-xl bg-neutral-100 p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "whitespace-nowrap rounded-lg px-3 py-2 text-[11px] font-semibold transition-colors",
                  activeTab === tab.id
                    ? "bg-white text-neutral-900 ring-1 ring-neutral-200/80"
                    : "font-medium text-neutral-500 hover:text-neutral-800",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <FancyDropdown
              value={period}
              options={periodOptions}
              onSelect={onPeriodChange}
              icon={<CalendarDays className="size-3.5 text-neutral-500" />}
            />
            <FancyDropdown
              value={release}
              options={releaseOptions}
              onSelect={onReleaseChange}
              icon={<SlidersHorizontal className="size-3.5 text-neutral-500" />}
            />
            <FancyDropdown value={status} options={statusOptions} onSelect={onStatusChange} />
            <label className="relative min-w-[200px] flex-1 sm:min-w-0 sm:flex-none">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-neutral-400" />
              <input
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                placeholder="Поиск: tx id / release / action"
                className="h-10 w-full min-w-0 rounded-xl border border-neutral-200 bg-neutral-50/90 pl-9 pr-3 text-xs text-neutral-800 outline-none ring-1 ring-neutral-100 transition placeholder:text-neutral-400 focus:border-neutral-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </label>
          </div>
        </div>
      </div>
    </section>
  );
}
