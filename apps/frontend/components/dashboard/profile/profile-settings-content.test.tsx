import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { ProfileSettingsContent } from "@/components/dashboard/profile/profile-settings-content";

const mockFetchNotificationPreferences = vi.fn();
const mockPatchNotificationPreferences = vi.fn();
const mockAuthorizedFetch = vi.fn();

vi.mock("@/services/notifications.service", () => ({
  fetchNotificationPreferences: (...args: unknown[]) => mockFetchNotificationPreferences(...args),
  patchNotificationPreferences: (...args: unknown[]) => mockPatchNotificationPreferences(...args),
}));

vi.mock("@/components/providers/auth-provider", () => ({
  useAuth: () => ({
    authorizedFetch: mockAuthorizedFetch,
    isAuthenticated: true,
    isLoading: false,
    status: "authenticated",
  }),
}));

vi.mock("@/lib/public-env", () => ({
  isLiveAccountEnabled: () => true,
  isStrictDeployMode: () => false,
}));

const t = (key: string) => key;
vi.mock("@/components/providers/i18n-provider", () => ({
  useI18n: () => ({
    t,
    locale: "en",
    setLocale: vi.fn(),
  }),
}));

describe("ProfileSettingsContent", () => {
  beforeEach(() => {
    mockFetchNotificationPreferences.mockResolvedValue({
      emailFinance: true,
      emailMarket: false,
      emailNews: true,
      emailSecurity: true,
      emailSupport: true,
      inAppFinance: true,
      inAppMarket: true,
      inAppSupport: false,
      inAppNews: true,
    });
    mockPatchNotificationPreferences.mockResolvedValue({});
  });

  it("loads notification preferences including locked security email", async () => {
    render(<ProfileSettingsContent />);
    await waitFor(() => expect(mockFetchNotificationPreferences).toHaveBeenCalled());
    expect(screen.getByText("profile.settings.securityEmail.title")).toBeInTheDocument();
    expect(screen.getByText("profile.settings.securityEmail.locked")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "profile.settings.tab.email" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.queryByText("profile.settings.inAppFinance.title")).not.toBeInTheDocument();
    expect(screen.queryByText("profile.settings.displayName.label")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "profile.settings.saveButton" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "profile.settings.tab.inApp" }));
    expect(await screen.findByText("profile.settings.inAppFinance.title")).toBeInTheDocument();
    expect(screen.queryByText("profile.settings.securityEmail.title")).not.toBeInTheDocument();
  });

  it("saves a notification toggle immediately in live mode", async () => {
    render(<ProfileSettingsContent />);
    await waitFor(() => expect(mockFetchNotificationPreferences).toHaveBeenCalled());

    const marketToggle = await waitFor(() => {
      const switches = screen.getAllByRole("switch");
      expect(switches[1]).not.toBeDisabled();
      return switches[1];
    });
    fireEvent.click(marketToggle);

    await waitFor(() => {
      expect(mockPatchNotificationPreferences).toHaveBeenCalledWith(expect.any(Function), {
        emailMarket: true,
      });
    });
  });
});
