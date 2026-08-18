import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { ProfileSecurityContent } from "@/components/dashboard/profile/profile-security-content";
import { securityRecommendationText } from "@/lib/profile/security-labels";

const mockFetchUserMe = vi.fn();
const mockFetchUserSessions = vi.fn();
const mockFetchSecurityEvents = vi.fn();
const mockFetchSecurityPreferences = vi.fn();
const mockFetchNotificationPreferences = vi.fn();

vi.mock("@/services/user-me.service", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/services/user-me.service")>();
  return {
    ...actual,
    fetchUserMe: (...args: unknown[]) => mockFetchUserMe(...args),
    fetchUserSessions: (...args: unknown[]) => mockFetchUserSessions(...args),
    fetchSecurityEvents: (...args: unknown[]) => mockFetchSecurityEvents(...args),
    fetchSecurityPreferences: (...args: unknown[]) => mockFetchSecurityPreferences(...args),
    changeUserPassword: vi.fn(),
    patchSecurityPreferences: vi.fn(),
    revokeUserSession: vi.fn(),
    logoutAllUserSessions: vi.fn(),
  };
});

vi.mock("@/services/notifications.service", () => ({
  fetchNotificationPreferences: (...args: unknown[]) => mockFetchNotificationPreferences(...args),
  patchNotificationPreferences: vi.fn(),
}));

vi.mock("@/components/dashboard/profile/profile-two-factor-panel", () => ({
  ProfileTwoFactorPanel: () => <div data-testid="two-fa-panel" />,
}));

vi.mock("@/components/providers/auth-provider", () => ({
  useAuth: () => ({
    user: { id: "user-1", email: "test@example.com" },
    authorizedFetch: vi.fn(),
    isAuthenticated: true,
    resendEmail: vi.fn(),
    requiresEmailVerification: false,
  }),
}));

vi.mock("@/lib/public-env", () => ({
  isLiveAccountEnabled: () => true,
  isAccountCenterDemoMode: () => false,
  isStrictDeployMode: () => false,
}));

vi.mock("@/components/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    locale: "en",
  }),
}));

const accountCenter = {
  accountCompleteness: { score: 40, maxScore: 100, level: "MEDIUM", completedItems: [], missingItems: [] },
  security: {
    score: 62,
    maxScore: 100,
    level: "MEDIUM",
    recommendations: [{ code: "ENABLE_2FA", title: "x", description: "y", severity: "HIGH", isCompleted: false, actionHref: "/dashboard/profile?tab=security" }],
    emailVerified: true,
    twoFactorEnabled: false,
    passwordSet: true,
    passwordChangedAt: "2025-06-01T00:00:00.000Z",
    activeSessionsCount: 1,
    lastLoginAt: null,
  },
  verification: { status: "NOT_STARTED" },
  legal: { missingRequiredConsentsCount: 0, hasAcceptedCurrentRequiredPolicies: true },
  activity: {},
  securityPreferences: {
    withdrawalEmailConfirmationEnabled: false,
    withdrawalAddressWhitelistEnabled: false,
    suspiciousLoginAlertsEnabled: true,
    emailSecurityNotificationsEnabled: true,
    enforcementReady: false,
  },
  recentSecurityEvents: [],
};

describe("security labels", () => {
  it("maps recommendation codes to i18n", () => {
    expect(securityRecommendationText("ENABLE_2FA", "en").title).toBe("Enable 2FA");
  });
});

describe("profile security live guards", () => {
  it("does not use client-side computeScore", () => {
    const source = readFileSync(
      join(__dirname, "profile-security-content.tsx"),
      "utf8",
    );
    expect(source).not.toContain("computeScore");
    expect(source).not.toContain("defaultCfg");
    expect(source).not.toContain("ProtectionCfg");
  });
});

describe("ProfileSecurityContent", () => {
  beforeEach(() => {
    mockFetchUserMe.mockResolvedValue({ id: "user-1", email: "test@example.com", accountCenter });
    mockFetchUserSessions.mockResolvedValue({ items: [] });
    mockFetchSecurityEvents.mockResolvedValue({ items: [] });
    mockFetchSecurityPreferences.mockResolvedValue({
      withdrawalEmailConfirmationEnabled: false,
      withdrawalAddressWhitelistEnabled: false,
      suspiciousLoginAlertsEnabled: true,
    });
    mockFetchNotificationPreferences.mockResolvedValue({ emailSecurity: true });
  });

  it("renders live security page without a score ring", async () => {
    render(<ProfileSecurityContent />);
    await waitFor(() => expect(mockFetchUserMe).toHaveBeenCalled());
    expect(await screen.findByText(/Enable 2FA/)).toBeTruthy();
    expect(screen.queryByText("profile.security.protectionLevel")).toBeNull();
    expect(screen.queryByText(/Medium level/)).toBeNull();
  });

  it("shows Telegram-style session cards instead of meter and empty KPIs", async () => {
    mockFetchUserMe.mockResolvedValue({
      id: "user-1",
      email: "test@example.com",
      accountCenter: { ...accountCenter, security: { ...accountCenter.security, lastLoginAt: null } },
    });
    mockFetchUserSessions.mockResolvedValue({
      items: [
        {
          id: "s-1",
          device: "Chrome / Windows",
          ip: "100.64.0.6",
          userAgent: "Mozilla/5.0 Chrome Windows",
          lastActiveAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          active: true,
          revokedAt: null,
          isCurrent: true,
        },
      ],
    });

    render(<ProfileSecurityContent />);
    await waitFor(() => expect(mockFetchUserMe).toHaveBeenCalled());
    fireEvent.click(await screen.findByRole("tab", { name: "profile.security.tab.sessions" }));

    expect(await screen.findByText("profile.security.sessions.thisDevice")).toBeTruthy();
    expect(screen.getByText("Chrome / Windows")).toBeTruthy();
    expect(screen.getAllByText("profile.devices.openPage").length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: "profile.devices.openPage" })).toHaveAttribute(
      "href",
      "/dashboard/profile/devices",
    );
    expect(screen.queryByText("profile.security.sessions.kpi.location")).toBeNull();
    expect(screen.queryByText("profile.security.sessions.kpi.lastLogin")).toBeNull();
    expect(screen.queryByText("profile.security.sessions.kpi.alerts")).toBeNull();
    expect(screen.queryByText("profile.devices.title")).toBeNull();
    expect(screen.queryByText("profile.security.events.title")).toBeNull();
    expect(screen.queryByText("profile.security.recoverAccess")).toBeNull();
    expect(screen.queryByText("100.64.0.6")).toBeNull();
  });

  it("renders 2FA panel in live mode", async () => {
    render(<ProfileSecurityContent />);
    expect(await screen.findByTestId("two-fa-panel")).toBeTruthy();
  });

  it("does not allow turning off security email notifications", async () => {
    render(<ProfileSecurityContent />);
    fireEvent.click(await screen.findByRole("tab", { name: "profile.security.tab.withdraw" }));
    const emailSwitch = await screen.findByRole("switch", {
      name: "profile.security.preferences.emailSecurity.title",
    });
    expect(emailSwitch).toBeDisabled();
    expect(emailSwitch).toHaveAttribute("aria-checked", "true");
  });

  it("still renders security controls when /users/me fails", async () => {
    mockFetchUserMe.mockRejectedValue({ code: "INTERNAL_ERROR", message: "Internal server error" });
    render(<ProfileSecurityContent />);
    expect(await screen.findByTestId("two-fa-panel")).toBeTruthy();
    expect(screen.queryByText("profile.security.loadError")).toBeNull();
    expect(screen.queryByRole("alert")).toBeNull();
  });
});
