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
  level: "VERIFIED",
  countryCode: "DE",
  submittedAt: "2025-06-01T00:00:00.000Z",
  reviewedAt: "2025-06-02T00:00:00.000Z",
  expiresAt: "2026-06-02T00:00:00.000Z",
  rejectionReasonSafe: null,
  provider: "manual",
  canSubmit: false,
  steps: { details: true, identity: true, address: false, selfie: true },
  required: { details: true, identity: true, selfie: true, address: false },
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
      saveDetails: vi.fn(),
      submitManual: vi.fn(),
      saveAddress: vi.fn(),
      uploadDocument: vi.fn(),
    });
    mockEligibility.mockReturnValue({
      data: eligibilitySummary,
      loading: false,
      error: null,
    });
  });

  it("does not treat unknown KYC as not started while loading", () => {
    mockKyc.mockReturnValue({
      data: null,
      loading: true,
      error: null,
      submitting: false,
      reload: vi.fn(),
      start: vi.fn(),
      saveDetails: vi.fn(),
      submitManual: vi.fn(),
      saveAddress: vi.fn(),
      uploadDocument: vi.fn(),
    });
    render(<ProfileVerificationLiveContent />);
    expect(screen.queryByText("verification.status.notStarted")).not.toBeInTheDocument();
    expect(screen.queryByText("verification.hero.accountTitle")).not.toBeInTheDocument();
    expect(screen.queryByText("verification.status.approved")).not.toBeInTheDocument();
  });

  it("renders approved summary from live status", () => {
    render(<ProfileVerificationLiveContent />);
    expect(screen.getByText("verification.timeline.title")).toBeInTheDocument();
    expect(screen.getAllByText("verification.timeline.decisionApproved").length).toBeGreaterThan(0);
    expect(screen.getByText("verification.helpTitle")).toBeInTheDocument();
    expect(screen.queryByText("verification.country")).not.toBeInTheDocument();
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
      data: {
        ...kycApproved,
        status: "PENDING",
        canSubmit: false,
        steps: { details: false, identity: false, address: false, selfie: false },
      },
      loading: false,
      error: null,
      submitting: false,
      reload: vi.fn(),
      start: vi.fn(),
      saveDetails: vi.fn(),
      submitManual: vi.fn(),
      saveAddress: vi.fn(),
      uploadDocument: vi.fn(),
    });

    render(<ProfileVerificationLiveContent />);
    expect(screen.getAllByRole("button", { name: "verification.manualFormOpen" }).length).toBeGreaterThan(0);
    expect(screen.queryByPlaceholderText("****1234")).not.toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: "verification.manualFormOpen" })[0]);
    expect(screen.getByPlaceholderText("****1234")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("DE")).toBeInTheDocument();
    expect(screen.getAllByText("verification.manualFormHint").length).toBeGreaterThan(0);
    expect(screen.getByText("verification.manualProviderHint")).toBeInTheDocument();
  });

  it("opens address setup from a real button, not a static label", () => {
    mockKyc.mockReturnValue({
      data: {
        ...kycApproved,
        status: "PENDING",
        canSubmit: false,
        steps: { details: false, identity: false, address: false, selfie: false },
      },
      loading: false,
      error: null,
      submitting: false,
      reload: vi.fn(),
      start: vi.fn(),
      saveDetails: vi.fn(),
      submitManual: vi.fn(),
      saveAddress: vi.fn(),
      uploadDocument: vi.fn(),
    });

    render(<ProfileVerificationLiveContent />);
    const setupButtons = screen.getAllByRole("button", { name: "profile.okx.setup" });
    fireEvent.click(setupButtons[1]);
    expect(screen.getByLabelText("verification.address.city")).toBeInTheDocument();
    expect(screen.getByLabelText("verification.address.street")).toBeInTheDocument();
    expect(screen.getByText("verification.doc.save")).toBeInTheDocument();
  });

  it("keeps unknown KYC as skeleton even if loading is already false", () => {
    mockKyc.mockReturnValue({
      data: null,
      loading: false,
      error: null,
      submitting: false,
      reload: vi.fn(),
      start: vi.fn(),
      saveDetails: vi.fn(),
      submitManual: vi.fn(),
      saveAddress: vi.fn(),
      uploadDocument: vi.fn(),
    });
    render(<ProfileVerificationLiveContent />);
    expect(screen.queryByText("verification.status.notStarted")).not.toBeInTheDocument();
    expect(screen.queryByText("verification.hero.accountTitle")).not.toBeInTheDocument();
  });

  it("shows a retry state when status cannot be loaded", () => {
    mockKyc.mockReturnValue({
      data: null,
      loading: false,
      error: "verification.network",
      submitting: false,
      reload: vi.fn(),
      start: vi.fn(),
      saveDetails: vi.fn(),
      submitManual: vi.fn(),
      saveAddress: vi.fn(),
      uploadDocument: vi.fn(),
    });
    render(<ProfileVerificationLiveContent />);
    expect(screen.getByText("verification.loadError")).toBeInTheDocument();
    expect(screen.queryByText("verification.status.notStarted")).not.toBeInTheDocument();
  });

  it("renders rejected action-required copy and the public reason", () => {
    mockKyc.mockReturnValue({
      data: {
        ...kycApproved,
        status: "REJECTED",
        canSubmit: false,
        rejectionReasonSafe: "Document photo is unreadable",
        steps: { details: true, identity: true, address: false, selfie: true },
      },
      loading: false,
      error: null,
      submitting: false,
      reload: vi.fn(),
      start: vi.fn(),
      saveDetails: vi.fn(),
      submitManual: vi.fn(),
      saveAddress: vi.fn(),
      uploadDocument: vi.fn(),
    });
    render(<ProfileVerificationLiveContent />);
    expect(screen.getByText("verification.rejectionTitle")).toBeInTheDocument();
    expect(screen.getByText("Document photo is unreadable")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "verification.fixAndContinue" }).length).toBeGreaterThan(0);
  });

  it("renders expired as renewal, not rejection", () => {
    mockKyc.mockReturnValue({
      data: {
        ...kycApproved,
        status: "EXPIRED",
        canSubmit: false,
        steps: { details: true, identity: true, address: false, selfie: true },
      },
      loading: false,
      error: null,
      submitting: false,
      reload: vi.fn(),
      start: vi.fn(),
      saveDetails: vi.fn(),
      submitManual: vi.fn(),
      saveAddress: vi.fn(),
      uploadDocument: vi.fn(),
    });
    render(<ProfileVerificationLiveContent />);
    expect(screen.getByRole("button", { name: "verification.expired.cta" })).toBeInTheDocument();
    expect(screen.queryByText("verification.hero.rejectedHeadline")).not.toBeInTheDocument();
  });

  it("submits for review once when required steps are complete", () => {
    const submitManual = vi.fn();
    mockKyc.mockReturnValue({
      data: {
        ...kycApproved,
        status: "PENDING",
        canSubmit: true,
        steps: { details: true, identity: true, address: false, selfie: true },
      },
      loading: false,
      error: null,
      submitting: false,
      reload: vi.fn(),
      start: vi.fn(),
      saveDetails: vi.fn(),
      submitManual,
      saveAddress: vi.fn(),
      uploadDocument: vi.fn(),
    });
    render(<ProfileVerificationLiveContent />);
    fireEvent.click(screen.getAllByRole("button", { name: "verification.submit" })[0]);
    expect(submitManual).toHaveBeenCalledTimes(1);
  });
});
