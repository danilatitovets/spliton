import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DepositAddressSource } from '@prisma/client';
import { DepositAddressService } from '../treasury/deposit-address.service';
import { DepositAddressPoolService } from '../treasury/deposit-address-pool.service';
import { DepositNetworkSettingsService } from '../treasury/deposit-network-settings.service';
import { isValidTrc20Address } from './validators/trc20-address.validator';

export type DepositAddressResult =
  | { kind: 'address'; address: string }
  | { kind: 'unavailable'; reason: string };

/**
 * Resolves TRC20 deposit addresses for user wallets (no private keys).
 */
@Injectable()
export class DepositAddressProvider {
  private readonly logger = new Logger(DepositAddressProvider.name);

  constructor(
    private readonly config: ConfigService,
    private readonly depositAddresses: DepositAddressService,
    private readonly addressPool: DepositAddressPoolService,
    private readonly networkSettings: DepositNetworkSettingsService,
  ) {}

  async resolveForUser(
    userId: string,
    walletId: string,
    existingAddress: string | null | undefined,
  ): Promise<DepositAddressResult> {
    const active = await this.depositAddresses.getActiveAddress(walletId);
    if (active) {
      return { kind: 'address', address: active };
    }

    const trimmed = existingAddress?.trim();
    if (trimmed) {
      await this.depositAddresses.assignAddress(
        walletId,
        userId,
        trimmed,
        DepositAddressSource.STATIC,
      );
      return { kind: 'address', address: trimmed };
    }

    const settings = await this.networkSettings.getForAssetNetwork();
    const poolAddress = await this.addressPool.claimForWallet(
      walletId,
      userId,
      settings.asset,
      settings.network,
    );
    if (poolAddress) {
      await this.depositAddresses.assignAddress(
        walletId,
        userId,
        poolAddress,
        DepositAddressSource.ADMIN_POOL,
      );
      return { kind: 'address', address: poolAddress };
    }

    const allowShared =
      (process.env.ALLOW_SHARED_DEPOSIT_ADDRESS === 'true' ||
        process.env.ALLOW_SHARED_DEPOSIT_ADDRESS === '1') &&
      process.env.NODE_ENV !== 'production';
    const shared = allowShared
      ? this.config.get<{ sharedDepositAddress?: string }>('wallet')
          ?.sharedDepositAddress?.trim()
      : '';
    if (shared && isValidTrc20Address(shared)) {
      await this.depositAddresses.assignAddress(
        walletId,
        userId,
        shared,
        DepositAddressSource.STATIC,
      );
      this.logger.warn(
        `Assigned shared deposit address for user ${userId} (dev/test only)`,
      );
      return { kind: 'address', address: shared };
    }

    const resolved = this.depositAddresses.resolveDevOrProviderAddress(
      userId,
      null,
    );
    if (resolved.kind !== 'address') {
      this.logger.warn(
        `Deposit address unavailable for user ${userId} (no pool/shared address configured)`,
      );
    }
    return resolved.kind !== 'address'
      ? resolved
      : this.assignGenerated(userId, walletId, resolved.address);
  }

  private async assignGenerated(
    userId: string,
    walletId: string,
    address: string,
  ): Promise<DepositAddressResult> {
    if (address.startsWith('T_DEV_')) {
      const nodeEnv = process.env.NODE_ENV ?? 'development';
      if (nodeEnv === 'production') {
        return {
          kind: 'unavailable',
          reason: 'Dev deposit addresses are forbidden in production',
        };
      }
    }

    await this.depositAddresses.assignAddress(
      walletId,
      userId,
      address,
      DepositAddressSource.GENERATED,
    );
    this.logger.debug(`Assigned deposit address for user ${userId}`);
    return { kind: 'address', address };
  }
}