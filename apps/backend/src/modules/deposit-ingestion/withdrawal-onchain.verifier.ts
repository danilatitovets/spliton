import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Inject } from '@nestjs/common';
import { throwAdminError } from '../admin/common/admin-http.util';
import {
  DEPOSIT_BLOCKCHAIN_PROVIDER,
  type DepositBlockchainProvider,
} from './providers/deposit-blockchain-provider.interface';
import { resolveTronRuntimeConfig, sameTronAddress } from './tron/tron-network.config';
import { tokenRawToDecimal } from './tron/tron-amount';
import { normalizeTronTxHash, InvalidTronTxHashError } from './tron/tron-tx-hash';
import { TreasuryPayoutWalletsService } from './treasury-payout-wallets.service';

@Injectable()
export class WithdrawalOnchainVerifier {
  constructor(
    @Inject(DEPOSIT_BLOCKCHAIN_PROVIDER)
    private readonly provider: DepositBlockchainProvider,
    private readonly payoutWallets: TreasuryPayoutWalletsService,
  ) {}

  async assertMatchesWithdrawal(params: {
    txHash: string;
    toAddress: string;
    netAmount: Prisma.Decimal;
  }): Promise<{ confirmations: number; rawAmount: string; fromAddress: string }> {
    let canonical: string;
    try {
      canonical = normalizeTronTxHash(params.txHash);
    } catch (err) {
      if (err instanceof InvalidTronTxHashError) {
        throwAdminError(
          'WITHDRAWAL_TX_INVALID',
          'Transaction hash is not a valid TRON txid',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw err;
    }

    const cfg = resolveTronRuntimeConfig();
    const transfers = await this.provider.getVerifiedTransfers(canonical);
    if (transfers.length === 0) {
      throwAdminError(
        'WITHDRAWAL_TX_NOT_FOUND',
        'Blockchain transaction not found',
        HttpStatus.CONFLICT,
      );
    }

    const treasuryFrom = await this.payoutWallets.listApprovedFromAddresses();
    if (treasuryFrom.length === 0) {
      throwAdminError(
        'WITHDRAWAL_TREASURY_FROM_NOT_CONFIGURED',
        'No approved treasury payout wallet is configured',
        HttpStatus.CONFLICT,
      );
    }

    const matches = transfers.filter((verified) => {
      if (!verified.success) return false;
      if (!sameTronAddress(verified.tokenContract, cfg.usdtContract)) return false;
      if (!sameTronAddress(verified.toAddress, params.toAddress)) return false;
      if (!treasuryFrom.some((addr) => sameTronAddress(verified.fromAddress, addr))) {
        return false;
      }
      const onChainAmount = tokenRawToDecimal(
        BigInt(verified.rawAmount),
        verified.decimals,
      );
      if (!onChainAmount.equals(params.netAmount)) return false;
      if (verified.confirmations < cfg.confirmationsRequired) return false;
      return true;
    });

    if (matches.length === 0) {
      const anyFailed = transfers.every((t) => !t.success);
      if (anyFailed) {
        throwAdminError(
          'WITHDRAWAL_TX_FAILED',
          'Blockchain transaction is not SUCCESS',
          HttpStatus.CONFLICT,
        );
      }
      throwAdminError(
        'WITHDRAWAL_TX_NOT_MATCHED',
        'No unique USDT transfer matches treasury from, destination, amount, and confirmations',
        HttpStatus.CONFLICT,
      );
    }
    if (matches.length > 1) {
      throwAdminError(
        'WITHDRAWAL_TX_AMBIGUOUS',
        'Multiple matching USDT transfers in this transaction; refusing auto-complete',
        HttpStatus.CONFLICT,
      );
    }

    const verified = matches[0]!;
    return {
      confirmations: verified.confirmations,
      rawAmount: verified.rawAmount,
      fromAddress: verified.fromAddress,
    };
  }
}
