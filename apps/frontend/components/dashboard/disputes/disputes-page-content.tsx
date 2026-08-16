"use client";

import "./disputes-page.css";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Plus, RefreshCw } from "@/lib/lucide";
import { SplitonLoader } from "@/components/ui/spliton-loader";

import { DashboardAppShell } from "@/components/layout/dashboard-app-shell";
import { SplitonDarkSurface } from "@/components/dashboard/assets/spliton-dark-surface";
import { SecondaryMarketResponsiveSheet } from "@/components/dashboard/secondary-market/secondary-market-responsive-sheet";
import { smExchange } from "@/components/dashboard/secondary-market/secondary-market-exchange-styles";
import {
  profileCardClass,
  profileMutedCardClass,
  profilePrimaryButtonClass,
} from "@/components/dashboard/profile/profile-ui";
import { useAuth } from "@/components/providers/auth-provider";
import { useI18n } from "@/components/providers/i18n-provider";
import { SplitonCtaPill } from "@/components/ui/spliton-cta-pill";
import { StyledSelectField } from "@/components/ui/styled-select";
import { ROUTES } from "@/constants/routes";
import { useApiErrorMessage } from "@/hooks/use-api-error-message";
import { DISPUTE_TYPE_VALUES, disputeTypeLabel } from "@/lib/i18n/disputes-messages";
import { formatDate } from "@/lib/i18n/formatters";
import { statusLabel } from "@/lib/i18n/status-labels";
import { resolveApiUrl } from "@/lib/public-env";
import { cn } from "@/lib/utils";

type DisputeRow = {
  id: string;
  subject: string;
  status: string;
  type: string;
  description?: string;
  createdAt: string;
  dueAt?: string | null;
};

const DISPUTES_ICON = "/images/services-menu/disputes.png";
const DISPUTES_EMPTY_ICON = "/images/services-menu/disputes-empty.png";

const STATUS_TONE: Record<string, "amber" | "emerald" | "neutral" | "red"> = {
  open: "amber",
  in_review: "amber",
  waiting_for_user: "neutral",
  waiting_for_admin: "amber",
  escalated: "amber",
  resolved: "emerald",
  rejected: "red",
  closed: "neutral",
};

const inputClass = cn(
  "h-11 w-full rounded-xl border-0 bg-white/[0.06] px-3.5 text-sm text-white shadow-none outline-none ring-0",
  "placeholder:text-zinc-600 transition",
  "hover:bg-white/[0.08] focus:bg-white/[0.1] focus:outline-none focus:ring-0",
);

const textareaClass = cn(
  "min-h-[2.75rem] w-full resize-none overflow-hidden rounded-xl border-0 bg-white/[0.06] px-3.5 py-3 text-sm leading-relaxed text-white shadow-none outline-none ring-0",
  "placeholder:text-zinc-600 transition",
  "hover:bg-white/[0.08] focus:bg-white/[0.1] focus:outline-none focus:ring-0",
);

function useAutoGrowTextarea(value: string, maxHeight = 280) {
  const ref = React.useRef<HTMLTextAreaElement>(null);

  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
    el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden";
  }, [value, maxHeight]);

  return ref;
}

function shortTicketId(id: string) {
  return id.length > 8 ? `DS-${id.slice(0, 8).toUpperCase()}` : `DS-${id.toUpperCase()}`;
}

function StatusBadge({ status, locale }: { status: string; locale: ReturnType<typeof useI18n>["locale"] }) {
  const tone = STATUS_TONE[status] ?? "neutral";
  return (
    <span
      className={cn(
        "inline-flex shrink-0 rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold",
        tone === "amber" && "bg-amber-400/15 text-amber-200",
        tone === "emerald" && "bg-emerald-400/15 text-emerald-200",
        tone === "red" && "bg-rose-400/15 text-rose-200",
        tone === "neutral" && "bg-white/[0.08] text-zinc-300",
      )}
    >
      {statusLabel("dispute", status, locale)}
    </span>
  );
}

export function DisputesPageContent() {
  const router = useRouter();
  const { accessToken, user } = useAuth();
  const { t, locale } = useI18n();
  const { messageFor } = useApiErrorMessage();

  const disputeTypeOptions = React.useMemo(
    () => DISPUTE_TYPE_VALUES.map((value) => ({ value, label: disputeTypeLabel(value, locale) })),
    [locale],
  );

  const [createOpen, setCreateOpen] = React.useState(false);
  const [items, setItems] = React.useState<DisputeRow[]>([]);
  const [loading, setLoading] = React.useState(Boolean(user));
  const [loadError, setLoadError] = React.useState<string | null>(null);

  const [type, setType] = React.useState<string>("withdrawal_not_received");
  const [subject, setSubject] = React.useState("");
  const [description, setDescription] = React.useState("");

  const [submitting, setSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const descriptionRef = useAutoGrowTextarea(description);

  const load = React.useCallback(() => {
    if (!accessToken) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    void fetch(resolveApiUrl("/api/v1/disputes?page=1&pageSize=50"), {
      headers: { Authorization: `Bearer ${accessToken}` },
      credentials: "include",
    })
      .then(async (r) => {
        const body = (await r.json()) as { items?: DisputeRow[]; message?: string; code?: string };
        if (!r.ok) throw body;
        setItems(body.items ?? []);
      })
      .catch((e: unknown) => {
        setItems([]);
        setLoadError(messageFor(e) || t("disputes.error.loadFailed"));
      })
      .finally(() => setLoading(false));
  }, [accessToken, messageFor, t]);

  React.useEffect(() => {
    load();
  }, [load]);

  const metrics = React.useMemo(() => {
    const total = items.length;
    const active = items.filter((i) => !["resolved", "closed", "rejected"].includes(i.status)).length;
    const resolved = items.filter((i) => i.status === "resolved" || i.status === "closed").length;
    return [
      { key: "total", label: t("disputes.metrics.total"), value: total },
      { key: "active", label: t("disputes.metrics.active"), value: active },
      { key: "resolved", label: t("disputes.metrics.resolved"), value: resolved },
    ] as const;
  }, [items, t]);

  const resetForm = () => {
    setSubject("");
    setDescription("");
    setType("withdrawal_not_received");
    setFormError(null);
  };

  const create = () => {
    if (!accessToken) return;
    const trimmedSubject = subject.trim();
    const trimmedDescription = description.trim();
    if (!trimmedSubject || trimmedDescription.length < 10) {
      setFormError(t("disputes.error.validation"));
      return;
    }
    setSubmitting(true);
    setFormError(null);
    void fetch(resolveApiUrl("/api/v1/disputes"), {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ type, subject: trimmedSubject, description: trimmedDescription }),
    })
      .then(async (r) => {
        const body = (await r.json()) as DisputeRow & { message?: string; code?: string };
        if (!r.ok) throw body;
        resetForm();
        setCreateOpen(false);
        load();
        router.push(`${ROUTES.dashboardDisputes}/${encodeURIComponent(body.id)}`);
      })
      .catch((e: unknown) => {
        setFormError(messageFor(e) || t("disputes.error.createFailed"));
      })
      .finally(() => setSubmitting(false));
  };

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
            src={DISPUTES_ICON}
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
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">{t("disputes.title")}</h1>
          <p className="mt-2 text-sm leading-relaxed text-white/55">
            {t("disputes.subtitle")}{" "}
            <Link
              href={ROUTES.dashboardSupport}
              className="font-medium text-white underline decoration-white/25 underline-offset-4 hover:decoration-white/60"
            >
              {t("disputes.subtitleSupportLink")}
            </Link>
            .
          </p>
        </div>
      </SplitonDarkSurface>

      <div className="mt-4 flex flex-wrap gap-2">
        <SplitonCtaPill
          href={ROUTES.dashboardSupport}
          tone="onDark"
          variant="ghost"
          className="h-9 min-w-0 px-3.5 text-[12px]"
        >
          {t("disputes.subtitleSupportLink")}
        </SplitonCtaPill>
        <SplitonCtaPill
          type="button"
          tone="onDark"
          variant="ghost"
          withArrow={false}
          onClick={() => setCreateOpen(true)}
          className="h-9 min-w-0 px-3.5 text-[12px]"
        >
          {t("disputes.tab.create")}
        </SplitonCtaPill>
      </div>

      {!user ? (
        <section className={cn(profileCardClass, "mt-6 text-center sm:mt-8")}>
          <div className="relative mx-auto size-20">
            <Image src={DISPUTES_EMPTY_ICON} alt="" fill sizes="80px" className="object-contain" unoptimized aria-hidden />
          </div>
          <p className="mt-4 text-sm text-zinc-300">{t("disputes.signInPrompt")}</p>
          <Link href={ROUTES.login} className={cn(profilePrimaryButtonClass, "mt-5")}>
            {t("auth.login.submit")}
          </Link>
        </section>
      ) : (
        <div className="mt-6 space-y-5 sm:mt-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-1.5">
              <span className={cn(smExchange.chipBase, smExchange.chipActive, "px-3.5 py-2 text-[13px]")}>
                {t("disputes.tab.list")}
              </span>
              <button
                type="button"
                onClick={() => setCreateOpen(true)}
                className={cn(smExchange.chipBase, smExchange.chipIdle, "inline-flex items-center gap-1.5 px-3.5 py-2 text-[13px]")}
              >
                <Plus className="size-3.5" aria-hidden />
                {t("disputes.tab.create")}
              </button>
            </div>
            <button
              type="button"
              onClick={load}
              className="inline-flex size-9 items-center justify-center rounded-full bg-white/[0.06] text-zinc-300 transition hover:bg-white/[0.1] hover:text-white"
              aria-label={t("disputes.list.refreshAria")}
            >
              <RefreshCw className="size-4" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
            {metrics.map((m) => (
              <div key={m.key} className={cn(profileMutedCardClass, "px-3 py-3.5 sm:px-4")}>
                <p className="text-[11px] font-medium text-zinc-500">{m.label}</p>
                <p className="mt-2 font-mono text-xl font-semibold tabular-nums tracking-tight text-white sm:text-2xl">
                  {m.value}
                </p>
              </div>
            ))}
          </div>

          <section className={profileCardClass}>
            {loading ? (
              <div className="flex min-h-[12rem] items-center justify-center">
                <SplitonLoader size="sm" variant="light" className="shrink-0" />
              </div>
            ) : loadError ? (
              <div className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-100 ring-1 ring-rose-400/25">
                <p>{loadError}</p>
                <button type="button" onClick={load} className="mt-2 text-xs font-semibold text-white underline">
                  {t("common.retry")}
                </button>
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center px-2 py-10 text-center sm:py-14">
                <div className="relative size-[7.5rem] sm:size-36">
                  <Image
                    src={DISPUTES_EMPTY_ICON}
                    alt=""
                    fill
                    sizes="144px"
                    className="object-contain"
                    unoptimized
                    aria-hidden
                  />
                </div>
                <p className="mt-5 text-[15px] font-medium text-white">{t("disputes.list.empty")}</p>
                <button
                  type="button"
                  onClick={() => setCreateOpen(true)}
                  className={cn(profilePrimaryButtonClass, "mt-5")}
                >
                  {t("disputes.create.submit")}
                </button>
              </div>
            ) : (
              <ul className="divide-y divide-white/[0.06]">
                {items.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={`${ROUTES.dashboardDisputes}/${encodeURIComponent(item.id)}`}
                      className="flex items-center justify-between gap-3 py-3.5 transition hover:bg-white/[0.03] first:pt-0 last:pb-0"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">{item.subject}</p>
                        <p className="mt-0.5 font-mono text-[11px] text-zinc-500">
                          {shortTicketId(item.id)} · {disputeTypeLabel(item.type, locale)} ·{" "}
                          {formatDate(item.createdAt, locale)}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <StatusBadge status={item.status} locale={locale} />
                        <ChevronRight className="size-4 text-zinc-500" aria-hidden />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}

      <SecondaryMarketResponsiveSheet
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) resetForm();
        }}
        title={t("disputes.tab.create")}
        description={t("disputes.create.hint")}
        widthClassName="md:w-[min(100vw-1rem,520px)]"
        footer={
          <button
            type="button"
            disabled={submitting}
            onClick={create}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-white text-sm font-semibold text-black transition hover:bg-[#e8e8e8] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (
              <>
                <SplitonLoader size="xxs" variant="dark" className="shrink-0" />
                {t("disputes.create.submitting")}
              </>
            ) : (
              t("disputes.create.submit")
            )}
          </button>
        }
      >
        <div className="space-y-4">
          <StyledSelectField
            label={t("disputes.create.typeLabel")}
            id="dispute-type"
            tone="dark"
            borderless
            value={type}
            options={disputeTypeOptions}
            onChange={setType}
            className="text-xs font-medium text-zinc-400"
          />

          <div>
            <label htmlFor="dispute-subject" className="mb-1.5 block text-xs font-medium text-zinc-400">
              {t("disputes.create.subjectLabel")}
            </label>
            <input
              id="dispute-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={t("disputes.create.subjectPlaceholder")}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="dispute-description" className="mb-1.5 block text-xs font-medium text-zinc-400">
              {t("disputes.create.descriptionLabel")}
            </label>
            <textarea
              id="dispute-description"
              ref={descriptionRef}
              rows={1}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("disputes.create.descriptionPlaceholder")}
              className={textareaClass}
            />
          </div>

          {formError ? <p className="text-sm text-rose-200">{formError}</p> : null}
        </div>
      </SecondaryMarketResponsiveSheet>
    </DashboardAppShell>
  );
}
