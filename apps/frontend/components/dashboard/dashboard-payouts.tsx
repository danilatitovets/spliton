import Link from "next/link";

import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

type Payout = {
  id: string;
  title: string;
  artist: string;
  time: string;
  amount: string;
};

const payouts: Payout[] = [
  {
    id: "1",
    title: "Midnight Drive",
    artist: "Luna Pulse",
    time: "Сегодня, 12:30",
    amount: "+ 12,46",
  },
  {
    id: "2",
    title: "Glass Echo",
    artist: "North Tide",
    time: "Вчера, 18:40",
    amount: "+ 8,02",
  },
  {
    id: "3",
    title: "Low Horizon",
    artist: "Studio 84",
    time: "18 мая, 14:22",
    amount: "+ 3,10",
  },
  {
    id: "4",
    title: "Midnight Drive",
    artist: "Luna Pulse",
    time: "10 апр., 11:22",
    amount: "+ 12,46",
  },
  {
    id: "5",
    title: "Glass Echo",
    artist: "North Tide",
    time: "8 апр., 20:01",
    amount: "+ 5,55",
  },
];

export function DashboardPayouts({ className }: { className?: string }) {
  return (
    <aside
      id="payouts"
      className={cn(
        "rounded-2xl bg-[#111111] p-5 ring-1 ring-white/6 lg:sticky lg:top-18 lg:self-start lg:p-6",
        className,
      )}
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold tracking-tight text-white md:text-lg">Прозрачная история начислений</h2>
      </div>

      <ul>
        {payouts.map((p, i) => (
          <li
            key={p.id + p.time}
            className={cn("flex gap-3 py-3 first:pt-0 last:pb-0", i > 0 && "border-t border-white/6")}
          >
            <div
              className="size-11 shrink-0 rounded-lg bg-[#0a0a0a] ring-1 ring-white/8"
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-zinc-100">{p.title}</p>
              <p className="truncate text-xs text-zinc-500">{p.artist}</p>
              <p className="mt-1 text-[11px] text-zinc-600">{p.time}</p>
            </div>
            <p className="shrink-0 text-right text-[13px] font-semibold tabular-nums text-[#d4f570]">
              {p.amount}
              <span className="block text-[10px] font-medium text-zinc-600">USDT</span>
            </p>
          </li>
        ))}
      </ul>

      <Link
        href={ROUTES.dashboardPayoutsHistory}
        className="mt-4 block text-center text-[12px] font-semibold uppercase tracking-wide text-[#d4f570] transition hover:text-[#e8ff9a]"
      >
        Смотреть историю
      </Link>
    </aside>
  );
}
