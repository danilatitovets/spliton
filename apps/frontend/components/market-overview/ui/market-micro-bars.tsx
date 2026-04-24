import { cn } from "@/lib/utils";

import { densifySeries } from "./market-chart-densify";

const SIZE_CLASS = {
  sm: "h-10 gap-px",
  md: "h-16 gap-px",
  lg: "h-[min(22vh,200px)] gap-0.5",
} as const;

const DENSE_LEN = {
  sm: 28,
  md: 36,
  lg: 48,
} as const;

const BAR_MIN = {
  sm: "min-w-[2px]",
  md: "min-w-[2.5px]",
  lg: "min-w-[3px] rounded-[2px]",
} as const;

/** Вертикальные бары: плотная сетка + мягкое свечение (mock flow). */
export function MarketMicroBars({
  values,
  className,
  size = "sm",
}: {
  values: number[];
  className?: string;
  size?: keyof typeof SIZE_CLASS;
}) {
  const dense = densifySeries(values, DENSE_LEN[size]);
  const max = Math.max(...dense.map(Math.abs), 1);

  return (
    <div className={cn("relative w-full", className)}>
      <div
        className={cn(
          "flex w-full items-end transition-[height,gap] duration-300 ease-out",
          SIZE_CLASS[size],
        )}
        aria-hidden
      >
        {dense.map((v, i) => {
          const hPct = (Math.abs(v) / max) * 100;
          const pos = v >= 0;
          return (
            <div
              key={i}
              className={cn(
                "flex-1 rounded-[1px] transition-all duration-300 ease-out",
                BAR_MIN[size],
                pos
                  ? "bg-gradient-to-t from-[#B7F500]/25 via-[#B7F500]/65 to-[#e8ff9a]/50 shadow-[0_0_10px_rgba(183,245,0,0.22)]"
                  : "bg-gradient-to-t from-rose-900/30 via-rose-500/55 to-rose-300/35 shadow-[0_0_8px_rgba(251,113,133,0.18)]",
              )}
              style={{ height: `${Math.max(hPct, 6)}%` }}
            />
          );
        })}
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-white/10" aria-hidden />
    </div>
  );
}
