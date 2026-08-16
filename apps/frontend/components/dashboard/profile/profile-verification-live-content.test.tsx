import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { ProfileVerificationLiveContent } from "@/components/dashboard/profile/profile-verification-live-content";

const mockKyc = vi.fn();
const mockEligibility = vi.fn();

vi.mock("@/hooks/use-kyc-status", () => ({
  useKycStatus: () => mockKyc(),
}));

vi.mock("@/hooks/use-eligibility-summary", () => ({
  useEligibilitySummary: () => mockEligibility(),
}));

const t = (key: string) => key;
vi.mock("@/components/providers/i18n-provider", () => ({
  useI18n: () => ({
    t,
    locale: "en",
  }),
}));

const kycApproved = {
  status: "APPROVED",
  level: "BASIC",
  countryCode: "RU",
  submittedAt: "2025-06-01T00:00:00.000Z",
  reviewedAt: "2025-06-02T00:00:00.000Z",
  expiresAt: null,
  rejectionReasonSafe: null,
  provider: "MANUAL",
};

const eligibilitySummary = {
  deposit: { allowed: true, userMessage: "OK" },
  withdraw: { allowed: false, blockingCode: "KYC_REQUIRED", userMessage: "Complete KYC" },
  primary: { allowed: false, blockingCode: "CONSENT_REQUIRED", userMessage: "Accept terms" },
  secondary: { allowed: true, userMessage: "OK" },
};

describe("ProfileVerificationLiveContent", () => {
  beforeEach(() => {
    mockKyc.mockReturnValue({
      data: kycApproved,
      loading: false,
      error: null,
      submitting: false,
      reload: vi.fn(),
      start: vi.fn(),
      submitManual: vi.fn(),
    });
    mockEligibility.mockReturnValue({
      data: eligibilitySummary,
      loading: false,
      error: null,
    });
  });

  it("renders KYC timeline from live status", () => {
    render(<ProfileVerificationLiveContent />);
    expect(screen.getByRole("heading", { name: "Spliton Verification" })).toBeInTheDocument();
    expect(screen.getByText("verification.timeline.title")).toBeInTheDocument();
    expect(screen.getByText("verification.timeline.decisionApproved")).toBeInTheDocument();
    expect(screen.getByText("verification.helpTitle")).toBeInTheDocument();
    expect(screen.getByText("verification.helpBody")).toBeInTheDocument();
    expect(screen.queryByText("verification.country")).not.toBeInTheDocument();
    expect(screen.queryByText("verification.submittedAt")).not.toBeInTheDocument();
  });

  it("renders eligibility rows from API summary", () => {
    render(<ProfileVerificationLiveContent />);
    expect(screen.getAllByText("verification.access.deposit").length).toBeGreaterThan(0);
    expect(screen.getAllByText("verification.eligibility.status.allowed").length).toBeGreaterThan(0);
    expect(screen.getAllByText("verification.eligibility.status.kyc_required").length).toBeGreaterThan(0);
    expect(screen.getAllByText("verification.eligibility.status.legal_required").length).toBeGreaterThan(0);
  });

  it("keeps verification details in a modal until opened", () => {
    mockKyc.mockReturnValue({
      data: { ...kycApproved, status: "PENDING" },
      loading: false,
      error: null,
      submitting: false,
      reload: vi.fn(),
      start: vi.fn(),
      submitManual: vi.fn(),
    });

    render(<ProfileVerificationLiveContent />);
    expect(screen.getAllByRole("button", { name: "verification.manualFormOpen" }).length).toBeGreaterThan(0);
    expect(screen.queryByPlaceholderText("****1234")).not.toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: "verification.manualFormOpen" })[0]);
    expect(screen.getByPlaceholderText("****1234")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("RU")).toBeInTheDocument();
    expect(screen.getByText("verification.manualFormHint")).toBeInTheDocument();
    expect(screen.getByText("verification.manualProviderHint")).toBeInTheDocument();
    expect(screen.getAllByText("verification.helpTitle").length).toBeGreaterThan(0);
    expect(screen.getAllByText("verification.helpBody").length).toBeGreaterThan(0);
  });
});
