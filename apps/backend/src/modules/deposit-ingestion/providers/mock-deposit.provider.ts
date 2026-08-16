import { Injectable } from '@nestjs/common';
import { confirmationsFromBlocks } from '../tron/tron-amount';
import { tryNormalizeTronTxHash } from '../tron/tron-tx-hash';
import { resolveTronRuntimeConfig } from '../tron/tron-network.config';
import type {
  AddressScanCursor,
  DepositBlockchainProvider,
  ProviderHealth,
  Trc20TransferPage,
  VerifiedTrc20Transfer,
} from './deposit-blockchain-provider.interface';

/** In-memory queue for e2e and local tests. Never used when TRON_PROVIDER_MODE=tron. */
@Injectable()
export class MockDepositProvider implements DepositBlockchainProvider {
  readonly mode = 'mock';

  nowBlock = 10_000n;
  private readonly byHash = new Map<string, VerifiedTrc20Transfer[]>();

  enqueue(transfer: VerifiedTrc20Transfer): void {
    const hash = tryNormalizeTronTxHash(transfer.txHash);
    if (!hash) return;
    const canonical = { ...transfer, txHash: hash };
    const existing = this.byHash.get(hash) ?? [];
    existing.push(canonical);
    this.byHash.set(hash, existing);
  }

  clear(): void {
    this.byHash.clear();
  }

  async health(): Promise<ProviderHealth> {
    await Promise.resolve();
    return {
      ok: true,
      mode: this.mode,
      message: `${this.byHash.size} queued`,
      lastBlock: this.nowBlock.toString(),
      network: 'mock',
    };
  }

  async getNowBlock(): Promise<bigint> {
    await Promise.resolve();
    return this.nowBlock;
  }

  async fetchTrc20Incoming(
    address: string,
    cursor: AddressScanCursor,
  ): Promise<Trc20TransferPage> {
    await Promise.resolve();
    const overlap = BigInt(resolveTronRuntimeConfig().watermarkOverlapMs);
    const minTs =
      cursor.watermarkTimestamp > 0n
        ? cursor.watermarkTimestamp > overlap
          ? cursor.watermarkTimestamp - overlap
          : 0n
        : 0n;
    const items = [...this.byHash.values()]
      .flat()
      .filter((item) => item.toAddress === address)
      .filter((item) => minTs === 0n || item.blockTimestampMs >= minTs)
      .map((item) => this.withConfirmations(item));
    return { items, fingerprint: cursor.fingerprint, hasMore: false };
  }

  async getVerifiedTransfer(
    txHash: string,
  ): Promise<VerifiedTrc20Transfer | null> {
    const transfers = await this.getVerifiedTransfers(txHash);
    return transfers.length === 1 ? transfers[0]! : null;
  }

  async getVerifiedTransfers(
    txHash: string,
  ): Promise<VerifiedTrc20Transfer[]> {
    await Promise.resolve();
    const hash = tryNormalizeTronTxHash(txHash);
    if (!hash) return [];
    return (this.byHash.get(hash) ?? []).map((item) => this.withConfirmations(item));
  }

  private withConfirmations(
    transfer: VerifiedTrc20Transfer,
  ): VerifiedTrc20Transfer {
    return {
      ...transfer,
      confirmations: confirmationsFromBlocks(this.nowBlock, transfer.blockNumber),
    };
  }
}
