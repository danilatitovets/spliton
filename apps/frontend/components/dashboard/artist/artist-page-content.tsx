"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, FileText, Mic2, RefreshCw } from "@/lib/lucide";
import { SplitonLoader } from "@/components/ui/spliton-loader";

import { IssuerPortalOnboarding } from "@/components/dashboard/artist/issuer-portal-onboarding";
import { MediaPlaceholder } from "@/components/dashboard/dashboard-media-placeholder";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { useAuth } from "@/components/providers/auth-provider";
import { useI18n } from "@/components/providers/i18n-provider";
import { ReadOnlySectionError } from "@/components/shared/data-states/read-only-section-error";
import { ROUTES } from "@/constants/routes";
import { catalogItems, type CatalogItem } from "@/lib/catalog-mock";
import { formatUsdtRu } from "@/lib/wallet/format-money";
import { resolveApiUrl } from "@/lib/public-env";
import { cn } from "@/lib/utils";
import { isLiveCatalogEnabled, loadLiveCatalogItems } from "@/services/catalog.service";

type ArtistDashboard = {
  summary: {
    releases: number;
    liveRounds: number;
    tradesLast30Days: number;
    payoutsTotal: string;
    openSubmissions: number;
  };
};

type ArtistRelease = {
  id: string;
  slug: string;
  title: string;
  symbol: string;
  status: string;
  roundStatus: string | null;
  updatedAt: string;
};

type DisplayRelease = ArtistRelease & {
  artist?: string;
  coverUrl?: string | null;
  catalogId: string;
};

const surface = "rounded-2xl bg-white shadow-[0_1px_0_rgba(15,23,42,0.04)] ring-1 ring-black/[0.04]";
const surfaceMuted = "rounded-2xl bg-[#f4f4f5] px-4 py-4 sm:px-5";

function catalogCoverFallback(id: string, index = 0): string {
  const n = Number.parseInt(id, 10);
  const slot = Number.isFinite(n) ? ((n - 1) % 8) + 1 : (index % 8) + 1;
  return `/images/catalog/${slot}.png`;
}

function findCatalogMatch(pool: CatalogItem[], release: Pick<ArtistRelease, "id" | "slug">) {
  return pool.find((item) => item.slug === release.slug || item.id === release.id || item.id === release.slug);
}

function enrichRelease(release: ArtistRelease, pool: CatalogItem[]): DisplayRelease {
  const match = findCatalogMatch(pool, release);
  return {
    ...release,
    title: match?.title ?? release.title,
    artist: match?.artist,
    coverUrl: match?.coverUrl ?? catalogCoverFallback(release.id),
    catalogId: match?.id ?? release.id,
  };
}

function releaseHref(release: DisplayRelease) {
  return `/catalog/buy/${encodeURIComponent(release.catalogId)}`;
}

function ReleaseCover({
  coverUrl,
  title,
}: {
  coverUrl?: string | null;
  title: string;
}) {
  return (
    <div className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-[#111]">
      {coverUrl ? (
        <Image src={coverUrl} alt="" fill sizes="48px" className="object-cover" unoptimized />
      ) : (
        <MediaPlaceholder label={title} aspectClassName="absolute inset-0 h-full w-full min-h-0" frameless />
      )}
    </div>
  );
}

function StatusPill({
  status,
  roundStatus,
  t,
}: {
  status: string;
  roundStatus?: string | null;
  t: (key: string, fallback?: string) => string;
}) {
  const isLive = status === "live" || roundStatus === "live";
  const label = roundStatus
    ? t(`artist.portal.round.${roundStatus}`, roundStatus)
    : t(`artist.portal.status.${status}`, status);

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide",
        isLive && "bg-neutral-900 text-white",
        !isLive && status === "payouts" && "bg-emerald-50 text-emerald-800",
        !isLive && status !== "payouts" && "bg-neutral-100 text-neutral-600",
      )}
    >
      {label}
    </span>
  );
}

export function ArtistPageContent() {
  const { accessToken, user } = useAuth();
  const { t, locale } = useI18n();
  const [data, setData] = React.useState<ArtistDashboard | null>(null);
  const [releases, setReleases] = React.useState<ArtistRelease[]>([]);
  const [forbidden, setForbidden] = React.useState(false);
  const [loadError, setLoadError] = React.useState<unknown>(null);
  const [loading, setLoading] = React.useState(Boolean(user));
  const [catalogPool, setCatalogPool] = React.useState<CatalogItem[]>(
    isLiveCatalogEnabled() ? [] : catalogItems,
  );

  const kpiConfig = React.useMemo(
    () =>
      [
        { key: "releases" as const, label: t("artist.portal.kpi.releases") },
        { key: "liveRounds" as const, label: t("artist.portal.kpi.liveRounds") },
        { key: "tradesLast30Days" as const, label: t("artist.portal.kpi.tradesLast30Days") },
        {
          key: "payoutsTotal" as const,
          label: t("artist.portal.kpi.payoutsTotal"),
          format: (v: string | number) => formatUsdtRu(String(v)),
        },
        { key: "openSubmissions" as const, label: t("artist.portal.kpi.openSubmissions") },
      ] as const,
    [t],
  );

  React.useEffect(() => {
    if (!isLiveCatalogEnabled()) {
      setCatalogPool(catalogItems);
      return;
    }
    let cancelled = false;
    void loadLiveCatalogItems({ page: 1, pageSize: 32 }, locale)
      .then((res) => {
        if (!cancelled) setCatalogPool(res.items);
      })
      .catch(() => {
        if (!cancelled) setCatalogPool([]);
      });
    return () => {
      cancelled = true;
    };
  }, [locale]);

  const load = React.useCallback(() => {
    if (!accessToken) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    const headers = { Authorization: `Bearer ${accessToken}` };
    void Promise.all([
      fetch(resolveApiUrl("/api/v1/artist/dashboard"), { headers, credentials: "include" }),
      fetch(resolveApiUrl("/api/v1/artist/releases"), { headers, credentials: "include" }),
    ])
      .then(async ([dashRes, relRes]) => {
        if (dashRes.status === 403 || relRes.status === 403) {
          setForbidden(true);
          setLoadError(null);
          setData(null);
          setReleases([]);
          return;
        }
        if (!dashRes.ok || !relRes.ok) throw new Error("load failed");
        const dash = (await dashRes.json()) as ArtistDashboard;
        const rel = (await relRes.json()) as { items: ArtistRelease[] };
        setForbidden(false);
        setLoadError(null);
        setData(dash);
        setReleases(rel.items);
      })
      .catch((e) => {
        setForbidden(false);
        setLoadError(e);
        setData(null);
        setReleases([]);
      })
      .finally(() => setLoading(false));
  }, [accessToken]);

  React.useEffect(() => {
    load();
  }, [load]);

  const displayReleases = React.useMemo(
    () => releases.map((r) => enrichRelease(r, catalogPool)),
    [releases, catalogPool],
  );

  const hasPortalAccess = Boolean(data) && !forbidden;

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <DashboardHeader />
      <main className="scheme-light flex-1 text-neutral-900">
        <div className="mx-auto w-full max-w-[1120px] px-4 pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] pt-8 sm:px-6 sm:pb-12 lg:px-8 lg:pt-10">
          {!user ? (
            <IssuerPortalOnboarding />
          ) : loading ? (
            <div className="flex min-h-[40vh] items-center justify-center">
              <SplitonLoader size="sm" variant="dark" className="shrink-0" />
            </div>
          ) : (
            <>
              {loadError ? (
                <ReadOnlySectionError
                  sectionId="artist-portal"
                  error={loadError}
                  onRetry={load}
                />
              ) : null}
              {forbidden ? <IssuerPortalOnboarding /> : null}

              {hasPortalAccess && data ? (
                <div className="space-y-8 sm:space-y-10">
                  <header className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <h1 className="text-[2rem] font-semibold tracking-[-0.04em] text-neutral-950 sm:text-[2.5rem]">
                        {t("artist.portal.page.title")}
                      </h1>
                    </div>
                    <button
                      type="button"
                      onClick={load}
                      className="inline-flex size-10 items-center justify-center rounded-full bg-[#f4f4f5] text-neutral-600 transition hover:bg-neutral-200"
                      aria-label={t("artist.portal.releases.refreshAria")}
                    >
                      <RefreshCw className="size-4" />
                    </button>
                  </header>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                    {kpiConfig.map((kpi) => (
                      <div key={kpi.key} className={surfaceMuted}>
                        <p className="text-[11px] font-medium text-neutral-500">{kpi.label}</p>
                        <p className="mt-2 font-mono text-xl font-semibold tabular-nums tracking-tight text-neutral-950 sm:text-2xl">
                          {"format" in kpi && kpi.format
                            ? kpi.format(data.summary[kpi.key])
                            : String(data.summary[kpi.key])}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:gap-8">
                    <section className={cn(surface, "p-5 sm:p-6")}>
                      <h2 className="text-lg font-semibold tracking-[-0.02em] text-neutral-950">
                        {t("artist.portal.releases.title")}
                      </h2>

                      {displayReleases.length === 0 ? (
                        <p className="mt-6 rounded-2xl bg-[#f4f4f5] px-4 py-10 text-center text-sm text-neutral-500">
                          {t("artist.portal.releases.empty")}
                        </p>
                      ) : (
                        <ul className="mt-5 divide-y divide-neutral-100">
                          {displayReleases.map((display) => (
                            <li key={display.id} className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0">
                              <ReleaseCover coverUrl={display.coverUrl} title={display.title} />
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="truncate text-[15px] font-medium text-neutral-950">{display.title}</p>
                                  <StatusPill
                                    status={display.status}
                                    roundStatus={display.roundStatus}
                                    t={t}
                                  />
                                </div>
                                <p className="mt-0.5 font-mono text-xs text-neutral-400">{display.symbol}</p>
                              </div>
                              <Link
                                href={releaseHref(display)}
                                className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-neutral-900 transition hover:opacity-70"
                              >
                                {t("artist.portal.releases.open")}
                                <ArrowRight className="size-3.5" />
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </section>

                    <section className={cn(surface, "flex flex-col p-5 sm:p-6")}>
                      <h2 className="text-lg font-semibold tracking-[-0.02em] text-neutral-950">
                        {t("artist.portal.quickActions.title")}
                      </h2>
                      <div className="mt-5 flex flex-1 flex-col gap-2">
                        <Link
                          href={ROUTES.dashboardDocuments}
                          className="inline-flex h-12 items-center gap-3 rounded-2xl bg-[#f4f4f5] px-4 text-sm font-medium text-neutral-900 transition hover:bg-neutral-200"
                        >
                          <FileText className="size-4 text-neutral-500" aria-hidden />
                          {t("artist.portal.quickActions.documents")}
                        </Link>
                        <Link
                          href={ROUTES.dashboardSupport}
                          className="inline-flex h-12 items-center gap-3 rounded-2xl bg-[#f4f4f5] px-4 text-sm font-medium text-neutral-900 transition hover:bg-neutral-200"
                        >
                          <Mic2 className="size-4 text-neutral-500" aria-hidden />
                          {t("artist.portal.quickActions.newRelease")}
                        </Link>
                        <Link
                          href={ROUTES.dashboardStatements}
                          className="mt-auto inline-flex h-12 items-center justify-center rounded-2xl bg-neutral-950 px-4 text-sm font-semibold text-white transition hover:bg-neutral-800"
                        >
                          {t("artist.portal.quickActions.statements")}
                        </Link>
                      </div>
                    </section>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
