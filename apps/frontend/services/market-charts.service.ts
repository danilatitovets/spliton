import { parseApiClientError } from "@/lib/api/api-client-error";
import { getPublicApiBaseUrl } from "@/lib/public-env";
import type { ChartPeriodId } from "@/lib/analytics/chart-period";

export type ChartSeriesApi = {
  period: string;
  bucket: string;
  timezone: string;
  from: string | null;
  to: string;
  points: Array<{
    timestamp: string;
    value: number;
    values?: Record<string, number>;
  }>;
  summary: Record<string, string | number | null>;
  lastUpdatedAt: string;
  source: string;
  emptyReason?: string;
};

export type MarketChartReleaseRef =
  | string
  | {
      releaseId?: string;
      slug?: string;
      symbol?: string;
    };

type Fetcher = (path: string, init?: RequestInit) => Promise<Response>;

const RELEASE_UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function baseUrl() {
  return getPublicApiBaseUrl();
}

function qs(params: Record<string, string | undefined>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v) sp.set(k, v);
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

function releaseQuery(ref: MarketChartReleaseRef): Record<string, string | undefined> {
  if (typeof ref === "string") {
    if (RELEASE_UUID_RE.test(ref)) return { releaseId: ref };
    return { slug: ref };
  }
  return {
    releaseId: ref.releaseId,
    slug: ref.slug,
    symbol: ref.symbol,
  };
}

async function parseChart(res: Response): Promise<ChartSeriesApi> {
  if (!res.ok) throw await parseApiClientError(res);
  return res.json() as Promise<ChartSeriesApi>;
}

async function fetchChart(
  chart: "price" | "volume" | "liquidity",
  release: MarketChartReleaseRef,
  period: ChartPeriodId,
  fetcher?: Fetcher,
): Promise<ChartSeriesApi> {
  const path = `/api/v1/market/charts/${chart}${qs({ ...releaseQuery(release), period })}`;
  const res = fetcher
    ? await fetcher(`${baseUrl()}${path}`)
    : await fetch(`${baseUrl()}${path}`, { credentials: "include" });
  return parseChart(res);
}

export async function fetchMarketPriceChart(
  release: MarketChartReleaseRef,
  period: ChartPeriodId,
  fetcher?: Fetcher,
): Promise<ChartSeriesApi> {
  return fetchChart("price", release, period, fetcher);
}

export async function fetchMarketVolumeChart(
  release: MarketChartReleaseRef,
  period: ChartPeriodId,
  fetcher?: Fetcher,
): Promise<ChartSeriesApi> {
  return fetchChart("volume", release, period, fetcher);
}

export async function fetchMarketLiquidityChart(
  release: MarketChartReleaseRef,
  period: ChartPeriodId,
  fetcher?: Fetcher,
): Promise<ChartSeriesApi> {
  return fetchChart("liquidity", release, period, fetcher);
}

export function chartPointsToValues(chart: ChartSeriesApi): number[] {
  return chart.points.map((p) => p.value);
}

export function chartPointsToDual(
  chart: ChartSeriesApi,
  secondKey: string,
): { primary: number[]; secondary?: number[] } {
  return {
    primary: chart.points.map((p) => p.value),
    secondary: chart.points.map((p) => p.values?.[secondKey] ?? 0),
  };
}
