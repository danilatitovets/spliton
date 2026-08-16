import { Injectable, Logger } from '@nestjs/common';
import { isValidTrc20Address } from '../../wallets/validators/trc20-address.validator';
import { tronFetchJson, TronProviderError } from '../tron/tron-http.client';
import { tryNormalizeTronTxHash } from '../tron/tron-tx-hash';
import {
  resolveTronRuntimeConfig,
  sameTronAddress,
  type TronRuntimeConfig,
} from '../tron/tron-network.config';
import {
  mapTrc20Row,
  transferRowsFromLogs,
  type TronGridTrc20ListResponse,
  type TronGridTrc20Row,
  type TronTransactionById,
  type TronTransactionInfo,
} from './tron-trc20.mapper';
import type {
  AddressScanCursor,
  DepositBlockchainProvider,
  ProviderHealth,
  Trc20TransferPage,
  VerifiedTrc20Transfer,
} from './deposit-blockchain-provider.interface';

@Injectable()
export class TronDepositProvider implements DepositBlockchainProvider {
  readonly mode = 'tron';
  private readonly logger = new Logger(TronDepositProvider.name);

  private cfg(): TronRuntimeConfig {
    return resolveTronRuntimeConfig();
  }

  async health(): Promise<ProviderHealth> {
    const cfg = this.cfg();
    try {
      const lastBlock = await this.getNowBlock();
      return {
        ok: true,
        mode: this.mode,
        lastBlock: lastBlock.toString(),
        network: cfg.chainNetwork,
        usdtContract: cfg.usdtContract,
      };
    } catch (err) {
      return {
        ok: false,
        mode: this.mode,
        message: err instanceof Error ? err.message : String(err),
        network: cfg.chainNetwork,
        usdtContract: cfg.usdtContract,
      };
    }
  }

  async getNowBlock(): Promise<bigint> {
    const cfg = this.cfg();
    const body = await tronFetchJson<{
      block_header?: { raw_data?: { number?: number } };
    }>(`${cfg.providerUrl}/wallet/getnowblock`, {
      apiKey: cfg.apiKey,
      timeoutMs: cfg.requestTimeoutMs,
    });
    const num = body.block_header?.raw_data?.number;
    if (num == null || !Number.isFinite(num) || num <= 0) {
      throw new TronProviderError('Missing current TRON block', 'MALFORMED');
    }
    return BigInt(num);
  }

  async fetchTrc20Incoming(
    address: string,
    cursor: AddressScanCursor,
  ): Promise<Trc20TransferPage> {
    const cfg = this.cfg();
    if (!isValidTrc20Address(address)) {
      return { items: [], fingerprint: null, hasMore: false };
    }

    const currentBlock = await this.getNowBlock();
    const items: VerifiedTrc20Transfer[] = [];
    let fingerprint: string | null = null;
    let pages = 0;
    let hasMore = true;
    const minTimestamp =
      cursor.watermarkTimestamp > 0n
        ? cursor.watermarkTimestamp > BigInt(cfg.watermarkOverlapMs)
          ? cursor.watermarkTimestamp - BigInt(cfg.watermarkOverlapMs)
          : 0n
        : 0n;

    while (hasMore && pages < cfg.maxPagesPerAddress) {
      pages += 1;
      const params = new URLSearchParams({
        only_to: 'true',
        limit: String(cfg.pageSize),
        order_by: 'block_timestamp,asc',
      });
      if (minTimestamp > 0n) {
        params.set('min_timestamp', minTimestamp.toString());
      }
      if (fingerprint) params.set('fingerprint', fingerprint);

      const url = `${cfg.providerUrl}/v1/accounts/${encodeURIComponent(address)}/transactions/trc20?${params.toString()}`;
      const body = await tronFetchJson<TronGridTrc20ListResponse>(url, {
        apiKey: cfg.apiKey,
        timeoutMs: cfg.requestTimeoutMs,
      });
      if (body.success === false) {
        throw new TronProviderError('TronGrid TRC20 list failed', 'MALFORMED');
      }
      const rows = body.data ?? [];
      if (rows.length === 0) {
        hasMore = false;
        fingerprint = null;
        break;
      }

      let waitingForInfo = false;
      for (const row of rows) {
        const mapped = await this.hydrateRow(row, currentBlock, cfg);
        if (mapped === 'wait') {
          waitingForInfo = true;
          break;
        }
        if (mapped) items.push(mapped);
      }

      const nextFingerprint = body.meta?.fingerprint ?? null;
      fingerprint = nextFingerprint;
      hasMore = Boolean(nextFingerprint) && !waitingForInfo;
      if (waitingForInfo) hasMore = false;
    }

    return { items, fingerprint, hasMore };
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
    const cfg = this.cfg();
    const hash = tryNormalizeTronTxHash(txHash);
    if (!hash) return [];
    const currentBlock = await this.getNowBlock();
    const [info, tx] = await Promise.all([
      this.getTransactionInfo(hash, cfg),
      this.getTransaction(hash, cfg),
    ]);
    if (!info) return [];
    const rows = transferRowsFromLogs({
      txHash: hash,
      info,
      expectedContract: cfg.usdtContract,
    });
    return rows
      .map((row) =>
        mapTrc20Row({
          row,
          info,
          tx,
          currentBlock,
          chainNetwork: cfg.chainNetwork,
          expectedContract: cfg.usdtContract,
        }),
      )
      .filter((item): item is VerifiedTrc20Transfer => item != null);
  }

  private async hydrateRow(
    row: TronGridTrc20Row,
    currentBlock: bigint,
    cfg: TronRuntimeConfig,
  ): Promise<VerifiedTrc20Transfer | null | 'wait'> {
    const txHash = tryNormalizeTronTxHash(row?.transaction_id);
    if (!txHash) return null;
    if (
      row.token_info?.address &&
      cfg.usdtContract &&
      !sameTronAddress(row.token_info.address, cfg.usdtContract)
    ) {
      return null;
    }
    const [info, tx] = await Promise.all([
      this.getTransactionInfo(txHash, cfg),
      this.getTransaction(txHash, cfg),
    ]);
    if (!info?.blockNumber) return 'wait';
    return mapTrc20Row({
      row: { ...row, transaction_id: txHash },
      info,
      tx,
      currentBlock,
      chainNetwork: cfg.chainNetwork,
      expectedContract: cfg.usdtContract,
    });
  }

  private async getTransactionInfo(
    txHash: string,
    cfg: TronRuntimeConfig,
  ): Promise<TronTransactionInfo | null> {
    try {
      const body = await tronFetchJson<TronTransactionInfo>(
        `${cfg.providerUrl}/wallet/gettransactioninfobyid`,
        {
          method: 'POST',
          apiKey: cfg.apiKey,
          timeoutMs: cfg.requestTimeoutMs,
          body: { value: txHash },
        },
      );
      if (!body?.id && body?.blockNumber == null) return null;
      return body;
    } catch (err) {
      this.logger.warn(
        JSON.stringify({
          event: 'deposit.provider_error',
          op: 'gettransactioninfobyid',
          message: err instanceof Error ? err.message : String(err),
        }),
      );
      throw err;
    }
  }

  private async getTransaction(
    txHash: string,
    cfg: TronRuntimeConfig,
  ): Promise<TronTransactionById | null> {
    try {
      const body = await tronFetchJson<TronTransactionById>(
        `${cfg.providerUrl}/wallet/gettransactionbyid`,
        {
          method: 'POST',
          apiKey: cfg.apiKey,
          timeoutMs: cfg.requestTimeoutMs,
          body: { value: txHash },
        },
      );
      if (!body?.txID && !body?.ret) return null;
      return body;
    } catch (err) {
      this.logger.warn(
        JSON.stringify({
          event: 'deposit.provider_error',
          op: 'gettransactionbyid',
          message: err instanceof Error ? err.message : String(err),
        }),
      );
      throw err;
    }
  }
}
