import { createHash } from 'node:crypto';
import { normalizeTronTxHash } from '../../src/modules/deposit-ingestion/tron/tron-tx-hash';

/** Deterministic valid TRON tx hash for tests (never a live chain id). */
export function canonicalTestTxHash(seed: string): string {
  return normalizeTronTxHash(createHash('sha256').update(seed).digest('hex'));
}
