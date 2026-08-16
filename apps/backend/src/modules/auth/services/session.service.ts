import { Injectable } from '@nestjs/common';
import { createHash, timingSafeEqual } from 'node:crypto';
import { Prisma, UserSession } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../../prisma/prisma.service';
import { resolveSessionDeviceLabel } from '../../../common/http/user-agent-label';

type SessionMeta = {
  ip?: string | null;
  userAgent?: string | null;
  device?: string | null;
};

/** High-entropy refresh tokens — SHA-256 is enough; bcrypt(12) was ~2–3s per call. */
export function hashRefreshToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function refreshTokenMatches(storedHash: string, refreshToken: string): boolean {
  if (storedHash.startsWith('$2')) {
    // Legacy sessions hashed with bcrypt — verify once, then rewrite on rotate.
    return false;
  }
  const expected = hashRefreshToken(refreshToken);
  if (storedHash.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(storedHash), Buffer.from(expected));
  } catch {
    return false;
  }
}

@Injectable()
export class SessionService {
  constructor(private readonly prisma: PrismaService) {}

  async createSessionWithRefresh(params: {
    sessionId: string;
    userId: string;
    refreshToken: string;
    expiresAt: Date;
    meta?: SessionMeta;
  }): Promise<UserSession> {
    return this.prisma.userSession.create({
      data: {
        id: params.sessionId,
        userId: params.userId,
        refreshTokenHash: hashRefreshToken(params.refreshToken),
        expiresAt: params.expiresAt,
        lastActiveAt: new Date(),
        ip: params.meta?.ip ?? null,
        userAgent: params.meta?.userAgent ?? null,
        device: resolveSessionDeviceLabel(
          params.meta?.device,
          params.meta?.userAgent,
        ),
      },
    });
  }

  async createSession(params: {
    userId: string;
    meta?: SessionMeta;
  }): Promise<UserSession> {
    return this.prisma.userSession.create({
      data: {
        userId: params.userId,
        refreshTokenHash: null,
        expiresAt: null,
        lastActiveAt: new Date(),
        ip: params.meta?.ip ?? null,
        userAgent: params.meta?.userAgent ?? null,
        device: resolveSessionDeviceLabel(
          params.meta?.device,
          params.meta?.userAgent,
        ),
      },
    });
  }

  async setRefreshToken(
    sessionId: string,
    refreshToken: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.prisma.userSession.update({
      where: { id: sessionId },
      data: {
        refreshTokenHash: hashRefreshToken(refreshToken),
        expiresAt,
      },
    });
  }

  findSessionById(sessionId: string) {
    return this.prisma.userSession.findUnique({
      where: { id: sessionId },
    });
  }

  findSessionWithUserById(sessionId: string) {
    return this.prisma.userSession.findUnique({
      where: { id: sessionId },
      include: {
        user: {
          include: {
            profile: true,
            userRoles: {
              include: {
                role: true,
              },
            },
          },
        },
      },
    });
  }

  async verifySessionRefreshToken(
    session: UserSession,
    refreshToken: string,
  ): Promise<boolean> {
    if (!session.refreshTokenHash) return false;
    const stored = session.refreshTokenHash;
    if (stored.startsWith('$2')) {
      const started = performance.now();
      const ok = await bcrypt.compare(refreshToken, stored);
      const durationMs = Math.round(performance.now() - started);
      if (durationMs >= 300) {
        // No token/hash in logs — only timing + session id.
        // eslint-disable-next-line no-console
        console.warn(
          JSON.stringify({
            event: 'auth.refresh.legacy_bcrypt',
            sessionId: session.id,
            durationMs,
            matched: ok,
          }),
        );
      }
      if (ok) {
        // Upgrade hash in place so a failed rotate still avoids bcrypt next time.
        // Does not issue a new refresh token — caller still rotates as usual.
        await this.prisma.userSession.update({
          where: { id: session.id },
          data: { refreshTokenHash: hashRefreshToken(refreshToken) },
        });
      }
      return ok;
    }
    return refreshTokenMatches(stored, refreshToken);
  }

  async revokeSession(params: {
    sessionId: string;
    reason: string;
    replacedBySessionId?: string | null;
    tx?: Prisma.TransactionClient;
  }): Promise<void> {
    const db = params.tx ?? this.prisma;
    await db.userSession.update({
      where: { id: params.sessionId },
      data: {
        revokedAt: new Date(),
        revokedReason: params.reason,
        replacedBySessionId: params.replacedBySessionId ?? null,
      },
    });
  }

  async revokeAllUserSessions(params: {
    userId: string;
    reason: string;
    excludeSessionId?: string;
  }): Promise<number> {
    const result = await this.prisma.userSession.updateMany({
      where: {
        userId: params.userId,
        revokedAt: null,
        ...(params.excludeSessionId
          ? { id: { not: params.excludeSessionId } }
          : {}),
      },
      data: {
        revokedAt: new Date(),
        revokedReason: params.reason,
      },
    });

    return result.count;
  }

  async rotateSession(params: {
    currentSession: UserSession;
    newSessionId: string;
    refreshToken: string;
    expiresAt: Date;
    meta?: SessionMeta;
  }): Promise<UserSession> {
    return this.prisma.$transaction(async (tx) => {
      // Lock current session; concurrent refresh loses and must not mint a second session.
      const locked = await tx.$queryRaw<Array<{ id: string }>>`
        SELECT id
        FROM user_sessions
        WHERE id = ${params.currentSession.id}::uuid
          AND revoked_at IS NULL
        FOR UPDATE
      `;
      if (!locked[0]) {
        throw new Error('SESSION_ALREADY_ROTATED');
      }

      const newSession = await tx.userSession.create({
        data: {
          id: params.newSessionId,
          userId: params.currentSession.userId,
          refreshTokenHash: hashRefreshToken(params.refreshToken),
          expiresAt: params.expiresAt,
          lastActiveAt: new Date(),
          ip: params.meta?.ip ?? params.currentSession.ip ?? null,
          userAgent:
            params.meta?.userAgent ?? params.currentSession.userAgent ?? null,
          device: resolveSessionDeviceLabel(
            params.meta?.device ?? params.currentSession.device,
            params.meta?.userAgent ?? params.currentSession.userAgent,
          ),
        },
      });

      await tx.userSession.update({
        where: { id: params.currentSession.id },
        data: {
          revokedAt: new Date(),
          revokedReason: 'ROTATED',
          replacedBySessionId: newSession.id,
        },
      });

      return newSession;
    });
  }

  async touchSession(sessionId: string): Promise<void> {
    await this.prisma.userSession.update({
      where: { id: sessionId },
      data: {
        lastActiveAt: new Date(),
      },
    });
  }

  private sessionTouchMinIntervalMs(): number {
    const raw = process.env.JWT_SESSION_TOUCH_MIN_INTERVAL_MS;
    const parsed = raw ? Number(raw) : 60_000;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 60_000;
  }

  /** Updates lastActiveAt at most once per interval — avoids write on every JWT request. */
  async touchSessionIfStale(session: UserSession): Promise<void> {
    const minIntervalMs = this.sessionTouchMinIntervalMs();
    const elapsedMs = Date.now() - session.lastActiveAt.getTime();
    if (elapsedMs < minIntervalMs) {
      return;
    }
    await this.prisma.userSession.update({
      where: { id: session.id },
      data: {
        lastActiveAt: new Date(),
      },
    });
  }

  isSessionExpired(session: UserSession): boolean {
    return Boolean(
      session.expiresAt && session.expiresAt.getTime() <= Date.now(),
    );
  }

  isSessionRevoked(session: UserSession): boolean {
    return Boolean(session.revokedAt);
  }
}