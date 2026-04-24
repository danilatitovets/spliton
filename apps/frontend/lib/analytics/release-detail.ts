import { buildReleaseDetailPageData } from "@/mocks/analytics/release-detail.mock";
import { RELEASE_ANALYTICS_ROWS_MOCK } from "@/mocks/analytics/releases.mock";
import type { ReleaseDetailPageData } from "@/types/analytics/release-detail";
import type { ReleaseAnalyticsRow } from "@/types/analytics/releases";

export function getReleaseAnalyticsRowById(id: string): ReleaseAnalyticsRow | undefined {
  return RELEASE_ANALYTICS_ROWS_MOCK.find((r) => r.id === id);
}

export function getReleaseDetailPageData(id: string): ReleaseDetailPageData | undefined {
  const row = getReleaseAnalyticsRowById(id);
  if (!row) return undefined;
  return buildReleaseDetailPageData(row);
}
