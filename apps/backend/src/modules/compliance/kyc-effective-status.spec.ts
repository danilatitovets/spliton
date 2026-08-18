import { KycStatus } from '@prisma/client';

import { effectiveKycStatus, isKycLockedForEdits } from './kyc-effective-status';

describe('effectiveKycStatus', () => {
  it('treats approved rows past expiresAt as expired', () => {
    expect(
      effectiveKycStatus({
        status: KycStatus.APPROVED,
        expiresAt: new Date(Date.now() - 1000),
      }),
    ).toBe(KycStatus.EXPIRED);
  });

  it('keeps approved rows with a future expiry', () => {
    expect(
      effectiveKycStatus({
        status: KycStatus.APPROVED,
        expiresAt: new Date(Date.now() + 86400000),
      }),
    ).toBe(KycStatus.APPROVED);
  });
});

describe('isKycLockedForEdits', () => {
  it('locks approved and in-review states only', () => {
    expect(isKycLockedForEdits(KycStatus.APPROVED)).toBe(true);
    expect(isKycLockedForEdits(KycStatus.MANUAL_REVIEW_REQUIRED)).toBe(true);
    expect(isKycLockedForEdits(KycStatus.IN_REVIEW)).toBe(true);
    expect(isKycLockedForEdits(KycStatus.PENDING)).toBe(false);
    expect(isKycLockedForEdits(KycStatus.EXPIRED)).toBe(false);
  });
});
