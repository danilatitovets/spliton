"use client";

import Image from "next/image";
import Link from "next/link";

import { useI18n } from "@/components/providers/i18n-provider";
import { assetsPositionDetailPath, ROUTES } from "@/constants/routes";
import type { UserHoldingItem } from "@/services/wallet.service";
import { cn } from "@/lib/utils";

type DemoRow = {
  name: string;
  sub: string;
  price: string;
  change: string;
  up: boolean;
  cover?: string;
};

function catalogCoverFromId(id: string): string {
  const n = Number.parseInt(id, 10);
  if (!Number.isFinite(n)) return "/images/hero-journey/1.webp";
  const slot = ((Math.abs(n) - 1) % 5) + 1;
  return `/images/catalog/${slot}.png`;
}

function HoldingCover({ src }: { src?: string | null }) {
  if (!src) {
    return <div className="size-12 shrink-0 rounded-xl bg-white/[0.06]" />;
  }
  return (
    <div className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-white/[0.06]">
      <Image src={src} alt="" fill sizes="48px" className="object-cover" />
    </div>
  );
}

export function ProfileHoldingsList({
  liveWallet,
  holdings,
  demoRows,
}: {
  liveWallet: boolean;
  holdings: UserHoldingItem[];
  demoRows: readonly DemoRow[];
}) {
  const { t } = useI18n();
  const showLive = liveWallet && holdings.length > 0;
  const showDemo = !showLive && demoRows.length > 0;

  if (!showLive && !showDemo) return null;

  if (showLive) {
    return (
      <>
        {holdings.map((row) => (
          <Link
            key={row.releaseId}
            href={assetsPositionDetailPath(row.releaseId)}
            className="flex items-center gap-3.5 px-5 py-[1.15rem] transition hover:bg-white/[0.03] sm:gap-4 sm:px-6"
          >
            <HoldingCover src={catalogCoverFromId(row.releaseId)} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-semibold text-white">{row.trackTitle}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-zinc-500">
                {row.symbol} / {t("profile.holdings.revenueShare")}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[15px] font-semibold tabular-nums text-white">{row.unitsTotal}</p>
              <p className="mt-1 text-[13px] tabular-nums text-zinc-500">
                {t("profile.holdings.available").replace("{count}", String(row.unitsAvailable))}
              </p>
            </div>
          </Link>
        ))}
      </>
    );
  }

  return (
    <>
      {demoRows.map((row) => (
        <Link
          key={row.name}
          href={ROUTES.dashboardPositions}
          className="flex items-center gap-3.5 px-5 py-[1.15rem] transition hover:bg-white/[0.03] sm:gap-4 sm:px-6"
        >
          <HoldingCover src={row.cover} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-semibold text-white">{row.name}</p>
            <p className="mt-1 text-[13px] leading-relaxed text-zinc-500">
              {row.sub} / {t("profile.holdings.demo")}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[15px] font-semibold tabular-nums text-white">{row.price}</p>
            <p
              className={cn(
                "mt-1 text-[13px] font-medium tabular-nums",
                row.up ? "text-[#B7F500]" : "text-zinc-500",
              )}
            >
              {row.change}
            </p>
          </div>
        </Link>
      ))}
    </>
  );
}

export function ProfileHoldingsEmpty({ liveWallet }: { liveWallet: boolean }) {
  const { t } = useI18n();
  if (!liveWallet) return null;
  return (
    <p className="px-5 py-8 text-center text-[14px] leading-relaxed text-zinc-500 sm:px-6">
      {t("profile.holdings.emptyBefore")}{" "}
      <Link href={ROUTES.dashboardCatalog} className="font-medium text-white underline decoration-white/35 underline-offset-[5px]">
        {t("profile.holdings.emptyCatalog")}
      </Link>
    </p>
  );
}
