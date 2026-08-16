import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaModule } from '../../prisma/prisma.module';
import { ComplianceModule } from '../compliance/compliance.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ReferralsModule } from '../referrals/referrals.module';
import { TreasuryModule } from '../treasury/treasury.module';
import { LedgerPostingService } from '../admin/common/ledger-posting.service';
import { WalletLedgerService } from '../admin/common/wallet-ledger.service';
import { DepositIngestionController } from './deposit-ingestion.controller';
import { DepositIngestionService } from './deposit-ingestion.service';
import { DepositIngestionWorker } from './deposit-ingestion.worker';
import { CryptoWorkerLeaseService } from './crypto-worker-lease.service';
import { DepositReconciliationService } from './deposit-reconciliation.service';
import { WithdrawalOnchainVerifier } from './withdrawal-onchain.verifier';
import { TreasuryPayoutWalletsService } from './treasury-payout-wallets.service';
import {
  DEPOSIT_BLOCKCHAIN_PROVIDER,
  type DepositBlockchainProvider,
} from './providers/deposit-blockchain-provider.interface';
import { MockDepositProvider } from './providers/mock-deposit.provider';
import { TronDepositProvider } from './providers/tron-deposit.provider';
import { resolveTronRuntimeConfig } from './tron/tron-network.config';

@Module({
  imports: [
    PrismaModule,
    ComplianceModule,
    NotificationsModule,
    ReferralsModule,
    TreasuryModule,
  ],
  controllers: [DepositIngestionController],
  providers: [
    LedgerPostingService,
    WalletLedgerService,
    CryptoWorkerLeaseService,
    DepositIngestionService,
    DepositIngestionWorker,
    DepositReconciliationService,
    WithdrawalOnchainVerifier,
    TreasuryPayoutWalletsService,
    MockDepositProvider,
    TronDepositProvider,
    {
      provide: DEPOSIT_BLOCKCHAIN_PROVIDER,
      inject: [ConfigService, MockDepositProvider, TronDepositProvider],
      useFactory: (
        _config: ConfigService,
        mock: MockDepositProvider,
        tron: TronDepositProvider,
      ): DepositBlockchainProvider => {
        const runtime = resolveTronRuntimeConfig();
        if (runtime.mode === 'tron') return tron;
        const depositsOn = process.env.FEATURE_ENABLE_DEPOSITS !== 'false';
        if (process.env.NODE_ENV === 'production' && depositsOn) {
          throw new Error(
            'TRON_PROVIDER_MODE=mock is forbidden when deposits are enabled in production',
          );
        }
        return mock;
      },
    },
  ],
  exports: [
    DepositIngestionService,
    MockDepositProvider,
    DepositReconciliationService,
    WithdrawalOnchainVerifier,
    DEPOSIT_BLOCKCHAIN_PROVIDER,
  ],
})
export class DepositIngestionModule {}
