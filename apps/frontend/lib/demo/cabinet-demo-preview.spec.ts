import { afterEach, describe, expect, it, vi } from "vitest";

import { isDemoForAdminsEnabled, isDemoPreviewEligible } from "@/lib/demo/cabinet-demo-preview";

describe("cabinet demo eligibility", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("does not enable admin demo by default in production", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_DEMO_FOR_ADMINS", "");
    expect(isDemoForAdminsEnabled()).toBe(false);
    expect(
      isDemoPreviewEligible({ email: "ops@spliton.io", roles: ["SUPER_ADMIN"] }),
    ).toBe(false);
  });

  it("allows explicit admin demo in production", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_DEMO_FOR_ADMINS", "1");
    expect(isDemoForAdminsEnabled()).toBe(true);
    expect(
      isDemoPreviewEligible({ email: "ops@spliton.io", roles: ["SUPER_ADMIN"] }),
    ).toBe(true);
  });
});
