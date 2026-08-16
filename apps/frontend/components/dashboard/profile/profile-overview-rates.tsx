"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { useAuth } from "@/components/providers/auth-provider";
import { useI18n } from "@/components/providers/i18n-provider";
import { analyticsReleaseDetailPath, ROUTES } from "@/constants/routes";
import { parseSignedPercentChange } from "@/lib/analytics/change-pct";
import { adaptAnalyticsListItem } from "@/lib/analytics/release-analytics-adapter";
import { resolveCatalogCoverUrl } from "@/lib/catalog/catalog-demo-covers";
import { readLocalReleaseNotes } from "@/features/analytics/releases/lib/local-release-notes";
import { isLiveReleaseAnalyticsEnabled } from "@/lib/public-env";
import { cn } from "@/lib/utils";
import { RELEASE_ANALYTICS_ROWS_MOCK } from "@/mocks/analytics/releases.mock";
import { fetchReleaseAnalyticsList } from "@/services/release-analytics.service";
import type { ReleaseAnalyticsRow } from "@/types/analytics/releases";

import { profileCardClass } from "./profile-ui";

type RatesTab = "favorites" | "top" | "popular" | "gainers" | "new";

const TABS: RatesTab[] = ["favorites", "top", "popular", "gainers", "new"];
const ROW_LIMIT = 7;

function parseVolume(s: string): number {
  return Number(s.replace(/[^\d]/g, "")) || 0;
}

function lastPrice(row: ReleaseAnalyticsRow): string {
  const raw = row.lastTradePrice ?? row.pricePerUnitUsdt;
  if (!raw) return "—";
  const n = Number(String(raw).replace(",", ".").replace(/[^\d.-]/g, ""));
  if (!Number.isFinite(n)) return "—";
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function changeTone(changePct: string): string {
  const n = parseSignedPercentChange(changePct);
  if (n > 0) return "text-[#00C087]";
  if (n < 0) return "text-[#FF4D4F]";
  return "text-zinc-500";
}

function sortRows(rows: ReleaseAnalyticsRow[], tab: RatesTab): ReleaseAnalyticsRow[] {
  const copy = [...rows];
  if (tab === "favorites") {
    const watch = readLocalReleaseNotes();
    return copy.filter((row) => watch[row.id]).slice(0, ROW_LIMIT);
  }
  if (tab === "top") {
    return copy.sort((a, b) => parseVolume(b.payouts) - parseVolume(a.payouts)).slice(0, ROW_LIMIT);
  }
  if (tab === "popular") {
    return copy
      .sort((a, b) => (b.holdersCount ?? parseVolume(b.payouts)) - (a.holdersCount ?? parseVolume(a.payouts)))
      .slice(0, ROW_LIMIT);
  }
  if (tab === "gainers") {
    return copy
      .sort((a, b) => parseSignedPercentChange(b.changePct) - parseSignedPercentChange(a.changePct))
      .slice(0, ROW_LIMIT);
  }
  return copy.sort((a, b) => Number.parseInt(b.id, 10) - Number.parseInt(a.id, 10)).slice(0, ROW_LIMIT);
}

export function ProfileOverviewRates() {
  const { t } = useI18n();
  const { authorizedFetch } = useAuth();
  const [tab, setTab] = useState<RatesTab>("top");
  const [rows, setRows] = useState<ReleaseAnalyticsRow[]>(RELEASE_ANALYTICS_ROWS_MOCK);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLiveReleaseAnalyticsEnabled()) return;
    let cancelled = false;
    setLoading(true);
    void fetchReleaseAnalyticsList({ page: 1, pageSize: 24, sort: "payouts", sortDir: "desc" }, authorizedFetch)
      .then((res) => {
        if (cancelled || !res.items?.length) return;
        setRows(res.items.map(adaptAnalyticsListItem));
      })
      .catch(() => {
        if (!cancelled) setRows(RELEASE_ANALYTICS_ROWS_MOCK);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [authorizedFetch]);

  const visible = useMemo(() => sortRows(rows, tab), [rows, tab]);

  return (
    <section className={profileCardClass} aria-label={t("profile.overview.rates.aria")}>
      <h2 className="text-[16px] font-semibold tracking-tight text-white">{t("profile.overview.rates.title")}</h2>

      <div
        className="mt-4 flex flex-wrap gap-x-5 gap-y-0 overflow-x-auto overflow-y-hidden border-b border-white/[0.06] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="tablist"
      >
        {TABS.map((id) => {
          const active = tab === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(id)}
              className={cn(
                "relative shrink-0 pb-2.5 text-[13px] transition after:absolute after:inset-x-0 after:bottom-[-1px] after:h-0.5 after:bg-transparent",
                active
                  ? "font-semibold text-white after:bg-white"
                  : "text-zinc-500 hover:text-zinc-300",
              )}
            >
              {t(`profile.overview.rates.tab.${id}`)}
            </button>
          );
        })}
      </div>

      <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto_4.5rem] gap-3 px-0.5 text-[12px] text-zinc-500">
        <span>{t("profile.overview.rates.col.name")}</span>
        <span className="text-right">{t("profile.overview.rates.col.price")}</span>
        <span className="text-right">{t("profile.overview.rates.col.change")}</span>
      </div>

      {loading && !visible.length ? (
        <div className="mt-2 space-y-2" aria-hidden>
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-white/[0.04]" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <p className="py-8 text-center text-[13px] text-zinc-500">{t("profile.overview.rates.empty")}</p>
      ) : (
        <ul className="mt-1 divide-y divide-white/[0.06]">
          {visible.map((row) => {
            const cover = resolveCatalogCoverUrl(undefined, row.id);
            return (
              <li key={row.id}>
                <Link
                  href={analyticsReleaseDetailPath(row.id)}
                  className="grid grid-cols-[minmax(0,1fr)_auto_4.5rem] items-center gap-3 py-3.5 transition hover:bg-white/[0.03]"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="relative size-8 shrink-0 overflow-hidden rounded-full bg-white/[0.06]">
                      <Image src={cover} alt="" fill sizes="32px" className="object-cover" />
                    </div>
                    <p className="truncate text-[14px] font-semibold text-white">{row.symbol}</p>
                  </div>
                  <p className="text-right font-mono text-[14px] tabular-nums text-white">{lastPrice(row)}</p>
                  <p
                    className={cn(
                      "text-right font-mono text-[14px] font-medium tabular-nums",
                      changeTone(row.changePct),
                    )}
                  >
                    {row.changePct}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-2 border-t border-white/[0.06] pt-4 text-center">
        <Link
          href={ROUTES.analyticsReleases}
          className="text-[13px] text-white underline decoration-white/40 underline-offset-[5px] transition hover:decoration-white"
        >
          {t("profile.overview.rates.more")}
        </Link>
      </div>
    </section>
  );
}
