"use client";

import { ChevronLeft, ChevronRight } from "@/lib/lucide";
import { useMemo, useState } from "react";

import { MetricsDetailChart, type MetricsPoint } from "@/components/dashboard/assets/metrics-charts";
import { MetricsGptToggle } from "@/components/dashboard/assets/metrics-gpt-toggle";
import { MetricsInfoTip } from "@/components/dashboard/assets/metrics-info-tip";
import { assetsMutedCardClass, assetsPanelClass } from "@/components/dashboard/assets/assets-ui";
import { useI18n } from "@/components/providers/i18n-provider";
import { formatUsdtAmount, intlLocaleFor } from "@/lib/i18n/formatters";
import { tf } from "@/lib/i18n/widget-messages";
import { cn } from "@/lib/utils";

type ViewMode = "calendar" | "chart";

type DayCell = {
  day: number;
  pnl: number;
  inMonth: boolean;
};

function hash01(seed: number, i: number) {
  const x = Math.sin(seed * 127.1 + i * 311.7) * 10000;
  return x - Math.floor(x);
}

/** Deterministic demo daily PnL for a calendar day (USDT). */
function dayPnl(year: number, monthIndex: number, day: number): number {
  const seed = year * 12 + monthIndex;
  const raw = (hash01(seed, day) - 0.48) * 86 + Math.sin(day / 2.4 + seed) * 28;
  if (Math.abs(raw) < 4) return 0;
  return Math.round(raw * 100) / 100;
}

function daysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

/** Monday-first offset 0..6 for the 1st of the month. */
function mondayOffset(year: number, monthIndex: number) {
  const js = new Date(year, monthIndex, 1).getDay(); // 0=Sun
  return (js + 6) % 7;
}

function buildMonthGrid(year: number, monthIndex: number): DayCell[] {
  const total = daysInMonth(year, monthIndex);
  const offset = mondayOffset(year, monthIndex);
  const cells: DayCell[] = [];
  for (let i = 0; i < offset; i++) {
    cells.push({ day: 0, pnl: 0, inMonth: false });
  }
  for (let day = 1; day <= total; day++) {
    cells.push({ day, pnl: dayPnl(year, monthIndex, day), inMonth: true });
  }
  while (cells.length % 7 !== 0) {
    cells.push({ day: 0, pnl: 0, inMonth: false });
  }
  return cells;
}

function formatDayLabel(year: number, monthIndex: number, day: number, localeTag: string) {
  return new Intl.DateTimeFormat(localeTag, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(year, monthIndex, day));
}

function formatMonthTitle(year: number, monthIndex: number, localeTag: string) {
  return new Intl.DateTimeFormat(localeTag, { month: "long", year: "numeric" }).format(
    new Date(year, monthIndex, 1),
  );
}

function shortPnl(value: number, localeTag: string) {
  if (value === 0) return "0";
  const abs = Math.abs(value);
  const body =
    abs >= 100
      ? new Intl.NumberFormat(localeTag, { maximumFractionDigits: 0 }).format(abs)
      : new Intl.NumberFormat(localeTag, { minimumFractionDigits: 0, maximumFractionDigits: 1 }).format(abs);
  return value > 0 ? `+${body}` : `−${body}`;
}

export function MetricsDailyBreakdownCard() {
  const { t, locale } = useI18n();
  const localeTag = intlLocaleFor(locale);
  const [mode, setMode] = useState<ViewMode>("calendar");
  const [cursor, setCursor] = useState(() => {
    const now = new Date(2026, 3, 1); // Apr 2026 — matches product demo date
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [selectedDay, setSelectedDay] = useState(10);

  const grid = useMemo(() => buildMonthGrid(cursor.year, cursor.month), [cursor.year, cursor.month]);

  const selected = useMemo(() => {
    const max = daysInMonth(cursor.year, cursor.month);
    const day = Math.min(Math.max(1, selectedDay), max);
    return { day, pnl: dayPnl(cursor.year, cursor.month, day) };
  }, [cursor.year, cursor.month, selectedDay]);

  const chartSeries: MetricsPoint[] = useMemo(() => {
    const total = daysInMonth(cursor.year, cursor.month);
    return Array.from({ length: total }, (_, i) => {
      const day = i + 1;
      return {
        label: day % 3 === 1 ? String(day) : "",
        primary: dayPnl(cursor.year, cursor.month, day),
      };
    });
  }, [cursor.year, cursor.month]);

  const monthLabel = formatMonthTitle(cursor.year, cursor.month, localeTag);
  const dateLabel = formatDayLabel(cursor.year, cursor.month, selected.day, localeTag);
  const headlineColor =
    selected.pnl > 0 ? "text-blue-600" : selected.pnl < 0 ? "text-red-600" : "text-neutral-900";

  const shiftMonth = (delta: number) => {
    setCursor((prev) => {
      const d = new Date(prev.year, prev.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  };

  const weekdays = [
    t("assets.metrics.dayMon"),
    t("assets.metrics.dayTue"),
    t("assets.metrics.dayWed"),
    t("assets.metrics.dayThu"),
    t("assets.metrics.dayFri"),
    t("assets.metrics.daySat"),
    t("assets.metrics.daySun"),
  ];

  return (
    <section className={assetsMutedCardClass} aria-label={t("assets.metrics.dailyBreakdownAria")}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-1.5">
            <h3 className="text-base font-semibold tracking-tight text-neutral-900 sm:text-xl">
              {t("assets.metrics.dailyBreakdownTitle")}
            </h3>
            <MetricsInfoTip label={t("assets.metrics.infoLabel")}>
              {t("assets.metrics.dailyBreakdownInfo")}
            </MetricsInfoTip>
          </div>
          <p className="text-sm text-neutral-500">
            {tf(t("assets.metrics.dailyBreakdownSubtitle"), { date: dateLabel })}
          </p>
          <p
            className={cn(
              "font-mono text-2xl font-semibold tabular-nums tracking-tight sm:text-[2.25rem]",
              headlineColor,
            )}
          >
            {selected.pnl > 0 ? "+" : ""}
            {formatUsdtAmount(selected.pnl, locale)}
          </p>
        </div>
        <MetricsGptToggle
          value={mode}
          onChange={setMode}
          ariaLabel={t("assets.metrics.dailyBreakdownAria")}
          size="sm"
          className="self-start"
          options={[
            { id: "calendar", label: t("assets.metrics.dailyCalendarShort") },
            { id: "chart", label: t("assets.metrics.dailyChartShort") },
          ]}
        />
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 sm:mt-4 sm:justify-end">
        <button
          type="button"
          aria-label={t("assets.metrics.dailyPrevMonth")}
          onClick={() => shiftMonth(-1)}
          className="inline-flex size-8 items-center justify-center rounded-full bg-[#212121] text-white/70 transition hover:bg-[#2f2f2f] hover:text-white"
        >
          <ChevronLeft className="size-4" strokeWidth={2.2} aria-hidden />
        </button>
        <span className="min-w-0 flex-1 truncate text-center text-xs font-semibold capitalize text-neutral-700 sm:min-w-[8.5rem] sm:flex-none">
          {monthLabel}
        </span>
        <button
          type="button"
          aria-label={t("assets.metrics.dailyNextMonth")}
          onClick={() => shiftMonth(1)}
          className="inline-flex size-8 items-center justify-center rounded-full bg-[#212121] text-white/70 transition hover:bg-[#2f2f2f] hover:text-white"
        >
          <ChevronRight className="size-4" strokeWidth={2.2} aria-hidden />
        </button>
      </div>

      {mode === "calendar" ? (
        <div className={cn(assetsPanelClass, "mt-3 grid grid-cols-7 gap-1 p-2 sm:gap-1.5 sm:p-4")}>
          {weekdays.map((d) => (
            <div key={d} className="py-0.5 text-center text-[10px] font-medium text-neutral-500 sm:py-1 sm:text-[11px]">
              {d}
            </div>
          ))}
          {grid.map((cell, idx) => {
            if (!cell.inMonth) {
              return <div key={`pad-${idx}`} className="min-h-[2.6rem] sm:min-h-[3.25rem]" aria-hidden />;
            }
            const selectedCell = cell.day === selected.day;
            const positive = cell.pnl > 0;
            const negative = cell.pnl < 0;
            return (
              <button
                key={cell.day}
                type="button"
                onClick={() => setSelectedDay(cell.day)}
                aria-pressed={selectedCell}
                className={cn(
                  "min-h-[2.6rem] rounded-lg px-0.5 py-1 text-center transition sm:min-h-[3.25rem] sm:rounded-xl sm:px-1 sm:py-1.5",
                  selectedCell && "ring-2 ring-neutral-900 ring-offset-1 ring-offset-neutral-50",
                  positive && "bg-blue-50 active:bg-blue-100/80",
                  negative && "bg-red-50 active:bg-red-100/80",
                  !positive && !negative && "bg-white active:bg-neutral-100",
                )}
              >
                <div className="text-[11px] font-semibold text-neutral-800 sm:text-[12px]">{cell.day}</div>
                <div
                  className={cn(
                    "mt-0.5 text-[8px] font-medium tabular-nums leading-tight sm:text-[10px]",
                    positive && "text-blue-600",
                    negative && "text-red-600",
                    !positive && !negative && "text-neutral-400",
                  )}
                >
                  {shortPnl(cell.pnl, localeTag)}
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="mt-3">
          <MetricsDetailChart
            series={chartSeries}
            showSecondary={false}
            valueIsPercent={false}
            tone="light"
            variant="bars"
            tooltipPrimaryLabel={t("metrics.pnlAbs")}
          />
        </div>
      )}
    </section>
  );
}
