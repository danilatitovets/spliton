"use client";

import { cn } from "@/lib/utils";

type Pan = {
  title: string;
  period: string;
  amountLabel: string;
  weight: number;
  accent?: boolean;
};

type PayoutsComparisonScaleVisualProps = {
  left: Pan;
  right: Pan;
  asset: string;
  parityLabel: string;
  className?: string;
};

/** Exchange-style balance scale: beam tilts toward the heavier accrual window. */
export function PayoutsComparisonScaleVisual({
  left,
  right,
  asset,
  parityLabel,
  className,
}: PayoutsComparisonScaleVisualProps) {
  const max = Math.max(left.weight, right.weight, 1);
  // Left heavier = clockwise (positive) so left pan drops.
  const tiltDeg = Math.max(-11, Math.min(11, ((left.weight - right.weight) / max) * 11));
  const leftFill = Math.round((left.weight / max) * 100);
  const rightFill = Math.round((right.weight / max) * 100);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[1.35rem] bg-black px-4 pb-6 pt-5 sm:rounded-[1.75rem] sm:px-8 sm:pb-8 sm:pt-6",
        "shadow-[inset_0_0_0_1px_rgba(255,255,255,0.14)]",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(90% 70% at 50% 0%, rgba(183,245,0,0.12) 0%, transparent 55%)",
        }}
        aria-hidden
      />

      <div className="relative z-10 flex items-start justify-between gap-3">
        <p className="text-[11px] font-medium tracking-wide text-white/45">{asset}</p>
        <p className="max-w-[28ch] text-right font-mono text-[11px] text-[#B7F500]">{parityLabel}</p>
      </div>

      <div className="relative z-10 mx-auto mt-4 w-full max-w-xl sm:mt-6">
        <div className="relative mx-auto h-[11.5rem] w-full sm:h-[13.5rem]">
          <div
            className="absolute left-1/2 top-[42%] z-0 h-[58%] w-1.5 -translate-x-1/2 rounded-full bg-[#2a2a2c]"
            aria-hidden
          />
          <div
            className="absolute left-1/2 top-[40%] z-20 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#B7F500]"
            aria-hidden
          />

          <div
            className="absolute inset-x-[4%] top-[28%] z-10 transition-transform duration-700 ease-out sm:inset-x-[6%]"
            style={{ transform: `rotate(${tiltDeg}deg)` }}
          >
            <div className="h-1.5 w-full rounded-full bg-white/40" />

            <div className="absolute left-[6%] top-1.5 flex w-[38%] flex-col items-center sm:left-[8%] sm:w-[34%]">
              <div className="h-8 w-px bg-white/35 sm:h-10" aria-hidden />
              <div
                className={cn(
                  "w-full rounded-2xl px-3 py-3 text-center",
                  left.accent ? "bg-[#B7F500] text-black" : "bg-[#1c1c1e] text-white",
                )}
              >
                <p className={cn("truncate text-[10px] font-medium", left.accent ? "text-black/60" : "text-white/45")}>
                  {left.title}
                </p>
                <p className="mt-1 font-mono text-base font-semibold tabular-nums tracking-tight sm:text-lg">
                  {left.amountLabel}
                </p>
                <p className={cn("mt-0.5 font-mono text-[10px]", left.accent ? "text-black/50" : "text-white/35")}>
                  {left.period}
                </p>
              </div>
            </div>

            <div className="absolute right-[6%] top-1.5 flex w-[38%] flex-col items-center sm:right-[8%] sm:w-[34%]">
              <div className="h-8 w-px bg-white/35 sm:h-10" aria-hidden />
              <div
                className={cn(
                  "w-full rounded-2xl px-3 py-3 text-center",
                  right.accent ? "bg-[#B7F500] text-black" : "bg-[#1c1c1e] text-white",
                )}
              >
                <p className={cn("truncate text-[10px] font-medium", right.accent ? "text-black/60" : "text-white/45")}>
                  {right.title}
                </p>
                <p className="mt-1 font-mono text-base font-semibold tabular-nums tracking-tight sm:text-lg">
                  {right.amountLabel}
                </p>
                <p className={cn("mt-0.5 font-mono text-[10px]", right.accent ? "text-black/50" : "text-white/35")}>
                  {right.period}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-2 grid grid-cols-2 gap-4 sm:gap-8">
          <div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className={cn("h-full rounded-full transition-all duration-700", left.accent ? "bg-[#B7F500]" : "bg-white/55")}
                style={{ width: `${leftFill}%` }}
              />
            </div>
          </div>
          <div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className={cn(
                  "ml-auto h-full rounded-full transition-all duration-700",
                  right.accent ? "bg-[#B7F500]" : "bg-white/55",
                )}
                style={{ width: `${rightFill}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
