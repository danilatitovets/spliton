import type { ReleaseAnalyticsRow } from "@/types/analytics/releases";

export function ReleasePayoutRangeBar({ lo, hi, t }: ReleaseAnalyticsRow["payoutBand"]) {
  return (
    <div className="w-[128px] shrink-0">
      <div className="relative h-1 rounded-full bg-zinc-800">
        <span
          className="absolute -top-1 size-0 border-x-[4px] border-b-[5px] border-x-transparent border-b-white"
          style={{ left: `calc(${Math.min(100, Math.max(0, t * 100))}% - 4px)` }}
          aria-hidden
        />
      </div>
      <div className="mt-1 flex justify-between gap-1 text-[10px] tabular-nums text-zinc-600">
        <span>{lo}</span>
        <span>{hi}</span>
      </div>
    </div>
  );
}
