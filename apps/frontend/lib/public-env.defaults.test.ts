import { afterEach, describe, expect, it, vi } from "vitest";

import {
  getAuthDataSource,
  getCatalogDataSource,
  getNewsDataSource,
  getPortfolioDataSource,
  getStatusDataSource,
  getSupportDataSource,
  getWalletDataSource,
} from "@/lib/public-env";

describe("public data source fail-closed defaults", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("resolves unset sources to live, not mock", () => {
    vi.stubEnv("NEXT_PUBLIC_WALLET_DATA_SOURCE", "");
    vi.stubEnv("NEXT_PUBLIC_CATALOG_DATA_SOURCE", "");
    vi.stubEnv("NEXT_PUBLIC_PORTFOLIO_DATA_SOURCE", "");
    vi.stubEnv("NEXT_PUBLIC_AUTH_DATA_SOURCE", "");
    vi.stubEnv("NEXT_PUBLIC_SUPPORT_DATA_SOURCE", "");
    vi.stubEnv("NEXT_PUBLIC_NEWS_DATA_SOURCE", "");
    vi.stubEnv("NEXT_PUBLIC_STATUS_DATA_SOURCE", "");

    expect(getWalletDataSource()).toBe("live");
    expect(getCatalogDataSource()).toBe("live");
    expect(getPortfolioDataSource()).toBe("live");
    expect(getAuthDataSource()).toBe("live");
    expect(getSupportDataSource()).toBe("live");
    expect(getNewsDataSource()).toBe("live");
    expect(getStatusDataSource()).toBe("live");
  });

  it("honours explicit mock", () => {
    vi.stubEnv("NEXT_PUBLIC_WALLET_DATA_SOURCE", "mock");
    expect(getWalletDataSource()).toBe("mock");
  });
});
