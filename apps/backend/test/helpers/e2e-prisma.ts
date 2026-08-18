import { PrismaClient } from '@prisma/client';

import { applyPrismaConnectionLimit } from '../../src/config/db-connection-policy';

let shared: PrismaClient | null = null;

/**
 * One PrismaClient per Jest e2e process. Opening a new client per helper
 * call exhausts Supabase session pooler (EMAXCONNSESSION / pool_size 15).
 */
export function getE2ePrisma(): PrismaClient {
  if (!shared) {
    const url = process.env.DATABASE_URL?.trim();
    shared = new PrismaClient(
      url ? { datasources: { db: { url: applyPrismaConnectionLimit(url) } } } : undefined,
    );
  }
  return shared;
}

export async function disconnectE2ePrisma(): Promise<void> {
  if (!shared) return;
  const client = shared;
  shared = null;
  await client.$disconnect();
}

/**
 * Extra PrismaClient for true multi-connection races (two buyers, lease fencing).
 * Always $disconnect in finally. Caps pool at 1 so races cannot exhaust session pooler.
 */
export function createIsolatedE2ePrisma(): PrismaClient {
  const url = process.env.DATABASE_URL?.trim();
  const limited = url
    ? applyPrismaConnectionLimit(url, { ...process.env, PRISMA_CONNECTION_LIMIT: '1' })
    : undefined;
  return new PrismaClient(limited ? { datasources: { db: { url: limited } } } : undefined);
}
