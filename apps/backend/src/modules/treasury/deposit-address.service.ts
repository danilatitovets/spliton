import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DepositAddressSource,
  DepositAddressStatus,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { throwAdminError } from '../admin/common/admin-http.util';
import {
  deriveDevTronAddress,
  isValidTrc20Address,
  normalizeTrc20Address,
} from '../wallets/validators/trc20-address.validator';

@Injectable()
export class DepositAddressService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async getActiveAddress(walletId: string): Promise<string | null> {
    const row = await this.prisma.userDepositAddress.findFirst({
      where: { walletId, status: DepositAddressStatus.ACTIVE },
      orderBy: { createdAt: 'desc' },
    });
    return row?.address ?? null;
  }

  async assignAddress(
    walletId: string,
    userId: string,
    address: string,
    source: DepositAddressSource,
  ) {
    void userId;
    const normalized = normalizeTrc20Address(address);
    if (!isValidTrc20Address(normalized)) {
      throwAdminError(
        'INVALID_DEPOSIT_ADDRESS',
        'Deposit address failed TRON Base58Check validation',
        HttpStatus.BAD_REQUEST,
      );
    }

    const existing = await this.getActiveAddress(walletId);
    if (existing === normalized) return existing;

    await this.prisma.$transaction(async (tx) => {
      const owned = await tx.userDepositAddress.findUnique({
        where: { address: normalized },
      });
      if (owned && owned.walletId !== walletId) {
        throwAdminError(
          'DEPOSIT_ADDRESS_IN_USE',
          'This TRON address is already assigned to another user',
          HttpStatus.CONFLICT,
        );
      }

      await tx.userDepositAddress.updateMany({
        where: { walletId, status: DepositAddressStatus.ACTIVE },
        data: {
          status: DepositAddressStatus.ROTATED,
          rotatedAt: new Date(),
        },
      });

      if (owned) {
        await tx.userDepositAddress.update({
          where: { id: owned.id },
          data: {
            status: DepositAddressStatus.ACTIVE,
            source,
            rotatedAt: null,
          },
        });
      } else {
        await tx.userDepositAddress.create({
          data: {
            walletId,
            address: normalized,
            status: DepositAddressStatus.ACTIVE,
            source,
          },
        });
      }
      await tx.wallet.update({
        where: { id: walletId },
        data: { address: normalized },
      });
    });

    return normalized;
  }

  resolveDevOrProviderAddress(
    userId: string,
    existingWalletAddress: string | null | undefined,
  ): { kind: 'address'; address: string } | { kind: 'unavailable'; reason: string } {
    const nodeEnv =
      this.config.get<string>('app.nodeEnv') ??
      process.env.NODE_ENV ??
      'development';
    const allowDev =
      process.env.ALLOW_DEV_DEPOSIT_ADDRESS === 'true' ||
      nodeEnv !== 'production';

    if (existingWalletAddress?.trim()) {
      return { kind: 'address', address: existingWalletAddress.trim() };
    }

    if (!allowDev) {
      return {
        kind: 'unavailable',
        reason: 'Deposit address provider is not configured',
      };
    }

    const address = deriveDevTronAddress(userId);
    return { kind: 'address', address };
  }

  async adminRotate(
    walletId: string,
    actorUserId: string,
    reason: string,
    newAddress?: string,
  ) {
    if (!reason?.trim()) {
      throwAdminError(
        'REASON_REQUIRED',
        'Укажите причину ротации адреса',
        HttpStatus.BAD_REQUEST,
      );
    }
    const wallet = await this.prisma.wallet.findUnique({
      where: { id: walletId },
    });
    if (!wallet) {
      throwAdminError('WALLET_NOT_FOUND', 'Wallet not found', HttpStatus.NOT_FOUND);
    }

    const resolved = newAddress?.trim()
      ? { kind: 'address' as const, address: newAddress.trim() }
      : this.resolveDevOrProviderAddress(wallet!.userId, null);

    if (resolved.kind !== 'address') {
      throwAdminError(
        'ADDRESS_UNAVAILABLE',
        resolved.reason,
        HttpStatus.CONFLICT,
      );
    }

    await this.prisma.userDepositAddress.updateMany({
      where: { walletId, status: DepositAddressStatus.ACTIVE },
      data: {
        status: DepositAddressStatus.ROTATED,
        rotatedAt: new Date(),
      },
    });

    return this.assignAddress(
      walletId,
      wallet!.userId,
      resolved.address,
      newAddress ? DepositAddressSource.MANUAL : DepositAddressSource.GENERATED,
    );
  }

  async adminDisable(walletId: string, reason: string, compromised = false) {
    if (!reason?.trim()) {
      throwAdminError(
        'REASON_REQUIRED',
        'Укажите причину',
        HttpStatus.BAD_REQUEST,
      );
    }
    await this.prisma.userDepositAddress.updateMany({
      where: { walletId, status: DepositAddressStatus.ACTIVE },
      data: {
        status: compromised
          ? DepositAddressStatus.COMPROMISED
          : DepositAddressStatus.DISABLED,
        rotatedAt: new Date(),
      },
    });
    await this.prisma.wallet.update({
      where: { id: walletId },
      data: { address: null },
    });
  }
}
