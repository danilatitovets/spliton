"use client";

import "./statements-page.css";

import Image from "next/image";

import { Download } from "@/lib/lucide";
import { SplitonLoader } from "@/components/ui/spliton-loader";

import { useI18n } from "@/components/providers/i18n-provider";
import { intlLocaleFor } from "@/lib/i18n/formatters";
import { tf } from "@/lib/i18n/financial-messages";
import { cn } from "@/lib/utils";

const LOGO_MINI = "/images/LOGO/mini-logo.png";
const USDT_ICON = "/images/currency/usdt.svg";

function formatDocDate(iso: string | null | undefined, locale: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(locale, { day: "2-digit", month: "long", year: "numeric" });
}

function formatRangeDate(value: string | undefined, locale: string) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(locale, { day: "2-digit", month: "2-digit", year: "numeric" });
}

function amountValue(value?: string | null) {
  if (!value) return "—";
  return value.replace(/\s*USDT\s*$/i, "").trim();
}

function maskEmail(email?: string | null) {
  if (!email) return "—";
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const visible = local.length <= 2 ? local : `${local.slice(0, 2)}•••`;
  return `${visible}@${domain}`;
}

export type StatementDocumentPreviewProps = {
  kindLabel: string;
  periodLabel: string;
  dateFrom?: string;
  dateTo?: string;
  holderName?: string | null;
  holderEmail?: string | null;
  balance?: string | null;
  opsCount?: number | null;
  inflow?: string | null;
  outflow?: string | null;
  status: "idle" | "generating" | "ready" | "failed";
  reference?: string | null;
  issuedAt?: string | null;
  errorMessage?: string | null;
  showDownload?: boolean;
  downloading?: boolean;
  onDownload?: () => void;
};

export function StatementDocumentPreview({
  kindLabel,
  periodLabel,
  dateFrom,
  dateTo,
  holderName,
  holderEmail,
  balance,
  opsCount,
  inflow,
  outflow,
  status,
  reference,
  issuedAt,
  showDownload,
  downloading,
  onDownload,
}: StatementDocumentPreviewProps) {
  const { locale, t } = useI18n();
  const intl = intlLocaleFor(locale);

  const isReady = status === "ready";
  const isGenerating = status === "generating";
  const isFailed = status === "failed";
  const docRef = reference ?? "ST-PREVIEW";
  const holder = holderName?.trim() || maskEmail(holderEmail);

  const stampLabel = isReady
    ? t("statements.preview.stamp.confirmed")
    : isGenerating
      ? t("statements.preview.stamp.generating")
      : isFailed
        ? t("statements.preview.stamp.error")
        : t("statements.preview.stamp.preview");

  return (
    <div
      className={cn(
        "stmt-doc relative overflow-hidden rounded-2xl bg-black shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]",
        isReady && "stmt-doc--ready",
        isGenerating && "stmt-doc--generating",
      )}
    >
      <div className="stmt-doc-watermark pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
        <Image
          src={LOGO_MINI}
          alt=""
          width={120}
          height={120}
          className="size-[7.5rem] object-contain opacity-[0.06] sm:size-32"
          unoptimized
        />
      </div>

      <div className="stmt-doc-accent absolute inset-x-0 top-0 h-px bg-white/25" aria-hidden />

      <header className="relative bg-white/[0.03] px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Image
              src="/images/LOGO/white-logo-nofon.png"
              alt={t("statements.preview.logoAlt")}
              width={320}
              height={76}
              className="h-8 w-auto max-w-[11rem] object-contain object-left sm:h-9 sm:max-w-[13rem]"
              unoptimized
            />
            <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
              {t("statements.preview.platformTagline")}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
              {t("statements.preview.referenceLabel")}
            </p>
            <p className="mt-0.5 font-mono text-xs font-semibold text-white">{docRef}</p>
            <p className="mt-1 text-[10px] text-zinc-500">{formatDocDate(issuedAt ?? new Date().toISOString(), intl)}</p>
          </div>
        </div>
      </header>

      <div className="relative px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold tracking-tight text-white sm:text-lg">{kindLabel}</h3>
            <p className="mt-1 text-xs text-zinc-500">
              {tf(t("statements.preview.reportingPeriod"), { period: periodLabel })}
            </p>
          </div>
          <span
            className={cn(
              "stmt-doc-stamp inline-flex rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em]",
              isReady && "bg-emerald-400/15 text-emerald-200",
              isGenerating && "bg-amber-400/15 text-amber-200",
              isFailed && "bg-rose-400/15 text-rose-200",
              status === "idle" && "bg-white/[0.08] text-zinc-300",
            )}
          >
            {stampLabel}
          </span>
        </div>

        <dl className="stmt-doc-meta mt-4 grid gap-3 rounded-xl bg-white/[0.04] px-3 py-3 ring-1 ring-white/[0.06] sm:grid-cols-2 sm:gap-x-4 sm:px-4">
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
              {t("statements.preview.holder")}
            </dt>
            <dd className="mt-0.5 text-sm font-medium text-white">{holder}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
              {t("statements.preview.period")}
            </dt>
            <dd className="mt-0.5 font-mono text-sm text-zinc-200">
              {dateFrom && dateTo ? `${formatRangeDate(dateFrom, intl)} — ${formatRangeDate(dateTo, intl)}` : periodLabel}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
              {t("statements.preview.currency")}
            </dt>
            <dd className="mt-0.5 flex items-center gap-1.5 text-sm font-medium text-white">
              <span className="relative size-4 shrink-0 overflow-hidden rounded-full">
                <Image src={USDT_ICON} alt="" fill className="object-cover" sizes="16px" />
              </span>
              {t("statements.preview.currencyValue")}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
              {t("statements.preview.opsInPeriod")}
            </dt>
            <dd className="mt-0.5 font-mono text-sm font-semibold text-white">{opsCount ?? "—"}</dd>
          </div>
        </dl>

        <div className="stmt-doc-summary mt-4 overflow-hidden rounded-xl bg-white/[0.03] ring-1 ring-white/[0.06]">
          <div className="bg-white/[0.06] px-3 py-2 sm:px-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-300">
              {t("statements.preview.summaryTitle")}
            </p>
          </div>
          <table className="w-full text-left text-xs sm:text-sm">
            <tbody>
              <tr>
                <td className="px-3 py-2.5 text-zinc-500 sm:px-4">{t("statements.preview.availableBalance")}</td>
                <td className="px-3 py-2.5 text-right font-mono font-semibold text-white sm:px-4">
                  {amountValue(balance)} USDT
                </td>
              </tr>
              <tr className="bg-white/[0.03]">
                <td className="px-3 py-2.5 text-zinc-500 sm:px-4">{t("statements.preview.inflow")}</td>
                <td className="px-3 py-2.5 text-right font-mono font-semibold text-emerald-300 sm:px-4">
                  +{amountValue(inflow)} USDT
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2.5 text-zinc-500 sm:px-4">{t("statements.preview.outflow")}</td>
                <td className="px-3 py-2.5 text-right font-mono font-semibold text-zinc-200 sm:px-4">
                  −{amountValue(outflow)} USDT
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {status === "idle" ? (
          <p className="mt-4 text-xs leading-relaxed text-zinc-500">{t("statements.preview.idleHint")}</p>
        ) : null}

        {isGenerating ? (
          <p className="stmt-doc-status mt-4 flex items-center gap-2 text-xs text-zinc-400">
            <SplitonLoader size="xxs" variant="light" className="shrink-0" />
            {t("statements.preview.generatingHint")}
          </p>
        ) : null}

        {isFailed ? (
          <p className="mt-4 rounded-lg bg-rose-400/10 px-3 py-2 text-xs text-rose-200">
            {t("statements.errors.requestFailed")}
          </p>
        ) : null}

        {showDownload ? (
          <button
            type="button"
            onClick={onDownload}
            disabled={downloading}
            className="stmt-doc-download mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-white text-xs font-semibold text-black transition hover:bg-[#e8e8e8] disabled:opacity-60 sm:text-sm"
          >
            {downloading ? <SplitonLoader size="xxs" variant="dark" className="shrink-0" /> : <Download className="size-4" />}
            {t("statements.preview.downloadPdf")}
          </button>
        ) : null}
      </div>

      <footer className="relative bg-white/[0.03] px-4 py-3 sm:px-6">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[9px] leading-relaxed text-zinc-500">{t("statements.preview.footerDisclaimer")}</p>
            <p className="mt-1 font-mono text-[9px] text-zinc-600">{t("statements.preview.footerContact")}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 rounded-lg bg-white/[0.06] px-2 py-1.5 ring-1 ring-white/10">
            <Image src={LOGO_MINI} alt="" width={20} height={20} className="size-5 object-contain" unoptimized />
            <span className="text-[9px] font-semibold text-zinc-200">{t("statements.preview.spliton")}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
