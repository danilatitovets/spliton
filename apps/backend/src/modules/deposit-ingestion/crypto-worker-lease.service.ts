import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

const LEASE_ID = 'deposit-ingestion';

export type CryptoWorkerLeaseHandle = {
  holder: string;
  version: number;
};

@Injectable()
export class CryptoWorkerLeaseService {
  constructor(private readonly prisma: PrismaService) {}

  async tryAcquire(ttlMs: number): Promise<CryptoWorkerLeaseHandle | null> {
    const holder = randomUUID();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttlMs);
    await this.prisma.$executeRaw`
      INSERT INTO crypto_worker_leases (id, holder, version, expires_at, heartbeat_at, created_at, updated_at)
      VALUES (${LEASE_ID}, ${holder}, 1, ${expiresAt}, ${now}, ${now}, ${now})
      ON CONFLICT (id) DO UPDATE
        SET holder = EXCLUDED.holder,
            version = crypto_worker_leases.version + 1,
            expires_at = EXCLUDED.expires_at,
            heartbeat_at = EXCLUDED.heartbeat_at,
            updated_at = EXCLUDED.updated_at
        WHERE crypto_worker_leases.expires_at < ${now}
    `;
    const row = await this.prisma.cryptoWorkerLease.findUnique({
      where: { id: LEASE_ID },
    });
    if (!row || row.holder !== holder) return null;
    return { holder, version: row.version };
  }

  async heartbeat(
    handle: CryptoWorkerLeaseHandle,
    ttlMs: number,
  ): Promise<boolean> {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttlMs);
    const updated = await this.prisma.cryptoWorkerLease.updateMany({
      where: {
        id: LEASE_ID,
        holder: handle.holder,
        version: handle.version,
      },
      data: { heartbeatAt: now, expiresAt },
    });
    return updated.count === 1;
  }

  async release(handle: CryptoWorkerLeaseHandle): Promise<void> {
    await this.prisma.cryptoWorkerLease.updateMany({
      where: {
        id: LEASE_ID,
        holder: handle.holder,
        version: handle.version,
      },
      data: { expiresAt: new Date(0) },
    });
  }
}
