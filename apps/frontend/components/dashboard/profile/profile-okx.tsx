"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { ProfileGlassIcon, ProfileScoreRing } from "./profile-shared";

function ProfileOkxLeading({ icon, size }: { icon: ReactNode; size: "sm" | "lg" | "xl" }) {
  if (typeof icon === "string") {
    return <ProfileGlassIcon src={icon} size={size} />;
  }
  return <>{icon}</>;
}

export const profileOkxGhostClass =
  "inline-flex h-9 shrink-0 items-center justify-center rounded-lg px-3.5 text-[13px] font-medium text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)] transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-40";

export const profileOkxPrimaryClass =
  "inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-white px-6 text-[14px] font-semibold text-black transition hover:bg-[#e8e8e8] disabled:opacity-50";

export const profileOkxPillClass =
  "inline-flex h-12 w-full items-center justify-center rounded-full bg-white px-6 text-[15px] font-semibold text-black transition hover:bg-[#e8e8e8] disabled:opacity-50";

export const profileOkxDangerPillClass =
  "inline-flex h-12 w-full items-center justify-center rounded-full bg-red-600 px-6 text-[15px] font-semibold text-white transition hover:bg-red-500 disabled:opacity-50";

export function ProfileOkxRecommended({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-[#B7F500] px-2 py-[3px] text-[11px] font-semibold leading-none text-black">
      {children}
    </span>
  );
}

export function ProfileOkxDetails({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="text-[14px] text-white underline decoration-white/45 underline-offset-[5px] transition hover:decoration-white"
    >
      {children}
    </Link>
  );
}

export function ProfileOkxSpotlight({
  icon,
  headline,
  body,
  detailsHref,
  detailsLabel,
  cta,
}: {
  icon: ReactNode;
  headline: string;
  body: string;
  detailsHref?: string;
  detailsLabel?: string;
  cta?: ReactNode;
}) {
  return (
    <section className="px-2 py-8 text-center sm:px-4 sm:py-10">
      <div className="mx-auto flex justify-center">
        <ProfileOkxLeading icon={icon} size="xl" />
      </div>
      <h2 className="mt-7 text-[22px] font-semibold tracking-tight text-white sm:text-[26px]">{headline}</h2>
      <p className="mx-auto mt-3 max-w-[44ch] text-[14px] leading-relaxed text-zinc-400">{body}</p>
      {detailsHref && detailsLabel ? (
        <div className="mt-3">
          <ProfileOkxDetails href={detailsHref}>{detailsLabel}</ProfileOkxDetails>
        </div>
      ) : null}
      {cta ? <div className="mx-auto mt-8 max-w-[22rem]">{cta}</div> : null}
    </section>
  );
}

export function ProfileOkxHeader({
  icon,
  title,
  subtitle,
  score,
  scoreMax,
  scoreLabel,
  cta,
}: {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  score?: number;
  scoreMax?: number;
  scoreLabel?: string;
  cta?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-4">
        {score != null && scoreMax != null ? (
          <ProfileScoreRing score={score} maxScore={scoreMax} label={scoreLabel} size="md" />
        ) : icon ? (
          <ProfileOkxLeading icon={icon} size="lg" />
        ) : null}
        <div className="min-w-0 pt-1">
          <h1 className="text-[1.65rem] font-semibold tracking-tight text-white sm:text-[1.85rem]">{title}</h1>
          {subtitle ? (
            <p className="mt-2 max-w-[54ch] text-[14px] leading-relaxed text-zinc-400">{subtitle}</p>
          ) : null}
        </div>
      </div>
      {cta ? <div className="shrink-0 self-start sm:self-center">{cta}</div> : null}
    </header>
  );
}

export function ProfileOkxBanner({
  icon,
  title,
  description,
  action,
  iconSize = "sm",
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  iconSize?: "sm" | "lg" | "xl";
}) {
  return (
    <div className="flex items-center gap-3.5 rounded-[1.25rem] bg-[#111111] px-5 py-4 sm:px-6">
      {icon ? <ProfileOkxLeading icon={icon} size={iconSize} /> : null}
      <div className="min-w-0 flex-1">
        <p className={cn("text-[14px] leading-snug", description ? "font-medium text-white" : "text-zinc-300")}>
          {title}
        </p>
        {description ? (
          <p className="mt-1 text-[13px] leading-snug text-zinc-400">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function ProfileOkxToggle({
  id,
  checked,
  onChange,
  disabled,
}: {
  id?: string;
  checked: boolean;
  onChange?: (value: boolean) => void;
  disabled?: boolean;
}) {
  const interactive = Boolean(onChange) && !disabled;
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={!interactive}
      onClick={() => onChange?.(!checked)}
      className={cn(
        "relative h-7 w-12 shrink-0 rounded-full transition-colors",
        checked ? "bg-[#B7F500]" : "bg-white/15",
        !interactive && "cursor-not-allowed opacity-50",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 size-6 rounded-full bg-black shadow transition-transform",
          checked && "translate-x-5",
        )}
      />
    </button>
  );
}

export function ProfileOkxSection({
  id,
  title,
  description,
  action,
  children,
}: {
  id?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} className="space-y-3">
      <div className="flex items-end justify-between gap-3 px-0.5 sm:px-1">
        <div className="min-w-0">
          <h2 className="text-[16px] font-semibold tracking-tight text-white sm:text-[17px]">{title}</h2>
          {description ? (
            <p className="mt-1 max-w-[52ch] text-[13px] leading-relaxed text-zinc-500">{description}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0 pb-0.5">{action}</div> : null}
      </div>
      <div className="overflow-hidden rounded-[1.25rem] bg-[#111111] divide-y divide-white/[0.06]">
        {children}
      </div>
    </section>
  );
}

export function ProfileOkxRow({
  id,
  icon,
  title,
  description,
  badge,
  action,
}: {
  id?: string;
  icon?: ReactNode;
  title: string;
  description?: string;
  badge?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div id={id} className="flex items-center gap-3.5 px-5 py-[1.15rem] sm:gap-4 sm:px-6">
      {icon ? <ProfileOkxLeading icon={icon} size="sm" /> : null}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[15px] font-semibold text-white">{title}</p>
          {badge}
        </div>
        {description ? <p className="mt-1 text-[13px] leading-relaxed text-zinc-500">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function ProfileOkxLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className={profileOkxGhostClass}>
      {children}
    </Link>
  );
}

export function ProfileOkxAlert({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-amber-500/10 px-4 py-3.5 sm:px-5" role="status">
      <p className="text-[14px] font-semibold text-amber-100">{title}</p>
      <div className="mt-1 text-[13px] leading-relaxed text-amber-100/80">{children}</div>
    </div>
  );
}

export function ProfileOkxTableWrap({ children }: { children: ReactNode }) {
  return (
    <div className={cn("overflow-x-auto rounded-2xl bg-[#111111]")}>{children}</div>
  );
}
