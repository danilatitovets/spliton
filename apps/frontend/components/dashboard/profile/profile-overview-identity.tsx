"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { Check, Copy, Shield, UserPlus, X } from "@/lib/lucide";

import { profileDashboardHref } from "@/constants/dashboard/profile-page";
import { copyTextToClipboard } from "@/lib/copy-to-clipboard";
import { useI18n } from "@/components/providers/i18n-provider";
import { cn } from "@/lib/utils";
import { profileCardClass } from "@/components/dashboard/profile/profile-ui";

export function maskProfileEmail(email: string | undefined | null): string | null {
  if (!email?.includes("@")) return null;
  const [user, domain] = email.split("@");
  if (!user || !domain) return email;
  return `${user.slice(0, Math.min(3, user.length))}***@${domain}`;
}

export function profileInitials(name: string | null, email: string | null): string {
  const parts = name?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (parts.length >= 2) return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase();
  if (parts[0] && parts[0].length >= 2) return parts[0].slice(0, 2).toUpperCase();
  if (parts[0]) return parts[0][0]!.toUpperCase();
  const local = email?.split("@")[0]?.trim();
  if (local && local.length >= 2) return local.slice(0, 2).toUpperCase();
  if (local) return local[0]!.toUpperCase();
  return "S";
}

export function isKycApproved(status: string | null | undefined): boolean {
  return (status ?? "").toLowerCase().replace(/_/g, "") === "approved";
}

function IdentityPill({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-white/[0.06] px-2.5 text-[12px] font-medium text-zinc-200 transition hover:bg-white/[0.1] hover:text-white"
    >
      {children}
    </Link>
  );
}

type Props = {
  displayName: string | null;
  email: string | null;
  userId: string | null;
  kycStatus: string | null;
  securityLevel: string | null;
  fallbackName: string;
};

export function ProfileOverviewIdentity({
  displayName,
  email,
  userId,
  kycStatus,
  securityLevel,
  fallbackName,
}: Props) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const [bannerOpen, setBannerOpen] = useState(true);
  const nick = displayName?.trim() || maskProfileEmail(email) || fallbackName;
  const verified = isKycApproved(kycStatus);
  const levelKey = securityLevel ? `profile.overview.identity.level.${securityLevel.toLowerCase()}` : "";
  const levelLabel = levelKey ? t(levelKey) : t("profile.overview.identity.level.medium");

  async function onCopyId() {
    if (!userId) return;
    const result = await copyTextToClipboard(userId);
    if (result !== "ok") return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="flex min-w-0 flex-col gap-3">
      {bannerOpen && !verified ? (
        <div className="flex items-center gap-3 rounded-[1.25rem] bg-amber-500/12 px-4 py-3 text-[13px] leading-relaxed text-amber-100">
          <p className="min-w-0 flex-1">
            {t("profile.overview.identity.verifyBanner")}{" "}
            <Link
              href={profileDashboardHref("verification")}
              className="font-medium underline decoration-amber-100/50 underline-offset-[4px] hover:decoration-amber-50"
            >
              {t("profile.overview.identity.verifyNow")}
            </Link>
          </p>
          <button
            type="button"
            onClick={() => setBannerOpen(false)}
            className="inline-flex size-7 shrink-0 items-center justify-center rounded-full text-amber-100/70 transition hover:bg-white/[0.06] hover:text-white"
            aria-label={t("profile.overview.identity.dismissBanner")}
          >
            <X className="size-4" />
          </button>
        </div>
      ) : null}

      <section className={profileCardClass}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3.5">
            <div
              className="grid size-12 shrink-0 place-items-center rounded-full bg-white/[0.08] text-[14px] font-semibold tracking-wide text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)] sm:size-[3.25rem] sm:text-[15px]"
              aria-hidden
            >
              {profileInitials(displayName, email)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[15px] font-semibold tracking-tight text-white sm:text-[16px]">{nick}</p>
              {userId ? (
                <div className="mt-1 flex min-w-0 items-center gap-1">
                  <p className="min-w-0 truncate text-[13px] text-zinc-500">
                    <span>{t("profile.overview.identity.idPrefix")}</span>{" "}
                    <span className="font-mono">{userId}</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => void onCopyId()}
                    className="inline-flex size-6 shrink-0 items-center justify-center rounded-md text-zinc-500 transition hover:bg-white/[0.06] hover:text-white"
                    aria-label={t("profile.overview.copyId")}
                  >
                    {copied ? <Check className="size-3.5 text-[#B7F500]" /> : <Copy className="size-3.5" />}
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <IdentityPill href={profileDashboardHref("security")}>
              <span className="grid size-5 place-items-center rounded-full bg-white/[0.12] text-white">
                <Shield className="size-3" aria-hidden />
              </span>
              {levelLabel}
            </IdentityPill>
            <IdentityPill href={profileDashboardHref("settings")}>
              <span className="grid size-5 place-items-center rounded-full bg-white/[0.12] text-white">
                <UserPlus className="size-3" aria-hidden />
              </span>
              {t("profile.overview.identity.accountType")}
            </IdentityPill>
            <IdentityPill href={profileDashboardHref("verification")}>
              <span
                className={cn(
                  "grid size-5 place-items-center rounded-full text-[11px] font-bold",
                  verified ? "bg-[#B7F500] text-black" : "bg-amber-500 text-black",
                )}
              >
                {verified ? <Check className="size-3" aria-hidden /> : "!"}
              </span>
              {verified ? t("profile.overview.identity.verified") : t("profile.overview.identity.unverified")}
            </IdentityPill>
          </div>
        </div>
      </section>
    </div>
  );
}
