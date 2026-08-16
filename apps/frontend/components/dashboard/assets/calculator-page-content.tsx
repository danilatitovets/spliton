"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";

import {
  assetsCardClass,
  assetsMutedCardClass,
} from "@/components/dashboard/assets/assets-ui";
import { useI18n } from "@/components/providers/i18n-provider";
import { UntMark, UsdtMark } from "@/components/shared/asset-marks";
import { ProductDemoBanner } from "@/components/shared/product-demo-banner";
import { SplitonCtaPill } from "@/components/ui/spliton-cta-pill";
import { ROUTES } from "@/constants/routes";
import { CALCULATOR_MOCK } from "@/constants/calculator-mock";
import { useCalculatorConfig } from "@/hooks/use-calculator-config";
import { usePublicPlatformFees } from "@/hooks/use-public-platform-fees";
import { formatDate, formatNumber, formatUsdtAmount } from "@/lib/i18n/formatters";
import { tf } from "@/lib/i18n/widget-messages";
import {
  computeEducationalPrimaryBuy,
  computeSecondaryTrade,
} from "@/lib/market/pricing-calculator";
import { isLiveServicesEnabled } from "@/lib/public-env";
import { pctToRate } from "@/services/platform-fees.service";
import type { CalculatorConfig } from "@/services/calculator.service";
import { cn } from "@/lib/utils";

type CalcTab = "buy" | "sell" | "withdraw";

function parsePositiveNumber(raw: string): number | null {
  const cleaned = raw.replace(/\s/g, "").replace(",", ".").trim();
  if (cleaned === "") return null;
  const n = Number.parseFloat(cleaned);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

const chipBase = "shrink-0 rounded-full px-3.5 py-2 text-[13px] font-medium transition-colors";
const chipActive = "bg-neutral-900 text-white";
const chipIdle = "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900";

const inputClass = cn(
  "h-12 w-full rounded-full bg-white px-4 font-mono text-base font-medium tabular-nums text-neutral-900",
  "placeholder:font-sans placeholder:text-sm placeholder:text-neutral-400 outline-none",
  "transition-[background-color,box-shadow] duration-200",
  "focus:shadow-[0_0_0_3px_rgba(0,0,0,0.06)]",
);

const CTA_VIDEO = "/videos/position-holding-bg.mp4";
const TEXTURE = "/images/landing/footer-spliton-texture-fill-bw.png";

const CALC_TABS: { id: CalcTab; labelKey: string }[] = [
  { id: "buy", labelKey: "calculator.tab.buy" },
  { id: "sell", labelKey: "calculator.tab.sell" },
  { id: "withdraw", labelKey: "calculator.tab.withdraw" },
];

export function CalculatorPageContent() {
  const { t, locale } = useI18n();
  const fmtUsdt = (n: number) => formatUsdtAmount(n, locale).replace(" USDT", "");
  const fmtNum = (n: number) => formatNumber(n, locale);
  const pct = (rate: number) =>
    `${(rate * 100).toLocaleString(locale, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}%`;

  const servicesLive = isLiveServicesEnabled();
  const { config, loading: configLoading, error: configError, reload: reloadConfig } = useCalculatorConfig();
  const { fees, loading: feesLoading, error: feesError, reload: reloadFees } = usePublicPlatformFees();

  const rates = useMemo(() => {
    const fromConfig = calculatorConfigFees(config);
    if (fromConfig) return { ...fromConfig, fromLive: true as const };
    if (servicesLive && fees) {
      return {
        buyPlatformFeeRate: pctToRate(fees.primaryPurchaseFeePct),
        secondaryMarketFeeRate: pctToRate(fees.secondaryMarketFeePct),
        withdrawFeeMinUsdt: Number(fees.withdrawalFeeFixedUsdt) || CALCULATOR_MOCK.withdrawFeeMinUsdt,
        withdrawFeeRate: pctToRate(fees.withdrawalFeePct),
        effectiveFrom: fees.effectiveFrom,
        fromLive: true as const,
      };
    }
    if (servicesLive) return null;
    return {
      buyPlatformFeeRate: CALCULATOR_MOCK.buyPlatformFeeRate,
      secondaryMarketFeeRate: CALCULATOR_MOCK.secondaryMarketFeeRate,
      withdrawFeeMinUsdt: CALCULATOR_MOCK.withdrawFeeMinUsdt,
      withdrawFeeRate: CALCULATOR_MOCK.withdrawFeeRate,
      effectiveFrom: null as string | null,
      fromLive: false as const,
    };
  }, [config, fees, servicesLive]);

  const [tab, setTab] = useState<CalcTab>("buy");
  const [buyMode, setBuyMode] = useState<"usdt" | "units">("usdt");
  const [buyUsdt, setBuyUsdt] = useState("1000");
  const [buyUnits, setBuyUnits] = useState("80");
  const [buyPrice, setBuyPrice] = useState(String(CALCULATOR_MOCK.defaultPricePerUnitUsdt));
  const [sellUnits, setSellUnits] = useState("50");
  const [sellPrice, setSellPrice] = useState(String(CALCULATOR_MOCK.defaultPricePerUnitUsdt));
  const [withdrawAmount, setWithdrawAmount] = useState("500");

  const defaultRelease = config?.releases[0];
  useEffect(() => {
    if (!servicesLive || !defaultRelease) return;
    const price = defaultRelease.pricePerUnitUsdt;
    setBuyPrice(price);
    setSellPrice(price);
  }, [defaultRelease, servicesLive]);

  const buyPriceN = parsePositiveNumber(buyPrice) ?? (servicesLive ? null : CALCULATOR_MOCK.defaultPricePerUnitUsdt);
  const sellPriceN = parsePositiveNumber(sellPrice) ?? (servicesLive ? null : CALCULATOR_MOCK.defaultPricePerUnitUsdt);
  const platformFeeRate = rates?.buyPlatformFeeRate ?? 0;
  const secondaryFeeRate = rates?.secondaryMarketFeeRate ?? 0;

  const buyCalc = useMemo(() => {
    if (buyPriceN == null || buyPriceN <= 0) return null;
    const feePct = platformFeeRate * 100;
    if (buyMode === "usdt") {
      const budget = parsePositiveNumber(buyUsdt);
      if (budget === null || budget === 0) return null;
      return computeEducationalPrimaryBuy({
        mode: "usdt",
        budgetUsdt: budget,
        unitPrice: buyPriceN,
        feePct,
      });
    }
    const units = parsePositiveNumber(buyUnits);
    if (units === null || units === 0) return null;
    return computeEducationalPrimaryBuy({
      mode: "units",
      unitsInput: units,
      unitPrice: buyPriceN,
      feePct,
    });
  }, [buyMode, buyUsdt, buyUnits, buyPriceN, platformFeeRate]);

  const sellCalc = useMemo(() => {
    const units = parsePositiveNumber(sellUnits);
    if (units === null || units === 0 || sellPriceN == null || sellPriceN <= 0) return null;
    const feePct = secondaryFeeRate * 100;
    const quote = computeSecondaryTrade({ unitPrice: sellPriceN, units, feePct });
    if (!quote) return null;
    return {
      units,
      gross: quote.grossAmount,
      fee: quote.feeAmount,
      net: quote.sellerNet,
      pricePerUnit: sellPriceN,
    };
  }, [sellUnits, sellPriceN, secondaryFeeRate]);

  const withdrawCalc = useMemo(() => {
    const amount = parsePositiveNumber(withdrawAmount);
    if (amount === null || amount === 0 || !rates) return null;
    const fee = Math.max(rates.withdrawFeeMinUsdt, amount * rates.withdrawFeeRate);
    const net = amount - fee;
    return { amount, fee, net };
  }, [withdrawAmount, rates]);

  const unavailable = servicesLive && !configLoading && (!config || Boolean(configError) || !rates);

  if (configLoading && servicesLive) {
    return (
      <div className="space-y-4">
        <div className="h-14 animate-pulse rounded-2xl bg-neutral-100" />
        <div className="h-72 animate-pulse rounded-2xl bg-neutral-100" />
      </div>
    );
  }

  if (unavailable) {
    return (
      <div className="rounded-2xl bg-rose-50 px-6 py-10 text-center">
        <p className="text-sm font-medium text-rose-900">{t("calculator.unavailable.title")}</p>
        <p className="mt-2 text-sm text-rose-700/80">{configError ?? feesError ?? t("calculator.unavailable.subtitle")}</p>
        <button
          type="button"
          onClick={() => {
            void reloadConfig();
            void reloadFees();
          }}
          className={cn(chipBase, chipIdle, "mt-4")}
        >
          {t("calculator.unavailable.retry")}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-8 sm:space-y-5">
      {!servicesLive ? <ProductDemoBanner messageKey="calculator.demoBanner" /> : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(260px,0.9fr)] lg:items-stretch">
        <section className={cn(assetsCardClass, "sm:py-6")}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {CALC_TABS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={cn(chipBase, tab === item.id ? chipActive : chipIdle)}
                >
                  {t(item.labelKey)}
                </button>
              ))}
            </div>
            {rates ? (
              <p className="inline-flex shrink-0 items-center gap-2 rounded-full bg-neutral-950 px-3.5 py-2 text-white shadow-[0_1px_0_rgba(255,255,255,0.12)_inset]">
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/55">
                  {tab === "buy"
                    ? t("calculator.buy.feePlatform")
                    : tab === "sell"
                      ? t("calculator.sell.feeSecondary")
                      : t("calculator.tab.withdraw")}
                </span>
                <span className="font-mono text-[13px] font-semibold tabular-nums tracking-tight">
                  {tab === "buy"
                    ? pct(platformFeeRate)
                    : tab === "sell"
                      ? pct(secondaryFeeRate)
                      : `max(${rates.withdrawFeeMinUsdt}; ${pct(rates.withdrawFeeRate)})`}
                </span>
              </p>
            ) : null}
          </div>

          {servicesLive && feesLoading ? (
            <p className="mt-3 text-xs text-neutral-500">{t("calculator.feesLoading")}</p>
          ) : null}

          {tab === "buy" ? (
            <div className="mt-6">
              <div className="inline-flex gap-1 rounded-full bg-neutral-100 p-1">
                {(
                  [
                    { id: "usdt" as const, label: t("calculator.buy.modeUsdt") },
                    { id: "units" as const, label: t("calculator.buy.modeUnits") },
                  ] as const
                ).map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => setBuyMode(o.id)}
                    className={cn(
                      chipBase,
                      buyMode === o.id ? chipActive : "bg-transparent text-neutral-600 hover:text-neutral-900",
                    )}
                  >
                    {o.label}
                  </button>
                ))}
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <Field
                  id="calc-buy-primary"
                  label={buyMode === "usdt" ? t("calculator.buy.payAmount") : t("calculator.buy.unitsToBuy")}
                  value={buyMode === "usdt" ? buyUsdt : buyUnits}
                  onChange={buyMode === "usdt" ? setBuyUsdt : setBuyUnits}
                  suffix={buyMode === "usdt" ? <UsdtMark /> : <UntMark />}
                  suffixLabel={buyMode === "usdt" ? "USDT" : "UNT"}
                />
                <Field
                  id="calc-buy-price"
                  label={t("calculator.buy.priceLabel")}
                  value={buyPrice}
                  onChange={setBuyPrice}
                  suffix={<UntMark />}
                  suffixLabel="USDT / UNT"
                />
              </div>

              {buyCalc ? (
                <ResultRows
                  rows={[
                    { label: t("calculator.buy.statPrice"), value: `${fmtUsdt(buyCalc.pricePerUnit)} USDT` },
                    { label: t("calculator.buy.feePlatform"), value: `${fmtUsdt(buyCalc.feeAmount)} USDT` },
                    { label: t("calculator.buy.feeTotal"), value: `${fmtUsdt(buyCalc.totalPaid)} USDT`, strong: true },
                  ]}
                  footnote={t("calculator.buy.primaryCheckoutNote")}
                />
              ) : (
                <EmptyState message={t("calculator.buy.empty")} />
              )}
            </div>
          ) : null}

          {tab === "sell" ? (
            <div className="mt-6">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  id="calc-sell-units"
                  label={t("calculator.sell.unitsLabel")}
                  value={sellUnits}
                  onChange={setSellUnits}
                  suffix={<UntMark />}
                  suffixLabel="UNT"
                />
                <Field
                  id="calc-sell-price"
                  label={t("calculator.sell.priceLabel")}
                  value={sellPrice}
                  onChange={setSellPrice}
                  suffix={<UntMark />}
                  suffixLabel="USDT / UNT"
                />
              </div>

              {sellCalc ? (
                <ResultRows
                  rows={[
                    { label: t("calculator.sell.gross"), value: `${fmtUsdt(sellCalc.gross)} USDT` },
                    { label: t("calculator.sell.feeSecondary"), value: `− ${fmtUsdt(sellCalc.fee)} USDT` },
                    { label: t("calculator.sell.net"), value: `${fmtUsdt(sellCalc.net)} USDT`, strong: true },
                  ]}
                />
              ) : (
                <EmptyState message={t("calculator.sell.empty")} />
              )}
            </div>
          ) : null}

          {tab === "withdraw" ? (
            <div className="mt-6">
              <div className="max-w-md">
                <Field
                  id="calc-withdraw-amount"
                  label={t("calculator.withdraw.amountLabel")}
                  value={withdrawAmount}
                  onChange={setWithdrawAmount}
                  suffix={<UsdtMark />}
                  suffixLabel="USDT"
                />
              </div>

              {withdrawCalc ? (
                <ResultRows
                  rows={[
                    { label: t("calculator.withdraw.amountLabel"), value: `${fmtUsdt(withdrawCalc.amount)} USDT` },
                    { label: t("calculator.withdraw.fee"), value: `− ${fmtUsdt(withdrawCalc.fee)} USDT` },
                    {
                      label: t("calculator.withdraw.toAddress"),
                      value: `${fmtUsdt(withdrawCalc.net)} USDT`,
                      strong: true,
                    },
                  ]}
                />
              ) : (
                <EmptyState message={t("calculator.withdraw.empty")} />
              )}
              <p className="mt-3 text-xs text-neutral-500">{t("calculator.withdraw.networkNote")}</p>
            </div>
          ) : null}

          {rates?.fromLive && rates.effectiveFrom ? (
            <p className="mt-6 text-[12px] font-medium tracking-wide text-neutral-400">
              {tf(t("calculator.product.feesUpdated"), { date: formatDate(rates.effectiveFrom, locale) })}
            </p>
          ) : null}

          <p className="mt-3 max-w-xl text-[13px] leading-6 text-neutral-500">{t("calculator.disclaimer")}</p>
        </section>

        <ResultHero
          tab={tab}
          buyCalc={buyCalc}
          sellCalc={sellCalc}
          withdrawCalc={withdrawCalc}
          fmtNum={fmtNum}
          fmtUsdt={fmtUsdt}
          t={t}
        />
      </div>

      {rates ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <article className={cn(assetsMutedCardClass, "px-4 py-4")}>
            <p className="text-[12px] text-neutral-500">{t("calculator.tab.buy")}</p>
            <p className="mt-2 font-mono text-lg font-semibold tabular-nums tracking-tight text-neutral-900 sm:text-xl">
              {pct(rates.buyPlatformFeeRate)}
            </p>
          </article>
          <article className={cn(assetsMutedCardClass, "px-4 py-4")}>
            <p className="text-[12px] text-neutral-500">{t("calculator.tab.sell")}</p>
            <p className="mt-2 font-mono text-lg font-semibold tabular-nums tracking-tight text-neutral-900 sm:text-xl">
              {pct(rates.secondaryMarketFeeRate)}
            </p>
          </article>
          <article className={cn(assetsMutedCardClass, "px-4 py-4")}>
            <p className="text-[12px] text-neutral-500">{t("calculator.tab.withdraw")}</p>
            <p className="mt-2 font-mono text-lg font-semibold tabular-nums tracking-tight text-neutral-900 sm:text-xl">
              {pct(rates.withdrawFeeRate)}
            </p>
          </article>
        </div>
      ) : null}

      <article className="relative isolate overflow-hidden rounded-[1.35rem] bg-black shadow-[inset_0_0_0_1px_rgba(255,255,255,0.14)] sm:rounded-[1.75rem]">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <video
            className="absolute inset-0 h-full w-full scale-105 object-cover motion-reduce:hidden"
            src={CTA_VIDEO}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          />
          <div className="absolute inset-0 bg-black/55 motion-reduce:bg-black" />
        </div>

        <div className="relative z-10 flex flex-col gap-5 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-7 sm:py-8">
          <div className="min-w-0 max-w-xl">
            <p className="text-base font-semibold text-white sm:text-lg">{t("calculator.product.ctaCatalog")}</p>
            <p className="mt-1 text-sm text-white/55">{t("calculator.disclaimer")}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <SplitonCtaPill
              href={ROUTES.dashboardCatalog}
              tone="onDark"
              variant="accent"
              className="h-10 min-w-0 px-4 text-[13px]"
            >
              {t("calculator.product.ctaCatalog")}
            </SplitonCtaPill>
            <Link
              href={ROUTES.dashboardSecondaryMarket}
              className="inline-flex h-10 items-center rounded-full px-4 text-[13px] font-medium text-white/80 transition hover:bg-white/[0.08] hover:text-white"
            >
              {t("calculator.product.ctaSecondary")} →
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}

function ResultHero({
  tab,
  buyCalc,
  sellCalc,
  withdrawCalc,
  fmtNum,
  fmtUsdt,
  t,
}: {
  tab: CalcTab;
  buyCalc: { units: number; totalPaid: number } | null;
  sellCalc: { net: number; gross: number; fee: number } | null;
  withdrawCalc: { amount: number; fee: number; net: number } | null;
  fmtNum: (n: number) => string;
  fmtUsdt: (n: number) => string;
  t: (key: string, fallback?: string) => string;
}) {
  let headline = "—";
  let subline = t("calculator.buy.empty");
  let unit = "";

  if (tab === "buy" && buyCalc) {
    headline = fmtNum(buyCalc.units);
    subline = tf(t("calculator.summary.toPay"), { amount: fmtUsdt(buyCalc.totalPaid) });
    unit = "UNT";
  } else if (tab === "sell" && sellCalc) {
    headline = fmtUsdt(sellCalc.net);
    subline = t("calculator.sell.net");
    unit = "USDT";
  } else if (tab === "withdraw" && withdrawCalc) {
    headline = fmtUsdt(withdrawCalc.net);
    subline = t("calculator.withdraw.toAddress");
    unit = "USDT";
  } else if (tab === "sell") {
    subline = t("calculator.sell.empty");
  } else if (tab === "withdraw") {
    subline = t("calculator.withdraw.empty");
  }

  return (
    <section
      className="relative isolate flex min-h-[240px] flex-col justify-between overflow-hidden rounded-[1.35rem] bg-black px-5 py-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)] sm:rounded-[1.75rem] sm:px-6 sm:py-6"
      aria-live="polite"
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `url('${TEXTURE}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: 0.72,
        }}
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 bg-black/50" aria-hidden />

      <div className="relative z-10">
        <p className="text-[13px] font-medium text-white/55">{subline}</p>
        <p className="mt-3 font-mono text-[2rem] font-semibold leading-none tracking-tight text-white sm:text-[2.5rem]">
          {headline}
          {unit ? <span className="ml-2 text-[1rem] font-medium text-white/45 sm:text-[1.15rem]">{unit}</span> : null}
        </p>
      </div>

      <div className="relative z-10 mt-6 flex flex-wrap gap-2">
        <SplitonCtaPill
          href={ROUTES.dashboardCatalog}
          tone="onDark"
          variant="accent"
          className="h-10 min-w-0 px-4 text-[13px]"
        >
          {t("calculator.product.ctaCatalog")}
        </SplitonCtaPill>
        <SplitonCtaPill
          href={ROUTES.fees}
          tone="onDark"
          variant="ghost"
          withArrow={false}
          className="h-10 min-w-0 px-4 text-[13px]"
        >
          {t("calculator.product.ctaFees")}
        </SplitonCtaPill>
      </div>
    </section>
  );
}

function calculatorConfigFees(config: CalculatorConfig | null) {
  if (!config?.fees) return null;
  const f = config.fees;
  return {
    buyPlatformFeeRate: pctToRate(f.primaryPurchaseFeePct),
    secondaryMarketFeeRate: pctToRate(f.secondaryMarketFeePct),
    withdrawFeeMinUsdt: Number(f.withdrawalFeeFixedUsdt) || CALCULATOR_MOCK.withdrawFeeMinUsdt,
    withdrawFeeRate: pctToRate(f.withdrawalFeePct),
    effectiveFrom: f.effectiveFrom,
  };
}

function Field({
  id,
  label,
  value,
  onChange,
  suffix,
  suffixLabel,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  suffix: ReactNode;
  suffixLabel: string;
}) {
  return (
    <div className={cn(assetsMutedCardClass, "px-4 py-4")}>
      <label htmlFor={id} className="text-[13px] font-medium text-neutral-600">
        {label}
      </label>
      <input
        id={id}
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(inputClass, "mt-2")}
      />
      <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500">
        {suffix}
        <span>{suffixLabel}</span>
      </p>
    </div>
  );
}

function ResultRows({
  rows,
  footnote,
}: {
  rows: { label: string; value: string; strong?: boolean }[];
  footnote?: string;
}) {
  const detailRows = rows.filter((row) => !row.strong);
  const totalRow = rows.find((row) => row.strong);

  return (
    <div className="mt-6">
      {detailRows.length > 0 ? (
        <div className="divide-y divide-neutral-100">
          {detailRows.map((row) => (
            <div key={row.label} className="flex items-baseline justify-between gap-4 py-3 first:pt-0">
              <span className="text-[13px] leading-5 text-neutral-500">{row.label}</span>
              <span className="font-mono text-[13px] font-medium tabular-nums tracking-tight text-neutral-800">
                {row.value}
              </span>
            </div>
          ))}
        </div>
      ) : null}

      {totalRow ? (
        <div
          className={cn(
            "flex flex-col gap-1.5 sm:flex-row sm:items-end sm:justify-between sm:gap-6",
            detailRows.length > 0 ? "mt-4 border-t border-neutral-200 pt-5" : "",
          )}
        >
          <span className="text-[12px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
            {totalRow.label}
          </span>
          <span className="font-mono text-[1.75rem] font-semibold leading-none tracking-tight text-neutral-950 sm:text-[2rem]">
            {totalRow.value}
          </span>
        </div>
      ) : null}

      {footnote ? (
        <p className="mt-4 max-w-prose text-[12px] leading-5 text-neutral-400">{footnote}</p>
      ) : null}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <p className={cn(assetsMutedCardClass, "mt-6 px-4 py-8 text-center text-sm text-neutral-500")}>{message}</p>
  );
}
