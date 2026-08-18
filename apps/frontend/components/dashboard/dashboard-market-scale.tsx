"use client";

import NextImage from "next/image";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { ArrowDown, ArrowRight, ArrowUp, Plus, Send } from "@/lib/lucide";

import { LandingReveal } from "@/components/dashboard/landing-motion";
import { useAuth } from "@/components/providers/auth-provider";
import { useI18n } from "@/components/providers/i18n-provider";
import { ReadOnlySectionError } from "@/components/shared/data-states/read-only-section-error";
import { ROUTES } from "@/constants/routes";
import { formatUsdtFixedRu } from "@/lib/market-overview/format";
import { cn } from "@/lib/utils";
import { fetchCatalogStats } from "@/services/catalog.service";
import { fetchMarketOverviewList } from "@/services/market-overview.service";
import { fetchWalletSummary, getWalletDataSource } from "@/services/wallet.service";

type CardId = "wallet" | "listings" | "releases" | "rounds";

/** Everyday traffic palette — no mint neon. */
const C = {
  red: "#e5484d",
  orange: "#f0762b",
  green: "#2f9e44",
  redSoft: "rgba(229,72,77,0.18)",
  orangeSoft: "rgba(240,118,43,0.18)",
  greenSoft: "rgba(47,158,68,0.18)",
} as const;

type PlatformMetric = {
  id: CardId;
  value: string;
  href: string;
  walletAvailable?: string;
  volume24h?: string;
};

const DEMO_RELEASES = [
  { symbol: "MD2145", title: "Midnight Code", artist: "Vera Kline", cover: "/images/hero-journey/1.webp" },
  { symbol: "AC2145", title: "Neon Harbor", artist: "Atlas Row", cover: "/images/hero-journey/2.webp" },
  { symbol: "SGN", title: "Signal Path", artist: "Lumen", cover: "/images/hero-journey/3.webp" },
  { symbol: "VLT", title: "Voltage", artist: "Kite", cover: "/images/catalog/3.png" },
  { symbol: "GLS", title: "Glassline", artist: "Nora V", cover: "/images/catalog/4.png" },
] as const;

const DEMO_ROUNDS = [
  { symbol: "MD2145", title: "Midnight Code", pct: 72, raised: "18 400" },
  { symbol: "AC2145", title: "Neon Harbor", pct: 48, raised: "9 120" },
  { symbol: "SGN", title: "Signal Path", pct: 91, raised: "41 200" },
  { symbol: "VLT", title: "Voltage", pct: 33, raised: "4 860" },
  { symbol: "GLS", title: "Glassline", pct: 64, raised: "12 050" },
] as const;

const BOOK_ASKS = [
  { price: "22,40", size: 88 },
  { price: "22,25", size: 64 },
  { price: "22,18", size: 41 },
] as const;

const BOOK_BIDS = [
  { price: "22,05", size: 52 },
  { price: "21,90", size: 73 },
  { price: "21,70", size: 96 },
] as const;

const TAPE = [
  { side: "buy" as const, price: "22,10", qty: "18" },
  { side: "sell" as const, price: "22,18", qty: "7" },
  { side: "buy" as const, price: "22,05", qty: "40" },
  { side: "sell" as const, price: "22,25", qty: "12" },
  { side: "buy" as const, price: "22,00", qty: "25" },
];

/** Fixed 2×2 card geometry — equal height, compact, no flex growth. */
const MARKET_CARD_CLASS =
  "group flex h-auto min-h-[352px] w-full max-w-full min-w-0 flex-col overflow-hidden rounded-[22px] bg-[#111113] sm:h-[328px] sm:min-h-0";
const MARKET_BODY_CLASS =
  "relative min-h-[268px] shrink-0 overflow-hidden sm:h-[248px] sm:min-h-0";
const MARKET_STAT_CLASS =
  "shrink-0 px-4 pb-1 pt-2 font-mono text-[1.2rem] font-medium leading-none tracking-[-0.03em] text-white tabular-nums sm:px-5 sm:text-[1.35rem]";
const MARKET_SCENE_PAD = "h-full p-3.5 sm:p-4";

function MarketScaleHorizontalTape({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-w-0 shrink-0 overflow-hidden py-1">
      <div className="market-scale-tape flex w-max max-w-none will-change-transform">
        <div className="flex shrink-0 items-center gap-1.5 px-2">{children}</div>
        <div className="flex shrink-0 items-center gap-1.5 px-2" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}

function MarketScaleVerticalMarquee({ children }: { children: ReactNode }) {
  return (
    <div className="market-scale-marquee flex w-full flex-col will-change-transform">
      <div className="flex flex-col gap-1.5 p-2.5">{children}</div>
      <div className="flex flex-col gap-1.5 p-2.5" aria-hidden>
        {children}
      </div>
    </div>
  );
}

function formatUsdt(value: string | number): string {
  const n = typeof value === "string" ? Number.parseFloat(value) : value;
  if (!Number.isFinite(n)) return "—";
  return `${formatUsdtFixedRu(n)} USDT`;
}

function WalletScene({
  available,
  volume24h,
}: {
  available: string;
  volume24h: string;
}) {
  const { t } = useI18n();
  const amount = available.replace(/\s*USDT$/i, "").trim();
  const actions = [
    { key: "buy", label: t("dashboard.marketScale.wallet.buy"), Icon: Plus },
    { key: "sell", label: t("dashboard.marketScale.wallet.sell"), Icon: ArrowUp },
    { key: "send", label: t("dashboard.marketScale.wallet.send"), Icon: Send },
    { key: "receive", label: t("dashboard.marketScale.wallet.receive"), Icon: ArrowDown },
  ] as const;

  return (
    <div className={MARKET_SCENE_PAD}>
      <div className="flex h-full min-h-0 flex-col gap-2">
        <div className="min-h-0 shrink-0 rounded-[16px] bg-white px-3 pb-3.5 pt-3 max-sm:overflow-visible sm:flex-1 sm:overflow-hidden">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span
                className="flex size-8 items-center justify-center rounded-full text-[10px] font-bold text-white"
                style={{ backgroundColor: C.green }}
              >
                ₮
              </span>
              <div className="min-w-0">
                <p className="text-[13px] font-[510] text-black">USDT</p>
                <p className="text-[10px] text-[#737373]">TRC20</p>
              </div>
            </div>
            <span className="rounded-full bg-black/[0.06] px-2 py-0.5 font-mono text-[9px] tabular-nums text-[#525252]">
              TXo7…9k2m
            </span>
          </div>

          <p className="mt-2.5 text-center font-mono text-[1.35rem] font-medium leading-none tracking-[-0.04em] text-black tabular-nums sm:mt-3 sm:text-[1.65rem]">
            {amount}
          </p>
          <p className="mt-1 text-center text-[10px] font-[510] text-[#737373] sm:text-[11px]">
            {t("dashboard.marketScale.wallet.available")}
          </p>

          <div className="mt-2.5 grid grid-cols-4 gap-0.5 sm:mt-3 sm:gap-1">
            {actions.map(({ key, label, Icon }) => (
              <div key={key} className="flex flex-col items-center gap-0.5 sm:gap-1">
                <span className="flex size-8 items-center justify-center rounded-full bg-black text-white sm:size-9">
                  <Icon className="size-3.5" strokeWidth={2.25} aria-hidden />
                </span>
                <span className="max-w-full truncate text-[8px] font-[510] text-[#525252] sm:text-[9px]">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-2 px-0.5">
          <div>
            <p className="text-[9px] uppercase tracking-[0.12em] text-[#737373]">
              {t("dashboard.marketScale.wallet.volume")}
            </p>
            <p className="font-mono text-[13px] font-medium tabular-nums text-white">{volume24h}</p>
          </div>
          <span
            className="rounded-full px-2 py-0.5 text-[9px] font-medium text-white"
            style={{ backgroundColor: C.green }}
          >
            {t("dashboard.marketScale.wallet.ready")}
          </span>
        </div>
      </div>
    </div>
  );
}

function ListingsScene() {
  return (
    <>
      <div className={MARKET_SCENE_PAD}>
        <div className="flex h-full flex-col overflow-hidden rounded-[16px] bg-[#0a0a0a]">
          <div className="flex min-h-0 flex-1 flex-col justify-center gap-0.5 px-2.5 py-1.5">
            {BOOK_ASKS.map((row, i) => (
              <div
                key={`ask-${row.price}`}
                className="relative flex h-[22px] items-center justify-between overflow-hidden rounded-md px-1.5"
              >
              <span
                aria-hidden
                className="market-scale-depth market-scale-depth--right absolute inset-y-0 right-0"
                style={{ width: `${row.size}%`, animationDelay: `${i * 0.18}s`, backgroundColor: C.redSoft }}
              />
              <span className="relative font-mono text-[12px] tabular-nums" style={{ color: C.red }}>
                {row.price}
              </span>
              <span className="relative font-mono text-[11px] tabular-nums text-[#8a8f98]">{row.size}</span>
            </div>
          ))}

          <div className="market-scale-mid-pulse my-0.5 flex shrink-0 items-center justify-center gap-1.5 rounded-md bg-white/[0.04] py-1">
            <span className="size-1 rounded-full" style={{ backgroundColor: C.orange }} />
            <span className="font-mono text-[0.95rem] font-medium tracking-[-0.03em] text-white tabular-nums">
              22,10
            </span>
            <span className="text-[9px] uppercase tracking-[0.12em] text-[#62666d]">MD2145</span>
          </div>

          {BOOK_BIDS.map((row, i) => (
            <div
              key={`bid-${row.price}`}
              className="relative flex h-[22px] items-center justify-between overflow-hidden rounded-md px-1.5"
            >
              <span
                aria-hidden
                className="market-scale-depth absolute inset-y-0 left-0"
                style={{ width: `${row.size}%`, animationDelay: `${i * 0.18 + 0.35}s`, backgroundColor: C.greenSoft }}
              />
              <span className="relative font-mono text-[12px] tabular-nums" style={{ color: C.green }}>
                {row.price}
              </span>
              <span className="relative font-mono text-[11px] tabular-nums text-[#8a8f98]">{row.size}</span>
            </div>
          ))}
          </div>
          <MarketScaleHorizontalTape>
            {TAPE.map((t, i) => (
              <span
                key={`${t.price}-${t.side}-${i}`}
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] tabular-nums"
                style={
                  t.side === "buy"
                    ? { backgroundColor: C.greenSoft, color: C.green }
                    : { backgroundColor: C.redSoft, color: C.red }
                }
              >
                {t.side === "buy" ? "↑" : "↓"} {t.price}
                <span className="text-[#8a8f98]">×{t.qty}</span>
              </span>
            ))}
          </MarketScaleHorizontalTape>
        </div>
      </div>
    </>
  );
}

function ReleasesScene() {
  const releaseRows = DEMO_RELEASES.slice(0, 3);
  const accents = [C.red, C.orange, C.green] as const;
  return (
    <>
      <div className={MARKET_SCENE_PAD}>
        <div className={cn("relative h-full overflow-hidden rounded-[16px] bg-[#0a0a0a]")}>
          <MarketScaleVerticalMarquee>
            {releaseRows.map((row, i) => (
              <div
                key={`${row.symbol}-${i}`}
                className="flex shrink-0 items-center gap-2.5 rounded-[10px] bg-white/[0.04] p-1.5"
              >
                <div className="relative size-9 shrink-0 overflow-hidden rounded-[8px] bg-black">
                  <NextImage
                    src={row.cover}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="44px"
                  />
                  <span
                    aria-hidden
                    className="absolute bottom-1 left-1 size-2 rounded-full"
                    style={{ backgroundColor: accents[i % accents.length] }}
                  />
                </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-medium text-white">{row.title}</p>
                <p className="truncate text-[10px] text-[#8a8f98]">
                  {row.artist} · {row.symbol}
                </p>
              </div>
            </div>
            ))}
          </MarketScaleVerticalMarquee>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-[#0a0a0a] to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
        </div>
      </div>
    </>
  );
}

function RoundRing({
  pct,
  size,
  stroke,
  color,
  className,
}: {
  pct: number;
  size: number;
  stroke: number;
  color: string;
  className?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - pct / 100);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={className} aria-hidden>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth={stroke}
      />
      <circle
        className="market-scale-ring-draw"
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
}

function RoundsScene() {
  const featured = DEMO_ROUNDS[2]!;
  const palette = [C.orange, C.red, C.green, C.orange, C.red] as const;
  const chipSource = DEMO_ROUNDS.filter((r) => r.symbol !== featured.symbol).map((row, i) => ({
    row,
    color: palette[i % palette.length]!,
  }));
  const chips = chipSource;

  return (
    <>
      <div className={MARKET_SCENE_PAD}>
        <div className="flex h-full flex-col overflow-hidden rounded-[16px] bg-[#0a0a0a] pb-2 pt-2">
          <div className="flex shrink-0 flex-col items-center px-2">
            <div className="relative">
              <RoundRing pct={featured.pct} size={96} stroke={5} color={C.green} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="font-mono text-[1.25rem] font-medium leading-none tracking-[-0.04em] text-white tabular-nums">
                  {featured.pct}%
                </p>
                <p className="mt-0.5 text-[10px] text-[#8a8f98]">{featured.symbol}</p>
              </div>
            </div>
            <p className="mt-2 max-w-[160px] truncate text-center text-[12px] font-[510] text-white">
              {featured.title}
            </p>
          </div>

          <div className="relative mt-auto w-full">
            <MarketScaleHorizontalTape>
              {chips.map(({ row, color }, i) => (
                <div
                  key={`${row.symbol}-${i}`}
                  className="flex shrink-0 items-center gap-1.5 rounded-full bg-white/[0.04] px-2 py-1"
                >
                  <RoundRing pct={row.pct} size={22} stroke={2.5} color={color} />
                  <div className="min-w-0">
                    <p className="whitespace-nowrap text-[9px] font-medium text-[#d0d6e0]">{row.symbol}</p>
                    <p className="font-mono text-[9px] tabular-nums" style={{ color }}>
                      {row.pct}%
                    </p>
                  </div>
                </div>
              ))}
            </MarketScaleHorizontalTape>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-[#0a0a0a] to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-[#0a0a0a] to-transparent" />
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * Landing 2×2: demo wallet / scrolling listings / rounds / releases.
 */
export function DashboardMarketScale({ className }: { className?: string }) {
  const { t } = useI18n();
  const live = getWalletDataSource() === "live";
  const { authorizedFetch, isAuthenticated } = useAuth();
  const [metrics, setMetrics] = useState<PlatformMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<unknown>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setFetchError(null);

    const demoFallback: PlatformMetric[] = [
      {
        id: "wallet",
        value: "84 220 USDT",
        href: ROUTES.dashboardOverview,
        walletAvailable: "2 640,00 USDT",
        volume24h: "84 220 USDT",
      },
      { id: "listings", value: "24", href: ROUTES.dashboardSecondaryMarket },
      { id: "releases", value: "7", href: ROUTES.dashboardCatalog },
      { id: "rounds", value: "3", href: ROUTES.dashboardCatalog },
    ];

    if (!live) {
      setMetrics(demoFallback);
      setLoading(false);
      return;
    }

    void (async () => {
      try {
        const [overview, catalog, wallet] = await Promise.all([
          fetchMarketOverviewList({ sort: "activity", sortDir: "desc" }),
          fetchCatalogStats(),
          isAuthenticated ? fetchWalletSummary(authorizedFetch).catch(() => null) : Promise.resolve(null),
        ]);
        if (cancelled) return;

        const volume24h = formatUsdt(overview.aggregate.totalVolume24hUsdt);
        const available = wallet ? formatUsdt(wallet.availableBalance) : null;

        setMetrics([
          {
            id: "wallet",
            value: volume24h,
            href: ROUTES.dashboardOverview,
            walletAvailable: available ?? undefined,
            volume24h,
          },
          {
            id: "listings",
            value: catalog.activeSecondaryListings.toLocaleString("ru-RU"),
            href: ROUTES.dashboardSecondaryMarket,
          },
          {
            id: "releases",
            value: catalog.publicReleases.toLocaleString("ru-RU"),
            href: ROUTES.dashboardCatalog,
          },
          {
            id: "rounds",
            value: catalog.livePrimaryRounds.toLocaleString("ru-RU"),
            href: ROUTES.dashboardCatalog,
          },
        ]);
      } catch (err) {
        if (!cancelled) {
          setMetrics([]);
          setFetchError(err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authorizedFetch, isAuthenticated, live, tick]);

  return (
    <section
      id="holdings"
      className={cn("scroll-mt-24 w-full max-w-full bg-black", className)}
      aria-labelledby="dash-market-scale-heading"
    >
      <div className="mx-auto w-full min-w-0 max-w-[1200px] px-4 py-10 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <LandingReveal>
          <div className="mb-8 max-w-2xl sm:mb-10 lg:mb-12">
            <h2
              id="dash-market-scale-heading"
              className="text-3xl font-medium tracking-[-0.022em] text-white md:text-4xl lg:text-[2.75rem] lg:leading-[1.08] [font-feature-settings:'cv01'_on,'ss03'_on,'zero'_on]"
            >
              {t("dashboard.marketScale.title")}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[#8a8f98] md:text-base md:leading-7">
              {t("dashboard.marketScale.lead")}
            </p>
          </div>
        </LandingReveal>

        {fetchError && metrics.length === 0 ? (
          <ReadOnlySectionError
            sectionId="dashboard-landing-stats"
            error={fetchError}
            onRetry={() => setTick((n) => n + 1)}
            retryLabel={t("dashboard.stats.retry")}
            variant="dark"
          />
        ) : (
          <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            {(
              [
                { id: "wallet" as const, titleKey: "dashboard.marketScale.card.wallet" },
                { id: "listings" as const, titleKey: "dashboard.marketScale.card.listings" },
                { id: "rounds" as const, titleKey: "dashboard.marketScale.card.rounds" },
                { id: "releases" as const, titleKey: "dashboard.marketScale.card.releases" },
              ] as const
            ).map((card, cardIndex) => {
              const metric = metrics.find((m) => m.id === card.id);
              return (
                <LandingReveal key={card.id} delay={cardIndex * 0.07} className="min-w-0 w-full">
                <article className={MARKET_CARD_CLASS}>
                  <div className={MARKET_BODY_CLASS}>
                    {loading || !metric ? (
                      <div className="h-full animate-pulse bg-white/[0.03]" />
                    ) : card.id === "wallet" ? (
                      <WalletScene
                        available={metric.walletAvailable ?? "—"}
                        volume24h={metric.volume24h ?? metric.value}
                      />
                    ) : card.id === "listings" ? (
                      <ListingsScene />
                    ) : card.id === "releases" ? (
                      <ReleasesScene />
                    ) : (
                      <RoundsScene />
                    )}
                  </div>
                  <p
                    className={cn(
                      MARKET_STAT_CLASS,
                      card.id === "wallet" && "invisible",
                    )}
                    aria-hidden={card.id === "wallet"}
                  >
                    {metric?.value ?? "—"}
                  </p>
                  <div className="mt-auto flex shrink-0 items-center justify-between gap-3 px-4 pb-3.5 pt-1 sm:px-5 sm:pb-4">
                    <p className="text-[15px] font-[510] tracking-[-0.014em] text-[#a1a1aa]">
                      {t(card.titleKey)}
                    </p>
                    <Link
                      href={metric?.href ?? ROUTES.dashboardSecondaryMarket}
                      className="inline-flex items-center gap-1 text-[14px] font-[510] tracking-[-0.011em] text-[#71717a] transition group-hover:text-white"
                    >
                      {t("dashboard.marketScale.explore")}
                      <ArrowRight className="size-3.5" strokeWidth={1.75} aria-hidden />
                    </Link>
                  </div>
                </article>
                </LandingReveal>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}