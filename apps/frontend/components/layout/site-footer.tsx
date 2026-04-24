import Link from "next/link";
import { ArrowUpRight, Globe, Mail } from "lucide-react";

import { FooterSoundtrack } from "@/components/layout/footer-soundtrack";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

type FooterHref = { label: string; href: string };

const FOOTER_SITE_ORIGIN = "https://revshare.app";

const assetsLinks: FooterHref[] = [
  { label: "Обзор активов", href: ROUTES.dashboardOverview },
  { label: "Метрики", href: ROUTES.dashboardMetrics },
  { label: "Позиции", href: ROUTES.dashboardPositions },
  { label: "Активность", href: ROUTES.dashboardActivity },
  { label: "Выплаты — обзор", href: ROUTES.dashboardPayouts },
  { label: "История выплат", href: ROUTES.dashboardPayoutsHistory },
  { label: "Сравнение периодов", href: ROUTES.dashboardPayoutsComparison },
  { label: "Пополнение USDT", href: "/assets/payouts/deposit" },
  { label: "Вывод USDT", href: "/assets/payouts/withdraw" },
];

const marketLinks: FooterHref[] = [
  { label: "Вторичный рынок", href: ROUTES.dashboardSecondaryMarket },
  { label: "Каталог релизов", href: ROUTES.dashboardCatalog },
  { label: "Обзор рынка", href: ROUTES.catalogMarketOverview },
  { label: "Параметры релиза", href: ROUTES.catalogReleaseParameters },
  { label: "Аналитика релизов", href: ROUTES.analyticsReleases },
  { label: "Калькулятор доходности", href: ROUTES.calculator },
];

const learnLinks: FooterHref[] = [
  { label: "Подбор релиза", href: ROUTES.guideSelection },
  { label: "Структура сделки", href: ROUTES.guideDealStructure },
  { label: "Комиссии и тарифы", href: ROUTES.fees },
];

const servicesLinks: FooterHref[] = [
  { label: "Поддержка", href: ROUTES.support },
  { label: "Статус системы", href: ROUTES.systemStatus },
  { label: "Новости", href: ROUTES.news },
  { label: "Реферальная программа", href: ROUTES.referralProgram },
  { label: "Партнёрская программа", href: ROUTES.partnerProgram },
];

const accountLinks: FooterHref[] = [
  { label: "Кабинет", href: ROUTES.dashboard },
  { label: "Профиль", href: ROUTES.dashboardProfile },
  { label: "Выписка", href: ROUTES.dashboardStatement },
  { label: "Вход", href: ROUTES.login },
  { label: "Регистрация", href: ROUTES.register },
];

const legalLinks: FooterHref[] = [
  { label: "Пользовательское соглашение", href: ROUTES.terms },
  { label: "Политика конфиденциальности", href: ROUTES.privacy },
  { label: "AML / KYC", href: ROUTES.support },
];

const socials: { label: string; href: string; icon: "telegram" | "x" | "github" | "youtube" | "linkedin" | "mail" }[] =
  [
    { label: "Telegram", href: "#", icon: "telegram" },
    { label: "X", href: "#", icon: "x" },
    { label: "GitHub", href: "#", icon: "github" },
    { label: "YouTube", href: "#", icon: "youtube" },
    { label: "LinkedIn", href: "#", icon: "linkedin" },
    { label: "Почта", href: "mailto:support@revshare.app", icon: "mail" },
  ];

function SocialGlyph({ kind }: { kind: (typeof socials)[number]["icon"] }) {
  const common = "size-[18px]";
  if (kind === "github") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
      </svg>
    );
  }
  if (kind === "youtube") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    );
  }
  if (kind === "linkedin") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    );
  }
  if (kind === "mail") return <Mail className={common} strokeWidth={1.6} aria-hidden />;
  if (kind === "telegram") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M21.946 2.316a.478.478 0 0 0-.5-.095L2.26 9.85a.476.476 0 0 0 .002.908l5.374 2.09 2.07 6.682a.478.478 0 0 0 .756.228l3.017-2.465 4.678 3.44a.477.477 0 0 0 .73-.52l-2.03-13.857ZM17.1 7.45 7.62 12.721l-.197-3.84 9.677-1.43Z" />
      </svg>
    );
  }
  return (
    <svg className={common} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function FooterLinkColumn({
  title,
  links,
  mono,
}: {
  title: string;
  links: readonly FooterHref[];
  mono?: boolean;
}) {
  return (
    <div className="min-w-0">
      <h3 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">{title}</h3>
      <ul className={cn("space-y-3.5", mono ? "font-mono text-[13px]" : "text-[14px]")}>
        {links.map((l) => (
          <li key={l.href + l.label}>
            <Link
              href={l.href}
              className="text-zinc-500 transition-colors hover:text-zinc-100 [text-wrap:balance]"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FooterCtaBlock() {
  const registerUrl = `${FOOTER_SITE_ORIGIN}${ROUTES.register}`;
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(registerUrl)}`;

  return (
    <div className="flex flex-col items-stretch rounded-2xl border border-white/10 bg-[#070707] p-6 sm:p-8 lg:max-w-[320px] lg:justify-self-end">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">Мобильный доступ</p>
      <h3 className="mt-3 text-xl font-semibold tracking-tight text-white sm:text-2xl">
        RevShare рядом с вами
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-zinc-500">
        Отсканируйте код — откроется регистрация. В демо среде ссылка ведёт на прод-домен для превью QR.
      </p>
      <Link
        href={ROUTES.register}
        className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-white text-sm font-semibold text-black transition hover:bg-zinc-200"
      >
        Создать аккаунт
      </Link>
      <div className="mt-8 flex justify-center rounded-xl bg-white p-3 ring-1 ring-white/10">
        {/* eslint-disable-next-line @next/next/no-img-element -- внешний QR без remotePatterns */}
        <img src={qrSrc} alt="" width={168} height={168} className="size-[168px]" />
      </div>
      <p className="mt-4 text-center text-[11px] leading-snug text-zinc-600">
        Отсканируйте, чтобы перейти к регистрации RevShare
      </p>
    </div>
  );
}

export function SiteFooter({ className }: { className?: string }) {
  const year = new Date().getFullYear();

  return (
    <footer className={cn("mt-auto border-t border-white/8 bg-black text-zinc-500", className)}>
      <div className="mx-auto max-w-[1600px] px-4 pb-6 pt-16 sm:px-6 sm:pb-8 sm:pt-20 lg:px-10 lg:pb-10 lg:pt-24">
        {/* Верхняя полоса — как newsletter / CTA у Sanity */}
        <div className="border-b border-white/8 pb-12 md:pb-16">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
            <div className="max-w-2xl space-y-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">Обновления</p>
              <p className="text-2xl font-semibold leading-[1.15] tracking-tight text-white md:text-3xl lg:text-[2.15rem]">
                Продукт, выплаты и вторичный рынок — в ленте{" "}
                <Link href={ROUTES.news} className="text-zinc-300 underline decoration-white/20 underline-offset-[6px] transition hover:text-white hover:decoration-white/40">
                  новостей
                </Link>
                .
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={ROUTES.news}
                className="inline-flex h-11 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] px-6 text-xs font-semibold uppercase tracking-wide text-zinc-100 transition hover:border-white/25 hover:bg-white/[0.07]"
              >
                К ленте
              </Link>
              <Link
                href={ROUTES.dashboard}
                className="inline-flex h-11 items-center justify-center gap-1.5 rounded-full bg-white px-6 text-xs font-semibold uppercase tracking-wide text-black transition hover:bg-zinc-200"
              >
                В кабинет
                <ArrowUpRight className="size-3.5 opacity-80" strokeWidth={2} aria-hidden />
              </Link>
            </div>
          </div>
        </div>

        {/* Основная сетка */}
        <div className="mt-14 grid gap-14 lg:mt-20 lg:grid-cols-12 lg:gap-12 xl:gap-16">
          {/* Бренд */}
          <div className="flex flex-col gap-8 lg:col-span-3">
            <div>
              <Link
                href={ROUTES.home}
                className="inline-flex w-fit items-baseline gap-0.5 text-3xl font-semibold tracking-[-0.03em] text-white md:text-[2.1rem]"
              >
                <span>Rev</span>
                <span className="text-zinc-400">Share</span>
              </Link>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-zinc-500 md:text-[15px]">
                Долевое участие в доходе музыкальных релизов. USDT (TRC20), прозрачные условия и единый кабинет для
                rights и ликвидности.
              </p>
            </div>
            <p className="font-mono text-[11px] text-zinc-600">© {year} RevShare</p>
            <button
              type="button"
              className="inline-flex w-fit items-center gap-2 rounded-lg border border-white/15 bg-white/[0.03] px-3 py-2 text-left text-xs font-medium text-zinc-300 transition hover:border-white/22 hover:bg-white/[0.06]"
            >
              <Globe className="size-3.5 text-zinc-500" strokeWidth={1.75} aria-hidden />
              <span>Русский · USDT</span>
              <span className="text-zinc-600" aria-hidden>
                ▾
              </span>
            </button>
          </div>

          {/* Колонки ссылок */}
          <div className="grid gap-12 sm:grid-cols-2 md:grid-cols-3 lg:col-span-6 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-12">
            <FooterLinkColumn title="Активы и выплаты" links={assetsLinks} mono />
            <FooterLinkColumn title="Рынок и аналитика" links={marketLinks} mono />
            <FooterLinkColumn title="Обучение и тарифы" links={learnLinks} mono />
            <FooterLinkColumn title="Сервисы" links={servicesLinks} mono />
            <FooterLinkColumn title="Аккаунт" links={accountLinks} mono />
            <FooterLinkColumn title="Правовая информация" links={legalLinks} mono />
          </div>

          <div className="lg:col-span-3">
            <FooterCtaBlock />
          </div>
        </div>

        {/* Крупный вордмарк */}
        <div className="pointer-events-none mt-16 select-none border-t border-white/6 pt-14 text-center md:mt-24 md:pt-20">
          <p
            className="bg-gradient-to-b from-white/[0.14] via-white/[0.06] to-transparent bg-clip-text font-semibold tracking-[-0.05em] text-transparent"
            style={{ fontSize: "clamp(3rem, 14vw, 9rem)", lineHeight: 0.9 }}
            aria-hidden
          >
            RevShare
          </p>
        </div>

        {/* Нижняя полоса */}
        <div className="mt-12 flex flex-col gap-8 border-t border-white/8 pt-10 md:mt-16 md:flex-row md:items-center md:justify-between md:gap-6 md:pt-12">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-600">Сообщество</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {socials.map((s) => (
                <Link
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="flex size-11 items-center justify-center rounded-full border border-white/10 text-zinc-400 transition hover:border-white/18 hover:bg-white/[0.05] hover:text-zinc-100"
                >
                  <SocialGlyph kind={s.icon} />
                </Link>
              ))}
            </div>
          </div>

          <p className="max-w-md text-center font-mono text-[11px] leading-relaxed text-zinc-600 md:text-left">
            USDT (TRC20) · ончейн-прозрачность · без скрытых комиссий в интерфейсе кабинета. Данные демо могут отличаться
            от продакшена.
          </p>

          <Link
            href={ROUTES.systemStatus}
            className="inline-flex items-center gap-2 self-center rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 font-mono text-[11px] text-zinc-400 transition hover:border-white/16 hover:text-zinc-200 md:self-auto"
          >
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400/50 opacity-40" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-400/90" />
            </span>
            Статус сервисов
          </Link>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-white/6 pt-8 text-[12px] text-zinc-600 sm:flex-row sm:items-center">
          <p>
            <span className="font-medium text-zinc-400">RevShare</span> · {year} · Все права защищены
          </p>
          <p className="font-mono text-[11px] text-zinc-600">RevShare Platform</p>
        </div>
      </div>

      <FooterSoundtrack />
    </footer>
  );
}
