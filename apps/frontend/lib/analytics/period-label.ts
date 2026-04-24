import type { ReleaseAnalyticsPeriod } from "@/types/analytics/releases";

export function releaseAnalyticsPeriodLabel(p: ReleaseAnalyticsPeriod) {
  switch (p) {
    case "7d":
      return "7D";
    case "30d":
      return "30D";
    case "90d":
      return "90D";
    case "all":
      return "All time";
    default:
      return p;
  }
}
