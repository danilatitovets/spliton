import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import { ProfileLegalContent } from "@/components/dashboard/profile/profile-legal-content";
import { ROUTES } from "@/constants/routes";

const mockFetchLegalCenter = vi.fn();
const mockAcceptLegalConsents = vi.fn();
const mockPush = vi.fn();
const navState = { search: new URLSearchParams() };

vi.mock("@/services/legal.service", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/services/legal.service")>();
  return {
    ...actual,
    fetchLegalCenter: (...args: unknown[]) => mockFetchLegalCenter(...args),
    acceptLegalConsents: (...args: unknown[]) => mockAcceptLegalConsents(...args),
  };
});

const authorizedFetch = vi.fn();
vi.mock("@/components/providers/auth-provider", () => ({
  useAuth: () => ({
    authorizedFetch,
    isAuthenticated: true,
  }),
}));

const t = (key: string) => key;
vi.mock("@/components/providers/i18n-provider", () => ({
  useI18n: () => ({
    t,
    locale: "en",
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => navState.search,
}));

const centerWithMissing = {
  activePolicies: [
    {
      id: "p1",
      type: "TERMS_OF_SERVICE",
      version: "1.0",
      title: "Terms",
      content: "",
      contentFormat: "markdown",
      effectiveAt: "2025-01-01T00:00:00.000Z",
      publishedAt: "2025-01-01T00:00:00.000Z",
      requiresUserConsent: true,
    },
  ],
  acceptedConsents: [],
  missingConsents: {
    primaryPurchase: [],
    secondaryTrade: [],
    withdrawal: [],
  },
  lawyerReviewRequired: false,
};

describe("ProfileLegalContent", () => {
  beforeEach(() => {
    mockFetchLegalCenter.mockReset();
    mockAcceptLegalConsents.mockReset();
    mockPush.mockReset();
    navState.search = new URLSearchParams();
    sessionStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("shows accept section when consents are missing", async () => {
    mockFetchLegalCenter.mockResolvedValue({
      ...centerWithMissing,
      missingConsents: {
        primaryPurchase: [
          {
            type: "TERMS_OF_SERVICE",
            activeVersion: "1.0",
            policyId: "p1",
            title: "Terms",
          },
        ],
        secondaryTrade: [],
        withdrawal: [],
      },
    });

    render(<ProfileLegalContent />);
    await waitFor(() => expect(mockFetchLegalCenter).toHaveBeenCalled());
    expect(screen.getByText("profile.legal.acceptSection.title")).toBeInTheDocument();
    expect(screen.getByText("profile.legal.activeTitle")).toBeInTheDocument();
  });

  it("opens missing consent document from the accept list", async () => {
    const missingCenter = {
      ...centerWithMissing,
      activePolicies: [
        {
          ...centerWithMissing.activePolicies[0],
          content: "Short terms body for tests.",
        },
      ],
      missingConsents: {
        primaryPurchase: [
          {
            type: "TERMS_OF_SERVICE",
            activeVersion: "1.0",
            policyId: "p1",
            title: "Terms",
          },
        ],
        secondaryTrade: [],
        withdrawal: [],
      },
    };

    mockFetchLegalCenter.mockResolvedValue(missingCenter);

    render(<ProfileLegalContent />);
    await waitFor(() => expect(screen.getByText("profile.legal.acceptSection.title")).toBeInTheDocument());

    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "profile.legal.acceptButton" })).not.toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: "profile.legal.readDocument" })[0]);
    expect(mockPush).toHaveBeenCalledWith(ROUTES.dashboardProfileLegalDoc("p1", true));
    expect(mockAcceptLegalConsents).not.toHaveBeenCalled();
  });
});
