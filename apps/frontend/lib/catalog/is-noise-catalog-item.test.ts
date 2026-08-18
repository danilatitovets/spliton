import { describe, expect, it } from "vitest";

import { isNoiseCatalogGenre, isNoiseCatalogRelease } from "./is-noise-catalog-item";

describe("isNoiseCatalogRelease", () => {
  it("hides e2e admin-cancel fixtures", () => {
    expect(isNoiseCatalogRelease("Admin Cancel 2", "AC22906")).toBe(true);
    expect(isNoiseCatalogRelease("Admin Cancel", "AC1234")).toBe(true);
  });

  it("keeps real catalog titles", () => {
    expect(isNoiseCatalogRelease("Neon Drift", "RS-218", "Lumen")).toBe(false);
  });
});

describe("isNoiseCatalogGenre", () => {
  it("hides QA genre labels", () => {
    expect(isNoiseCatalogGenre("admincancel")).toBe(true);
    expect(isNoiseCatalogGenre("Pop")).toBe(false);
  });
});
