import { Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { AppLocale, KycStatus } from '@prisma/client';
import { normalizeAppLocale } from '../../common/i18n/app-locale';
import { resolveSessionDeviceLabel } from '../../common/http/user-agent-label';
import { UsersRepository } from './users.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { AccountCenterService } from './account-center.service';
import { buildLightweightAccountCenter } from './account-center.scoring';
import { AuthAuditService } from '../auth/services/auth-audit.service';
import { SessionService } from '../auth/services/session.service';
import type { RequestMeta } from './user-password.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly prisma: PrismaService,
    private readonly accountCenter: AccountCenterService,
    private readonly sessionService: SessionService,
    private readonly authAudit: AuthAuditService,
  ) {}

  async getMe(userId: string, _roles: string[] = []) {
    const user = await this.usersRepository.findUserWithProfileAndRoles(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.profile) {
      await this.usersRepository.upsertProfile(userId, {});
    }

    const [hydrated, twoFaEnabled, sessionCount, kyc, securityPrefs] = await Promise.all([
      user.profile
        ? Promise.resolve(user)
        : this.usersRepository.findUserWithProfileAndRoles(userId),
      this.safeQuery('twoFactorMethod.count', userId, 0, () =>
        this.prisma.twoFactorMethod.count({
          where: { userId, status: 'ENABLED' },
        }),
      ),
      this.safeQuery('userSession.count', userId, 0, () =>
        this.prisma.userSession.count({
          where: { userId, revokedAt: null },
        }),
      ),
      this.safeQuery('kycVerification.findFirst', userId, null, () =>
        this.prisma.kycVerification.findFirst({
          where: { userId },
          orderBy: { updatedAt: 'desc' },
          select: { status: true, level: true },
        }),
      ),
      this.safeQuery('userSecurityPreference.findUnique', userId, null, () =>
        this.prisma.userSecurityPreference.findUnique({ where: { userId } }),
      ),
    ]);

    const resolved = hydrated ?? user;
    const twoFa = twoFaEnabled > 0;
    const sessions = sessionCount;
    const accountCenter = buildLightweightAccountCenter({
      displayName: resolved.profile?.displayName,
      timezone: resolved.profile?.timezone,
      emailVerified: Boolean(resolved.emailVerifiedAt),
      twoFaEnabled: twoFa,
      passwordSet: true,
      passwordChangedAt: resolved.profile?.passwordChangedAt ?? null,
      activeSessionsCount: sessions,
      kycStatus: kyc?.status ?? KycStatus.NOT_STARTED,
      kycLevel: kyc?.level ?? null,
      withdrawalEmailConfirmationEnabled:
        securityPrefs?.withdrawalEmailConfirmationEnabled,
    });

    return {
      id: resolved.id,
      email: resolved.email,
      status: resolved.status,
      emailVerified: Boolean(resolved.emailVerifiedAt),
      profile: resolved.profile,
      roles: resolved.userRoles.map((item) => item.role.code),
      preferredLocale: resolved.profile?.preferredLocale ?? 'ru',
      security: {
        twoFaEnabled: twoFa,
        activeSessions: sessions,
      },
      createdAt: resolved.createdAt,
      accountCenter,
    };
  }

  private async safeQuery<T>(
    label: string,
    userId: string,
    fallback: T,
    run: () => Promise<T>,
  ): Promise<T> {
    try {
      return await run();
    } catch (error: unknown) {
      this.logger.warn(
        `${label} failed for ${userId}: ${
          error instanceof Error ? error.message : 'unknown'
        }`,
      );
      return fallback;
    }
  }

  async getAccountCenter(userId: string, roles: string[] = []) {
    return this.accountCenter.buildSummary(userId, roles);
  }

  async updatePreferences(
    userId: string,
    body: {
      preferredLocale?: AppLocale;
      displayName?: string;
      timezone?: string;
    },
  ) {
    const user = await this.usersRepository.findUserWithProfileAndRoles(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const profile = await this.usersRepository.upsertProfile(userId, {
      preferredLocale: body.preferredLocale
        ? normalizeAppLocale(body.preferredLocale)
        : undefined,
      displayName: body.displayName,
      timezone: body.timezone,
    });

    return {
      id: user.id,
      email: user.email,
      profile,
      preferredLocale: profile.preferredLocale,
    };
  }

  async listSessions(userId: string, currentSessionId?: string | null) {
    const rows = await this.prisma.userSession.findMany({
      where: { userId },
      orderBy: { lastActiveAt: 'desc' },
      take: 20,
    });
    return {
      items: rows.map((s) => ({
        id: s.id,
        device: resolveSessionDeviceLabel(s.device, s.userAgent),
        ip: s.ip,
        userAgent: s.userAgent,
        lastActiveAt: s.lastActiveAt.toISOString(),
        createdAt: s.createdAt.toISOString(),
        active: !s.revokedAt && (!s.expiresAt || s.expiresAt.getTime() > Date.now()),
        revokedAt: s.revokedAt?.toISOString() ?? null,
        isCurrent: Boolean(currentSessionId && s.id === currentSessionId),
      })),
    };
  }

  async revokeSession(userId: string, sessionId: string) {
    const session = await this.prisma.userSession.findFirst({
      where: { id: sessionId, userId },
    });
    if (!session) {
      throw new NotFoundException('Session not found');
    }
    await this.prisma.userSession.update({
      where: { id: sessionId },
      data: { revokedAt: new Date(), revokedReason: 'USER_REVOKED' },
    });
    return { ok: true };
  }

  async revokeAllSessions(userId: string) {
    const result = await this.prisma.userSession.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date(), revokedReason: 'USER_LOGOUT_ALL' },
    });
    return { revoked: result.count };
  }

  async logoutAllSessions(
    userId: string,
    sessionId: string | undefined,
    meta?: RequestMeta,
  ) {
    const revoked = await this.sessionService.revokeAllUserSessions({
      userId,
      reason: 'LOGOUT_ALL',
      excludeSessionId: sessionId,
    });
    await this.authAudit.logEvent({
      event: 'LOGOUT_ALL',
      actorUserId: userId,
      ip: meta?.ip,
      userAgent: meta?.userAgent,
      safeMeta: { userId, sessionId: sessionId ?? null, revoked },
    });
    return { revoked, success: true };
  }

  async listSecurityEvents(userId: string) {
    const rows = await this.prisma.auditLog.findMany({
      where: { entityType: 'auth', actorUserId: userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return {
      items: rows.map((r) => ({
        id: r.id,
        action: r.action,
        ip: r.ip,
        userAgent: r.userAgent,
        createdAt: r.createdAt.toISOString(),
      })),
    };
  }
}
