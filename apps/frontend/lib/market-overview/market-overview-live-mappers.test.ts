import { describe, expect, it } from "vitest";

import { mapSecondaryLiveSnapshot } from "./market-overview-live-mappers";
import type { MarketOverviewStatsApi } from "@/services/market-overview.service";

function statsWithTop(
  byVolume: MarketOverviewStatsApi["topReleases"]["byVolume"],
): MarketOverviewStatsApi {
  return {
    topReleases: { byVolume, byYield: [], byLiquidity: [], byProgress: [] },
    secondaryMarket: { tradesCount: 0, activeListings: 0, volumeUsdt: "0" },
  } as MarketOverviewStatsApi;
}

describe("mapSecondaryLiveSnapshot", () => {
  it("skips e2e admin-cancel titles when picking top demand", () => {
    const snap = mapSecondaryLiveSnapshot(
      statsWithTop([
        { id: "1", symbol: "AC22906", title: "Admin Cancel 2", artist: "QA", value: "120" },
        { id: "2", symbol: "RS-218", title: "Neon Drift", artist: "Lumen", value: "80" },
      ]),
    );
    expect(snap.topDemand).toBe("RS-218 — Neon Drift");
  });

  it("falls back when only noise titles exist", () => {
    const snap = mapSecondaryLiveSnapshot(
      statsWithTop([
        { id: "1", symbol: "AC22906", title: "Admin Cancel 2", artist: "QA", value: "120" },
      ]),
    );
    expect(snap.topDemand).toBe("—");
  });
});
