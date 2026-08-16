import { describe, expect, it } from "vitest";

import {
  getClientCache,
  invalidateClientCache,
  setClientCache,
} from "./client-data-cache";

describe("client-data-cache", () => {
  it("clears all entries on invalidate without prefix", () => {
    setClientCache("assets:overview:user-a", { v: 1 });
    setClientCache("assets:wallet-summary:user-a", { v: 2 });
    setClientCache("catalog:list:ru", { v: 3 });
    invalidateClientCache();
    expect(getClientCache("assets:overview:user-a")).toBeNull();
    expect(getClientCache("assets:wallet-summary:user-a")).toBeNull();
    expect(getClientCache("catalog:list:ru")).toBeNull();
  });

  it("clears only matching prefix", () => {
    setClientCache("assets:overview:user-a", { v: 1 });
    setClientCache("catalog:list:ru", { v: 3 });
    invalidateClientCache("assets:");
    expect(getClientCache("assets:overview:user-a")).toBeNull();
    expect(getClientCache("catalog:list:ru")).toEqual({ v: 3 });
  });
});
