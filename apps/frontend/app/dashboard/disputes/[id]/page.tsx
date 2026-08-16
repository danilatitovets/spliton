"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { SplitonLoader } from "@/components/ui/spliton-loader";
import { useParams } from "next/navigation";

import { DisputeStatusSteps } from "@/components/dashboard/disputes/dispute-document-preview";
import { SplitonDarkSurface } from "@/components/dashboard/assets/spliton-dark-surface";
import { DashboardAppShell } from "@/components/layout/dashboard-app-shell";
import { useAuth } from "@/components/providers/auth-provider";
import { useI18n } from "@/components/providers/i18n-provider";
import { ROUTES } from "@/constants/routes";
import { useApiErrorMessage } from "@/hooks/use-api-error-message";
import { disputeTypeLabel } from "@/lib/i18n/disputes-messages";
import { formatDateTime } from "@/lib/i18n/formatters";
import { statusLabel } from "@/lib/i18n/status-labels";
import { resolveApiUrl } from "@/lib/public-env";
import { cn } from "@/lib/utils";

type DisputeMessage = {
  id: string;
  body: string;
  isStaff: boolean;
  createdAt: string;
};

type DisputeDetail = {
  id: string;
  subject: string;
  description: string;
  status: string;
  type: string;
  createdAt: string;
  messages: DisputeMessage[];
};

const DISPUTES_ICON = "/images/services-menu/disputes.webp";
const PANEL = "rounded-2xl bg-[#111111] sm:rounded-[1.35rem]";

const textareaClass = cn(
  "min-h-24 w-full rounded-2xl bg-white/[0.06] px-4 py-3 text-sm text-white",
  "placeholder:text-zinc-600 outline-none ring-1 ring-white/10 transition",
  "hover:bg-white/[0.08] hover:ring-white/20",
  "focus:bg-white/[0.1] focus:ring-white/55",
  "focus:shadow-[0_0_0_1px_rgba(255,255,255,0.35),0_0_24px_rgba(255,255,255,0.18)]",
);

export default function DisputeDetailPage() {
  const params = useParams<{ id: string }>();
  const disputeId = params.id;
  const { accessToken, user } = useAuth();
  const { t, locale } = useI18n();
  const { messageFor } = useApiErrorMessage();
  const [detail, setDetail] = React.useState<DisputeDetail | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [reply, setReply] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const load = React.useCallback(() => {
    if (!accessToken || !disputeId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    void fetch(resolveApiUrl(`/api/v1/disputes/${encodeURIComponent(disputeId)}`), {
      headers: { Authorization: `Bearer ${accessToken}` },
      credentials: "include",
    })
      .then(async (r) => {
        const body = (await r.json()) as DisputeDetail & { message?: string; code?: string };
        if (!r.ok) throw body;
        setDetail(body);
      })
      .catch((e: unknown) => {
        setDetail(null);
        setError(messageFor(e) || t("disputes.error.notFound"));
      })
      .finally(() => setLoading(false));
  }, [accessToken, disputeId, messageFor, t]);

  React.useEffect(() => {
    load();
  }, [load]);

  const sendReply = () => {
    if (!accessToken || !disputeId || !reply.trim()) return;
    setSubmitting(true);
    void fetch(resolveApiUrl(`/api/v1/disputes/${encodeURIComponent(disputeId)}/messages`), {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ body: reply.trim() }),
    })
      .then(async (r) => {
        const body = (await r.json()) as { message?: string; code?: string };
        if (!r.ok) throw body;
        setReply("");
        load();
      })
      .catch((e: unknown) => {
        setError(messageFor(e) || t("disputes.error.messageFailed"));
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <DashboardAppShell tone="dark" contentClassName="max-w-[960px] space-y-5 pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] sm:pb-10">
      <Link
        href={ROUTES.dashboardDisputes}
        className="text-sm font-medium text-zinc-400 transition hover:text-white"
      >
        {t("disputes.detail.back")}
      </Link>

      {!user ? (
        <section className={cn(PANEL, "px-6 py-10 text-center text-sm text-zinc-300")}>
          {t("disputes.detail.signInPrompt")}
        </section>
      ) : loading ? (
        <div className={cn(PANEL, "flex items-center justify-center gap-2 py-12 text-sm text-zinc-500")}>
          <SplitonLoader size="xxs" variant="light" className="shrink-0" />
          {t("common.loading")}
        </div>
      ) : error || !detail ? (
        <div className="rounded-2xl bg-rose-500/10 px-6 py-10 text-center ring-1 ring-rose-400/25">
          <p className="text-sm text-rose-100">{error ?? t("disputes.error.notFound")}</p>
          <button
            type="button"
            onClick={load}
            className="mt-3 text-xs font-semibold text-white underline-offset-2 hover:underline"
          >
            {t("common.retry")}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <SplitonDarkSurface
            className="min-h-0 shadow-none"
            contentClassName="flex items-start gap-4 sm:gap-5"
            watermarkCompact
          >
            <div className="relative size-16 shrink-0 sm:size-20">
              <Image
                src={DISPUTES_ICON}
                alt=""
                fill
                sizes="80px"
                className="object-contain"
                unoptimized
                aria-hidden
              />
            </div>
            <div className="min-w-0 pt-0.5">
              <p className="font-mono text-[11px] font-semibold text-zinc-400">
                {detail.id.length > 8
                  ? `DS-${detail.id.slice(0, 8).toUpperCase()}`
                  : `DS-${detail.id.toUpperCase()}`}
              </p>
              <h1 className="mt-1 text-xl font-semibold tracking-tight text-white sm:text-2xl">
                {detail.subject}
              </h1>
              <p className="mt-1 text-xs text-white/50">
                {disputeTypeLabel(detail.type, locale)} — {formatDateTime(detail.createdAt, locale)}
              </p>
            </div>
          </SplitonDarkSurface>

          <section className={cn(PANEL, "px-4 py-5 sm:px-6")}>
            <DisputeStatusSteps status={detail.status} />
            <p className="mt-3 text-center text-xs font-medium text-zinc-400">
              {statusLabel("dispute", detail.status, locale)}
            </p>
          </section>

          <section className={cn(PANEL, "px-5 py-5 sm:px-6")}>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">{detail.description}</p>
          </section>

          <section className={cn(PANEL, "px-5 py-5 sm:px-6")}>
            <h2 className="text-sm font-semibold text-white">{t("disputes.detail.conversation")}</h2>
            {detail.messages.length === 0 ? (
              <p className="mt-3 text-sm text-zinc-500">{t("disputes.detail.noMessages")}</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {detail.messages.map((msg) => (
                  <li
                    key={msg.id}
                    className={cn(
                      "rounded-2xl px-4 py-3 text-sm",
                      msg.isStaff ? "bg-white/[0.06] text-zinc-100" : "bg-white/[0.03] text-zinc-200",
                    )}
                  >
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                      {msg.isStaff ? t("disputes.detail.authorSupport") : t("disputes.detail.authorYou")} —{" "}
                      {formatDateTime(msg.createdAt, locale)}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap">{msg.body}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {!["resolved", "rejected", "closed"].includes(detail.status) ? (
            <section className={cn(PANEL, "space-y-3 px-5 py-5 sm:px-6")}>
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder={t("disputes.detail.replyPlaceholder")}
                className={textareaClass}
              />
              <button
                type="button"
                disabled={submitting || !reply.trim()}
                onClick={sendReply}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-white px-6 text-[13px] font-semibold text-black transition hover:bg-[#e8e8e8] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <SplitonLoader size="xxs" variant="dark" className="shrink-0" />
                    {t("disputes.detail.sending")}
                  </>
                ) : (
                  t("common.submit")
                )}
              </button>
            </section>
          ) : null}
        </div>
      )}
    </DashboardAppShell>
  );
}
