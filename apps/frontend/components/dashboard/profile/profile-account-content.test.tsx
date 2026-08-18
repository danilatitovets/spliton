import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { ProfileAccountContent } from "@/components/dashboard/profile/profile-account-content";

const mockFetchUserMe = vi.fn();
const mockUseAuth = vi.fn();

vi.mock("@/services/user-me.service", () => ({
  fetchUserMe: (...args: unknown[]) => mockFetchUserMe(...args),
  patchUserPreferences: vi.fn(),
}));

vi.mock("@/components/providers/auth-provider", () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock("@/lib/public-env", () => ({
  isLiveAccountEnabled: () => true,
  isStrictDeployMode: () => false,
}));

vi.mock("@/components/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    locale: "ru",
    setLocale: vi.fn(),
  }),
}));

describe("ProfileAccountContent", () => {
  beforeEach(() => {
    mockFetchUserMe.mockReset();
    mockUseAuth.mockReset();
  });

  it("does not flash sign-in while session is pending", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      authorizedFetch: vi.fn(),
      isAuthenticated: false,
      isLoading: true,
      status: "initializing",
    });

    render(<ProfileAccountContent />);
    expect(screen.queryByText("profile.legal.signInRequired")).toBeNull();
  });

  it("shows session email immediately without waiting for /users/me", async () => {
    mockFetchUserMe.mockImplementation(() => new Promise(() => undefined));
    mockUseAuth.mockReturnValue({
      user: {
        id: "user-1",
        email: "alex@spliton.io",
        profile: { displayName: "Alex" },
      },
      authorizedFetch: vi.fn(),
      isAuthenticated: true,
      isLoading: false,
      status: "authenticated",
    });

    render(<ProfileAccountContent />);
    expect(await screen.findByRole("heading", { name: "Alex" })).toBeInTheDocument();
    expect(screen.getAllByText("alex@spliton.io").length).toBeGreaterThan(0);
    expect(screen.queryByText("profile.legal.signInRequired")).toBeNull();
    expect(screen.queryByText("profile.account.loadError")).toBeNull();
  });

  it("keeps session profile if /users/me fails", async () => {
    mockFetchUserMe.mockRejectedValue(new Error("boom"));
    mockUseAuth.mockReturnValue({
      user: {
        id: "user-1",
        email: "alex@spliton.io",
        profile: { displayName: "Alex" },
      },
      authorizedFetch: vi.fn(),
      isAuthenticated: true,
      isLoading: false,
      status: "authenticated",
    });

    render(<ProfileAccountContent />);
    await waitFor(() => expect(mockFetchUserMe).toHaveBeenCalled());
    expect(screen.getAllByText("alex@spliton.io").length).toBeGreaterThan(0);
    expect(screen.queryByText("profile.account.loadError")).toBeNull();
  });

  it("uses a setup text link in account status instead of truncated pills", async () => {
    mockFetchUserMe.mockImplementation(() => new Promise(() => undefined));
    mockUseAuth.mockReturnValue({
      user: {
        id: "user-1",
        email: "alex@spliton.io",
        profile: { displayName: "Alex" },
      },
      authorizedFetch: vi.fn(),
      isAuthenticated: true,
      isLoading: false,
      status: "authenticated",
    });

    render(<ProfileAccountContent />);
    expect(await screen.findByRole("tab", { name: "profile.account.tab.personal" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.queryByRole("link", { name: "profile.okx.setup" })).toBeNull();

    fireEvent.click(screen.getByRole("tab", { name: "profile.account.tab.status" }));
    const setupLinks = await screen.findAllByRole("link", { name: "profile.okx.setup" });
    expect(setupLinks.length).toBeGreaterThanOrEqual(2);
    expect(screen.queryByText("profile.overview.identity.verifyNow")).toBeNull();
  });
});
