"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, RefreshCw } from "@/lib/lucide";
import { SplitonLoader } from "@/components/ui/spliton-loader";

import {
  shortSupportTicketId,
  SupportTicketStatusBadge,
} from "@/components/dashboard/support/dashboard-support-shared";
import { DashboardAppShell } from "@/components/layout/dashboard-app-shell";
import {
  profileCardClass,
  profileMutedCardClass,
  profilePrimaryButtonClass,
} from "@/components/dashboard/profile/profile-ui";
import { FeesPageTabs } from "@/components/fees/fees-page-tabs";
import { ProductDemoBanner } from "@/components/shared/product-demo-banner";
import { useAuth } from "@/components/providers/auth-provider";
import { useI18n } from "@/components/providers/i18n-provider";
import { SplitonCtaPill } from "@/components/ui/spliton-cta-pill";
import { StyledSelectField } from "@/components/ui/styled-select";
import { SUPPORT_HELPDESK_EMAIL } from "@/constants/support-center";
import { ROUTES } from "@/constants/routes";
import { useApiErrorMessage } from "@/hooks/use-api-error-message";
import { formatDateTime } from "@/lib/i18n/formatters";
import {
  SUPPORT_TICKET_CATEGORY_VALUES,
  supportTicketCategoryLabel,
} from "@/lib/i18n/support-messages";
import { cn } from "@/lib/utils";
import {
  createUserSupportTicket,
  getUserSupportDataSource,
  listUserSupportTickets,
  type UserSupportTicket,
} from "@/services/user/userSupport.service";

type PageTab = "create" | "list";

const PAGE_TABS: { id: PageTab; labelKey: string }[] = [
  { id: "create", labelKey: "support.tickets.tab.create" },
  { id: "list", labelKey: "support.tickets.tab.list" },
];

const HEADER_VIDEO = "/videos/position-holding-bg.mp4";
const SUPPORT_HERO = "/images/support/dashboard-support-hero.png?v=1";
const STEP_ICONS = [
  "/images/partner/partner-step-01.png",
  "/images/partner/partner-step-02.png",
  "/images/partner/partner-step-03.png",
] as const;

const fieldClass = cn(
  "h-11 w-full rounded-xl border-0 bg-white/[0.06] px-3.5 text-sm text-white shadow-none outline-none ring-0",
  "placeholder:text-zinc-600 transition",
  "hover:bg-white/[0.08] focus:bg-white/[0.1] focus:outline-none focus:ring-0",
);

const textareaClass = cn(
  "min-h-[7rem] w-full resize-none overflow-hidden rounded-xl border-0 bg-white/[0.06] px-3.5 py-3 text-sm leading-relaxed text-white shadow-none outline-none ring-0",
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

function FormStep({
  index,
  title,
  children,
}: {
  index: number;
  title: string;
  children: React.ReactNode;
}) {
  const icon = STEP_ICONS[index] ?? STEP_ICONS[0];
  return (
    <div className="grid gap-3 sm:grid-cols-[4.25rem_1fr] sm:items-start sm:gap-4">
      <div className="relative size-14 shrink-0 sm:size-16" aria-hidden>
        <Image src={`${icon}?v=1`} alt="" fill sizes="64px" className="object-contain" unoptimized />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/40">{title}</p>
        <div className="mt-2">{children}</div>
      </div>
    </div>
  );
}

export function DashboardSupportPageContent() {
  const { authorizedFetch, isAuthenticated, user } = useAuth();
  const { t, locale } = useI18n();
  const { messageFor } = useApiErrorMessage();
  const live = getUserSupportDataSource() === "live";

  const categoryOptions = React.useMemo(
    () =>
      SUPPORT_TICKET_CATEGORY_VALUES.map((value) => ({
        value,
        label: supportTicketCategoryLabel(value, locale),
      })),
    [locale],
  );

  const [tab, setTab] = React.useState<PageTab>("create");
  const [tickets, setTickets] = React.useState<UserSupportTicket[]>([]);
  const [loading, setLoading] = React.useState(Boolean(user && live));
  const [loadError, setLoadError] = React.useState<string | null>(null);

  const [category, setCategory] = React.useState<string>("other");
  const [subject, setSubject] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const messageRef = useAutoGrowTextarea(message);

  const load = React.useCallback(() => {
    if (!live || !isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    void listUserSupportTickets(authorizedFetch)
      .then((r) => setTickets(r.items))
      .catch((e: unknown) => setLoadError(messageFor(e) || t("support.error.live")))
      .finally(() => setLoading(false));
  }, [authorizedFetch, isAuthenticated, live, messageFor, t]);

  React.useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!live || !isAuthenticated) return;
    setFormError(null);
    setSubmitting(true);
    try {
      await createUserSupportTicket(authorizedFetch, {
        category,
        subject: subject.trim(),
        message: message.trim(),
      });
      setSubject("");
      setMessage("");
      setCategory("other");
      load();
      setTab("list");
    } catch (err: unknown) {
      setFormError(messageFor(err) || t("support.tickets.create.error"));
    } finally {
      setSubmitting(false);
    }
  }

  const tabItems = React.useMemo(
    () => PAGE_TABS.map((item) => ({ id: item.id, label: t(item.labelKey) })),
    [t],
  );

  const subtitleParts = t("support.tickets.subtitle").split("{help}");

  const metrics = React.useMemo(() => {
    const open = tickets.filter((x) => x.status === "open" || x.status === "in_progress").length;
    const waiting = tickets.filter((x) => x.status === "waiting_user").length;
    return [
      { key: "total", label: t("support.tickets.list.countSuffix"), value: tickets.length },
      { key: "open", label: t("support.tickets.metrics.open", "В работе"), value: open },
      { key: "waiting", label: t("support.tickets.metrics.waiting", "Ждут ответа"), value: waiting },
    ] as const;
  }, [t, tickets]);

  return (
    <DashboardAppShell
      tone="dark"
      contentClassName="max-w-3xl pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] sm:pb-10"
    >
      <section className="relative isolate overflow-hidden rounded-2xl shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)] sm:rounded-[1.35rem]">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <video
            className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-[12px] motion-reduce:hidden"
            src={HEADER_VIDEO}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/78 to-black" />
        </div>
        <div className="relative z-10 flex flex-col gap-5 px-5 py-6 sm:flex-row sm:items-center sm:gap-6 sm:px-7 sm:py-8">
          <div className="relative mx-auto size-24 shrink-0 sm:mx-0 sm:size-28">
            <Image
              src={SUPPORT_HERO}
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
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/45">
              {t("support.tickets.tab.create")}
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              {t("support.tickets.pageTitle")}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-white/55">
              {subtitleParts[0]}
              <Link
                href={ROUTES.support}
                className="font-medium text-white underline decoration-white/25 underline-offset-4 hover:decoration-white/60"
              >
                {t("support.tickets.subtitleHelpLink")}
              </Link>
              {subtitleParts[1]}
            </p>
          </div>
        </div>
      </section>

      <div className="mt-4 flex flex-wrap gap-2">
        <SplitonCtaPill href={ROUTES.support} tone="onDark" variant="ghost" className="h-9 min-w-0 px-3.5 text-[12px]">
          {t("support.tickets.link.helpCenter")}
        </SplitonCtaPill>
        <SplitonCtaPill
          href={ROUTES.systemStatus}
          tone="onDark"
          variant="ghost"
          withArrow={false}
          className="h-9 min-w-0 px-3.5 text-[12px]"
        >
          {t("support.tickets.link.systemStatus")}
        </SplitonCtaPill>
        <a
          href={`mailto:${SUPPORT_HELPDESK_EMAIL}?subject=${encodeURIComponent(t("support.contact.mailSubject"))}`}
          className="inline-flex h-9 items-center gap-1 rounded-full px-3.5 text-[12px] font-semibold text-white/75 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.14)] transition hover:bg-white/[0.06] hover:text-white"
        >
          {t("support.tickets.link.email")}
          <ChevronRight className="size-3.5" aria-hidden />
        </a>
      </div>

      {!user ? (
        <section className={cn(profileCardClass, "mt-6 text-center shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] sm:mt-8")}>
          <div className="relative mx-auto size-20">
            <Image src={SUPPORT_HERO} alt="" fill sizes="80px" className="object-contain" unoptimized aria-hidden />
          </div>
          <p className="mt-4 text-sm text-zinc-300">{t("support.tickets.signInPrompt")}</p>
          <Link href={ROUTES.login} className={cn(profilePrimaryButtonClass, "mt-5")}>
            {t("auth.login.submit")}
          </Link>
        </section>
      ) : (
        <div className="mt-6 space-y-5 sm:mt-8">
          <FeesPageTabs items={tabItems} active={tab} onChange={setTab} variant="chips" />

          {tab === "create" ? (
            <section className={cn(profileCardClass, "px-5 py-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] sm:px-7 sm:py-8")}>
              {!live ? (
                <ProductDemoBanner messageKey="support.tickets.demoHint" />
              ) : (
                <form onSubmit={(e) => void handleCreate(e)} className="space-y-6">
                  <FormStep index={0} title={t("support.tickets.categoryLabel")}>
                    <StyledSelectField
                      label=""
                      id="support-ticket-category"
                      tone="dark"
                      borderless
                      value={category}
                      options={categoryOptions}
                      onChange={setCategory}
                      className="text-xs font-medium text-zinc-400"
                    />
                  </FormStep>

                  <div className="border-t border-white/[0.08] pt-6">
                    <FormStep index={1} title={t("support.tickets.subjectLabel")}>
                      <input
                        id="support-ticket-subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder={t("support.tickets.subjectPlaceholder")}
                        className={fieldClass}
                        required
                        minLength={3}
                        maxLength={200}
                      />
                    </FormStep>
                  </div>

                  <div className="border-t border-white/[0.08] pt-6">
                    <FormStep index={2} title={t("support.tickets.messageLabel")}>
                      <textarea
                        id="support-ticket-message"
                        ref={messageRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={t("support.tickets.messagePlaceholder")}
                        className={textareaClass}
                        required
                        minLength={1}
                        maxLength={10000}
                      />
                    </FormStep>
                  </div>

                  {formError ? (
                    <p className="rounded-xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200 ring-1 ring-rose-400/25" role="alert">
                      {formError}
                    </p>
                  ) : null}

                  <div className="space-y-2 border-t border-white/[0.08] pt-6">
                    <button
                      type="submit"
                      disabled={submitting}
                      className={cn(profilePrimaryButtonClass, "w-full gap-2 disabled:opacity-50 sm:w-auto")}
                    >
                      {submitting ? (
                        <>
                          <SplitonLoader size="xxs" variant="dark" className="shrink-0" />
                          {t("support.tickets.create.submitting")}
                        </>
                      ) : (
                        t("support.tickets.submit")
                      )}
                    </button>
                    <p className="text-xs text-zinc-500">{t("support.tickets.create.hint")}</p>
                  </div>
                </form>
              )}
            </section>
          ) : (
            <section className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-zinc-500">
                  {tickets.length > 0 ? `${tickets.length} ${t("support.tickets.list.countSuffix")}` : null}
                </p>
                {live ? (
                  <button
                    type="button"
                    onClick={load}
                    disabled={loading}
                    className="inline-flex size-9 items-center justify-center rounded-full bg-white/[0.06] text-zinc-300 ring-1 ring-white/10 transition hover:bg-white/[0.1] hover:text-white disabled:opacity-60"
                    aria-label={t("support.tickets.list.refreshAria")}
                  >
                    <RefreshCw className={cn("size-4", loading && "animate-spin")} aria-hidden />
                  </button>
                ) : null}
              </div>

              {tickets.length > 0 ? (
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
              ) : null}

              {loadError ? (
                <p className="rounded-xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200 ring-1 ring-rose-400/25" role="alert">
                  {loadError}
                </p>
              ) : null}

              {loading ? (
                <div className="flex min-h-[12rem] items-center justify-center gap-2 text-sm text-zinc-500">
                  <SplitonLoader size="sm" variant="light" className="shrink-0" />
                  {t("support.tickets.loading")}
                </div>
              ) : tickets.length === 0 ? (
                <div className={cn(profileCardClass, "text-center shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]")}>
                  <div className="relative mx-auto size-20 opacity-80">
                    <Image src={SUPPORT_HERO} alt="" fill sizes="80px" className="object-contain" unoptimized aria-hidden />
                  </div>
                  <p className="mt-4 text-sm text-zinc-400">{t("support.tickets.empty")}</p>
                  <button
                    type="button"
                    onClick={() => setTab("create")}
                    className={cn(profilePrimaryButtonClass, "mt-5")}
                  >
                    {t("support.tickets.submit")}
                  </button>
                </div>
              ) : (
                <ul className="divide-y divide-white/[0.08] overflow-hidden rounded-2xl bg-[#111111] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
                  {tickets.map((ticket) => (
                    <li key={ticket.id}>
                      <Link
                        href={ROUTES.dashboardSupportTicket(ticket.id)}
                        className="flex items-center justify-between gap-3 px-4 py-3.5 transition hover:bg-white/[0.04] sm:px-5"
                      >
                        <div className="min-w-0">
                          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-white/40">
                            {shortSupportTicketId(ticket.id)}
                          </p>
                          <p className="mt-0.5 truncate text-sm font-semibold text-white">{ticket.subject}</p>
                          <p className="mt-0.5 text-xs text-zinc-500">
                            {supportTicketCategoryLabel(ticket.category, locale)} ·{" "}
                            {formatDateTime(ticket.updatedAt, locale, { dateStyle: "medium", timeStyle: "short" })}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <SupportTicketStatusBadge status={ticket.status} locale={locale} tone="dark" />
                          <ChevronRight className="size-4 text-zinc-500" aria-hidden />
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}
        </div>
      )}
    </DashboardAppShell>
  );
}
