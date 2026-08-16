import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { DepositStatus, LedgerOperationType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { DepositIngestionService } from './deposit-ingestion.service';
import {
  DEPOSIT_BLOCKCHAIN_PROVIDER,
  type DepositBlockchainProvider,
} from './providers/deposit-blockchain-provider.interface';
import { resolveTronRuntimeConfig, sameTronAddress } from './tron/tron-network.config';
import {
  depositCreditIdempotencyKey,
  tryNormalizeTronTxHash,
} from './tron/tron-tx-hash';
import { tokenRawToDecimal } from './tron/tron-amount';

export type ReconciliationFindingCode =
  | 'CHAIN_ONLY'
  | 'DEPOSIT_NO_CREDIT'
  | 'CREDIT_NO_DEPOSIT'
  | 'AMOUNT_MISMATCH'
  | 'USER_MISMATCH'
  | 'DUPLICATE_CREDIT'
  | 'STATUS_MISMATCH';

export type DepositReconciliationReport = {
  onChainMissingDeposit: number;
  depositMissingCredit: number;
  creditMissingDeposit: number;
  amountMismatch: number;
  userMismatch: number;
  duplicateCredits: number;
  statusMismatch: number;
  duplicateAttempts: number;
  autoFixed: number;
  items: Array<{
    code: ReconciliationFindingCode | 'A' | 'B' | 'C' | 'D' | 'E';
    finding: ReconciliationFindingCode;
    txHash: string | null;
    depositId: string | null;
    detail: string;
    autoFixed?: boolean;
  }>;
};

const CREDITABLE: DepositStatus[] = [
  DepositStatus.CONFIRMED,
  DepositStatus.PENDING_CONFIRMATIONS,
  DepositStatus.DETECTED,
  DepositStatus.PENDING,
  DepositStatus.CONFIRMING,
];

@Injectable()
export class DepositReconciliationService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => DepositIngestionService))
    private readonly ingestion: DepositIngestionService,
    @Inject(DEPOSIT_BLOCKCHAIN_PROVIDER)
    private readonly provider: DepositBlockchainProvider,
  ) {}

  async run(opts?: {
    autoFix?: boolean;
    watermarkTimestamp?: bigint;
  }): Promise<DepositReconciliationReport> {
    const autoFix = opts?.autoFix !== false;
    const cfg = resolveTronRuntimeConfig();
    const items: DepositReconciliationReport['items'] = [];
    const seenTx = new Set<string>();

    const addresses = await this.watchedAddresses();
    for (const address of addresses) {
      const page = await this.provider.fetchTrc20Incoming(address, {
        watermarkTimestamp: opts?.watermarkTimestamp ?? 0n,
        fingerprint: null,
      });
      for (const transfer of page.items) {
        const hash = tryNormalizeTronTxHash(transfer.txHash);
        if (!hash) continue;
        if (!transfer.success) continue;
        if (cfg.usdtContract && !sameTronAddress(transfer.tokenContract, cfg.usdtContract)) {
          continue;
        }
        const key = `${hash}:${transfer.toAddress}`;
        if (seenTx.has(key)) continue;
        seenTx.add(key);

        const deposit = await this.prisma.deposit.findFirst({
          where: { blockchainTxid: hash },
          include: { walletTx: { include: { wallet: true } } },
        });
        const chainAmount = tokenRawToDecimal(
          BigInt(transfer.rawAmount),
          transfer.decimals,
        );

        if (!deposit) {
          let autoFixed = false;
          if (autoFix) {
            const recovered = await this.ingestion.recoverByTxHash(hash);
            autoFixed =
              recovered.status === 'credited' || recovered.status === 'pending';
            if (recovered.status === 'ambiguous') {
              items.push({
                code: 'CHAIN_ONLY',
                finding: 'CHAIN_ONLY',
                txHash: hash,
                depositId: null,
                detail: `On-chain transfer to ${transfer.toAddress} is ambiguous; left for MANUAL_REVIEW`,
              });
              continue;
            }
          }
          if (!autoFixed) {
            items.push({
              code: 'CHAIN_ONLY',
              finding: 'CHAIN_ONLY',
              txHash: hash,
              depositId: null,
              detail: `On-chain USDT transfer to ${transfer.toAddress} has no deposit row`,
            });
          } else {
            items.push({
              code: 'CHAIN_ONLY',
              finding: 'CHAIN_ONLY',
              txHash: hash,
              depositId: null,
              detail: `CHAIN_ONLY recovered from unambiguous chain proof`,
              autoFixed: true,
            });
          }
          continue;
        }

        if (
          deposit.toAddress &&
          !sameTronAddress(deposit.toAddress, transfer.toAddress)
        ) {
          items.push({
            code: 'USER_MISMATCH',
            finding: 'USER_MISMATCH',
            txHash: hash,
            depositId: deposit.id,
            detail: `Deposit to ${deposit.toAddress} but chain to ${transfer.toAddress}`,
          });
        }

        if (deposit.amount && !deposit.amount.equals(chainAmount)) {
          items.push({
            code: 'AMOUNT_MISMATCH',
            finding: 'AMOUNT_MISMATCH',
            txHash: hash,
            depositId: deposit.id,
            detail: `Deposit amount ${deposit.amount.toString()} != chain ${chainAmount.toString()}`,
          });
        }

        const creditPostings = await this.creditPostingsFor(deposit.id, hash, deposit.chainNetwork);
        if (creditPostings.length > 1) {
          items.push({
            code: 'DUPLICATE_CREDIT',
            finding: 'DUPLICATE_CREDIT',
            txHash: hash,
            depositId: deposit.id,
            detail: `${creditPostings.length} DEPOSIT_SETTLE postings for one tx`,
          });
        }

        const credited = deposit.status === DepositStatus.CREDITED;
        if (credited && creditPostings.length === 0) {
          items.push({
            code: 'DEPOSIT_NO_CREDIT',
            finding: 'DEPOSIT_NO_CREDIT',
            txHash: hash,
            depositId: deposit.id,
            detail: 'CREDITED deposit has no ledger posting',
          });
        } else if (
          !credited &&
          CREDITABLE.includes(deposit.status) &&
          creditPostings.length === 0 &&
          deposit.confirmations >= deposit.requiredConfirmations
        ) {
          let fixed = false;
          if (autoFix && deposit.status === DepositStatus.CONFIRMED) {
            const next = await this.ingestion.recheckDeposit(deposit.id);
            fixed = next === DepositStatus.CREDITED;
          }
          items.push({
            code: 'DEPOSIT_NO_CREDIT',
            finding: 'DEPOSIT_NO_CREDIT',
            txHash: hash,
            depositId: deposit.id,
            detail: `Deposit ${deposit.status} is CREDITABLE but has no ledger credit`,
            autoFixed: fixed || undefined,
          });
        }

        if (credited && creditPostings.length === 1 && deposit.amount) {
          const posting = creditPostings[0]!;
          if (!posting.amount.equals(deposit.amount)) {
            items.push({
              code: 'AMOUNT_MISMATCH',
              finding: 'AMOUNT_MISMATCH',
              txHash: hash,
              depositId: deposit.id,
              detail: `Ledger ${posting.amount.toString()} != deposit ${deposit.amount.toString()}`,
            });
          }
          const assigned = await this.prisma.userDepositAddress.findFirst({
            where: { address: transfer.toAddress },
            include: { wallet: true },
          });
          if (assigned && assigned.walletId !== deposit.walletTx.walletId) {
            items.push({
              code: 'USER_MISMATCH',
              finding: 'USER_MISMATCH',
              txHash: hash,
              depositId: deposit.id,
              detail: 'Ledger wallet does not match assigned address owner',
            });
          }
        }

        if (
          deposit.status === DepositStatus.CREDITED &&
          deposit.walletTx.status !== 'COMPLETED'
        ) {
          items.push({
            code: 'STATUS_MISMATCH',
            finding: 'STATUS_MISMATCH',
            txHash: hash,
            depositId: deposit.id,
            detail: `Deposit CREDITED but wallet tx is ${deposit.walletTx.status}`,
          });
        }
      }
    }

    const settlePostings = await this.prisma.ledgerPosting.findMany({
      where: {
        operationType: LedgerOperationType.DEPOSIT_SETTLE,
        sourceEntityType: 'deposit',
      },
      take: 2000,
    });
    const byDeposit = new Map<string, number>();
    for (const posting of settlePostings) {
      byDeposit.set(
        posting.sourceEntityId,
        (byDeposit.get(posting.sourceEntityId) ?? 0) + 1,
      );
      const deposit = await this.prisma.deposit.findUnique({
        where: { id: posting.sourceEntityId },
      });
      if (!deposit) {
        items.push({
          code: 'CREDIT_NO_DEPOSIT',
          finding: 'CREDIT_NO_DEPOSIT',
          txHash: null,
          depositId: posting.sourceEntityId,
          detail: 'Ledger DEPOSIT_SETTLE posting without deposit row',
        });
      }
    }
    for (const [depositId, count] of byDeposit) {
      if (count > 1) {
        items.push({
          code: 'DUPLICATE_CREDIT',
          finding: 'DUPLICATE_CREDIT',
          txHash: null,
          depositId,
          detail: `${count} DEPOSIT_SETTLE postings for deposit`,
        });
      }
    }

    const duplicateLogs = await this.prisma.depositIngestionLog.count({
      where: { action: { contains: 'duplicate' } },
    });

    const counted = (finding: ReconciliationFindingCode) =>
      items.filter((i) => i.finding === finding && !i.autoFixed).length;

    return {
      onChainMissingDeposit: counted('CHAIN_ONLY'),
      depositMissingCredit: counted('DEPOSIT_NO_CREDIT'),
      creditMissingDeposit: counted('CREDIT_NO_DEPOSIT'),
      amountMismatch: counted('AMOUNT_MISMATCH'),
      userMismatch: counted('USER_MISMATCH'),
      duplicateCredits: counted('DUPLICATE_CREDIT'),
      statusMismatch: counted('STATUS_MISMATCH'),
      duplicateAttempts: duplicateLogs,
      autoFixed: items.filter((i) => i.autoFixed).length,
      items,
    };
  }

  private async creditPostingsFor(
    depositId: string,
    txHash: string,
    chainNetwork: string,
  ) {
    return this.prisma.ledgerPosting.findMany({
      where: {
        operationType: LedgerOperationType.DEPOSIT_SETTLE,
        OR: [
          { sourceEntityType: 'deposit', sourceEntityId: depositId },
          { idempotencyKey: depositCreditIdempotencyKey(chainNetwork, txHash) },
        ],
      },
    });
  }

  private async watchedAddresses(): Promise<string[]> {
    const rows = await this.prisma.userDepositAddress.findMany({
      select: { address: true },
    });
    const wallets = await this.prisma.wallet.findMany({
      where: { address: { not: null }, assetCode: 'USDT' },
      select: { address: true },
    });
    const set = new Set<string>();
    for (const row of rows) set.add(row.address);
    for (const row of wallets) {
      if (row.address) set.add(row.address);
    }
    return [...set];
  }
}
