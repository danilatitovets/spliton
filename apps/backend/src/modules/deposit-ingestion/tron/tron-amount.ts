import { Prisma } from '@prisma/client';

export const USDT_TRC20_DECIMALS = 6;

export function parseTokenRawAmount(raw: string): bigint {
  const trimmed = raw.trim();
  if (!/^[0-9]+$/.test(trimmed)) {
    throw new Error('MALFORMED_TOKEN_AMOUNT');
  }
  const value = BigInt(trimmed);
  if (value <= 0n) {
    throw new Error('NON_POSITIVE_TOKEN_AMOUNT');
  }
  return value;
}

export function tokenRawToDecimal(
  raw: bigint,
  decimals: number = USDT_TRC20_DECIMALS,
): Prisma.Decimal {
  if (decimals < 0 || decimals > 18) {
    throw new Error('UNSUPPORTED_TOKEN_DECIMALS');
  }
  const negative = raw < 0n;
  const abs = negative ? -raw : raw;
  const base = 10n ** BigInt(decimals);
  const whole = abs / base;
  const frac = abs % base;
  const fracStr = frac.toString().padStart(decimals, '0');
  const sign = negative ? '-' : '';
  return new Prisma.Decimal(`${sign}${whole.toString()}.${fracStr}`);
}

export function decimalToTokenRaw(
  amount: Prisma.Decimal,
  decimals: number = USDT_TRC20_DECIMALS,
): bigint {
  const quantized = amount.toDecimalPlaces(decimals, Prisma.Decimal.ROUND_DOWN);
  const [whole, frac = ''] = quantized.toFixed(decimals).split('.');
  const sign = whole.startsWith('-') ? -1n : 1n;
  const wholeAbs = whole.replace('-', '') || '0';
  return sign * (BigInt(wholeAbs) * 10n ** BigInt(decimals) + BigInt(frac || '0'));
}

export function confirmationsFromBlocks(
  currentBlock: bigint,
  txBlock: bigint,
): number {
  if (txBlock <= 0n || currentBlock < txBlock) return 0;
  const delta = currentBlock - txBlock + 1n;
  if (delta > BigInt(Number.MAX_SAFE_INTEGER)) return Number.MAX_SAFE_INTEGER;
  return Number(delta);
}
