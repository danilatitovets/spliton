import { describe, expect, it } from "vitest";

import { deriveAuthStatus, resolveAuthUiState } from "@/lib/auth/auth-status";

describe("resolveAuthUiState", () => {
  it("treats missing status + isLoading as pending, not guest", () => {
    const ui = resolveAuthUiState({ isAuthenticated: false, isLoading: true });
    expect(ui.pending).toBe(true);
    expect(ui.anonymous).toBe(false);
    expect(ui.authenticated).toBe(false);
  });

  it("treats explicit authenticated without isLoading as ready", () => {
    const ui = resolveAuthUiState({ isAuthenticated: true });
    expect(ui.authenticated).toBe(true);
    expect(ui.pending).toBe(false);
  });

  it("treats error as neither guest nor authenticated", () => {
    const ui = resolveAuthUiState({
      isAuthenticated: false,
      status: "error",
    });
    expect(ui.errored).toBe(true);
    expect(ui.anonymous).toBe(false);
    expect(ui.pending).toBe(false);
  });
});

describe("deriveAuthStatus", () => {
  it("keeps initializing while bootstrap is in flight", () => {
    expect(
      deriveAuthStatus({
        isLoading: true,
        isAuthenticated: false,
        sessionError: false,
        hasAccessToken: false,
      }),
    ).toBe("initializing");
  });

  it("does not map network sessionError to anonymous", () => {
    expect(
      deriveAuthStatus({
        isLoading: false,
        isAuthenticated: false,
        sessionError: true,
        hasAccessToken: false,
      }),
    ).toBe("error");
  });
});
