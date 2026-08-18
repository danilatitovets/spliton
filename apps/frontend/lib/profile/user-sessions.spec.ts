import { describe, expect, it } from "vitest";

import { mapUserSessionsToRows, sessionDeviceKind } from "@/lib/profile/user-sessions";
import type { UserSessionItem } from "@/services/user-me.service";

function session(partial: Partial<UserSessionItem> & Pick<UserSessionItem, "id">): UserSessionItem {
  return {
    device: "Chrome / Windows",
    ip: "203.0.113.10",
    userAgent: "Mozilla/5.0 Chrome Windows",
    lastActiveAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    active: true,
    revokedAt: null,
    isCurrent: false,
    ...partial,
  };
}

describe("sessionDeviceKind", () => {
  it("uses a phone glyph for handheld sessions", () => {
    expect(sessionDeviceKind("Safari / iPhone")).toBe("phone");
    expect(sessionDeviceKind("Chrome / Android")).toBe("phone");
    expect(sessionDeviceKind("Chrome / Windows")).toBe("laptop");
  });
});

describe("mapUserSessionsToRows", () => {
  it("does not label private session IPs as this device", () => {
    const now = Date.now();
    const rows = mapUserSessionsToRows(
      [
        session({
          id: "s-1",
          ip: "100.64.0.6",
          isCurrent: true,
          lastActiveAt: new Date(now).toISOString(),
        }),
        session({
          id: "s-2",
          ip: "203.0.113.1",
          isCurrent: false,
          lastActiveAt: new Date(now - 60_000).toISOString(),
        }),
      ],
      "ru",
      "Browser",
    );
    expect(rows.find((row) => row.id === "s-1")?.ip).toBe("—");
    expect(rows.find((row) => row.id === "s-2")?.ip).toBe("203.0.113.1");
    expect(rows.some((row) => row.ip === "Это устройство")).toBe(false);
  });
});