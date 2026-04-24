import Link from "next/link";
import { PieChart, TrendingUp, Wallet } from "lucide-react";

import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

type StatItem = {
  label: string;
  value: string;
  unit: string;
  icon: typeof Wallet;
  footer?: "none" | "delta" | "withdraw";
  deltaText?: string;
};

const stats: StatItem[] = [
  { label: "Средний чек сделки", value: "1 240,58", unit: "USDT", icon: Wallet, footer: "none" },
  {
    label: "Доход инвесторов за месяц",
    value: "156,42",
    unit: "USDT",
    icon: TrendingUp,
    footer: "delta",
    deltaText: "+12,4%",
  },
  { label: "Активные релизы", value: "7", unit: "треков", icon: PieChart, footer: "none" },
  {
    label: "Доступно к выплате",
    value: "73,19",
    unit: "USDT",
    icon: Wallet,
    footer: "withdraw",
  },
];

const logoCloud = [
  "cohere",
  "duolingo",
  "Hugging Face",
  "Mistral AI",
  "Microsoft",
  "NVIDIA",
  "Cribl",
  "instacart",
  "MERCURY",
  "mercari",
  "netlify",
  "gofundme",
  "Revolut",
] as const;

const tile = "rounded-2xl bg-white px-6 py-6 shadow-[0_10px_30px_-28px_rgba(0,0,0,0.45)] sm:px-7 sm:py-7";

export function DashboardStats({ className }: { className?: string }) {
  return (
    <section
      id="holdings"
      className={cn(
        "scroll-mt-24 relative left-1/2 right-1/2 -mx-[50vw] w-screen bg-[#f4f4f5] py-14 md:py-18",
        className,
      )}
    >
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-[760px] text-center md:mb-12">
          <p className="text-5xl font-medium tracking-tight text-zinc-500 sm:text-6xl">20,000 businesses</p>
          <h2 className="mt-2 text-5xl font-semibold tracking-tight text-zinc-900 sm:text-6xl">choose Tailscale</h2>
          <p className="mt-4 text-sm text-zinc-600">О платформе в цифрах</p>
        </div>

        <div className="mx-auto grid max-w-[1180px] gap-4 md:grid-cols-3 md:gap-5">
          {stats.slice(0, 3).map((s) => (
            <div key={s.label} className={cn(tile, "flex min-h-[230px] flex-col justify-between")}>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">{s.label}</p>
                <p className="mt-5 text-[52px] font-semibold leading-none tracking-tight text-zinc-900">
                  {s.value}
                  <span className="ml-1.5 text-xl font-medium text-zinc-600">{s.unit}</span>
                </p>
              </div>
              <div>
                {s.footer === "delta" && s.deltaText ? <p className="text-sm font-semibold text-emerald-600">{s.deltaText}</p> : null}
                <p className="mt-2 text-[30px] leading-tight text-zinc-700">
                  {s.label === "Средний чек сделки" ? "hours saved with fewer connectivity issues." : null}
                  {s.label === "Доход инвесторов за месяц" ? "headcount growth without dedicated IT resources." : null}
                  {s.label === "Активные релизы" ? "reduction in internal support requests." : null}
                </p>
                <p className="mt-6 text-sm font-medium text-zinc-900 underline decoration-zinc-500/60 underline-offset-4">Read case study</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-5 grid max-w-[1180px] grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6">
          {logoCloud.map((logo) => (
            <div
              key={logo}
              className={cn(
                "flex h-12 items-center justify-center rounded-xl bg-[#ececee] px-3 text-center text-[14px] font-semibold text-zinc-500",
                logo === "Revolut" && "md:col-span-2 md:col-start-3",
              )}
            >
              {logo}
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <Link
            href={ROUTES.dashboardPayoutsHistory}
            className="text-sm font-medium text-zinc-600 underline decoration-zinc-400/70 underline-offset-4 transition hover:text-zinc-900"
          >
            История и вывод
          </Link>
        </div>
      </div>
    </section>
  );
}
