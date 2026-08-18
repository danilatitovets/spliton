"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Copy, Plus, X } from "@/lib/lucide";

import { profileDashboardHref } from "@/constants/dashboard/profile-page";
import { ProfileMusicAvatar } from "@/components/dashboard/profile/profile-music-avatar";
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

type Props = {
  displayName: string | null;
  email: string | null;
  userId: string | null;
  kycStatus: string | null;
  fallbackName: string;
};

export function ProfileOverviewIdentity({
  displayName,
  email,
  userId,
  kycStatus,
  fallbackName,
}: Props) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const [bannerOpen, setBannerOpen] = useState(true);
  const nick = displayName?.trim() || maskProfileEmail(email) || fallbackName;
  const verified = isKycApproved(kycStatus);

  async function onCopyId() {
    if (!userId) return;
    const result = await copyTextToClipboard(userId);
    if (result !== "ok") return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="flex min-w-0 flex-col gap-3">
      {bannerOpen && kycStatus != null && !verified ? (
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

      <section className={cn(profileCardClass, "relative overflow-hidden")}>
        <Link
          href={profileDashboardHref("account")}
          className="group/plus absolute right-3 top-3 z-10 inline-flex h-9 max-w-none items-center overflow-hidden rounded-full bg-white/[0.08] px-3 text-zinc-200 ring-1 ring-white/[0.08] transition-[max-width,background-color,color] duration-300 hover:bg-white/[0.12] hover:text-white focus-visible:bg-white/[0.12] focus-visible:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 md:max-w-[2.25rem] md:px-0 md:hover:max-w-[12.5rem] md:focus-visible:max-w-[12.5rem] sm:right-4 sm:top-4"
          aria-label={t("profile.overview.identity.viewProfile")}
        >
          <span className="inline-flex size-9 shrink-0 items-center justify-center">
            <Plus className="size-4" strokeWidth={2.2} aria-hidden />
          </span>
          <span className="whitespace-nowrap text-[12px] font-medium opacity-100 md:pr-3.5 md:opacity-0 md:transition-opacity md:duration-300 md:group-hover/plus:opacity-100 md:group-focus-visible/plus:opacity-100">
            {t("profile.overview.identity.viewProfile")}
          </span>
        </Link>

        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            maskImage: "radial-gradient(circle at 20% 0%, black 10%, transparent 70%)",
          }}
          aria-hidden
        />

        <div className="relative flex min-w-0 items-start gap-4 pr-12 sm:gap-5 sm:pr-14">
          <ProfileMusicAvatar userId={userId} email={email} className="size-20 sm:size-[5.5rem]" />

          <div className="min-w-0 flex-1 pt-0.5 sm:pt-1">
            <h2 className="text-[clamp(1.45rem,5.5vw,2.85rem)] font-semibold leading-[1.02] tracking-[-0.04em] text-white break-words">
              {nick}
            </h2>

            {userId ? (
              <div className="mt-2 flex min-w-0 flex-wrap items-center gap-1">
                <p className="min-w-0 text-[10px] leading-snug text-zinc-600 sm:text-[11px]">
                  <span className="uppercase tracking-[0.08em]">{t("profile.overview.identity.idPrefix")}</span>{" "}
                  <span className="font-mono text-[10px] text-zinc-500 sm:text-[11px]">{userId}</span>
                </p>
                <button
                  type="button"
                  onClick={() => void onCopyId()}
                  className="inline-flex size-5 shrink-0 items-center justify-center rounded-md text-zinc-600 transition hover:bg-white/[0.06] hover:text-zinc-300"
                  aria-label={t("profile.overview.copyId")}
                >
                  {copied ? <Check className="size-3 text-[#B7F500]" /> : <Copy className="size-3" />}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
