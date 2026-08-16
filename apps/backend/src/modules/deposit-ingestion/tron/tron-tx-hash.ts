export class InvalidTronTxHashError extends Error {
  constructor(message = 'INVALID_TRON_TX_HASH') {
    super(message);
    this.name = 'InvalidTronTxHashError';
  }
}

/** TRON txid is SHA-256: 32 bytes, 64 hex chars. */
const TRON_TX_HASH_HEX = /^[0-9a-fA-F]{64}$/;

/**
 * Canonical TRON transaction hash: trimmed, optional 0x stripped, lowercase 64-hex.
 * Invalid input throws — never coerced into a valid hash.
 */
export function normalizeTronTxHash(value: string): string {
  if (typeof value !== 'string') {
    throw new InvalidTronTxHashError();
  }
  let hex = value.trim();
  if (hex.startsWith('0x') || hex.startsWith('0X')) {
    hex = hex.slice(2).trim();
  }
  if (!TRON_TX_HASH_HEX.test(hex)) {
    throw new InvalidTronTxHashError();
  }
  return hex.toLowerCase();
}

export function tryNormalizeTronTxHash(
  value: string | null | undefined,
): string | null {
  if (value == null) return null;
  try {
    return normalizeTronTxHash(value);
  } catch {
    return null;
  }
}

/** Ledger idempotency for a chain USDT deposit, keyed by canonical tx not deposit row. */
export function depositCreditIdempotencyKey(
  chainNetwork: string,
  canonicalTxHash: string,
): string {
  return `deposit-credit-txid:${chainNetwork}:${canonicalTxHash}`;
}
