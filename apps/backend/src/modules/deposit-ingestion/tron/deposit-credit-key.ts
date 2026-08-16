/** Ledger idempotency for a chain USDT deposit — keyed by canonical tx, not deposit row. */
export function depositCreditIdempotencyKey(
  chainNetwork: string,
  canonicalTxHash: string,
): string {
  return `deposit-credit-txid:${chainNetwork}:${canonicalTxHash}`;
}
