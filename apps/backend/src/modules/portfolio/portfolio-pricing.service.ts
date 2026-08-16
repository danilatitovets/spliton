import { Injectable } from '@nestjs/common';
import { ListingStatus, Prisma, TradeSettlementStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { d } from './portfolio-decimal.util';

export type ReleaseMarkPrice = {
  currentPrice: Prisma.Decimal;
  priceSource: 'best_ask' | 'last_trade' | 'primary';
  lastTradePrice: Prisma.Decimal | null;
};

/**
 * Lightweight mark prices for portfolio — not full secondary-market enrichment
 * (sparklines/history). Two queries max, not an 8-query fanout.
 */
@Injectable()
export class PortfolioPricingService {
  constructor(private readonly prisma: PrismaService) {}

  async resolveMarkPrices(
    releases: { id: string; primaryUnitPrice: Prisma.Decimal }[],
  ): Promise<Map<string, ReleaseMarkPrice>> {
    const map = new Map<string, ReleaseMarkPrice>();
    if (releases.length === 0) return map;

    const ids = releases.map((r) => r.id);
    const primaryById = new Map(
      releases.map((r) => [r.id, r.primaryUnitPrice] as const),
    );

    const [bestAskListings, lastTrades] = await Promise.all([
      this.prisma.marketListing.findMany({
        where: {
          releaseId: { in: ids },
          deletedAt: null,
          status: ListingStatus.ACTIVE,
          unitsAvailable: { gt: 0 },
        },
        orderBy: { pricePerUnit: 'asc' },
        distinct: ['releaseId'],
        select: { releaseId: true, pricePerUnit: true },
      }),
      this.prisma.trade.findMany({
        where: {
          releaseId: { in: ids },
          settlementStatus: TradeSettlementStatus.SETTLED,
        },
        orderBy: { executedAt: 'desc' },
        distinct: ['releaseId'],
        select: {
          releaseId: true,
          price: true,
        },
      }),
    ]);

    const bestAskByRelease = new Map(
      bestAskListings.map((l) => [l.releaseId, l.pricePerUnit]),
    );
    const lastTradeByRelease = new Map(
      lastTrades.map((t) => [t.releaseId, t.price]),
    );

    for (const releaseId of ids) {
      const primary = primaryById.get(releaseId) ?? new Prisma.Decimal(0);
      const bestAsk = bestAskByRelease.get(releaseId) ?? null;
      const last = lastTradeByRelease.get(releaseId) ?? null;
      if (bestAsk && bestAsk.greaterThan(0)) {
        map.set(releaseId, {
          currentPrice: bestAsk,
          priceSource: 'best_ask',
          lastTradePrice: last,
        });
      } else if (last && last.greaterThan(0)) {
        map.set(releaseId, {
          currentPrice: last,
          priceSource: 'last_trade',
          lastTradePrice: last,
        });
      } else {
        map.set(releaseId, {
          currentPrice: primary,
          priceSource: 'primary',
          lastTradePrice: last,
        });
      }
    }

    return map;
  }
}
