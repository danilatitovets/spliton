import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthRepository } from '../auth.repository';
import type { AuthResponse, AuthTokens } from '../types/auth-response.type';
import {
  assertUserCanLogin,
  prismaUserToSafeUser,
} from '../utils/safe-user.mapper';
import { AuthAuditService } from './auth-audit.service';
import { NotificationEventsService } from '../../notifications/notification-events.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { resolveSessionDeviceLabel } from '../../../common/http/user-agent-label';

type RequestMeta = {
  ip?: string | null;
  userAgent?: string | null;
  device?: string | null;
};

@Injectable()
export class TwoFactorLoginCompletionService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly authAuditService: AuthAuditService,
    private readonly notificationEvents: NotificationEventsService,
    private readonly prisma: PrismaService,
  ) {}

  async getUserForTwoFactor(
    userId: string,
  ): Promise<{ id: string; email: string; roles: string[] } | null> {
    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      return null;
    }
    try {
      assertUserCanLogin(user.status);
    } catch {
      return null;
    }
    return {
      id: user.id,
      email: user.email,
      roles: user.userRoles.map((r) => r.role.code),
    };
  }

  async finalizeTwoFactorLogin(
    userId: string,
    tokens: AuthTokens,
    meta?: RequestMeta,
  ): Promise<AuthResponse> {
    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    assertUserCanLogin(user.status);
    const safeUser = prismaUserToSafeUser(user);
    await this.authAuditService.logEvent({
      event: 'LOGIN_SUCCESS',
      actorUserId: safeUser.id,
      entityId: safeUser.id,
      ip: meta?.ip,
      userAgent: meta?.userAgent,
      safeMeta: { userId: safeUser.id, email: safeUser.email },
    });
    void this.maybeAlertNewDeviceLogin(safeUser.id, meta).catch(() => undefined);
    return { user: safeUser, tokens };
  }

  private async maybeAlertNewDeviceLogin(userId: string, meta?: RequestMeta) {
    const prefs = await this.prisma.userSecurityPreference.findUnique({
      where: { userId },
      select: { suspiciousLoginAlertsEnabled: true },
    });
    if (prefs && prefs.suspiciousLoginAlertsEnabled === false) return;

    const ua = meta?.userAgent?.trim() ?? '';
    const ip = meta?.ip?.trim() ?? '';
    if (!ua && !ip) return;

    const prior = await this.prisma.userSession.findFirst({
      where: {
        userId,
        revokedAt: null,
        OR: [...(ua ? [{ userAgent: ua }] : []), ...(ip ? [{ ip }] : [])],
      },
      orderBy: { lastActiveAt: 'desc' },
      skip: 1,
      select: { id: true },
    });
    if (prior) return;

    const knownCount = await this.prisma.userSession.count({ where: { userId } });
    if (knownCount <= 1) return;

    await this.notificationEvents.newDeviceLogin({
      userId,
      device: resolveSessionDeviceLabel(meta?.device, meta?.userAgent),
      ip: meta?.ip ?? null,
    });
  }
}
