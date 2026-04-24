"use client";

import { BarChart3, CalendarDays, Info } from "lucide-react";
import { useMemo, useState } from "react";

import { MetricsDetailChart, type MetricsPoint } from "@/components/dashboard/assets/metrics-charts";
import { cn } from "@/lib/utils";

type ViewMode = "calendar" | "chart";

function hash01(seed: number, i: number) {
  const x = Math.sin(seed * 127.1 + i * 311.7) * 10000;
  return x - Math.floor(x);
}

function buildDailyPnLPoints(): MetricsPoint[] {
  const n = 18;
  const out: MetricsPoint[] = [];
  let v = 0;
  for (let i = 0; i < n; i++) {
    v += (hash01(31, i) - 0.46) * 0.014;
    const label = i % 3 === 0 ? `${i + 1}` : "";
    out.push({ label, primary: v });
  }
  return out;
}

export function MetricsDailyBreakdownCard() {
  const [mode, setMode] = useState<ViewMode>("calendar");
  const chartData = useMemo(() => buildDailyPnLPoints(), []);

  const days = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
  const cells = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <section className="space-y-5 rounded-3xl bg-white px-5 py-6 sm:space-y-6 sm:px-7 sm:py-8" aria-label="Суточная разбивка">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">Metrics · Daily</p>
            <span className="text-neutral-400" title="Мок: календарь и дневной PnL.">
              <Info className="size-3.5" strokeWidth={2} aria-hidden />
            </span>
          </div>
          <h3 className="text-lg font-semibold tracking-tight text-neutral-900 sm:text-xl">Суточная разбивка</h3>
          <p className="text-sm text-neutral-500">PnL на 10.04.2026</p>
          <p className="font-mono text-3xl font-semibold tabular-nums tracking-tight text-neutral-900 sm:text-[2.25rem]">0,00 USDT</p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 rounded-xl bg-neutral-100 p-1">
          <button
            type="button"
            onClick={() => setMode("calendar")}
            aria-label="Календарный режим"
            className={cn(
              "inline-flex size-8 items-center justify-center rounded-lg transition-colors",
              mode === "calendar" ? "bg-white text-neutral-900 ring-1 ring-neutral-200/80" : "text-neutral-500 hover:text-neutral-800",
            )}
          >
            <CalendarDays className="size-3.5" strokeWidth={1.8} />
          </button>
          <button
            type="button"
            onClick={() => setMode("chart")}
            aria-label="Режим графика"
            className={cn(
              "inline-flex size-8 items-center justify-center rounded-lg transition-colors",
              mode === "chart" ? "bg-white text-neutral-900 ring-1 ring-neutral-200/80" : "text-neutral-500 hover:text-neutral-800",
            )}
          >
            <BarChart3 className="size-3.5" strokeWidth={1.8} />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-end">
        <button
          type="button"
          className="inline-flex items-center rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-100"
        >
          ‹ 2026-04 ›
        </button>
      </div>

      {mode === "calendar" ? (
        <div className="grid grid-cols-7 gap-1.5 rounded-2xl bg-neutral-50/90 p-3 ring-1 ring-neutral-100 sm:p-4">
          {days.map((d) => (
            <div key={d} className="py-1 text-center text-[11px] font-medium text-neutral-500">
              {d}
            </div>
          ))}
          {cells.map((cell) => (
            <div
              key={cell}
              className={cn(
                "rounded-lg border py-2 text-center text-[12px] transition-colors",
                cell === 10
                  ? "border-blue-200 bg-white text-neutral-900 ring-1 ring-blue-100"
                  : cell < 6 || (cell >= 13 && cell <= 19)
                    ? "border-neutral-200/80 bg-white text-neutral-700"
                    : "border-transparent text-neutral-400",
              )}
            >
              <div className="font-semibold">{cell}</div>
              <div className="text-[10px] text-neutral-400">0</div>
            </div>
          ))}
        </div>
      ) : (
        <MetricsDetailChart series={chartData} showSecondary={false} valueIsPercent />
      )}
    </section>
  );
}
