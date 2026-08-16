"use client";

import Image from "next/image";
import Link from "next/link";
import * as React from "react";

import { useI18n } from "@/components/providers/i18n-provider";
import {
  RELEASE_PARAMETERS_CARD_ZONES,
  RELEASE_PARAMETERS_EXAMPLE,
  RELEASE_PARAMETERS_FIRST_LOOK,
  RELEASE_PARAMETERS_GRID,
  RELEASE_PARAMETERS_MOCK_CARD,
} from "@/constants/release-parameters/page";
import { ROUTES } from "@/constants/routes";
import { ChevronRight, Share2 } from "@/lib/lucide";
import { cn } from "@/lib/utils";

const LINK = "font-medium text-black underline-offset-2 hover:underline";
const CTA_VIDEO = "/videos/release-parameters-cta.mp4";
const COVER_SRC = "/images/hero-journey/1.webp";

const SECTIONS = [
  { id: "summary", n: "1", title: "ОПОРНЫЕ ПОЛЯ", short: "Поля" },
  { id: "card", n: "2", title: "КАК ЧИТАТЬ КАРТОЧКУ", short: "Карточка" },
  { id: "params", n: "3", title: "ПАРАМЕТРЫ", short: "Параметры" },
  { id: "first", n: "4", title: "СНАЧАЛА СМОТРИТЕ", short: "Сначала" },
  { id: "example", n: "5", title: "ПРИМЕР РАЗБОРА", short: "Пример" },
  { id: "faq", n: "6", title: "FAQ", short: "FAQ" },
] as const;

const ART = [
  {
    src: "/images/release-parameters/rp-units.png?v=2",
    en: "Units",
    ru: "Юниты",
    body: "Сколько нормированных долей вы покупаете в пуле дохода релиза.",
  },
  {
    src: "/images/release-parameters/rp-share.png?v=2",
    en: "Investor share",
    ru: "Доля пользователей",
    body: "Какая часть дохода трека закреплена за держателями units — не акции и не мастер.",
  },
  {
    src: "/images/release-parameters/rp-raise.png?v=2",
    en: "Raise / Cap",
    ru: "Цель и потолок",
    body: "Сколько USDT собирают в раунде и где стоит жёсткий лимит сбора.",
  },
  {
    src: "/images/release-parameters/rp-payout.png?v=2",
    en: "Payout model",
    ru: "Модель выплат",
    body: "Как часто приходят выплаты в USDT TRC20 и какие правила до кошелька.",
  },
] as const;

const GRID_SLUG: Record<string, string> = {
  Units: "units",
  "Investor share": "investorShare",
  "Raise target": "raiseTarget",
  "Hard cap": "hardCap",
  "Available units": "availableUnits",
  "Payout model": "payoutModel",
  "Статус релиза": "status",
  "Secondary market": "secondaryMarket",
};

function ArticleMeta() {
  return (
    <div className="mx-auto mt-3 flex max-w-2xl items-start justify-center gap-3">
      <p className="min-w-0 text-center text-[13px] leading-relaxed text-[#8c8c8c]">
        Последнее обновление: 14 авг. 2026 г.
        <span className="mx-1.5 text-[#cfcfcf]">/</span>
        7 мин. чтения
      </p>
      <button
        type="button"
        className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-[#8c8c8c] transition hover:bg-[#f5f5f5] hover:text-black"
        onClick={() => {
          void navigator.clipboard?.writeText(window.location.href);
        }}
        aria-label="Поделиться"
      >
        <Share2 className="size-3.5" aria-hidden />
      </button>
    </div>
  );
}

function ArticleH2({ id, n, children }: { id: string; n: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="scroll-mt-24 text-[18px] font-bold leading-snug tracking-tight text-black sm:scroll-mt-28 sm:text-[22px]"
    >
      {n}. {children}
    </h2>
  );
}

function P({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("mt-4 text-[15px] leading-[1.75] text-[#1a1a1a] sm:text-[16px] sm:leading-[1.7]", className)}>
      {children}
    </p>
  );
}

function Sub({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <p className="mt-4 text-[15px] leading-[1.75] text-[#1a1a1a] sm:mt-5 sm:text-[16px] sm:leading-[1.7]">
      <span className="font-bold">{n}</span> {children}
    </p>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group border-b border-[#e8e8e8] py-4 first:border-t">
      <summary className="cursor-pointer list-none text-[15px] font-semibold text-black marker:content-none [&::-webkit-details-marker]:hidden">
        <span className="flex items-start justify-between gap-3">
          {q}
          <ChevronRight className="mt-1 size-4 shrink-0 text-[#999] transition group-open:rotate-90" aria-hidden />
        </span>
      </summary>
      <p className="mt-2 pr-6 text-[14px] leading-[1.7] text-[#555]">{a}</p>
    </details>
  );
}

function RpStartCta() {
  return (
    <section
      id="cta"
      className="relative isolate mt-14 overflow-hidden rounded-[1.35rem] bg-black sm:mt-16 sm:rounded-[1.75rem]"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <video
          className="absolute inset-0 h-full w-full scale-105 object-cover opacity-70 motion-reduce:hidden"
          src={CTA_VIDEO}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/35 motion-reduce:bg-black" />
      </div>
      <div className="relative z-10 flex min-h-[220px] flex-col justify-center gap-6 px-6 py-10 sm:min-h-[280px] sm:flex-row sm:items-center sm:justify-between sm:px-10 sm:py-14 md:min-h-[320px]">
        <div className="min-w-0 max-w-xl">
          <h2 className="text-[26px] font-bold leading-tight tracking-tight text-white sm:text-[32px]">
            Готовы читать карточку в каталоге?
          </h2>
          <p className="mt-3 text-[14px] leading-relaxed text-white/65 sm:text-[15px]">
            Откройте релиз и сверьте units, investor share, raise и payout model перед покупкой.
          </p>
        </div>
        <Link
          href={ROUTES.dashboardCatalog}
          className="inline-flex h-12 w-full shrink-0 items-center justify-center rounded-full bg-white px-8 text-[14px] font-semibold text-black transition hover:bg-zinc-100 active:scale-[0.98] sm:h-14 sm:w-auto sm:px-10 sm:text-[15px]"
        >
          Начать
        </Link>
      </div>
    </section>
  );
}

function CardExplainer() {
  const { t } = useI18n();
  const [activeZone, setActiveZone] = React.useState(RELEASE_PARAMETERS_CARD_ZONES[0]!.id);
  const mock = RELEASE_PARAMETERS_MOCK_CARD;

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-2 lg:items-start lg:gap-10">
      <article className="overflow-hidden rounded-xl bg-[#0c0c0e] font-mono text-[13px] tabular-nums tracking-tight">
        <div className="relative aspect-[16/10] w-full min-h-[140px] bg-[#070707]">
          <Image src={COVER_SRC} alt="" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 420px" />
        </div>
        <div className="flex flex-col gap-3 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3 pb-2.5">
            <span className="truncate font-sans text-[11px] font-medium text-zinc-200">
              {t("catalog.releaseParameters.card.mockStrip")}
            </span>
            <span className="shrink-0 font-mono text-[10px] text-zinc-100">{mock.statusBadge}</span>
          </div>
          <div>
            <h3 className="truncate font-sans text-lg font-semibold text-white">{mock.title}</h3>
            <p className="truncate text-sm text-zinc-500">{mock.artist}</p>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-[12px]">
            {(
              [
                ["yield", mock.yield],
                ["available", mock.availableUnits],
                ["filled", `${mock.filledPct}%`],
                ["raise", mock.raiseTarget],
              ] as const
            ).map(([id, value]) => (
              <div
                key={id}
                className={cn(
                  "px-0 py-1 transition-opacity",
                  activeZone === id ? "opacity-100" : "opacity-55",
                )}
              >
                <p className="text-[10px] uppercase tracking-wide text-zinc-500">
                  {t(`catalog.releaseParameters.zone.${id}.title`)}
                </p>
                <p className="mt-1 text-sm font-semibold text-zinc-100 sm:text-base">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </article>

      <div className="flex flex-col">
        {RELEASE_PARAMETERS_CARD_ZONES.map((zone, index) => {
          const isActive = activeZone === zone.id;
          return (
            <button
              key={zone.id}
              type="button"
              onClick={() => setActiveZone(zone.id)}
              className={cn(
                "grid w-full grid-cols-[2rem_minmax(0,1fr)] gap-3 border-b border-[#eee] py-4 text-left transition-colors last:border-b-0",
                isActive ? "text-black" : "text-[#1a1a1a] opacity-55 hover:opacity-100",
              )}
            >
              <span
                className={cn(
                  "flex size-7 items-center justify-center font-mono text-[11px] font-bold",
                  isActive ? "text-black" : "text-[#999]",
                )}
              >
                {index + 1}
              </span>
              <span>
                <span className="text-sm font-semibold text-black">
                  {t(`catalog.releaseParameters.zone.${zone.id}.title`)}
                </span>
                <p className="mt-1 text-[13px] leading-relaxed text-[#666]">
                  {t(`catalog.releaseParameters.zone.${zone.id}.body`)}
                </p>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ReleaseParametersScreen() {
  const { t } = useI18n();
  const [activeId, setActiveId] = React.useState<string>(SECTIONS[0]!.id);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const ex = RELEASE_PARAMETERS_EXAMPLE;

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const nodes = SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    if (!nodes.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const top = visible[0]?.target.id;
        if (top) setActiveId(top);
      },
      { root, rootMargin: "-15% 0px -65% 0px", threshold: [0, 0.25, 0.5] },
    );
    for (const node of nodes) observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={rootRef}
      className="h-full min-h-0 overflow-x-hidden overflow-y-auto scroll-smooth bg-white font-sans text-black antialiased [color-scheme:light]"
      data-mobile-scroll-root
    >
      <div className="mx-auto w-full max-w-[1120px] px-4 pb-16 pt-4 sm:px-6 sm:pb-20 sm:pt-8 lg:px-8">
        <nav aria-label="Хлебные крошки" className="mb-4 sm:mb-5">
          <ol className="flex flex-wrap items-center gap-1.5 text-[12px] text-[#8c8c8c] sm:text-[13px]">
            <li>
              <Link href={ROUTES.dashboardCatalog} className="transition hover:text-black">
                Каталог
              </Link>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="text-[#c4c4c4]">›</span>
              <span className="text-[#555]">Параметры релиза</span>
            </li>
          </ol>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(220px,280px)] lg:gap-14 xl:gap-16">
          <article className="min-w-0 max-w-[720px]">
            <header className="text-center">
              <h1 className="mx-auto max-w-2xl text-[28px] font-bold leading-[1.15] tracking-tight text-black sm:text-[36px] lg:text-[40px]">
                {t("catalog.releaseParameters.hero.title")}
              </h1>
              <ArticleMeta />
            </header>

            <P className="mx-auto mt-6 max-w-2xl text-center font-semibold sm:mt-8">
              {t("catalog.releaseParameters.hero.intro1")}
            </P>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[15px] sm:text-[16px]">
              <Link href={ROUTES.dashboardCatalog} className={LINK}>
                {t("catalog.releaseParameters.hero.ctaCatalog")}
              </Link>
              <Link href={ROUTES.guideSelection} className={LINK}>
                {t("catalog.releaseParameters.hero.ctaGuide")}
              </Link>
            </div>

            <P className="mt-6 sm:mt-8">{t("catalog.releaseParameters.hero.intro2")}</P>

            <nav aria-label="Содержание" className="mt-8 border-y border-[#eee] py-4 lg:hidden">
              <p className="text-[12px] font-semibold text-[#8c8c8c]">Содержание</p>
              <ol className="mt-3 columns-2 gap-x-4 space-y-2">
                {SECTIONS.map((s) => (
                  <li key={s.id} className="break-inside-avoid">
                    <a href={`#${s.id}`} className="text-[13px] text-[#555] hover:text-black">
                      {s.n}. {s.short}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            <section className="mt-10 sm:mt-14">
              <ArticleH2 id="summary" n="1">
                Опорные поля
              </ArticleH2>
              <P>
                Начните с четырёх полей на карточке: они задают масштаб входа, долю в доходе, объём сбора и ритм выплат.
              </P>
              <div className="mt-8 divide-y divide-[#eee] border-y border-[#eee]">
                {ART.map((item, index) => (
                  <div
                    key={item.en}
                    className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:gap-6 sm:py-7"
                  >
                    <div className="relative mx-auto size-[112px] shrink-0 sm:mx-0 sm:size-[128px]">
                      <Image
                        src={item.src}
                        alt=""
                        fill
                        className="object-contain"
                        sizes="128px"
                        unoptimized
                      />
                    </div>
                    <div className="min-w-0 flex-1 text-center sm:text-left">
                      <p className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-[#9a9a9a]">
                        {String(index + 1).padStart(2, "0")}
                        <span className="mx-2 text-[#d0d0d0]">/</span>
                        {item.en}
                      </p>
                      <h3 className="mt-1.5 text-[18px] font-bold tracking-tight text-black sm:text-[20px]">
                        {item.ru}
                      </h3>
                      <p className="mt-2 text-[14px] leading-relaxed text-[#555] sm:text-[15px] sm:leading-[1.65]">
                        {item.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-10 sm:mt-14">
              <ArticleH2 id="card" n="2">
                Как читать карточку
              </ArticleH2>
              <P>
                Нажмите зону на карточке или шаг справа — так видно, что означает каждое поле перед покупкой units.
              </P>
              <CardExplainer />
            </section>

            <section className="mt-10 sm:mt-14">
              <ArticleH2 id="params" n="3">
                Параметры
              </ArticleH2>
              {RELEASE_PARAMETERS_GRID.map((p, i) => {
                const slug = GRID_SLUG[p.title] ?? "units";
                return (
                  <Sub key={p.title} n={`${i + 1}.`}>
                    <span className="font-bold">{t(`catalog.releaseParameters.grid.${slug}.titleRu`)}</span>
                    {" — "}
                    {t(`catalog.releaseParameters.grid.${slug}.definition`)}{" "}
                    <span className="text-[#555]">{t(`catalog.releaseParameters.grid.${slug}.why`)}</span>
                  </Sub>
                );
              })}
            </section>

            <section className="mt-10 sm:mt-14">
              <ArticleH2 id="first" n="4">
                Сначала смотрите
              </ArticleH2>
              {RELEASE_PARAMETERS_FIRST_LOOK.map((_, idx) => (
                <Sub key={idx} n={`${idx + 1}.`}>
                  <span className="font-bold">{t(`catalog.releaseParameters.priority.item${idx + 1}.title`)}. </span>
                  {t(`catalog.releaseParameters.priority.item${idx + 1}.body`)}
                </Sub>
              ))}
            </section>

            <section className="mt-10 sm:mt-14">
              <ArticleH2 id="example" n="5">
                Пример разбора
              </ArticleH2>
              <P className="font-semibold">{t("catalog.releaseParameters.example.headline")}</P>
              <P>{t("catalog.releaseParameters.example.deck")}</P>
              <P>{t("catalog.releaseParameters.example.readAs")}</P>
              <Sub n="5.1">
                Статус: {t("catalog.releaseParameters.example.status")} / yield {ex.expectedYield}
              </Sub>
              <Sub n="5.2">
                Units: total {ex.totalUnits}, sold {ex.soldUnits}, available {ex.availableUnits}
              </Sub>
              <Sub n="5.3">
                Raise {ex.raiseTarget}, hard cap {ex.hardCap}, investor share {ex.investorShare}
              </Sub>
              <Sub n="5.4">
                Payout: {ex.payout}. Secondary: {ex.secondary}
              </Sub>
              <P className="mt-6 text-[14px] text-[#666]">{t("catalog.releaseParameters.example.closing")}</P>
            </section>

            <section className="mt-10 sm:mt-14">
              <ArticleH2 id="faq" n="6">
                FAQ
              </ArticleH2>
              <div className="mt-4">
                {Array.from({ length: 6 }, (_, i) => i + 1).map((n) => (
                  <FaqItem
                    key={n}
                    q={t(`catalog.releaseParameters.faq.item${n}.question`)}
                    a={t(`catalog.releaseParameters.faq.item${n}.answer`)}
                  />
                ))}
              </div>
            </section>
          </article>

          <aside className="hidden lg:block">
            <nav className="sticky top-8" aria-label="Содержание статьи">
              <ol className="space-y-0 border-l border-[#e5e5e5]">
                {SECTIONS.map((s) => {
                  const active = activeId === s.id;
                  return (
                    <li key={s.id}>
                      <a
                        href={`#${s.id}`}
                        className={cn(
                          "relative -ml-px block border-l-2 py-2 pl-3 text-[12px] font-medium uppercase leading-snug tracking-[0.02em] transition",
                          active ? "border-black text-black" : "border-transparent text-[#9a9a9a] hover:text-[#555]",
                        )}
                      >
                        {s.n}. {s.title}
                      </a>
                    </li>
                  );
                })}
              </ol>
            </nav>
          </aside>
        </div>

        <RpStartCta />
      </div>
    </div>
  );
}
