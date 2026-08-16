import {
  deriveDevTronAddress,
  encodeTronAddress,
  hexToTronAddress,
  isValidTrc20Address,
  normalizeTrc20Address,
} from './trc20-address.validator';
import { createHash, randomBytes } from 'node:crypto';

function randomValid(): string {
  return encodeTronAddress(randomBytes(20));
}

describe('TRON Base58Check validation', () => {
  it('accepts a valid T-address', () => {
    const addr = randomValid();
    expect(addr.startsWith('T')).toBe(true);
    expect(isValidTrc20Address(addr)).toBe(true);
    expect(normalizeTrc20Address(` ${addr} `)).toBe(addr);
  });

  it('rejects ETH 0x addresses', () => {
    expect(
      isValidTrc20Address('0x71C7656EC7ab88b098defB751B7401B5f6d8976F'),
    ).toBe(false);
  });

  it('rejects empty, short, long, and malformed', () => {
    expect(isValidTrc20Address('')).toBe(false);
    expect(isValidTrc20Address('Tshort')).toBe(false);
    expect(isValidTrc20Address(`T${'1'.repeat(40)}`)).toBe(false);
    expect(isValidTrc20Address('T0OIl0000000000000000000000000001')).toBe(false);
  });

  it('rejects wrong checksum', () => {
    const valid = randomValid();
    const broken = `${valid.slice(0, -1)}${valid.endsWith('1') ? '2' : '1'}`;
    expect(isValidTrc20Address(broken)).toBe(false);
  });

  it('round-trips hex payload', () => {
    const payload = createHash('sha256').update('spliton').digest().subarray(0, 20);
    const addr = encodeTronAddress(payload);
    expect(isValidTrc20Address(addr)).toBe(true);
    const hex = Buffer.from(payload).toString('hex');
    expect(hexToTronAddress(hex)).toBe(addr);
    expect(hexToTronAddress(`41${hex}`)).toBe(addr);
  });

  it('derives deterministic dev addresses', () => {
    expect(deriveDevTronAddress('user-1')).toBe(deriveDevTronAddress('user-1'));
    expect(isValidTrc20Address(deriveDevTronAddress('user-1'))).toBe(true);
  });
});
