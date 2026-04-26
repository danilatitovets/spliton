import Image from "next/image";
import Link from "next/link";

import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

export function DashboardHero({ className }: { className?: string }) {
  return (
    <section
      id="deposit"
      className={cn(
        "scroll-mt-24 relative z-1 w-full bg-black py-12 sm:py-14 lg:py-16",
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-[1400px] flex-col items-center px-4 text-center sm:px-6 lg:px-8">
        <div className="w-full max-w-[1120px]">
          <h1 className="mx-auto max-w-[920px] text-balance text-[2rem] font-semibold leading-[0.98] tracking-[-0.03em] text-white sm:text-[2.6rem] lg:text-[3.35rem]">
            Инвестируйте в музыкальные релизы и получайте доход в одном продукте
          </h1>

          <p className="mx-auto mt-5 max-w-[700px] text-pretty text-[14px] leading-relaxed text-zinc-400 sm:text-[15px]">
            RevShare объединяет каталог релизов, вторичный рынок, историю начислений и управление выплатами в USDT
            (TRC20) в едином интерфейсе.
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={ROUTES.dashboardCatalog}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-white px-5 text-[13px] font-semibold text-black transition hover:bg-zinc-200"
            >
              Открыть каталог
            </Link>
            <Link
              href={ROUTES.dashboardOverview}
              className="inline-flex h-10 items-center rounded-lg bg-zinc-700 px-5 text-[13px] font-semibold text-white transition hover:bg-zinc-600"
            >
              Как это работает
            </Link>
          </div>

          <div className="relative mt-10 w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a] p-2 sm:mt-12 sm:rounded-3xl sm:p-3">
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(187,153,255,0.18),transparent_42%)]"
              aria-hidden
            />
            <div className="relative aspect-16/10 w-full overflow-hidden rounded-xl bg-black sm:rounded-2xl">
              <Image
                src="/images/dashboard/hero-photo.jpg"
                alt="Превью интерфейса кабинета RevShare"
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 96vw, (max-width: 1280px) 92vw, 1120px"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
