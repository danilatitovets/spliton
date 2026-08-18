import { HttpStatus, Injectable } from '@nestjs/common';
import { KycDocumentStatus, KycLevel, KycStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { throwAdminError } from '../admin/common/admin-http.util';
import { AdminAuditService } from '../admin/common/admin-audit.service';
import { throwAppError } from '../../common/platform/errors/throw-app-error';
import { SupabaseStorageService } from '../admin/common/supabase-storage.service';
import {
  KYC_SELFIE_LIMITS,
  USER_DOCUMENT_LIMITS,
  kycDocumentPath,
} from '../admin/common/media-storage.constants';
import { effectiveKycStatus, isKycLockedForEdits } from './kyc-effective-status';
import type { SaveKycDetailsDto, SubmitKycManualDto } from './dto/kyc-user.dto';

const ADDRESS_META_TYPE = 'address_meta';
const META_PREFIX = 'meta:v1:';
/** Stored files. Review is account-level; KycDocumentStatus APPROVED/REJECTED is unused. */
const FILE_DOC_TYPES = ['identity', 'address', 'selfie'] as const;
const ADMIN_DOC_TTL_SECONDS = 300;
type KycFileDocType = (typeof FILE_DOC_TYPES)[number];

function fileKind(path: string): 'pdf' | 'image' {
  return path.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image';
}

export type KycAddressPayload = {
  city: string;
  street: string;
  postalCode: string;
  countryCode?: string;
};

export type KycUploadFile = {
  buffer: Buffer;
  mimetype: string;
  size: number;
  originalname: string;
};

function encodeAddressMeta(meta: KycAddressPayload): string {
  return META_PREFIX + Buffer.from(JSON.stringify(meta), 'utf8').toString('base64url');
}

function decodeAddressMeta(fileUrl: string | null | undefined): KycAddressPayload | null {
  if (!fileUrl?.startsWith(META_PREFIX)) return null;
  try {
    const parsed = JSON.parse(
      Buffer.from(fileUrl.slice(META_PREFIX.length), 'base64url').toString('utf8'),
    ) as KycAddressPayload;
    if (!parsed?.city || !parsed?.street) return null;
    return parsed;
  } catch {
    return null;
  }
}

function extFromMime(mime: string, allowed: Set<string>): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'application/pdf': 'pdf',
  };
  const ext = map[mime.toLowerCase()];
  if (!ext || !allowed.has(ext)) {
    throwAppError('INVALID_MEDIA_TYPE', `Unsupported file type: ${mime}`, HttpStatus.BAD_REQUEST);
  }
  return ext;
}

@Injectable()
export class UserKycService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AdminAuditService,
    private readonly supabase: SupabaseStorageService,
  ) {}

  async getStatus(userId: string) {
    let row = await this.prisma.kycVerification.findFirst({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: { documents: true },
    });
    const profile = await this.prisma.userProfile.findUnique({
      where: { userId },
      select: { countryCode: true },
    });
    const effective = effectiveKycStatus(row);
    if (row && effective === KycStatus.EXPIRED && row.status !== KycStatus.EXPIRED) {
      row = await this.prisma.kycVerification.update({
        where: { id: row.id },
        data: { status: KycStatus.EXPIRED },
        include: { documents: true },
      });
    }
    const documents = row?.documents ?? [];
    const addressMeta = decodeAddressMeta(
      documents.find((d) => d.docType === ADDRESS_META_TYPE)?.fileUrl,
    );
    const hasFile = (type: KycFileDocType) =>
      documents.some((d) => d.docType === type && d.status !== KycDocumentStatus.REJECTED);
    const hasIdentityRef = Boolean(row?.documentReference?.trim());
    const approved = effective === KycStatus.APPROVED;
    const detailsDone = Boolean(row?.countryCode?.trim() && row?.documentType && hasIdentityRef);
    const identityDone = hasFile('identity') || approved;
    const addressDone = Boolean(addressMeta?.city && addressMeta?.street) || hasFile('address');
    const selfieDone = hasFile('selfie') || approved;
    const canSubmit =
      detailsDone &&
      identityDone &&
      selfieDone &&
      !isKycLockedForEdits(effective);

    return {
      status: effective,
      level: row?.level ?? KycLevel.NONE,
      countryCode: row?.countryCode ?? addressMeta?.countryCode ?? null,
      profileCountryCode: profile?.countryCode ?? null,
      documentType: row?.documentType ?? null,
      documentReference: row?.documentReference ?? null,
      submittedAt: row?.submittedAt?.toISOString() ?? null,
      reviewedAt: row?.reviewedAt?.toISOString() ?? null,
      expiresAt: row?.expiresAt?.toISOString() ?? null,
      rejectionReasonSafe: row?.rejectReason ?? null,
      provider: row?.provider ?? 'manual',
      address: addressMeta,
      canSubmit,
      required: { details: true, identity: true, selfie: true, address: false },
      steps: {
        details: detailsDone,
        identity: identityDone,
        address: addressDone,
        selfie: selfieDone,
      },
      files: {
        identity: hasFile('identity'),
        address: hasFile('address'),
        selfie: hasFile('selfie'),
      },
    };
  }

  private async withUserKycLock<T>(
    userId: string,
    fn: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    return this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${userId}))`;
      return fn(tx);
    });
  }

  private async ensureVerification(userId: string) {
    return this.withUserKycLock(userId, async (tx) => {
      const existing = await tx.kycVerification.findFirst({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
      });
      if (existing) return existing;
      return tx.kycVerification.create({
        data: {
          userId,
          status: KycStatus.NOT_STARTED,
          level: KycLevel.BASIC,
          provider: 'manual',
        },
      });
    });
  }

  private async assertEditable(userId: string) {
    const existing = await this.prisma.kycVerification.findFirst({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
    const status = effectiveKycStatus(existing);
    if (isKycLockedForEdits(status)) {
      throwAppError(
        'VALIDATION_ERROR',
        'Verification is locked while under review or approved',
        HttpStatus.CONFLICT,
      );
    }
    return existing;
  }

  async saveAddress(userId: string, body: KycAddressPayload) {
    await this.assertEditable(userId);
    const city = body.city.trim();
    const street = body.street.trim();
    const postalCode = body.postalCode.trim();
    if (city.length < 2 || street.length < 3) {
      throwAppError('VALIDATION_ERROR', 'Address city and street are required', HttpStatus.BAD_REQUEST);
    }
    const row = await this.ensureVerification(userId);
    const meta: KycAddressPayload = {
      city: city.slice(0, 120),
      street: street.slice(0, 200),
      postalCode: postalCode.slice(0, 16),
      countryCode: body.countryCode?.trim().toUpperCase().slice(0, 8) || row.countryCode || undefined,
    };
    const existing = await this.prisma.kycDocument.findFirst({
      where: { kycVerificationId: row.id, docType: ADDRESS_META_TYPE },
    });
    if (existing) {
      await this.prisma.kycDocument.update({
        where: { id: existing.id },
        data: { fileUrl: encodeAddressMeta(meta), status: KycDocumentStatus.UPLOADED },
      });
    } else {
      await this.prisma.kycDocument.create({
        data: {
          kycVerificationId: row.id,
          docType: ADDRESS_META_TYPE,
          fileUrl: encodeAddressMeta(meta),
          status: KycDocumentStatus.UPLOADED,
          uploadedAt: new Date(),
        },
      });
    }
    if (meta.countryCode && !row.countryCode) {
      await this.prisma.kycVerification.update({
        where: { id: row.id },
        data: { countryCode: meta.countryCode },
      });
    }
    return this.getStatus(userId);
  }

  async uploadDocument(userId: string, docTypeRaw: string, file: KycUploadFile) {
    await this.assertEditable(userId);
    const docType = docTypeRaw.trim().toLowerCase();
    if (!FILE_DOC_TYPES.includes(docType as KycFileDocType)) {
      throwAppError('VALIDATION_ERROR', 'Unsupported KYC document type', HttpStatus.BAD_REQUEST);
    }
    const limits = docType === 'selfie' ? KYC_SELFIE_LIMITS : USER_DOCUMENT_LIMITS;
    if (!file?.buffer?.length) {
      throwAppError('VALIDATION_ERROR', 'File is required', HttpStatus.BAD_REQUEST);
    }
    if (file.size > limits.maxBytes) {
      throwAppError('VALIDATION_ERROR', 'File is too large', HttpStatus.BAD_REQUEST);
    }
    const mime = file.mimetype?.toLowerCase() ?? '';
    if (!limits.mimeTypes.has(mime)) {
      throwAppError('INVALID_MEDIA_TYPE', `Unsupported file type: ${mime || 'unknown'}`, HttpStatus.BAD_REQUEST);
    }
    if (!this.supabase.isReady()) {
      throwAppError(
        'STORAGE_UNAVAILABLE',
        'Document storage is not configured',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    const ext = extFromMime(mime, limits.extensions);
    const row = await this.ensureVerification(userId);
    const path = kycDocumentPath(userId, row.id, docType, ext);
    try {
      await this.supabase.upload({
        bucket: this.supabase.buckets.userDocuments,
        path,
        body: file.buffer,
        contentType: mime,
        upsert: true,
      });
    } catch {
      throwAppError(
        'STORAGE_UNAVAILABLE',
        'Could not store the document',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    const existing = await this.prisma.kycDocument.findFirst({
      where: { kycVerificationId: row.id, docType },
    });
    if (existing) {
      await this.prisma.kycDocument.update({
        where: { id: existing.id },
        data: {
          fileUrl: path,
          status: KycDocumentStatus.UPLOADED,
          uploadedAt: new Date(),
        },
      });
    } else {
      await this.prisma.kycDocument.create({
        data: {
          kycVerificationId: row.id,
          docType,
          fileUrl: path,
          status: KycDocumentStatus.UPLOADED,
          uploadedAt: new Date(),
        },
      });
    }
    return this.getStatus(userId);
  }

  async start(userId: string, countryCode?: string) {
    await this.withUserKycLock(userId, async (tx) => {
      const existing = await tx.kycVerification.findFirst({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
      });
      const status = effectiveKycStatus(existing);
      if (status === KycStatus.APPROVED) return;
      if (status === KycStatus.MANUAL_REVIEW_REQUIRED || status === KycStatus.IN_REVIEW) return;
      const cc = countryCode?.toUpperCase();
      if (existing) {
        await tx.kycVerification.update({
          where: { id: existing.id },
          data: {
            status: KycStatus.PENDING,
            countryCode: cc ?? existing.countryCode,
          },
        });
      } else {
        await tx.kycVerification.create({
          data: {
            userId,
            status: KycStatus.PENDING,
            level: KycLevel.BASIC,
            countryCode: cc,
            provider: 'manual',
          },
        });
      }

      if (cc) {
        await tx.userProfile.upsert({
          where: { userId },
          create: { userId, countryCode: cc },
          update: { countryCode: cc },
        });
      }
    });
    return this.getStatus(userId);
  }

  async saveDetails(userId: string, body: SaveKycDetailsDto) {
    await this.assertEditable(userId);
    const countryCode = body.countryCode.toUpperCase();
    const documentType = body.documentType;
    const documentReference = body.documentReference.trim().slice(0, 32);
    let row = await this.ensureVerification(userId);
    const status = effectiveKycStatus(row);
    await this.prisma.kycVerification.update({
      where: { id: row.id },
      data: {
        status: status === KycStatus.NOT_STARTED || status === KycStatus.EXPIRED ? KycStatus.PENDING : row.status === KycStatus.REJECTED ? KycStatus.PENDING : row.status,
        countryCode,
        documentType,
        documentReference,
      },
    });
    await this.prisma.userProfile.upsert({
      where: { userId },
      create: { userId, countryCode },
      update: { countryCode },
    });
    return this.getStatus(userId);
  }

  async submitManual(userId: string, body: SubmitKycManualDto = {}) {
    const existing = await this.prisma.kycVerification.findFirst({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
    const status = effectiveKycStatus(existing);
    if (status === KycStatus.APPROVED) {
      return this.getStatus(userId);
    }
    if (status === KycStatus.MANUAL_REVIEW_REQUIRED || status === KycStatus.IN_REVIEW) {
      return this.getStatus(userId);
    }
    if (body.countryCode && body.documentType && body.documentReference) {
      await this.saveDetails(userId, {
        countryCode: body.countryCode,
        documentType: body.documentType,
        documentReference: body.documentReference,
      });
    }
    const snapshot = await this.getStatus(userId);
    if (!snapshot.canSubmit) {
      throwAppError(
        'VALIDATION_ERROR',
        'Required verification steps are incomplete',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    const row = await this.prisma.kycVerification.findFirst({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
    if (!row) {
      throwAppError('VALIDATION_ERROR', 'Start verification before submitting', HttpStatus.BAD_REQUEST);
    }
    await this.prisma.kycVerification.update({
      where: { id: row!.id },
      data: {
        status: KycStatus.MANUAL_REVIEW_REQUIRED,
        submittedAt: new Date(),
        rejectReason: null,
      },
    });
    return this.getStatus(userId);
  }

  async getReviewById(id: string) {
    const row = await this.prisma.kycVerification.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, profile: true } },
        documents: true,
      },
    });
    if (!row) {
      throwAdminError('KYC_NOT_FOUND', 'KYC review not found', HttpStatus.NOT_FOUND);
    }
    const effective = effectiveKycStatus(row);
    return {
      ...this.mapReview({ ...row!, status: effective, documents: row!.documents }),
      user: row!.user,
      address: decodeAddressMeta(
        row!.documents.find((d) => d.docType === ADDRESS_META_TYPE)?.fileUrl,
      ),
    };
  }

  async listReviewDocuments(id: string) {
    const row = await this.prisma.kycVerification.findUnique({
      where: { id },
      include: { documents: true },
    });
    if (!row) {
      throwAdminError('KYC_NOT_FOUND', 'KYC review not found', HttpStatus.NOT_FOUND);
    }
    const storageReady = this.supabase.isReady();
    const files = row!.documents.filter(
      (d) => FILE_DOC_TYPES.includes(d.docType as KycFileDocType) && !d.fileUrl.startsWith(META_PREFIX),
    );
    const documents = await Promise.all(
      files.map(async (doc) => {
        let signedUrl: string | null = null;
        if (storageReady) {
          try {
            signedUrl = await this.supabase.createSignedUrl(
              this.supabase.buckets.userDocuments,
              doc.fileUrl,
              ADMIN_DOC_TTL_SECONDS,
            );
          } catch {
            signedUrl = null;
          }
        }
        return {
          docType: doc.docType,
          kind: fileKind(doc.fileUrl),
          uploadedAt: doc.uploadedAt.toISOString(),
          status: doc.status,
          signedUrl,
          expiresInSeconds: signedUrl ? ADMIN_DOC_TTL_SECONDS : null,
        };
      }),
    );
    return {
      id: row!.id,
      userId: row!.userId,
      documentViewerAvailable: storageReady && documents.some((d) => Boolean(d.signedUrl)),
      address: decodeAddressMeta(
        row!.documents.find((d) => d.docType === ADDRESS_META_TYPE)?.fileUrl,
      ),
      documents,
    };
  }

  async listReviews(status?: KycStatus) {
    const rows = await this.prisma.kycVerification.findMany({
      where: status
        ? { status }
        : {
            status: {
              in: [KycStatus.IN_REVIEW, KycStatus.MANUAL_REVIEW_REQUIRED],
            },
          },
      orderBy: { submittedAt: 'desc' },
      include: {
        user: { select: { id: true, email: true, profile: true } },
        documents: { select: { docType: true, fileUrl: true } },
      },
      take: 100,
    });
    return rows.map((row) => ({
      ...this.mapReview(row),
      user: row.user,
    }));
  }

  async approve(
    id: string,
    actorUserId: string,
    level: KycLevel = KycLevel.VERIFIED,
  ) {
    const row = await this.requireReviewRow(id);
    const updated = await this.prisma.kycVerification.update({
      where: { id },
      data: {
        status: KycStatus.APPROVED,
        level,
        reviewedAt: new Date(),
        reviewedBy: actorUserId,
        rejectReason: null,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    });
    await this.audit.logOperatorAction({
      actorUserId,
      actorRoles: [],
      entityType: 'kyc_verification',
      entityId: id,
      action: 'kyc.approve',
      after: { status: updated.status, level: updated.level },
      ip: null,
      userAgent: null,
    });
    return this.mapReview(updated);
  }

  async reject(id: string, actorUserId: string, reason: string) {
    await this.requireReviewRow(id);
    const updated = await this.prisma.kycVerification.update({
      where: { id },
      data: {
        status: KycStatus.REJECTED,
        reviewedAt: new Date(),
        reviewedBy: actorUserId,
        rejectReason: reason.slice(0, 500),
      },
    });
    await this.audit.logOperatorAction({
      actorUserId,
      actorRoles: [],
      entityType: 'kyc_verification',
      entityId: id,
      action: 'kyc.reject',
      after: { status: updated.status },
      ip: null,
      userAgent: null,
    });
    return this.mapReview(updated);
  }

  private async requireReviewRow(id: string) {
    const row = await this.prisma.kycVerification.findUnique({ where: { id } });
    if (!row) {
      throwAdminError('KYC_NOT_FOUND', 'KYC review not found', HttpStatus.NOT_FOUND);
    }
    return row!;
  }

  private mapReview(row: {
    id: string;
    userId: string;
    status: KycStatus;
    level: KycLevel;
    countryCode: string | null;
    documentType?: string | null;
    documentReference?: string | null;
    submittedAt: Date | null;
    reviewedAt: Date | null;
    reviewedBy?: string | null;
    rejectReason: string | null;
    provider?: string | null;
    documents?: Array<{ docType: string; fileUrl: string }>;
  }) {
    const files = row.documents ?? [];
    const hasStoredFile = files.some(
      (d) => FILE_DOC_TYPES.includes(d.docType as KycFileDocType) && !d.fileUrl.startsWith(META_PREFIX),
    );
    return {
      id: row.id,
      userId: row.userId,
      status: row.status,
      level: row.level,
      countryCode: row.countryCode,
      documentType: row.documentType ?? null,
      documentReference: row.documentReference ?? null,
      submittedAt: row.submittedAt?.toISOString() ?? null,
      reviewedAt: row.reviewedAt?.toISOString() ?? null,
      reviewedByUserId: row.reviewedBy ?? null,
      rejectionReasonSafe: row.rejectReason,
      provider: row.provider ?? 'manual',
      documentViewerAvailable: this.supabase.isReady() && hasStoredFile,
      files: {
        identity: files.some((d) => d.docType === 'identity'),
        address: files.some((d) => d.docType === 'address'),
        selfie: files.some((d) => d.docType === 'selfie'),
      },
    };
  }
}
