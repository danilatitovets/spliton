import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { ProfileSettingsContent } from "@/components/dashboard/profile/profile-settings-content";

const mockFetchUserMe = vi.fn();
const mockPatchUserPreferences = vi.fn();
const mockFetchNotificationPreferences = vi.fn();
const mockPatchNotificationPreferences = vi.fn();

vi.mock("@/services/user-me.service", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/services/user-me.service")>();
  return {
    ...actual,
    fetchUserMe: (...args: unknown[]) => mockFetchUserMe(...args),
    patchUserPreferences: (...args: unknown[]) => mockPatchUserPreferences(...args),
  };
});

vi.mock("@/services/notifications.service", () => ({
  fetchNotificationPreferences: (...args: unknown[]) => mockFetchNotificationPreferences(...args),
  patchNotificationPreferences: (...args: unknown[]) => mockPatchNotificationPreferences(...args),
}));

vi.mock("@/components/providers/auth-provider", () => ({
  useAuth: () => ({
    authorizedFetch: vi.fn(),
    isAuthenticated: true,
  }),
}));

vi.mock("@/lib/public-env", () => ({
  isLiveAccountEnabled: () => true,
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
    mockFetchUserMe.mockResolvedValue({
      profile: { displayName: "Alice", timezone: "Europe/Moscow" },
    });
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
    mockPatchUserPreferences.mockResolvedValue({});
    mockPatchNotificationPreferences.mockResolvedValue({});
  });

  it("loads notification preferences including locked security email", async () => {
    render(<ProfileSettingsContent />);
    await waitFor(() => expect(mockFetchNotificationPreferences).toHaveBeenCalled());
    expect(screen.getByText("profile.settings.securityEmail.title")).toBeInTheDocument();
    expect(screen.getByText("profile.settings.securityEmail.locked")).toBeInTheDocument();
    expect(screen.getByText("profile.settings.inAppFinance.title")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "profile.settings.saveButton" })).not.toBeInTheDocument();
  });

  it("saves a notification toggle immediately in live mode", async () => {
    render(<ProfileSettingsContent />);
    await waitFor(() => expect(mockFetchUserMe).toHaveBeenCalled());

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
    expect(mockPatchUserPreferences).not.toHaveBeenCalled();
  });

  it("saves display name when confirming the editor", async () => {
    render(<ProfileSettingsContent />);
    await waitFor(() => expect(screen.getByText("Alice")).toBeInTheDocument());

    fireEvent.click(screen.getAllByRole("button", { name: "profile.okx.change" })[0]);
    fireEvent.change(screen.getByDisplayValue("Alice"), {
      target: { value: "Bob" },
    });
    fireEvent.click(screen.getByRole("button", { name: "profile.settings.done" }));

    await waitFor(() => {
      expect(mockPatchUserPreferences).toHaveBeenCalledWith(expect.any(Function), {
        displayName: "Bob",
      });
    });
  });
});
