import { randomBytes, createHash } from 'node:crypto';
import { encodeTronAddress } from '../../src/modules/wallets/validators/trc20-address.validator';

/** Unique checksum-valid TRON address for e2e. */
export function uniqueTrc20Address(seed = ''): string {
  const digest = createHash('sha256')
    .update(`${Date.now()}:${seed}:${randomBytes(8).toString('hex')}`)
    .digest();
  return encodeTronAddress(digest.subarray(0, 20));
}
