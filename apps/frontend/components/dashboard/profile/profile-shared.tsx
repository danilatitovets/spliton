"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import type { LucideIcon } from "@/lib/lucide";
import {
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpFromLine,
  Banknote,
  Bell,
  Camera,
  FileSpreadsheet,
  FileText,
  FolderOpen,
  Headphones,
  IdCard,
  KeyRound,
  Laptop,
  ListChecks,
  Lock,
  Mail,
  MapPin,
  Percent,
  Send,
  Shield,
  ShieldCheck,
  User,
} from "@/lib/lucide";
import { cn } from "@/lib/utils";

import { profileCardClass } from "./profile-ui";

export const PROFILE_GLASS = {
  profile: "/images/profile/profile-glass-profile.png",
  settings: "/images/profile/profile-glass-settings.png",
  security: "/images/profile/profile-glass-security.png",
  securitySpotlight: "/images/profile/profile-glass-security-spotlight.png",
  verification: "/images/profile/profile-glass-verification.png",
  support: "/images/profile/profile-glass-support.png",
  id: "/images/profile/profile-glass-id.png",
  address: "/images/profile/profile-glass-address.png",
  selfie: "/images/profile/profile-glass-selfie.png",
  email: "/images/profile/profile-glass-email.png",
  device: "/images/profile/profile-glass-device.png",
  password: "/images/profile/profile-glass-password.png",
  twoFa: "/images/profile/profile-glass-2fa.png",
  legal: "/images/profile/profile-glass-legal.png",
  consentHistoryEmpty: "/images/profile/profile-glass-consent-history-empty.png",
} as const;

export const PROFILE_METAL = {
  s: "/images/profile/profile-metal-s.png",
  shield: "/images/profile/profile-metal-shield.png",
  id: "/images/profile/profile-metal-id.png",
  support: "/images/profile/profile-metal-support.png",
  md: "/images/profile/profile-metal-md.png",
  ac: "/images/profile/profile-metal-ac.png",
  sgn: "/images/profile/profile-metal-sgn.png",
} as const;

export const PROFILE_LINE = {
  verification: ShieldCheck,
  security: Shield,
  support: Headphones,
  id: IdCard,
  address: MapPin,
  selfie: Camera,
  email: Mail,
  send: Send,
  legal: FileText,
  fee: Percent,
  profile: User,
  password: Lock,
  twoFa: KeyRound,
  whitelist: ListChecks,
  alert: Bell,
  device: Laptop,
  deposit: ArrowDownToLine,
  withdraw: ArrowUpFromLine,
  secondary: ArrowLeftRight,
  payouts: Banknote,
  documents: FolderOpen,
  statements: FileSpreadsheet,
} as const;

export type ProfileLineIconName = keyof typeof PROFILE_LINE;
export type ProfileIconSize = "sm" | "md" | "lg" | "xl";

export function ProfileLineIcon({
  icon: Icon,
  size = "sm",
  className,
}: {
  icon: LucideIcon;
  size?: ProfileIconSize;
  className?: string;
}) {
  const box =
    size === "xl"
      ? "size-20 sm:size-24"
      : size === "lg"
        ? "size-16 sm:size-[4.25rem]"
        : size === "md"
          ? "size-12"
          : "size-10";
  const glyph =
    size === "xl"
      ? "size-9 sm:size-10"
      : size === "lg"
        ? "size-7"
        : size === "md"
          ? "size-6"
          : "size-5";
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-full bg-white/[0.08] text-zinc-300",
        box,
        className,
      )}
      aria-hidden
    >
      <Icon className={glyph} strokeWidth={1.75} />
    </span>
  );
}

export function profileLineIcon(name: ProfileLineIconName, size: ProfileIconSize = "sm") {
  return <ProfileLineIcon icon={PROFILE_LINE[name]} size={size} />;
}

export function ProfileGlassIcon({
  src,
  size = "md",
}: {
  src: string;
  size?: ProfileIconSize;
}) {
  const box =
    size === "xl"
      ? "size-24 sm:size-28"
      : size === "lg"
        ? "size-[4.5rem] sm:size-20"
        : size === "sm"
          ? "size-12"
          : "size-14 sm:size-16";
  return (
    <div className={cn("relative shrink-0", box)} aria-hidden>
      <Image src={src} alt="" fill sizes="112px" className="object-contain" unoptimized />
    </div>
  );
}

export function ProfileScoreRing({
  score,
  maxScore,
  label,
  size = "md",
  className,
}: {
  score: number;
  maxScore: number;
  label?: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const pct = maxScore > 0 ? Math.min(1, score / maxScore) : 0;
  const deg = pct * 360;
  const outer = size === "sm" ? "h-[64px] w-[64px]" : "h-[76px] w-[76px]";
  const inner = size === "sm" ? "h-[52px] w-[52px]" : "h-[62px] w-[62px]";
  const scoreText = size === "sm" ? "text-[13px]" : "text-[15px]";

  return (
    <div
      className={cn("relative grid shrink-0 place-items-center rounded-full", outer, className)}
      style={{
        background: `conic-gradient(#E8B86D 0deg ${deg}deg, rgba(255,255,255,0.12) ${deg}deg 360deg)`,
      }}
      aria-hidden
    >
      <div
        className={cn(
          "flex flex-col items-center justify-center rounded-full bg-[#111111] text-center",
          inner,
        )}
      >
        <span className={cn("font-semibold tabular-nums leading-none tracking-tight text-[#E8B86D]", scoreText)}>
          {score}
        </span>
        {label ? (
          <span className="mt-0.5 text-[7px] font-medium uppercase tracking-[0.04em] text-zinc-500">
            {label}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function ProfileSectionCard({
  title,
  children,
  className,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn(profileCardClass, className)}>
      {title ? (
        <h2 className="text-base font-semibold tracking-tight text-white">{title}</h2>
      ) : null}
      {children}
    </section>
  );
}

export function ProfileRowLink({
  href,
  label,
  actionLabel,
  onClick,
}: {
  href?: string;
  label: string;
  actionLabel: string;
  onClick?: () => void;
}) {
  const actionClass =
    "shrink-0 text-sm font-medium text-white transition hover:text-zinc-400";

  return (
    <div className="flex items-center justify-between gap-4 py-3.5">
      <span className="min-w-0 text-sm text-zinc-300">{label}</span>
      {href ? (
        <Link href={href} className={actionClass}>
          {actionLabel}
        </Link>
      ) : (
        <button type="button" onClick={onClick} className={actionClass}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export const profileRowDividerClass = "divide-y divide-white/[0.06]";
