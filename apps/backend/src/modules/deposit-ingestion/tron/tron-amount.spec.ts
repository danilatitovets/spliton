import { Prisma } from '@prisma/client';
import {
  confirmationsFromBlocks,
  decimalToTokenRaw,
  parseTokenRawAmount,
  tokenRawToDecimal,
} from './tron-amount';

describe('tron-amount', () => {
  it('converts 6-decimal USDT without floating point', () => {
    const dec = tokenRawToDecimal(1_500_000n);
    expect(dec.toString()).toBe('1.5');
    expect(decimalToTokenRaw(dec)).toBe(1_500_000n);
    expect(decimalToTokenRaw(new Prisma.Decimal('25'))).toBe(25_000_000n);
  });

  it('rejects malformed and zero amounts', () => {
    expect(() => parseTokenRawAmount('1.5')).toThrow();
    expect(() => parseTokenRawAmount('-1')).toThrow();
    expect(() => parseTokenRawAmount('0')).toThrow();
    expect(() => parseTokenRawAmount('abc')).toThrow();
  });

  it('computes confirmations as current - tx + 1', () => {
    expect(confirmationsFromBlocks(100n, 80n)).toBe(21);
    expect(confirmationsFromBlocks(80n, 80n)).toBe(1);
    expect(confirmationsFromBlocks(79n, 80n)).toBe(0);
  });
});
