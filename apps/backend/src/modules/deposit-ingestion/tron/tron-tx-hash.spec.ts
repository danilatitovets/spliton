import { InvalidTronTxHashError, normalizeTronTxHash, tryNormalizeTronTxHash } from './tron-tx-hash';

const LOWER = '6182758a7dd1bfdd005f978285300f8f6dbf93d76171ddb6514d7c0044d2b809';

describe('normalizeTronTxHash', () => {
  it('canonicalizes mixed case, whitespace, and 0x prefix to lowercase', () => {
    expect(normalizeTronTxHash(`  ${LOWER.toUpperCase()}  `)).toBe(LOWER);
    expect(normalizeTronTxHash(`0x${LOWER}`)).toBe(LOWER);
    expect(
      normalizeTronTxHash(`0X${LOWER.slice(0, 8).toUpperCase()}${LOWER.slice(8)}`),
    ).toBe(LOWER);
    expect(normalizeTronTxHash(LOWER)).toBe(LOWER);
  });

  it('rejects empty, non-hex, wrong length, and does not invent a valid hash', () => {
    expect(() => normalizeTronTxHash('')).toThrow(InvalidTronTxHashError);
    expect(() => normalizeTronTxHash('   ')).toThrow(InvalidTronTxHashError);
    expect(() => normalizeTronTxHash('zzzz')).toThrow(InvalidTronTxHashError);
    expect(() => normalizeTronTxHash(LOWER.slice(0, 63))).toThrow(InvalidTronTxHashError);
    expect(() => normalizeTronTxHash(`${LOWER}aa`)).toThrow(InvalidTronTxHashError);
    expect(() => normalizeTronTxHash(`once-${Date.now()}`)).toThrow(InvalidTronTxHashError);
    expect(tryNormalizeTronTxHash('not-a-hash')).toBeNull();
    expect(tryNormalizeTronTxHash(null)).toBeNull();
  });
});
