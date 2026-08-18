import { HttpStatus } from '@nestjs/common';
import { KycDocumentStatus, KycLevel, KycStatus } from '@prisma/client';

import { UserKycService } from './user-kyc.service';

describe('UserKycService checklist', () => {
  const prisma = {
    kycVerification: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    kycDocument: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    userProfile: { upsert: jest.fn(), findUnique: jest.fn() },
    $executeRaw: jest.fn(),
    $transaction: jest.fn(),
  };
  const audit = { logOperatorAction: jest.fn() };
  const supabase = {
    isReady: jest.fn(),
    buckets: { userDocuments: 'user-documents' },
    upload: jest.fn(),
    createSignedUrl: jest.fn(),
  };

  const service = new UserKycService(
    prisma as never,
    audit as never,
    supabase as never,
  );

  const verification = {
    id: 'kyc-1',
    userId: 'user-1',
    status: KycStatus.NOT_STARTED as KycStatus,
    level: KycLevel.BASIC,
    countryCode: 'RU',
    documentType: null as string | null,
    documentReference: null as string | null,
    submittedAt: null as Date | null,
    reviewedAt: null as Date | null,
    expiresAt: null as Date | null,
    rejectReason: null as string | null,
    provider: 'manual',
    documents: [] as Array<{
      docType: string;
      fileUrl: string;
      status: KycDocumentStatus;
    }>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    verification.status = KycStatus.NOT_STARTED;
    verification.documentType = null;
    verification.documentReference = null;
    verification.documents = [];
    prisma.kycVerification.findFirst.mockImplementation(async () => ({
      ...verification,
      documents: verification.documents,
    }));
    prisma.kycVerification.create.mockImplementation(async ({ data }) => ({
      ...verification,
      ...data,
      documents: verification.documents,
    }));
    prisma.kycVerification.update.mockImplementation(async ({ data }) => {
      Object.assign(verification, data);
      return { ...verification, documents: verification.documents };
    });
    prisma.kycDocument.findFirst.mockResolvedValue(null);
    prisma.kycDocument.create.mockImplementation(async ({ data }) => {
      const row = {
        id: `doc-${verification.documents.length + 1}`,
        status: KycDocumentStatus.UPLOADED,
        ...data,
      };
      verification.documents.push(row);
      return row;
    });
    prisma.userProfile.findUnique.mockResolvedValue(null);
    prisma.userProfile.upsert.mockResolvedValue({ userId: 'user-1', countryCode: 'RU' });
    prisma.$executeRaw.mockResolvedValue(0);
    prisma.$transaction.mockImplementation(async (fn: (tx: typeof prisma) => Promise<unknown>) => fn(prisma));
    supabase.isReady.mockReturnValue(true);
    supabase.upload.mockResolvedValue({ bucket: 'user-documents', path: 'kyc/x', publicUrl: null });
    supabase.createSignedUrl.mockResolvedValue('https://signed.example/doc');
  });

  it('returns empty steps when the user has no KYC row', async () => {
    prisma.kycVerification.findFirst.mockResolvedValue(null);
    const status = await service.getStatus('user-1');
    expect(status.status).toBe(KycStatus.NOT_STARTED);
    expect(status.steps).toEqual({
      details: false,
      identity: false,
      address: false,
      selfie: false,
    });
  });

  it('marks details done from a document reference, not identity file', async () => {
    verification.status = KycStatus.PENDING;
    verification.documentType = 'passport';
    verification.documentReference = '4512';
    prisma.kycVerification.findFirst.mockResolvedValue({
      ...verification,
      documents: [],
    });
    const withRef = await service.getStatus('user-1');
    expect(withRef.steps.details).toBe(true);
    expect(withRef.steps.identity).toBe(false);
    expect(withRef.canSubmit).toBe(false);

    verification.documentReference = null;
    prisma.kycVerification.findFirst.mockResolvedValue({
      ...verification,
      documents: [],
    });
    const pendingOnly = await service.getStatus('user-1');
    expect(pendingOnly.steps.details).toBe(false);
    expect(pendingOnly.steps.identity).toBe(false);
  });

  it('stores address text and marks the address step complete', async () => {
    const status = await service.saveAddress('user-1', {
      city: 'Москва',
      street: 'Тверская 1',
      postalCode: '125009',
      countryCode: 'RU',
    });
    expect(prisma.kycDocument.create).toHaveBeenCalled();
    expect(status.steps.address).toBe(true);
    expect(status.address).toMatchObject({
      city: 'Москва',
      street: 'Тверская 1',
      postalCode: '125009',
    });
  });

  it('uploads a selfie into the user-documents bucket', async () => {
    const status = await service.uploadDocument('user-1', 'selfie', {
      buffer: Buffer.from('selfie'),
      mimetype: 'image/jpeg',
      size: 12,
      originalname: 'selfie.jpg',
    });
    expect(supabase.upload).toHaveBeenCalledWith(
      expect.objectContaining({
        bucket: 'user-documents',
        path: 'kyc/user-1/kyc-1/selfie.jpg',
        contentType: 'image/jpeg',
      }),
    );
    expect(status.steps.selfie).toBe(true);
    expect(status.files.selfie).toBe(true);
  });

  it('saves identity details without submitting for review', async () => {
    verification.status = KycStatus.NOT_STARTED;
    const status = await service.saveDetails('user-1', {
      countryCode: 'de',
      documentType: 'passport',
      documentReference: 'C01X',
    });
    expect(prisma.kycVerification.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: KycStatus.PENDING,
          countryCode: 'DE',
          documentType: 'passport',
          documentReference: 'C01X',
        }),
      }),
    );
    expect(status.status).not.toBe(KycStatus.MANUAL_REVIEW_REQUIRED);
  });

  it('rejects final submit until identity file and selfie exist', async () => {
    verification.status = KycStatus.PENDING;
    verification.countryCode = 'DE';
    verification.documentType = 'passport';
    verification.documentReference = 'C01X';
    await expect(service.submitManual('user-1')).rejects.toMatchObject({
      status: HttpStatus.UNPROCESSABLE_ENTITY,
    });
  });

  it('submits for review once required files exist and is idempotent', async () => {
    verification.status = KycStatus.PENDING;
    verification.countryCode = 'DE';
    verification.documentType = 'passport';
    verification.documentReference = 'C01X';
    verification.documents = [
      { docType: 'identity', fileUrl: 'kyc/user-1/kyc-1/identity.jpg', status: KycDocumentStatus.UPLOADED },
      { docType: 'selfie', fileUrl: 'kyc/user-1/kyc-1/selfie.jpg', status: KycDocumentStatus.UPLOADED },
    ];
    const first = await service.submitManual('user-1');
    expect(first.status).toBe(KycStatus.MANUAL_REVIEW_REQUIRED);
    verification.status = KycStatus.MANUAL_REVIEW_REQUIRED;
    const second = await service.submitManual('user-1');
    expect(second.status).toBe(KycStatus.MANUAL_REVIEW_REQUIRED);
  });

  it('returns STORAGE_UNAVAILABLE when Supabase is not configured', async () => {
    supabase.isReady.mockReturnValue(false);
    await expect(
      service.uploadDocument('user-1', 'identity', {
        buffer: Buffer.from('id'),
        mimetype: 'image/png',
        size: 8,
        originalname: 'id.png',
      }),
    ).rejects.toMatchObject({
      status: HttpStatus.SERVICE_UNAVAILABLE,
    });
  });

  it('persists EXPIRED when an approved verification is past expiresAt', async () => {
    verification.status = KycStatus.APPROVED;
    verification.expiresAt = new Date(Date.now() - 1000);
    prisma.kycVerification.findFirst.mockResolvedValue({
      ...verification,
      documents: [],
    });
    const status = await service.getStatus('user-1');
    expect(status.status).toBe(KycStatus.EXPIRED);
    expect(prisma.kycVerification.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { status: KycStatus.EXPIRED },
      }),
    );
  });

  it('issues short-lived signed URLs for stored files only', async () => {
    prisma.kycVerification.findUnique.mockResolvedValue({
      ...verification,
      documents: [
        {
          docType: 'identity',
          fileUrl: 'kyc/user-1/kyc-1/identity.jpg',
          status: KycDocumentStatus.UPLOADED,
          uploadedAt: new Date('2026-01-01T00:00:00.000Z'),
        },
        {
          docType: 'address_meta',
          fileUrl: 'meta:v1:e30',
          status: KycDocumentStatus.UPLOADED,
          uploadedAt: new Date('2026-01-01T00:00:00.000Z'),
        },
      ],
    });
    const payload = await service.listReviewDocuments('kyc-1');
    expect(supabase.createSignedUrl).toHaveBeenCalledTimes(1);
    expect(payload.documents).toHaveLength(1);
    expect(payload.documents[0]).toMatchObject({
      docType: 'identity',
      kind: 'image',
      signedUrl: 'https://signed.example/doc',
      expiresInSeconds: 300,
    });
    expect(payload.documentViewerAvailable).toBe(true);
  });
});
