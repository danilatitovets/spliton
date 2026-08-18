import { describe, expect, it } from "vitest";

import {
  isProfileDevicesView,
  parseProfilePageTabParam,
  resolveProfilePageTab,
} from "@/constants/dashboard/profile-page";

describe("profile page tabs", () => {
  it("keeps security active on the devices route", () => {
    expect(resolveProfilePageTab("/dashboard/profile/devices", null)).toBe("security");
    expect(resolveProfilePageTab("/dashboard/profile", "security")).toBe("security");
  });

  it("treats tab=devices as security, not overview", () => {
    expect(parseProfilePageTabParam("devices")).toBe("security");
    expect(parseProfilePageTabParam(null)).toBe("overview");
  });

  it("marks devices view from path, tab, or view query", () => {
    expect(isProfileDevicesView("/dashboard/profile/devices", null, null)).toBe(true);
    expect(isProfileDevicesView("/dashboard/profile", "devices", null)).toBe(true);
    expect(isProfileDevicesView("/dashboard/profile", "security", "devices")).toBe(true);
    expect(isProfileDevicesView("/dashboard/profile", "security", null)).toBe(false);
  });

  it("keeps legal active on nested legal documents", () => {
    expect(resolveProfilePageTab("/dashboard/profile/legal/terms", null)).toBe("legal");
  });
});
