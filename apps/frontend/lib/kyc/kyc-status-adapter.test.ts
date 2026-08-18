import { describe, expect, it } from "vitest";

import {
  completedRequiredStepCount,
  mapKycStatusToUi,
  requiredKycStepCount,
} from "@/lib/kyc/kyc-status-adapter";

describe("mapKycStatusToUi", () => {
  it("maps backend statuses to UI states", () => {
    expect(mapKycStatusToUi("NOT_STARTED")).toBe("not_started");
    expect(mapKycStatusToUi("PENDING")).toBe("in_progress");
    expect(mapKycStatusToUi("IN_REVIEW")).toBe("pending_review");
    expect(mapKycStatusToUi("MANUAL_REVIEW_REQUIRED")).toBe("pending_review");
    expect(mapKycStatusToUi("APPROVED")).toBe("approved");
    expect(mapKycStatusToUi("REJECTED")).toBe("rejected");
    expect(mapKycStatusToUi("EXPIRED")).toBe("expired");
  });
});

describe("required KYC progress", () => {
  it("counts only required steps", () => {
    expect(requiredKycStepCount({ details: true, identity: true, selfie: true, address: false })).toBe(3);
    expect(
      completedRequiredStepCount(
        { details: true, identity: true, selfie: false, address: true },
        { details: true, identity: true, selfie: true, address: false },
      ),
    ).toBe(2);
  });
});
