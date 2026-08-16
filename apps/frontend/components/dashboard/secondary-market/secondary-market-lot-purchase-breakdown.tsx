import * as React from "react";

import { cn } from "@/lib/utils";

export function BreakdownRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5">
      <dt className="text-[12px] leading-none text-zinc-500">{label}</dt>
      <dd
        className={cn(
          "font-mono text-[13px] tabular-nums leading-none tracking-tight text-right",
          highlight ? "font-semibold text-white" : "font-medium text-zinc-100",
        )}
      >
        {value}
      </dd>
    </div>
  );
}
