import { createHash } from 'node:crypto';
import type { UserSession } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { SessionService, hashRefreshToken } from './session.service';
import { PrismaService } from '../../../prisma/prisma.service';

describe('SessionService.touchSessionIfStale', () => {
  const prisma = {
    userSession: {
      update: jest.fn(),
    },
  };
  let service: SessionService;

  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.JWT_SESSION_TOUCH_MIN_INTERVAL_MS;
    service = new SessionService(prisma as unknown as PrismaService);
  });

  const session = (lastActiveAt: Date): UserSession =>
    ({
      id: 'sess-1',
      userId: 'user-1',
      lastActiveAt,
    }) as UserSession;

  it('skips update when lastActiveAt is within default 60s interval', async () => {
    await service.touchSessionIfStale(session(new Date(Date.now() - 30_000)));
    expect(prisma.userSession.update).not.toHaveBeenCalled();
  });

  it('updates when lastActiveAt is older than interval', async () => {
    await service.touchSessionIfStale(session(new Date(Date.now() - 120_000)));
    expect(prisma.userSession.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'sess-1' },
      }),
    );
  });
});

describe('SessionService.refreshTokenHash', () => {
  const prisma = {
    userSession: {
      update: jest.fn(),
    },
  };
  let service: SessionService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new SessionService(prisma as unknown as PrismaService);
  });

  const baseSession = (hash: string | null): UserSession =>
    ({
      id: 'sess-hash-1',
      userId: 'user-1',
      refreshTokenHash: hash,
      lastActiveAt: new Date(),
    }) as UserSession;

  it('hashes refresh tokens with SHA-256 (not bcrypt)', () => {
    const token = 'r'.repeat(64);
    const hash = hashRefreshToken(token);
    expect(hash).toHaveLength(64);
    expect(hash).toBe(createHash('sha256').update(token).digest('hex'));
    expect(hash.startsWith('$2')).toBe(false);
  });

  it('accepts a SHA-256 session', async () => {
    const token = 'fresh-refresh-token-value-aaaaaaaa';
    const ok = await service.verifySessionRefreshToken(
      baseSession(hashRefreshToken(token)),
      token,
    );
    expect(ok).toBe(true);
    expect(prisma.userSession.update).not.toHaveBeenCalled();
  });

  it('rejects a wrong SHA-256 token', async () => {
    const ok = await service.verifySessionRefreshToken(
      baseSession(hashRefreshToken('correct-token')),
      'wrong-token',
    );
    expect(ok).toBe(false);
  });

  it('accepts legacy bcrypt session and upgrades hash in place', async () => {
    const token = 'legacy-refresh-token-bbbbbbbb';
    const bcryptHash = await bcrypt.hash(token, 4);
    prisma.userSession.update.mockResolvedValue({});
    const ok = await service.verifySessionRefreshToken(baseSession(bcryptHash), token);
    expect(ok).toBe(true);
    expect(prisma.userSession.update).toHaveBeenCalledWith({
      where: { id: 'sess-hash-1' },
      data: { refreshTokenHash: hashRefreshToken(token) },
    });
  });

  it('rejects wrong legacy bcrypt token without upgrade', async () => {
    const bcryptHash = await bcrypt.hash('correct-token', 4);
    const ok = await service.verifySessionRefreshToken(baseSession(bcryptHash), 'wrong');
    expect(ok).toBe(false);
    expect(prisma.userSession.update).not.toHaveBeenCalled();
  });

  it('rejects missing hash', async () => {
    const ok = await service.verifySessionRefreshToken(baseSession(null), 'anything');
    expect(ok).toBe(false);
  });
});