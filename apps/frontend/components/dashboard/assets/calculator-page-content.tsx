"use client";

import { ArrowLeftRight } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CALCULATOR_MOCK } from "@/constants/calculator-mock";
import { cn } from "@/lib/utils";

const USDT_FMT = new Intl.NumberFormat("ru-RU", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const NUM_FMT = new Intl.NumberFormat("ru-RU", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 6,
});

function parsePositiveNumber(raw: string): number | null {
  const cleaned = raw.replace(/\s/g, "").replace(",", ".").trim();
  if (cleaned === "") return null;
  const n = Number.parseFloat(cleaned);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

type TabId = "buy" | "sell" | "withdraw" | "payout";

const TABS: { id: TabId; label: string }[] = [
  { id: "buy", label: "Покупка" },
  { id: "sell", label: "Продажа" },
  { id: "withdraw", label: "Вывод" },
  { id: "payout", label: "Начисление" },
];

const BENEFIT_CARDS = [
  {
    title: "Иллюстративные сценарии",
    text: "Все суммы — ориентиры до подключения к боевым тарифам и округлениям.",
  },
  {
    title: "Прозрачные строки",
    text: "Комиссия, gross и net разнесены так же, как в превью операции перед подтверждением.",
  },
  {
    title: "USDT · TRC20",
    text: "Вывод и пополнение считаются в стейблкоине; сеть указываем там, где это важно.",
  },
  {
    title: "Без обещаний дохода",
    text: "Блок начислений — только пример распределения по введённым значениям.",
  },
] as const;

/** Крупные числа: градиент / акцент как на метриках и портфеле профиля. */
function CalcDisplay({
  value,
  suffix,
  tone,
  size = "lg",
}: {
  value: string;
  suffix?: string;
  tone: "primary" | "units" | "fee" | "neutral";
  size?: "lg" | "xl";
}) {
  const sizeCls = size === "xl" ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl";
  const toneCls =
    tone === "primary"
      ? "bg-gradient-to-br from-blue-800 via-blue-700 to-indigo-700 bg-clip-text text-transparent"
      : tone === "units"
        ? "bg-gradient-to-br from-emerald-800 via-teal-700 to-cyan-700 bg-clip-text text-transparent"
        : tone === "fee"
          ? "text-neutral-600"
          : "text-neutral-900";

  return (
    <span
      className={cn(
        "font-mono font-semibold tabular-nums tracking-tight [font-feature-settings:'tnum','lnum']",
        sizeCls,
        toneCls,
      )}
    >
      {value}
      {suffix ? <span className="text-[0.65em] font-medium text-neutral-500">{suffix}</span> : null}
    </span>
  );
}

function StatTile({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl bg-neutral-50 px-4 py-4 sm:px-5 sm:py-5", className)}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">{label}</p>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function FeeLine({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <span className={cn("text-sm", muted ? "text-neutral-500" : "text-neutral-600")}>{label}</span>
      <span className="font-mono text-sm font-medium tabular-nums text-neutral-900">{value}</span>
    </div>
  );
}

function Segment({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { id: string; label: string }[];
}) {
  return (
    <div className="inline-flex rounded-xl bg-neutral-100/90 p-1">
      {options.map((o) => {
        const on = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            className={cn(
              "rounded-lg px-3 py-2 text-xs font-semibold transition-all sm:text-[13px]",
              on ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-600 hover:text-neutral-900",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

const inputClass =
  "h-12 rounded-xl border-0 bg-white text-lg font-mono font-medium tabular-nums text-neutral-900 shadow-none ring-1 ring-neutral-200/80 transition-[box-shadow,ring-color] placeholder:text-neutral-400 placeholder:font-sans placeholder:text-sm focus-visible:ring-2 focus-visible:ring-blue-500/35 focus-visible:outline-none";

export function CalculatorPageContent() {
  const [tab, setTab] = useState<TabId>("buy");

  const [buyMode, setBuyMode] = useState<"usdt" | "units">("usdt");
  const [buyUsdt, setBuyUsdt] = useState("1000");
  const [buyUnits, setBuyUnits] = useState("80");
  const [buyPrice, setBuyPrice] = useState(String(CALCULATOR_MOCK.defaultPricePerUnitUsdt));

  const [sellUnits, setSellUnits] = useState("50");
  const [sellPrice, setSellPrice] = useState("14");

  const [withdrawAmount, setWithdrawAmount] = useState("500");

  const [payoutUnits, setPayoutUnits] = useState("10000");
  const [payoutPool, setPayoutPool] = useState("25000");
  const [payoutTotalUnits, setPayoutTotalUnits] = useState(String(CALCULATOR_MOCK.defaultTotalUnitsOutstanding));

  const buyPriceN = parsePositiveNumber(buyPrice) ?? CALCULATOR_MOCK.defaultPricePerUnitUsdt;
  const feeRate = CALCULATOR_MOCK.buyPlatformFeeRate;

  const buyCalc = useMemo(() => {
    if (buyPriceN <= 0) return null;
    if (buyMode === "usdt") {
      const total = parsePositiveNumber(buyUsdt);
      if (total === null || total === 0) return null;
      const platformFee = total * feeRate;
      const effective = total - platformFee;
      const units = effective / buyPriceN;
      return { total, platformFee, effective, units, pricePerUnit: buyPriceN };
    }
    const units = parsePositiveNumber(buyUnits);
    if (units === null || units === 0) return null;
    const effective = units * buyPriceN;
    const total = effective / (1 - feeRate);
    const platformFee = total - effective;
    return { total, platformFee, effective, units, pricePerUnit: buyPriceN };
  }, [buyMode, buyUsdt, buyUnits, buyPriceN, feeRate]);

  const sellCalc = useMemo(() => {
    const u = parsePositiveNumber(sellUnits);
    const p = parsePositiveNumber(sellPrice);
    if (u === null || p === null || u === 0) return null;
    const gross = u * p;
    const secondaryFee = gross * CALCULATOR_MOCK.secondaryMarketFeeRate;
    const net = gross - secondaryFee;
    return { gross, secondaryFee, net };
  }, [sellUnits, sellPrice]);

  const withdrawCalc = useMemo(() => {
    const amount = parsePositiveNumber(withdrawAmount);
    if (amount === null || amount === 0) return null;
    const pctFee = amount * CALCULATOR_MOCK.withdrawFeeRate;
    const fee = Math.max(CALCULATOR_MOCK.withdrawFeeMinUsdt, pctFee);
    const finalAmount = Math.max(0, amount - fee);
    return { amount, fee, finalAmount };
  }, [withdrawAmount]);

  const payoutCalc = useMemo(() => {
    const u = parsePositiveNumber(payoutUnits);
    const pool = parsePositiveNumber(payoutPool);
    const totalU = parsePositiveNumber(payoutTotalUnits);
    if (u === null || pool === null || totalU === null || totalU === 0) return null;
    const share = u / totalU;
    const estimated = pool * share;
    return { estimated, share };
  }, [payoutUnits, payoutPool, payoutTotalUnits]);

  function resetBuy() {
    setBuyMode("usdt");
    setBuyUsdt("1000");
    setBuyUnits("80");
    setBuyPrice(String(CALCULATOR_MOCK.defaultPricePerUnitUsdt));
  }

  function resetSell() {
    setSellUnits("50");
    setSellPrice("14");
  }

  function resetWithdraw() {
    setWithdrawAmount("500");
  }

  function resetPayout() {
    setPayoutUnits("10000");
    setPayoutPool("25000");
    setPayoutTotalUnits(String(CALCULATOR_MOCK.defaultTotalUnitsOutstanding));
  }

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* Tabs — как сегмент на метриках, без нижней границы панели */}
      <div className="sticky top-[52px] z-40 -mx-4 bg-[#f6f7f9]/95 px-4 pb-3 backdrop-blur-sm sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <nav
          aria-label="Разделы калькулятора"
          className="mx-auto flex max-w-[1320px] flex-wrap gap-2 rounded-2xl bg-neutral-100/90 p-1.5"
        >
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  "min-h-9 flex-1 rounded-xl px-3 py-2 text-center text-xs font-semibold transition-all sm:flex-none sm:px-4 sm:text-[13px]",
                  active ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-600 hover:text-neutral-900",
                )}
              >
                {t.label}
              </button>
            );
          })}
        </nav>
      </div>

      {tab === "buy" ? (
        <section className="scroll-mt-28 space-y-6" aria-labelledby="calc-buy-title">
          <div className="rounded-3xl bg-white px-5 py-7 sm:px-8 sm:py-9">
            <div className="space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">Калькулятор · Покупка</p>
              <h2 id="calc-buy-title" className="text-xl font-semibold tracking-tight text-neutral-900 sm:text-2xl">
                Покупка UNT
              </h2>
              <p className="max-w-2xl text-sm text-neutral-500">
                Оцените платёж в USDT (TRC20), комиссию платформы и объём UNT при вашей цене за UNT.
              </p>
            </div>

            <div className="mt-8 space-y-4">
              <Segment
                value={buyMode}
                onChange={(v) => setBuyMode(v as "usdt" | "units")}
                options={[
                  { id: "usdt", label: "Сумма USDT" },
                  { id: "units", label: "Кол-во UNT" },
                ]}
              />
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_auto_1fr] lg:items-stretch">
              <div className="rounded-2xl bg-neutral-50 p-5 sm:p-6">
                <Label htmlFor="buy-primary" className="text-xs font-medium text-neutral-500">
                  {buyMode === "usdt" ? "Сумма к оплате" : "UNT к покупке"}
                </Label>
                <Input
                  id="buy-primary"
                  inputMode="decimal"
                  value={buyMode === "usdt" ? buyUsdt : buyUnits}
                  onChange={(e) => (buyMode === "usdt" ? setBuyUsdt(e.target.value) : setBuyUnits(e.target.value))}
                  className={cn(inputClass, "mt-3 w-full")}
                  placeholder={buyMode === "usdt" ? "0,00" : "0"}
                />
                {buyMode === "usdt" ? (
                  <p className="mt-2 text-xs text-neutral-500">USDT · вводите сумму с учётом желаемого объёма покупки</p>
                ) : (
                  <p className="mt-2 text-xs text-neutral-500">Количество UNT к зачислению после комиссии</p>
                )}
              </div>

              <div className="flex items-center justify-center py-2 lg:min-h-[120px] lg:py-0">
                <span className="flex size-11 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
                  <ArrowLeftRight className="size-5" aria-hidden />
                </span>
              </div>

              <div className="rounded-2xl bg-neutral-50 p-5 sm:p-6">
                <Label htmlFor="buy-price" className="text-xs font-medium text-neutral-500">
                  Цена за UNT, USDT
                </Label>
                <Input
                  id="buy-price"
                  inputMode="decimal"
                  value={buyPrice}
                  onChange={(e) => setBuyPrice(e.target.value)}
                  className={cn(inputClass, "mt-3 w-full")}
                />
                <p className="mt-2 text-xs text-neutral-500">Справочно для расчёта; в сделке подставится актуальная цена.</p>
              </div>
            </div>

            {buyCalc ? (
              <p className="mt-6 text-center text-sm text-neutral-500">
                <span className="font-mono text-neutral-700">1 UNT</span> ≈{" "}
                <CalcDisplay value={USDT_FMT.format(buyCalc.pricePerUnit)} tone="neutral" size="lg" /> USDT
              </p>
            ) : null}

            <div className="mt-8 flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" onClick={resetBuy} className="border-0 bg-neutral-100 hover:bg-neutral-200/80">
                Сбросить
              </Button>
            </div>

            {buyCalc ? (
              <>
                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  <StatTile label="Цена за UNT">
                    <CalcDisplay value={USDT_FMT.format(buyCalc.pricePerUnit)} suffix=" USDT" tone="neutral" />
                  </StatTile>
                  <StatTile label="Количество UNT" className="bg-gradient-to-br from-neutral-50 to-blue-50/70">
                    <CalcDisplay value={NUM_FMT.format(buyCalc.units)} tone="units" />
                  </StatTile>
                </div>
                <div className="mt-4 rounded-2xl bg-neutral-50 px-5 py-2 sm:px-6">
                  <FeeLine label="Комиссия платформы" value={`${USDT_FMT.format(buyCalc.platformFee)} USDT`} muted />
                  <div className="border-t border-neutral-100/80" />
                  <FeeLine label="Итого к оплате" value={`${USDT_FMT.format(buyCalc.total)} USDT`} />
                  <div className="border-t border-neutral-100/80" />
                  <FeeLine label="Эффективная сумма (к UNT)" value={`${USDT_FMT.format(buyCalc.effective)} USDT`} />
                </div>
                <div className="mt-6 rounded-2xl bg-neutral-50 px-5 py-5 sm:px-6">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">К оплате</p>
                  <CalcDisplay value={USDT_FMT.format(buyCalc.total)} suffix=" USDT" tone="primary" size="xl" />
                </div>
              </>
            ) : (
              <p className="mt-8 rounded-2xl bg-neutral-50 px-5 py-8 text-center text-sm text-neutral-500">
                Введите положительные значения, чтобы увидеть расчёт.
              </p>
            )}
            <p className="mt-5 text-xs leading-relaxed text-neutral-500">
              Комиссия — доля от суммы платежа. Фактические тарифы и округления могут отличаться.
            </p>
          </div>
        </section>
      ) : null}

      {tab === "sell" ? (
        <section className="scroll-mt-28 space-y-6" aria-labelledby="calc-sell-title">
          <div className="rounded-3xl bg-white px-5 py-7 sm:px-8 sm:py-9">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">Калькулятор · Secondary</p>
            <h2 id="calc-sell-title" className="mt-1 text-xl font-semibold tracking-tight text-neutral-900 sm:text-2xl">
              Продажа на secondary
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-neutral-500">Gross, комиссия вторичного рынка и сумма к получению.</p>

            <div className="mt-8 grid gap-5 lg:grid-cols-2">
              <div className="rounded-2xl bg-neutral-50 p-5 sm:p-6">
                <Label htmlFor="sell-units" className="text-xs font-medium text-neutral-500">
                  UNT к продаже
                </Label>
                <Input
                  id="sell-units"
                  inputMode="decimal"
                  value={sellUnits}
                  onChange={(e) => setSellUnits(e.target.value)}
                  className={cn(inputClass, "mt-3 w-full")}
                />
              </div>
              <div className="rounded-2xl bg-neutral-50 p-5 sm:p-6">
                <Label htmlFor="sell-price" className="text-xs font-medium text-neutral-500">
                  Цена за UNT, USDT
                </Label>
                <Input
                  id="sell-price"
                  inputMode="decimal"
                  value={sellPrice}
                  onChange={(e) => setSellPrice(e.target.value)}
                  className={cn(inputClass, "mt-3 w-full")}
                />
              </div>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={resetSell} className="mt-6 border-0 bg-neutral-100 hover:bg-neutral-200/80">
              Сбросить
            </Button>

            {sellCalc ? (
              <>
                <div className="mt-8 rounded-2xl bg-neutral-50 px-5 py-3 sm:px-6">
                  <FeeLine label="Сумма сделки (gross)" value={`${USDT_FMT.format(sellCalc.gross)} USDT`} />
                  <div className="border-t border-neutral-100/80" />
                  <FeeLine label="Комиссия secondary" value={`− ${USDT_FMT.format(sellCalc.secondaryFee)} USDT`} muted />
                </div>
                <div className="mt-4 rounded-2xl bg-neutral-50 px-5 py-5 sm:px-6">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">К получению (net)</p>
                  <CalcDisplay value={USDT_FMT.format(sellCalc.net)} suffix=" USDT" tone="primary" size="xl" />
                </div>
              </>
            ) : (
              <p className="mt-8 rounded-2xl bg-neutral-50 px-5 py-8 text-center text-sm text-neutral-500">
                Укажите UNT и цену за UNT.
              </p>
            )}
            <p className="mt-5 text-xs text-neutral-500">Иллюстрация; на стакане могут быть дополнительные правила.</p>
          </div>
        </section>
      ) : null}

      {tab === "withdraw" ? (
        <section className="scroll-mt-28 space-y-6" aria-labelledby="calc-wd-title">
          <div className="rounded-3xl bg-white px-5 py-7 sm:px-8 sm:py-9">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">Калькулятор · Вывод</p>
            <h2 id="calc-wd-title" className="mt-1 text-xl font-semibold tracking-tight text-neutral-900 sm:text-2xl">
              Вывод USDT
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-neutral-500">Удержание платформы и сумма к зачислению на адрес TRC20.</p>

            <div className="mt-8 max-w-md rounded-2xl bg-neutral-50 p-5 sm:p-6">
              <Label htmlFor="wd-amt" className="text-xs font-medium text-neutral-500">
                Сумма вывода, USDT
              </Label>
              <Input
                id="wd-amt"
                inputMode="decimal"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className={cn(inputClass, "mt-3 w-full")}
              />
            </div>
            <Button type="button" variant="outline" size="sm" onClick={resetWithdraw} className="mt-6 border-0 bg-neutral-100 hover:bg-neutral-200/80">
              Сбросить
            </Button>

            {withdrawCalc ? (
              <>
                <div className="mt-8 max-w-lg rounded-2xl bg-neutral-50 px-5 py-3 sm:px-6">
                  <FeeLine label="Комиссия вывода" value={`${USDT_FMT.format(withdrawCalc.fee)} USDT`} muted />
                  <div className="border-t border-neutral-100/80" />
                  <FeeLine label="К получению на адрес" value={`${USDT_FMT.format(withdrawCalc.finalAmount)} USDT`} />
                </div>
                <div className="mt-4 max-w-lg rounded-2xl bg-neutral-50 px-5 py-5 sm:px-6">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">Итог на кошелёк</p>
                  <CalcDisplay value={USDT_FMT.format(withdrawCalc.finalAmount)} suffix=" USDT" tone="primary" size="xl" />
                </div>
              </>
            ) : (
              <p className="mt-8 rounded-2xl bg-neutral-50 px-5 py-8 text-center text-sm text-neutral-500">Введите сумму вывода.</p>
            )}
            <div className="mt-6 rounded-2xl bg-neutral-50 px-5 py-4 text-xs leading-relaxed text-neutral-600">
              Сеть: <span className="font-semibold text-neutral-800">TRC20 (USDT)</span>. Адрес должен поддерживать стандарт.
              Комиссия сети — отдельно у провайдера или кошелька.
            </div>
          </div>
        </section>
      ) : null}

      {tab === "payout" ? (
        <section className="scroll-mt-28 space-y-6" aria-labelledby="calc-pay-title">
          <div className="rounded-3xl bg-white px-5 py-7 sm:px-8 sm:py-9">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">Калькулятор · Оценка</p>
            <h2 id="calc-pay-title" className="mt-1 text-xl font-semibold tracking-tight text-neutral-900 sm:text-2xl">
              Оценка начисления
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-neutral-500">
              Иллюстрация по введённым значениям. Не официальный отчёт и не прогноз будущих выплат.
            </p>

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <div className="rounded-2xl bg-neutral-50 p-5 sm:p-6">
                <Label htmlFor="payout-u" className="text-xs font-medium text-neutral-500">
                  Ваши UNT
                </Label>
                <Input
                  id="payout-u"
                  inputMode="decimal"
                  value={payoutUnits}
                  onChange={(e) => setPayoutUnits(e.target.value)}
                  className={cn(inputClass, "mt-3 w-full")}
                />
              </div>
              <div className="rounded-2xl bg-neutral-50 p-5 sm:p-6">
                <Label htmlFor="payout-pool" className="text-xs font-medium text-neutral-500">
                  Пример объёма для распределения, USDT
                </Label>
                <Input
                  id="payout-pool"
                  inputMode="decimal"
                  value={payoutPool}
                  onChange={(e) => setPayoutPool(e.target.value)}
                  className={cn(inputClass, "mt-3 w-full")}
                />
              </div>
              <div className="rounded-2xl bg-neutral-50 p-5 sm:p-6 sm:col-span-2">
                <Label htmlFor="payout-total" className="text-xs font-medium text-neutral-500">
                  Условный объём UNT по релизу
                </Label>
                <Input
                  id="payout-total"
                  inputMode="decimal"
                  value={payoutTotalUnits}
                  onChange={(e) => setPayoutTotalUnits(e.target.value)}
                  className={cn(inputClass, "mt-3 max-w-md w-full")}
                />
              </div>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={resetPayout} className="mt-6 border-0 bg-neutral-100 hover:bg-neutral-200/80">
              Сбросить
            </Button>

            {payoutCalc ? (
              <div className="mt-8 space-y-4">
                <div className="rounded-2xl bg-neutral-50 px-5 py-4 sm:px-6">
                  <FeeLine label="Доля позиции (иллюстрация)" value={`${(payoutCalc.share * 100).toFixed(4)} %`} muted />
                </div>
                <div className="rounded-2xl bg-neutral-50 px-5 py-5 sm:px-6">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">Оценочное начисление</p>
                  <CalcDisplay value={USDT_FMT.format(payoutCalc.estimated)} suffix=" USDT" tone="units" size="xl" />
                </div>
              </div>
            ) : (
              <p className="mt-8 rounded-2xl bg-neutral-50 px-5 py-8 text-center text-sm text-neutral-500">
                Заполните поля положительными числами.
              </p>
            )}
            <p className="mt-6 rounded-2xl bg-neutral-50 px-5 py-4 text-xs leading-relaxed text-neutral-600">
              Фактические начисления зависят от периода, условий релиза и правил платформы.
            </p>
          </div>
        </section>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Полезное о калькуляторе">
        {BENEFIT_CARDS.map((b) => (
          <article key={b.title} className="rounded-3xl bg-neutral-50/90 px-5 py-5 sm:px-6 sm:py-6">
            <h3 className="text-sm font-semibold text-neutral-900">{b.title}</h3>
            <p className="mt-2 text-xs leading-relaxed text-neutral-500 sm:text-sm">{b.text}</p>
          </article>
        ))}
      </section>

      <footer className="rounded-3xl bg-neutral-50 px-5 py-6 text-xs leading-relaxed text-neutral-600 sm:px-7">
        <p className="font-medium text-neutral-800">Общие примечания</p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-neutral-600">
          <li>Комиссии и лимиты могут меняться — ориентируйтесь на актуальные тарифы в продукте.</li>
          <li>После подключения API подставятся реальные параметры сделки.</li>
          <li>Оценки начислений не гарантируют будущие выплаты.</li>
        </ul>
      </footer>
    </div>
  );
}
