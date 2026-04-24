import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  LineChart,
  Newspaper,
  Percent,
} from "lucide-react";

import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

const surface = "rounded-2xl bg-[#111111] ring-1 ring-white/[0.06]";

export function DashboardTrustStrip({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 border-b border-white/8 py-4 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-600",
        className,
      )}
    >
      <p className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5">
        <span className="text-zinc-500">RevShare</span>
        <span className="text-zinc-800" aria-hidden>
          ·
        </span>
        <span className="text-zinc-400">Кабинет</span>
        <span className="text-zinc-800" aria-hidden>
          ·
        </span>
        <span className="text-zinc-500">USDT · TRC20</span>
      </p>
    </div>
  );
}

export function DashboardValueGrid({ className }: { className?: string }) {
  return (
    <section
      className={cn(
        "scroll-mt-24 relative left-1/2 right-1/2 -mx-[50vw] w-screen bg-[#f6f7f9] py-12 md:py-16",
        className,
      )}
      aria-labelledby="dash-value-heading"
    >
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:items-center">
          <div className="max-w-xl">
            <span className="inline-flex rounded-full bg-white px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-600">
              Обзор
            </span>
            <h2 id="dash-value-heading" className="mt-4 text-3xl font-semibold tracking-tight text-zinc-950 md:text-4xl">
              Всё важное о RevShare на одной странице
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-zinc-600 md:text-[15px]">
              Слева - короткое описание продукта. Справа - единый видеоблок, где позже будет ролик с обзором всех разделов:
              каталог, выплаты, вторичный рынок и аналитика.
            </p>
            <Link
              href={ROUTES.dashboardCatalog}
              className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-zinc-700 transition hover:text-zinc-950"
            >
              Открыть каталог
              <ArrowRight className="size-4" strokeWidth={2} aria-hidden />
            </Link>
          </div>

          <div className="relative overflow-hidden rounded-3xl bg-[#e8e8eb] p-4 sm:p-5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.7),transparent_46%)]" aria-hidden />
            <div className="relative min-h-[420px] rounded-xl bg-[#dcdce1]">
              <div className="flex h-full min-h-[420px] items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-center">
                  <span className="flex size-14 items-center justify-center rounded-full bg-white text-zinc-700 shadow-[0_8px_20px_-14px_rgba(0,0,0,0.4)]">
                    <svg viewBox="0 0 24 24" className="ml-0.5 size-6 fill-current" aria-hidden>
                      <path d="M8 6.5v11l9-5.5-9-5.5Z" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const marketTiles = [
  {
    title: "Вторичный рынок",
    subtitle: "Стакан · ордера · история",
    href: ROUTES.dashboardSecondaryMarket,
    Icon: BarChart3,
  },
  {
    title: "Аналитика релизов",
    subtitle: "Доходность и сравнение",
    href: ROUTES.analyticsReleases,
    Icon: LineChart,
  },
  {
    title: "Новости платформы",
    subtitle: "Релизы продукта и операций",
    href: ROUTES.news,
    Icon: Newspaper,
  },
  {
    title: "Комиссии",
    subtitle: "Тарифы и примеры",
    href: ROUTES.fees,
    Icon: Percent,
  },
] as const;

const journeySteps = [
  { n: "1", title: "Изучите релиз", text: "Параметры сделки, юниты и прогнозный сценарий дохода." },
  { n: "2", title: "Войдите в проект", text: "Покупка доли в USDT (TRC20) в несколько кликов." },
  { n: "3", title: "Следите за метриками", text: "Динамика, начисления и события доступны в реальном времени." },
  { n: "4", title: "Управляйте ликвидностью", text: "Вторичный рынок помогает перераспределять позиции внутри платформы." },
] as const;

export function DashboardUnifiedJourneyBlock({ className }: { className?: string }) {
  return (
    <section className={cn("scroll-mt-24 py-10 md:py-14", className)} aria-labelledby="dash-unified-journey-heading">
      <div className="relative overflow-hidden rounded-3xl bg-[#050505] px-5 py-9 sm:px-7 md:px-8 md:py-11">
        <div className="relative">
          <div className="mx-auto flex min-h-[360px] max-w-4xl flex-col items-center justify-center text-center sm:min-h-[420px]">
            <div className="mb-5 flex items-center justify-center">
              <Image
                src="/images/LOGO/icon-logo.png"
                alt="RevShare icon"
                width={188}
                height={188}
                className="h-40 w-40 object-contain sm:h-44 sm:w-44"
                priority
              />
            </div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">Сценарий пользователя</p>
            <h2
              id="dash-unified-journey-heading"
              className="mt-4 max-w-[920px] text-balance text-[2.25rem] font-semibold tracking-tight text-white sm:text-6xl lg:text-[4.1rem]"
            >
              Как устроен продукт
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-zinc-400 sm:text-base">
              Главный путь: от выбора релиза до управления доходностью и выходом из позиции.
            </p>
            <Link
              href={ROUTES.dashboardSecondaryMarket}
              className="mt-7 inline-flex h-11 items-center justify-center rounded-lg bg-white px-5 text-sm font-semibold text-black transition hover:bg-zinc-200"
            >
              Перейти к рынку
            </Link>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {journeySteps.slice(0, 3).map((s) => (
              <article key={s.n} className="rounded-2xl bg-[linear-gradient(180deg,#111114_0%,#0a0a0d_100%)] p-5">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#b99cff]">{`Step ${s.n}`}</p>
                <h3 className="mt-2 text-[28px] font-semibold leading-tight tracking-tight text-white">{s.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">{s.text}</p>
              </article>
            ))}
          </div>

          <div className="relative mt-4 overflow-hidden rounded-2xl bg-[linear-gradient(100deg,#0a0a0d_0%,#101013_55%,#17171b_100%)] p-5 sm:p-6">
            <div className="relative grid gap-5 md:grid-cols-[1fr_0.95fr] md:items-center">
              <div>
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Следующий шаг</p>
                <h4 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-[2rem]">Готовы начать с первого релиза?</h4>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-400">
                  Перейдите в каталог, сравните проекты и соберите свою первую стратегию прямо в интерфейсе платформы.
                </p>
                <div className="mt-5 flex flex-wrap gap-2.5">
                  <Link
                    href={ROUTES.dashboardCatalog}
                    className="inline-flex h-10 items-center justify-center rounded-lg bg-white px-4 text-sm font-semibold text-black transition hover:bg-zinc-200"
                  >
                    В каталог
                  </Link>
                  <Link
                    href={ROUTES.register}
                    className="inline-flex h-10 items-center justify-center rounded-lg bg-white/10 px-4 text-sm font-semibold text-zinc-100 transition hover:bg-white/14"
                  >
                    Регистрация
                  </Link>
                  <Link
                    href={ROUTES.support}
                    className="inline-flex h-10 items-center justify-center rounded-lg px-3 text-sm font-medium text-zinc-400 transition hover:text-zinc-200"
                  >
                    Поддержка
                  </Link>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                <div className="h-14 rounded-lg border border-white/20 bg-black/45" />
                <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-500">
                  <span>Stop</span>
                  <span>Esc</span>
                </div>
                <div className="mt-3 rounded-md bg-white/90 px-3 py-1.5 text-center text-[11px] font-semibold text-black">
                  #1 Product of the Week
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-white/10">
            <div className="grid gap-0 md:grid-cols-3 md:divide-x md:divide-white/10">
              <div className="px-4 pb-4 pt-6 sm:px-5 sm:pb-5 sm:pt-7">
                <div className="flex h-36 items-center justify-center rounded-xl bg-black/35">
                  <div className="relative flex items-center justify-center">
                    <div className="absolute h-20 w-52 rounded-full border border-white/12" />
                    <div className="absolute h-24 w-56 rounded-full border border-white/10" />
                    <div className="absolute h-28 w-60 rounded-full border border-white/8" />
                    <div className="relative rounded-2xl bg-[linear-gradient(180deg,#2f333b_0%,#1e2026_100%)] px-7 py-3 text-[11px] font-semibold text-zinc-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
                      Собери портфель
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 px-4 pb-4 pt-6 sm:px-5 sm:pb-5 sm:pt-7 md:border-t-0">
                <div className="flex h-36 items-center justify-center rounded-xl bg-black/35">
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      "bg-sky-500/25",
                      "bg-indigo-500/25",
                      "bg-red-500/25",
                      "bg-emerald-500/25",
                      "bg-pink-500/25",
                      "bg-blue-500/25",
                      "bg-zinc-200/25",
                      "bg-cyan-500/25",
                    ].map((c, i) => (
                      <div
                        key={i}
                        className={cn(
                          "flex h-12 w-12 items-center justify-center rounded-xl border border-white/10",
                          c,
                        )}
                      >
                        <span className="h-2.5 w-2.5 rounded-full bg-white/85" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 px-4 pb-4 pt-6 sm:px-5 sm:pb-5 sm:pt-7 md:border-t-0">
                <div className="flex h-36 items-center justify-center rounded-xl bg-black/35">
                  <div className="flex items-center gap-1.5">
                    <span className="size-6 rounded-full bg-white/20" />
                    <span className="size-8 rounded-full bg-white/22" />
                    <span className="size-10 rounded-full bg-white/24" />
                    <span className="flex size-16 items-center justify-center rounded-full bg-[linear-gradient(180deg,#4e515b_0%,#2f323c_100%)] ring-1 ring-white/20">
                      <span className="size-8 rounded-full border-2 border-white/80" />
                    </span>
                    <span className="size-10 rounded-full bg-white/24" />
                    <span className="size-8 rounded-full bg-white/22" />
                    <span className="size-6 rounded-full bg-white/20" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function DashboardMarketsRow({ className }: { className?: string }) {
  return (
    <section className={cn("scroll-mt-24 border-t border-white/8 py-12 md:py-16", className)} aria-labelledby="dash-markets-heading">
      <h2 id="dash-markets-heading" className="text-xl font-semibold tracking-tight text-white md:text-2xl">
        Экосистема RevShare
      </h2>
      <p className="mt-2 max-w-xl text-sm text-zinc-500">Разделы, которые формируют полный цикл работы пользователя в продукте.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {marketTiles.map(({ title, subtitle, href, Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              surface,
              "group flex flex-col gap-3 p-5 transition hover:bg-white/2 md:p-6",
            )}
          >
            <Icon className="size-5 text-zinc-500 transition group-hover:text-[#d4f570]" strokeWidth={1.6} aria-hidden />
            <div>
              <h3 className="font-semibold text-white">{title}</h3>
              <p className="mt-1 text-xs text-zinc-500">{subtitle}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function DashboardLandingCta({ className }: { className?: string }) {
  return (
    <section
      className={cn(
        "scroll-mt-24 border-t border-white/8 py-14 md:py-20",
        className,
      )}
      aria-labelledby="dash-cta-heading"
    >
      <div className={cn(surface, "relative overflow-hidden px-6 py-12 sm:px-10 sm:py-14 md:px-12 md:py-16")}>
        <div className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-[#B7F500]/10 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-32 -left-16 size-80 rounded-full bg-sky-500/8 blur-3xl" aria-hidden />
        <div className="relative max-w-2xl">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Следующий шаг</p>
          <h2 id="dash-cta-heading" className="mt-3 text-2xl font-semibold tracking-tight text-white md:text-3xl">
            Готовы начать с первого релиза?
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-zinc-500 md:text-base">
            Перейдите в каталог, сравните проекты и соберите свою первую стратегию прямо в интерфейсе платформы.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href={ROUTES.dashboardCatalog}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#B7F500] px-6 text-sm font-semibold text-black transition hover:bg-[#c8ff3d]"
            >
              В каталог
              <ArrowRight className="size-4" strokeWidth={2} aria-hidden />
            </Link>
            <Link
              href={ROUTES.register}
              className="inline-flex h-11 items-center justify-center rounded-lg border border-white/12 bg-[#0a0a0a] px-6 text-sm font-semibold text-zinc-100 ring-1 ring-white/10 transition hover:bg-white/5"
            >
              Регистрация
            </Link>
            <Link
              href={ROUTES.support}
              className="inline-flex h-11 items-center justify-center rounded-lg border border-transparent px-4 text-sm font-medium text-zinc-400 transition hover:text-zinc-200"
            >
              Поддержка
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
