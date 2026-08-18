import { Injectable, Logger } from '@nestjs/common';
import {
  ConsentSource,
  DisputeStatus,
  KycStatus,
  SupportTicketStatus,
  WithdrawalStatus,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { EligibilityService } from '../compliance/eligibility.service';
import { LegalConsentsService } from '../legal/legal-consents.service';
import { NotificationService } from '../notifications/notification.service';
import type { AccountCenterSummary } from './account-center.types';
import {
  buildAccountCompleteness,
  buildSecuritySummary,
  type CompletenessCheckContext,
} from './account-center.scoring';

@Injectable()
export class AccountCenterService {
  private readonly logger = new Logger(AccountCenterService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly legalConsents: LegalConsentsService,
    private readonly eligibility: EligibilityService,
    private readonly notifications: NotificationService,
  ) {}

  async buildSummary(userId: string, roles: string[]): Promise<AccountCenterSummary> {
    const consentSources = [
      ConsentSource.REGISTER,
      ConsentSource.PRIMARY_PURCHASE,
      ConsentSource.SECONDARY_TRADE,
      ConsentSource.WITHDRAWAL,
      ConsentSource.LOGIN,
    ] as const;

    const user = await this.settle(
      'user.findUnique',
      userId,
      null,
      () =>
        this.prisma.user.findUnique({
          where: { id: userId },
          select: {
            emailVerifiedAt: true,
            passwordHash: true,
            profile: {
              select: {
                displayName: true,
                timezone: true,
                passwordChangedAt: true,
              },
            },
          },
        }),
    );

    const [twoFaCount, activeSessionsCount, lastLogin, kyc] = await Promise.all([
      this.settle('twoFactorMethod.count', userId, 0, () =>
        this.prisma.twoFactorMethod.count({
          where: { userId, status: 'ENABLED' },
        }),
      ),
      this.settle('userSession.count', userId, 0, () =>
        this.prisma.userSession.count({
          where: { userId, revokedAt: null },
        }),
      ),
      this.settle('auditLog.lastLogin', userId, null, () =>
        this.prisma.auditLog.findFirst({
          where: { entityType: 'auth', actorUserId: userId, action: 'LOGIN_SUCCESS' },
          orderBy: { createdAt: 'desc' },
          select: { createdAt: true },
        }),
      ),
      this.settle('kycVerification.findFirst', userId, null, () =>
        this.prisma.kycVerification.findFirst({
          where: { userId },
          orderBy: { updatedAt: 'desc' },
          select: { status: true, level: true },
        }),
      ),
    ]);

    const [securityPrefs, notificationPrefs, securityEvents] = await Promise.all([
      this.settle('userSecurityPreference', userId, null, () =>
        this.prisma.userSecurityPreference.findUnique({ where: { userId } }),
      ),
      this.settle('notificationPreference', userId, null, () =>
        this.prisma.notificationPreference.findUnique({ where: { userId } }),
      ),
      this.settle('auditLog.securityEvents', userId, [] as Array<{
        id: string;
        action: string;
        ip: string | null;
        userAgent: string | null;
        createdAt: Date;
      }>, () =>
        this.prisma.auditLog.findMany({
          where: { entityType: 'auth', actorUserId: userId },
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: { id: true, action: true, ip: true, userAgent: true, createdAt: true },
        }),
      ),
    ]);

    const [
      openSupportTicketsCount,
      openDisputesCount,
      pendingWithdrawalsCount,
      hasWalletActivity,
      unreadNotificationsCount,
    ] = await Promise.all([
      this.settle('supportTicket.count', userId, 0, () =>
        this.prisma.supportTicket.count({
          where: {
            userId,
            status: { not: SupportTicketStatus.CLOSED },
          },
        }),
      ),
      this.settle('dispute.count', userId, 0, () =>
        this.prisma.dispute.count({
          where: {
            userId,
            status: {
              notIn: [DisputeStatus.RESOLVED, DisputeStatus.REJECTED, DisputeStatus.CLOSED],
            },
          },
        }),
      ),
      this.settle('withdrawal.count', userId, 0, () =>
        this.prisma.withdrawal.count({
          where: {
            status: {
              in: [
                WithdrawalStatus.REQUESTED,
                WithdrawalStatus.LOCKED,
                WithdrawalStatus.REVIEW,
                WithdrawalStatus.APPROVED,
                WithdrawalStatus.PROCESSING,
                WithdrawalStatus.ON_HOLD,
              ],
            },
            walletTx: { wallet: { userId } },
          },
        }),
      ),
      this.settle('walletTransaction.exists', userId, false, async () => {
        const row = await this.prisma.walletTransaction.findFirst({
          where: { wallet: { userId } },
          select: { id: true },
        });
        return Boolean(row);
      }),
      this.settle('notifications.unread', userId, 0, async () => {
        const result = await this.notifications.unreadCountForUser(userId, roles);
        return result.count;
      }),
    ]);

    const missingBySource = await this.settle(
      'legal.missingConsents',
      userId,
      new Map(),
      () => this.legalConsents.getMissingConsentsForSources(userId, [...consentSources]),
    );
    const eligibilityByAction = await this.settle(
      'eligibility.checkMany',
      userId,
      new Map(),
      () =>
        this.eligibility.checkMany(
          userId,
          [
            ConsentSource.LOGIN,
            ConsentSource.WITHDRAWAL,
            ConsentSource.PRIMARY_PURCHASE,
            ConsentSource.SECONDARY_TRADE,
          ],
          { missingBySource },
        ),
    );

    const registerMissing = missingBySource.get(ConsentSource.REGISTER) ?? [];
    const primaryMissing = missingBySource.get(ConsentSource.PRIMARY_PURCHASE) ?? [];
    const secondaryMissing = missingBySource.get(ConsentSource.SECONDARY_TRADE) ?? [];
    const withdrawalMissing = missingBySource.get(ConsentSource.WITHDRAWAL) ?? [];

    const canDeposit = eligibilityByAction.get(ConsentSource.LOGIN)?.allowed ?? false;
    const canWithdraw = eligibilityByAction.get(ConsentSource.WITHDRAWAL)?.allowed ?? false;
    const canBuyPrimary =
      eligibilityByAction.get(ConsentSource.PRIMARY_PURCHASE)?.allowed ?? false;
    const canTradeSecondary =
      eligibilityByAction.get(ConsentSource.SECONDARY_TRADE)?.allowed ?? false;

    const emailVerified = Boolean(user?.emailVerifiedAt);
    const twoFaEnabled = twoFaCount > 0;
    const passwordSet = Boolean(user?.passwordHash);
    const kycStatus = kyc?.status ?? KycStatus.NOT_STARTED;
    const registerLegalComplete = registerMissing.length === 0;
    const missingRequiredConsentsCount =
      registerMissing.length +
      primaryMissing.length +
      secondaryMissing.length +
      withdrawalMissing.length;

    const completenessCtx: CompletenessCheckContext = {
      displayName: user?.profile?.displayName,
      timezone: user?.profile?.timezone,
      emailVerified,
      kycStatus,
      registerLegalComplete,
      twoFaEnabled,
      hasWalletActivity,
    };

    const accountCompleteness = buildAccountCompleteness(completenessCtx);
    const securityPreferences = {
      withdrawalEmailConfirmationEnabled:
        securityPrefs?.withdrawalEmailConfirmationEnabled ?? false,
      withdrawalAddressWhitelistEnabled:
        securityPrefs?.withdrawalAddressWhitelistEnabled ?? false,
      suspiciousLoginAlertsEnabled: securityPrefs?.suspiciousLoginAlertsEnabled ?? true,
      emailSecurityNotificationsEnabled: notificationPrefs?.emailSecurity ?? true,
      enforcementReady: true,
    };

    const security = buildSecuritySummary({
      emailVerified,
      twoFaEnabled,
      passwordSet,
      passwordChangedAt: user?.profile?.passwordChangedAt ?? null,
      activeSessionsCount,
      lastLoginAt: lastLogin?.createdAt ?? null,
      kycStatus,
      registerLegalComplete,
      securityPreferences: {
        withdrawalEmailConfirmationEnabled:
          securityPreferences.withdrawalEmailConfirmationEnabled,
        emailSecurityNotificationsEnabled:
          securityPreferences.emailSecurityNotificationsEnabled,
      },
    });

    return {
      accountCompleteness,
      security,
      verification: {
        status: kycStatus,
        level: kyc?.level ?? null,
        canDeposit,
        canWithdraw,
        canBuyPrimary,
        canTradeSecondary,
      },
      legal: {
        missingRequiredConsentsCount,
        hasAcceptedCurrentRequiredPolicies: registerMissing.length === 0,
      },
      activity: {
        openSupportTicketsCount,
        openDisputesCount,
        unreadNotificationsCount,
        pendingWithdrawalsCount,
      },
      securityPreferences,
      recentSecurityEvents: securityEvents.map((ev) => ({
        id: ev.id,
        action: ev.action,
        ip: ev.ip,
        userAgent: ev.userAgent,
        createdAt: ev.createdAt.toISOString(),
      })),
    };
  }

  private async settle<T>(
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
}
