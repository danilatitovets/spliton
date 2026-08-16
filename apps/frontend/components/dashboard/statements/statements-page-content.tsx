"use client";

import "./statements-page.css";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, ChevronRight, Download, RefreshCw } from "@/lib/lucide";
import { SplitonLoader } from "@/components/ui/spliton-loader";

import { AssetsGptMenu } from "@/components/dashboard/assets/assets-gpt-menu";
import { SplitonDarkSurface } from "@/components/dashboard/assets/spliton-dark-surface";
import { DashboardAppShell } from "@/components/layout/dashboard-app-shell";
import { smExchange } from "@/components/dashboard/secondary-market/secondary-market-exchange-styles";
import {
  profileCardClass,
  profileMutedCardClass,
  profilePrimaryButtonClass,
} from "@/components/dashboard/profile/profile-ui";
import { useAuth } from "@/components/providers/auth-provider";
import { useI18n } from "@/components/providers/i18n-provider";
import { SplitonCtaPill } from "@/components/ui/spliton-cta-pill";
import { ROUTES } from "@/constants/routes";
import { intlLocaleFor } from "@/lib/i18n/formatters";
import { tf } from "@/lib/i18n/financial-messages";
import { resolveApiUrl } from "@/lib/public-env";
import { cn } from "@/lib/utils";
import {
  DOCUMENTS_API_PATHS,
  downloadUserDocument,
  isDocumentReady,
  saveBlob,
  type UserDocument,
} from "@/services/documents.service";
import { getWalletDataSource } from "@/services/wallet.service";

type StatementKind = { kind: string; label: string; disclaimer: string };

type RequestStatus = {
  id: string;
  kind: string;
  status: string;
  errorMessage?: string | null;
  completedAt?: string | null;
};

type PageTab = "request" | "history";

const STATEMENTS_ICON = "/images/services-menu/statements.png";
const STATEMENTS_EMPTY_ICON = "/images/services-menu/statements-empty.png";

const STATEMENT_DOC_KINDS = new Set([
  "ANNUAL_INCOME_STATEMENT",
  "MONTHLY_WALLET_STATEMENT",
  "TRADING_SUMMARY",
  "PAYOUTS_SUMMARY",
  "FEES_PAID_SUMMARY",
  "REALIZED_PNL_SUMMARY",
  "DEPOSITS_WITHDRAWALS_SUMMARY",
  "WALLET_STATEMENT",
  "PORTFOLIO_STATEMENT",
]);

const KIND_CODES = [
  "monthly_wallet_statement",
  "annual_income_statement",
  "trading_summary",
  "payouts_summary",
  "fees_paid_summary",
  "realized_pnl_summary",
  "deposits_withdrawals_summary",
  "wallet_statement",
] as const;

const STATUS_CODES = ["queued", "running", "completed", "failed", "expired", "ready"] as const;

const PERIOD_VALUES = ["q-current", "month-current", "year-2026", "year-2025"] as const;

const PERIOD_LABEL_KEYS: Record<(typeof PERIOD_VALUES)[number], string> = {
  "q-current": "statements.period.q-current",
  "month-current": "statements.period.month-current",
  "year-2026": "statements.period.year-2026",
  "year-2025": "statements.period.year-2025",
};

const DEMO_KIND_CODES = [
  "monthly_wallet_statement",
  "annual_income_statement",
  "trading_summary",
  "payouts_summary",
] as const;

const PAGE_TABS: { id: PageTab; labelKey: string }[] = [
  { id: "request", labelKey: "statements.tab.request" },
  { id: "history", labelKey: "statements.tab.history" },
];

function shortStatementRef(id: string) {
  return `ST-${id.slice(0, 8).toUpperCase()}`;
}

function StatementGenerationSteps({
  status,
  t,
}: {
  status: string;
  t: (key: string, fallback?: string) => string;
}) {
  const steps = [
    { id: 1, label: t("statements.step.accepted") },
    { id: 2, label: t("statements.step.collecting") },
    { id: 3, label: t("statements.step.pdf") },
    { id: 4, label: t("statements.step.downloadReady") },
  ] as const;

  const activeIndex =
    status === "queued" ? 1 : status === "running" ? 2 : status === "completed" || status === "ready" ? 4 : 0;

  return (
    <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
      {steps.map((step) => {
        const done = activeIndex > step.id || (status === "completed" && step.id <= 4);
        const active =
          activeIndex === step.id && status !== "failed" && status !== "completed" && status !== "ready";
        return (
          <div key={step.id} className="flex flex-col items-center gap-1 text-center">
            <span
              className={cn(
                "stmt-gen-step flex size-7 items-center justify-center rounded-full text-[10px] font-bold sm:size-8",
                done && "bg-white text-black stmt-gen-step--done",
                active && "bg-white text-black stmt-gen-step--active",
                !done && !active && "bg-white/[0.08] text-zinc-500",
              )}
            >
              {done ? <Check className="size-3.5" strokeWidth={3} /> : step.id}
            </span>
            <span className="text-[9px] leading-tight text-zinc-500 sm:text-[10px]">{step.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export function StatementsPageContent() {
  const { accessToken, authorizedFetch, isAuthenticated } = useAuth();
  const { locale, t } = useI18n();
  const live = getWalletDataSource() === "live" && isAuthenticated;

  const [tab, setTab] = React.useState<PageTab>("request");
  const [kinds, setKinds] = React.useState<StatementKind[]>([]);
  const [selected, setSelected] = React.useState("");
  const [period, setPeriod] = React.useState<string>("q-current");
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [requestError, setRequestError] = React.useState<string | null>(null);
  const [activeRequest, setActiveRequest] = React.useState<RequestStatus | null>(null);
  const [documents, setDocuments] = React.useState<UserDocument[]>([]);
  const [downloadingId, setDownloadingId] = React.useState<string | null>(null);

  const kindLabels = React.useMemo(
    () =>
      Object.fromEntries(KIND_CODES.map((code) => [code, t(`statements.kind.${code}`)])) as Record<string, string>,
    [t],
  );

  const statusLabels = React.useMemo(
    () =>
      Object.fromEntries(STATUS_CODES.map((code) => [code, t(`statements.status.${code}`)])) as Record<string, string>,
    [t],
  );

  const periodOptions = React.useMemo(
    () =>
      PERIOD_VALUES.map((value) => ({
        id: value,
        label: t(PERIOD_LABEL_KEYS[value]),
      })),
    [t],
  );

  const demoStatementKinds = React.useMemo(
    (): StatementKind[] =>
      DEMO_KIND_CODES.map((kind) => ({
        kind,
        label: t(`statements.kind.${kind}`),
        disclaimer: t(`statements.kind.${kind}.disclaimer`),
      })),
    [t],
  );

  const periodRange = React.useCallback(
    (value: string): { dateFrom?: string; dateTo?: string; fiscalYear?: number; label: string } => {
      const now = new Date();
      const y = now.getFullYear();
      const m = now.getMonth();
      const intl = intlLocaleFor(locale);

      if (value === "month-current") {
        const from = new Date(y, m, 1);
        const to = new Date(y, m + 1, 0);
        return {
          dateFrom: from.toISOString().slice(0, 10),
          dateTo: to.toISOString().slice(0, 10),
          label: from.toLocaleDateString(intl, { month: "long", year: "numeric" }),
        };
      }
      if (value === "q-current") {
        const qStart = Math.floor(m / 3) * 3;
        const from = new Date(y, qStart, 1);
        const to = new Date(y, qStart + 3, 0);
        return {
          dateFrom: from.toISOString().slice(0, 10),
          dateTo: to.toISOString().slice(0, 10),
          label: `Q${Math.floor(qStart / 3) + 1} ${y}`,
        };
      }
      const year = value === "year-2025" ? 2025 : 2026;
      return {
        fiscalYear: year,
        dateFrom: `${year}-01-01`,
        dateTo: `${year}-12-31`,
        label: tf(t("statements.period.yearLabel"), { year: String(year) }),
      };
    },
    [locale, t],
  );

  const periodMeta = React.useMemo(() => periodRange(period), [period, periodRange]);
  const selectedKind = kinds.find((k) => k.kind === selected);

  const loadKinds = React.useCallback(() => {
    if (!accessToken) {
      setKinds(demoStatementKinds);
      setSelected(demoStatementKinds[0]!.kind);
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    void fetch(resolveApiUrl("/api/v1/accounting/statements"), {
      headers: { Authorization: `Bearer ${accessToken}` },
      credentials: "include",
    })
      .then(async (r) => {
        if (!r.ok) throw new Error("loadKindsFailed");
        const body = (await r.json()) as { items?: StatementKind[] };
        const items = body.items ?? [];
        setKinds(items);
        setSelected((prev) => prev || items[0]?.kind || "");
      })
      .catch(() => {
        setKinds([]);
        setLoadError(t("statements.errors.loadKindsFailed"));
      })
      .finally(() => setLoading(false));
  }, [accessToken, demoStatementKinds, t]);

  const loadDocuments = React.useCallback(() => {
    if (!accessToken) return;
    void fetch(resolveApiUrl(DOCUMENTS_API_PATHS.list), {
      headers: { Authorization: `Bearer ${accessToken}` },
      credentials: "include",
    })
      .then(async (r) => {
        if (!r.ok) throw new Error("loadHistoryFailed");
        const body = (await r.json()) as { items?: UserDocument[] };
        const items = (body.items ?? []).filter((d) => STATEMENT_DOC_KINDS.has(d.kind));
        setDocuments(items.slice(0, 20));
      })
      .catch(() => setDocuments([]));
  }, [accessToken]);

  React.useEffect(() => {
    loadKinds();
    loadDocuments();
  }, [loadKinds, loadDocuments]);

  React.useEffect(() => {
    if (!activeRequest?.id || !accessToken) return;
    if (activeRequest.status === "completed" || activeRequest.status === "ready" || activeRequest.status === "failed") {
      return;
    }

    const poll = () => {
      void fetch(resolveApiUrl(`/api/v1/accounting/statements/requests/${activeRequest.id}`), {
        headers: { Authorization: `Bearer ${accessToken}` },
        credentials: "include",
      })
        .then(async (r) => {
          if (!r.ok) throw new Error("statusFailed");
          const body = (await r.json()) as RequestStatus;
          setActiveRequest(body);
          if (body.status === "completed" || body.status === "ready") {
            loadDocuments();
            setTab("history");
          }
        })
        .catch(() => undefined);
    };

    poll();
    const timer = window.setInterval(poll, 1600);
    return () => window.clearInterval(timer);
  }, [activeRequest?.id, activeRequest?.status, accessToken, loadDocuments]);

  const requestStatement = () => {
    if (!selected) return;

    if (!accessToken) {
      setBusy(true);
      setRequestError(null);
      const demoId = `demo-${Date.now()}`;
      setActiveRequest({ id: demoId, kind: selected, status: "queued" });
      window.setTimeout(() => setActiveRequest((r) => (r?.id === demoId ? { ...r, status: "running" } : r)), 900);
      window.setTimeout(() => {
        setActiveRequest((r) =>
          r?.id === demoId ? { ...r, status: "completed", completedAt: new Date().toISOString() } : r,
        );
        const demoDoc: UserDocument = {
          id: demoId,
          kind: selected.toUpperCase(),
          format: "PDF",
          status: "READY",
          fileSizeBytes: null,
          expiresAt: null,
          createdAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          downloadCount: 0,
        };
        setDocuments((prev) => [demoDoc, ...prev].slice(0, 20));
        setTab("history");
        setBusy(false);
      }, 3200);
      return;
    }

    setBusy(true);
    setRequestError(null);
    const range = periodRange(period);
    void fetch(resolveApiUrl("/api/v1/accounting/statements/request"), {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        kind: selected,
        fiscalYear: range.fiscalYear,
        dateFrom: range.dateFrom,
        dateTo: range.dateTo,
      }),
    })
      .then(async (r) => {
        if (!r.ok) throw new Error("requestFailed");
        const body = (await r.json()) as { id?: string; kind?: string; status?: string };
        setActiveRequest({
          id: body.id!,
          kind: body.kind ?? selected,
          status: body.status ?? "queued",
        });
      })
      .catch(() => {
        setRequestError(t("statements.errors.requestFailed"));
      })
      .finally(() => setBusy(false));
  };

  async function handleDownload(id: string) {
    setDownloadingId(id);
    try {
      if (id.startsWith("demo-")) {
        setRequestError(t("statements.errors.demoPdfHint"));
        return;
      }
      const file = await downloadUserDocument(id, authorizedFetch);
      saveBlob(file.blob, file.filename);
    } catch {
      setRequestError(t("statements.errors.downloadFailed"));
    } finally {
      setDownloadingId(null);
    }
  }

  const generating =
    activeRequest &&
    activeRequest.status !== "completed" &&
    activeRequest.status !== "ready" &&
    activeRequest.status !== "failed";

  const completedDoc = documents.find(
    (d) => activeRequest && isDocumentReady(d.status) && d.id === activeRequest.id,
  );

  const readyDownloadId =
    completedDoc?.id ??
    (activeRequest?.status === "completed" || activeRequest?.status === "ready" ? activeRequest.id : null);

  const headerSubtitleParts = t("statements.page.subtitle").split("{documents}");

  return (
    <DashboardAppShell
      tone="dark"
      contentClassName="max-w-[960px] pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] sm:pb-10"
    >
      <SplitonDarkSurface
        className="min-h-0 shadow-none"
        contentClassName="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6"
        watermarkCompact
      >
        <div className="relative mx-auto size-24 shrink-0 sm:mx-0 sm:size-28">
          <Image
            src={STATEMENTS_ICON}
            alt=""
            fill
            sizes="112px"
            className="object-contain"
            unoptimized
            aria-hidden
            priority
          />
        </div>
        <div className="min-w-0 flex-1 text-center sm:text-left">
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            {t("statements.page.header.title")}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-white/55">
            {headerSubtitleParts[0]}
            <Link
              href={ROUTES.dashboardDocuments}
              className="font-medium text-white underline decoration-white/25 underline-offset-4 hover:decoration-white/60"
            >
              {t("statements.page.header.documentsLink")}
            </Link>
            {headerSubtitleParts[1]}
          </p>
        </div>
      </SplitonDarkSurface>

      <div className="mt-4 flex flex-wrap gap-2">
        <SplitonCtaPill
          href={ROUTES.dashboardDocuments}
          tone="onDark"
          variant="ghost"
          className="h-9 min-w-0 px-3.5 text-[12px]"
        >
          {t("statements.page.header.documentsLink")}
        </SplitonCtaPill>
        <SplitonCtaPill
          href={ROUTES.dashboardSupport}
          tone="onDark"
          variant="ghost"
          withArrow={false}
          className="h-9 min-w-0 px-3.5 text-[12px]"
        >
          {t("support.nav.support")}
        </SplitonCtaPill>
        <button
          type="button"
          onClick={() => setTab("request")}
          className="inline-flex h-9 items-center rounded-full px-3.5 text-[12px] font-semibold text-white/75 transition hover:bg-white/[0.06] hover:text-white"
        >
          {t("statements.tab.request")}
        </button>
      </div>

      <div className="mt-6 space-y-5 sm:mt-8">
        <div className="flex gap-1.5">
          {PAGE_TABS.map((item) => {
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={cn(
                  smExchange.chipBase,
                  active ? smExchange.chipActive : smExchange.chipIdle,
                  "px-3.5 py-2 text-[13px]",
                )}
              >
                {t(item.labelKey)}
              </button>
            );
          })}
        </div>

        {tab === "request" ? (
          <div className="space-y-4">
            <section className={profileCardClass}>
              {loading ? (
                <div className="flex min-h-[10rem] items-center justify-center">
                  <SplitonLoader size="sm" variant="light" className="shrink-0" />
                </div>
              ) : loadError ? (
                <div className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-100 ring-1 ring-rose-400/25">
                  <p>{loadError}</p>
                  <button type="button" onClick={loadKinds} className="mt-2 text-xs font-semibold text-white underline">
                    {t("statements.page.request.retry")}
                  </button>
                </div>
              ) : kinds.length === 0 ? (
                <p className="text-sm text-zinc-400">{t("statements.page.request.noKinds")}</p>
              ) : (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-white">{t("statements.page.request.kindLabel")}</p>
                    <AssetsGptMenu
                      value={period}
                      onChange={setPeriod}
                      options={periodOptions}
                      ariaLabel={t("statements.page.request.periodLabel")}
                    />
                  </div>

                  {!live ? (
                    <p className={cn(profileMutedCardClass, "mt-4 text-xs text-zinc-400")}>
                      {t("statements.page.request.demoHint")}
                    </p>
                  ) : null}

                  <ul className="mt-4 space-y-2">
                    {kinds.map((kind) => {
                      const isSelected = kind.kind === selected;
                      return (
                        <li key={kind.kind}>
                          <button
                            type="button"
                            onClick={() => setSelected(kind.kind)}
                            className={cn(
                              "flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-left transition",
                              isSelected
                                ? "bg-white/[0.08] text-white"
                                : "bg-white/[0.04] text-zinc-200 hover:bg-white/[0.06]",
                            )}
                          >
                            <span className="block min-w-0 truncate text-sm font-medium text-white">
                              {kind.label}
                            </span>
                            {isSelected ? (
                              <Check className="size-4 shrink-0 text-white" strokeWidth={2.5} aria-hidden />
                            ) : (
                              <ChevronRight className="size-4 shrink-0 text-zinc-600" aria-hidden />
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>

                  <div className="mt-5 space-y-2">
                    <button
                      type="button"
                      disabled={!selected || busy || Boolean(generating)}
                      onClick={requestStatement}
                      className={cn(profilePrimaryButtonClass, "h-11 w-full sm:w-auto sm:min-w-[180px]")}
                    >
                      {busy ? (
                        <>
                          <SplitonLoader size="xxs" variant="dark" className="mr-2 shrink-0" />
                          {t("statements.page.request.submitting")}
                        </>
                      ) : (
                        t("statements.page.request.submit")
                      )}
                    </button>
                    {requestError ? <p className="text-sm text-rose-200">{requestError}</p> : null}
                    <p className="text-xs text-zinc-500">{t("statements.page.request.hint")}</p>
                  </div>
                </>
              )}
            </section>

            {activeRequest ? (
              <section className={cn(profileCardClass, "space-y-4")}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {selectedKind?.label ?? kindLabels[activeRequest.kind] ?? activeRequest.kind}
                    </p>
                    <p className="mt-0.5 font-mono text-xs text-zinc-500">
                      {periodMeta.label} — {shortStatementRef(activeRequest.id)}
                    </p>
                  </div>
                  {generating ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.08] px-2.5 py-1 text-[10px] font-semibold text-zinc-200">
                      <SplitonLoader size="xxs" variant="light" className="shrink-0" />
                      {t("statements.page.preview.generating")}
                    </span>
                  ) : activeRequest.status === "completed" || activeRequest.status === "ready" ? (
                    <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-[10px] font-semibold text-emerald-200">
                      {t("statements.page.preview.ready")}
                    </span>
                  ) : activeRequest.status === "failed" ? (
                    <span className="rounded-full bg-rose-400/15 px-2.5 py-1 text-[10px] font-semibold text-rose-200">
                      {t("statements.status.failed")}
                    </span>
                  ) : null}
                </div>

                <StatementGenerationSteps status={activeRequest.status} t={t} />

                {generating ? (
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div className="stmt-gen-progress h-full rounded-full bg-white" />
                  </div>
                ) : null}

                {readyDownloadId ? (
                  <button
                    type="button"
                    onClick={() => void handleDownload(readyDownloadId)}
                    disabled={downloadingId === readyDownloadId}
                    className={cn(profilePrimaryButtonClass, "h-10 w-full sm:w-auto sm:min-w-[180px]")}
                  >
                    {downloadingId === readyDownloadId ? (
                      <SplitonLoader size="xxs" variant="dark" className="mr-2 shrink-0" />
                    ) : (
                      <Download className="mr-2 size-4" />
                    )}
                    {t("statements.preview.downloadPdf")}
                  </button>
                ) : generating ? (
                  <p className="flex items-center gap-2 text-xs text-zinc-400">
                    <SplitonLoader size="xxs" variant="light" className="shrink-0" />
                    {t("statements.preview.generatingHint")}
                  </p>
                ) : null}
              </section>
            ) : null}
          </div>
        ) : (
          <section className={profileCardClass}>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-white">{t("statements.tab.history")}</h2>
              <button
                type="button"
                onClick={loadDocuments}
                className="inline-flex size-9 items-center justify-center rounded-full bg-white/[0.06] text-zinc-300 transition hover:bg-white/[0.1] hover:text-white"
                aria-label={t("statements.page.history.refreshAria")}
              >
                <RefreshCw className="size-4" />
              </button>
            </div>

            {documents.length === 0 ? (
              <div className="flex flex-col items-center px-2 py-10 text-center sm:py-12">
                <div className="relative size-[7.5rem] sm:size-36">
                  <Image
                    src={STATEMENTS_EMPTY_ICON}
                    alt=""
                    fill
                    sizes="144px"
                    className="object-contain"
                    unoptimized
                    aria-hidden
                  />
                </div>
                <p className="mt-5 text-[15px] font-medium text-white">{t("statements.page.history.empty")}</p>
                <button
                  type="button"
                  onClick={() => setTab("request")}
                  className={cn(profilePrimaryButtonClass, "mt-5 h-10 px-5")}
                >
                  {t("statements.page.request.submit")}
                </button>
              </div>
            ) : (
              <ul className="mt-4 divide-y divide-white/[0.06]">
                {documents.map((doc) => (
                  <li
                    key={doc.id}
                    className="flex flex-wrap items-center justify-between gap-3 py-3.5 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">
                        {kindLabels[doc.kind.toLowerCase()] ?? doc.kind}
                      </p>
                      <p className="mt-0.5 font-mono text-xs text-zinc-500">
                        {new Date(doc.createdAt).toLocaleDateString(intlLocaleFor(locale))}
                        {" — "}
                        {statusLabels[doc.status.toLowerCase()] ?? doc.status}
                      </p>
                    </div>
                    {isDocumentReady(doc.status) ? (
                      <button
                        type="button"
                        onClick={() => void handleDownload(doc.id)}
                        disabled={downloadingId === doc.id}
                        className="inline-flex h-9 items-center gap-1.5 rounded-full bg-white px-3 text-xs font-semibold text-black transition hover:bg-[#e8e8e8] disabled:opacity-60"
                      >
                        {downloadingId === doc.id ? (
                          <SplitonLoader size="xxs" variant="dark" className="shrink-0" />
                        ) : (
                          <Download className="size-3.5" />
                        )}
                        {t("statements.page.history.pdf")}
                      </button>
                    ) : (
                      <span className="text-xs text-zinc-500">
                        {statusLabels[doc.status.toLowerCase()] ?? doc.status}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>
    </DashboardAppShell>
  );
}
