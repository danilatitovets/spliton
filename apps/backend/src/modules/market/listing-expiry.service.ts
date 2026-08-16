import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import {
  ListingStatus,
  OwnershipEventType,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CacheInvalidationService } from '../../common/platform/cache/cache-invalidation.service';

const DEFAULT_BATCH = 50;

@Injectable()
export class ListingExpiryService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ListingExpiryService.name);
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheInvalidation: CacheInvalidationService,
  ) {}

  onModuleInit(): void {
    if (process.env.LISTING_EXPIRY_JOB_ENABLED !== 'true') return;
    const minutes = Number(process.env.LISTING_EXPIRY_INTERVAL_MINUTES ?? 15);
    const ms = Math.max(1, minutes) * 60 * 1000;
    void this.expireDueListings();
    this.timer = setInterval(() => void this.expireDueListings(), ms);
    this.logger.log(`Listing expiry job scheduled every ${minutes}m`);
  }

  onModuleDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  async expireDueListings(now = new Date()): Promise<{ expired: number }> {
    const due = await this.prisma.marketListing.findMany({
      where: {
        deletedAt: null,
        expiresAt: { not: null, lt: now },
        status: { in: [ListingStatus.ACTIVE, ListingStatus.PAUSED] },
      },
      take: DEFAULT_BATCH,
      orderBy: { expiresAt: 'asc' },
    });

    let expired = 0;
    for (const listing of due) {
      const ok = await this.expireListing(listing.id);
      if (ok) expired += 1;
    }

    if (expired > 0) {
      this.logger.log(`Expired ${expired} listing(s)`);
      this.cacheInvalidation.onCatalogOrMarketChange();
    }

    return { expired };
  }

  private async expireListing(listingId: string): Promise<boolean> {
    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.$executeRaw`
          SELECT id FROM market_listings WHERE id = ${listingId}::uuid FOR UPDATE
        `;
        const listing = await tx.marketListing.findFirst({
          where: {
            id: listingId,
            deletedAt: null,
            expiresAt: { not: null, lt: new Date() },
            status: { in: [ListingStatus.ACTIVE, ListingStatus.PAUSED] },
          },
        });
        if (!listing) return;

        const unlock = listing.unitsAvailable;
        const cas = await tx.$executeRaw`
          UPDATE market_listings
          SET status = 'EXPIRED', updated_at = NOW()
          WHERE id = ${listingId}::uuid
            AND status IN ('ACTIVE', 'PAUSED')
            AND deleted_at IS NULL
        `;
        if (Number(cas) !== 1) return;

        if (unlock.gt(0)) {
          const posUpdated = await tx.$executeRaw`
            UPDATE user_positions
            SET
              units_available = units_available + ${unlock},
              units_locked = units_locked - ${unlock},
              updated_at = NOW()
            WHERE user_id = ${listing.sellerUserId}::uuid
              AND release_id = ${listing.releaseId}::uuid
              AND units_locked >= ${unlock}
          `;
          if (Number(posUpdated) !== 1) {
            throw new Error(`POSITION_LOCK_MISMATCH for listing ${listingId}`);
          }

          await tx.ownershipLedger.create({
            data: {
              userId: listing.sellerUserId,
              releaseId: listing.releaseId,
              eventType: OwnershipEventType.UNLOCK_AFTER_CANCEL,
              unitsDelta: unlock,
              sourceEntityType: 'listing',
              sourceEntityId: listingId,
              happenedAt: new Date(),
            },
          });
        }
      });
      return true;
    } catch (error) {
      this.logger.warn(
        `Failed to expire listing ${listingId}: ${error instanceof Error ? error.message : error}`,
      );
      return false;
    }
  }
}
