import { HttpStatus, Injectable } from '@nestjs/common';
import { ReleaseStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { throwAdminError } from '../admin/common/admin-http.util';

const PUBLIC_STATUSES: ReleaseStatus[] = [
  ReleaseStatus.ACTIVE,
  ReleaseStatus.PAUSED,
  ReleaseStatus.SOLD_OUT,
];

const releasePublicInclude = {
  releaseArtists: {
    include: { artist: true },
    orderBy: { createdAt: 'asc' as const },
    take: 3,
  },
  primaryRaiseRounds: {
    orderBy: { createdAt: 'desc' as const },
    take: 1,
  },
};

@Injectable()
export class UserAnalyticsResolveService {
  constructor(private readonly prisma: PrismaService) {}

  async resolveReleaseId(idOrSlug: string): Promise<string> {
    const row = await this.prisma.release.findFirst({
      where: {
        deletedAt: null,
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      select: { id: true },
    });
    if (row) return row.id;

    throwAdminError(
      'RELEASE_NOT_FOUND',
      'Release not found',
      HttpStatus.NOT_FOUND,
    );
  }

  async assertPublicRelease(releaseId: string): Promise<void> {
    const release = await this.prisma.release.findFirst({
      where: { id: releaseId, deletedAt: null },
      select: { status: true },
    });
    if (!release || !PUBLIC_STATUSES.includes(release.status)) {
      throwAdminError(
        'RELEASE_NOT_FOUND',
        'Release not found',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  /** One RTT: resolve by id/slug + public status check + full include. */
  async loadPublicReleaseByKey(idOrSlug: string) {
    const release = await this.prisma.release.findFirst({
      where: {
        deletedAt: null,
        status: { in: PUBLIC_STATUSES },
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      include: releasePublicInclude,
    });
    if (!release) {
      throwAdminError(
        'RELEASE_NOT_FOUND',
        'Release not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return release;
  }

  async loadRelease(releaseId: string) {
    const release = await this.prisma.release.findFirst({
      where: { id: releaseId, deletedAt: null },
      include: releasePublicInclude,
    });
    if (!release) {
      throwAdminError(
        'RELEASE_NOT_FOUND',
        'Release not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return release;
  }
}
