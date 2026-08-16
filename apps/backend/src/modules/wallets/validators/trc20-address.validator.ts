import { createHash } from 'node:crypto';

const BASE58_ALPHABET =
  '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const TRON_PREFIX = 0x41;
const PAYLOAD_LEN = 21;
const CHECKSUM_LEN = 4;
const DECODED_LEN = PAYLOAD_LEN + CHECKSUM_LEN;

function sha256(bytes: Uint8Array): Buffer {
  return createHash('sha256').update(bytes).digest();
}

function checksum4(payload: Uint8Array): Buffer {
  return sha256(sha256(payload)).subarray(0, CHECKSUM_LEN);
}

function base58Encode(bytes: Uint8Array): string {
  if (bytes.length === 0) return '';
  let zeros = 0;
  while (zeros < bytes.length && bytes[zeros] === 0) zeros += 1;

  const digits = [0];
  for (let i = zeros; i < bytes.length; i += 1) {
    let carry = bytes[i]!;
    for (let j = 0; j < digits.length; j += 1) {
      const n = digits[j]! * 256 + carry;
      digits[j] = n % 58;
      carry = Math.floor(n / 58);
    }
    while (carry > 0) {
      digits.push(carry % 58);
      carry = Math.floor(carry / 58);
    }
  }

  let out = '1'.repeat(zeros);
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    out += BASE58_ALPHABET[digits[i]!];
  }
  return out;
}

function base58Decode(input: string): Uint8Array | null {
  if (!input) return null;
  let zeros = 0;
  while (zeros < input.length && input[zeros] === '1') zeros += 1;

  const bytes = [0];
  for (let i = zeros; i < input.length; i += 1) {
    const ch = input[i]!;
    const val = BASE58_ALPHABET.indexOf(ch);
    if (val < 0) return null;
    let carry = val;
    for (let j = 0; j < bytes.length; j += 1) {
      const n = bytes[j]! * 58 + carry;
      bytes[j] = n & 0xff;
      carry = n >> 8;
    }
    while (carry > 0) {
      bytes.push(carry & 0xff);
      carry >>= 8;
    }
  }

  const decoded = new Uint8Array(zeros + bytes.length);
  decoded.fill(0, 0, zeros);
  for (let i = 0; i < bytes.length; i += 1) {
    decoded[zeros + bytes.length - 1 - i] = bytes[i]!;
  }
  return decoded;
}

/** Encode 20-byte payload as a TRON Base58Check address (0x41 prefix). */
export function encodeTronAddress(payload20: Uint8Array): string {
  if (payload20.length !== 20) {
    throw new Error('TRON address payload must be 20 bytes');
  }
  const body = new Uint8Array(PAYLOAD_LEN);
  body[0] = TRON_PREFIX;
  body.set(payload20, 1);
  const cs = checksum4(body);
  const full = new Uint8Array(DECODED_LEN);
  full.set(body, 0);
  full.set(cs, PAYLOAD_LEN);
  return base58Encode(full);
}

export function tronAddressToPayload(address: string): Uint8Array | null {
  if (!isValidTrc20Address(address)) return null;
  const decoded = base58Decode(address.trim());
  if (!decoded) return null;
  return decoded.subarray(1, PAYLOAD_LEN);
}

export function hexToTronAddress(hex: string): string | null {
  const h = hex.trim().replace(/^0x/i, '').toLowerCase();
  if (!/^[0-9a-f]+$/.test(h)) return null;
  let body = h;
  if (body.length === 42 && body.startsWith('41')) body = body.slice(2);
  if (body.length === 64) body = body.slice(-40);
  if (body.length !== 40) return null;
  try {
    const bytes = Buffer.from(body, 'hex');
    if (bytes.length !== 20) return null;
    return encodeTronAddress(bytes);
  } catch {
    return null;
  }
}

export function isValidTrc20Address(address: string): boolean {
  const trimmed = address.trim();
  if (trimmed.length < 34 || trimmed.length > 36) return false;
  if (!trimmed.startsWith('T')) return false;
  const decoded = base58Decode(trimmed);
  if (!decoded || decoded.length !== DECODED_LEN) return false;
  if (decoded[0] !== TRON_PREFIX) return false;
  const payload = decoded.subarray(0, PAYLOAD_LEN);
  const expected = checksum4(payload);
  const actual = decoded.subarray(PAYLOAD_LEN);
  if (expected.length !== actual.length) return false;
  for (let i = 0; i < expected.length; i += 1) {
    if (expected[i] !== actual[i]) return false;
  }
  return true;
}

export function normalizeTrc20Address(address: string): string {
  return address.trim();
}

/** Deterministic valid TRON address for local/dev placeholders (not a real wallet). */
export function deriveDevTronAddress(seed: string): string {
  const digest = sha256(Buffer.from(`spliton-dev-deposit:${seed}`, 'utf8'));
  return encodeTronAddress(digest.subarray(0, 20));
}
