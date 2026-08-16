import { hexToTronAddress } from '../../wallets/validators/trc20-address.validator';
import { Prisma } from '@prisma/client';
import {
  confirmationsFromBlocks,
  parseTokenRawAmount,
  tokenRawToDecimal,
  USDT_TRC20_DECIMALS,
} from '../tron/tron-amount';
import { tryNormalizeTronTxHash } from '../tron/tron-tx-hash';
import type { TronChainNetwork } from '../tron/tron-network.config';
import type { VerifiedTrc20Transfer } from './deposit-blockchain-provider.interface';

export type TronGridTrc20Row = {
  transaction_id?: string;
  token_info?: {
    symbol?: string;
    address?: string;
    decimals?: number;
    name?: string;
  };
  block_timestamp?: number;
  from?: string;
  to?: string;
  type?: string;
  value?: string;
};

export type TronGridTrc20ListResponse = {
  data?: TronGridTrc20Row[];
  success?: boolean;
  meta?: {
    fingerprint?: string;
    links?: { next?: string };
    page_size?: number;
  };
};

export type TronTransactionInfo = {
  id?: string;
  blockNumber?: number;
  blockTimeStamp?: number;
  contract_address?: string;
  receipt?: { result?: string };
  result?: string;
  log?: Array<{
    address?: string;
    topics?: string[];
    data?: string;
  }>;
};

export const TRC20_TRANSFER_TOPIC =
  'ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

export type TronTransactionById = {
  txID?: string;
  ret?: Array<{ contractRet?: string }>;
};

export function mapTrc20Row(params: {
  row: TronGridTrc20Row;
  info: TronTransactionInfo | null;
  tx: TronTransactionById | null;
  currentBlock: bigint;
  chainNetwork: TronChainNetwork;
  expectedContract: string;
}): VerifiedTrc20Transfer | null {
  const { row, info, tx, currentBlock, chainNetwork, expectedContract } = params;
  const txHash = tryNormalizeTronTxHash(
    info?.id ?? tx?.txID ?? row.transaction_id ?? '',
  );
  const toAddress = (row.to ?? '').trim();
  const fromAddress = (row.from ?? '').trim();
  const tokenContract = (row.token_info?.address ?? '').trim();
  const raw = (row.value ?? '').trim();
  if (!txHash || !toAddress || !fromAddress || !tokenContract || !raw) {
    return null;
  }
  if (row.type && row.type !== 'Transfer') return null;

  let rawAmount: bigint;
  try {
    rawAmount = parseTokenRawAmount(raw);
  } catch {
    return null;
  }

  const decimals = row.token_info?.decimals ?? USDT_TRC20_DECIMALS;
  if (decimals !== USDT_TRC20_DECIMALS) return null;

  if (!info?.blockNumber) {
    return null;
  }

  const receiptResult = (info.receipt?.result ?? info.result ?? '').toUpperCase();
  const contractRet = (tx?.ret?.[0]?.contractRet ?? '').toUpperCase();
  if (receiptResult && receiptResult !== 'SUCCESS') {
    return {
      ...baseTransfer({
        txHash,
        fromAddress,
        toAddress,
        tokenContract,
        rawAmount,
        decimals,
        symbol: row.token_info?.symbol ?? 'USDT',
        blockNumber: BigInt(info.blockNumber),
        blockTimestampMs: BigInt(row.block_timestamp ?? info.blockTimeStamp ?? 0),
        currentBlock,
        chainNetwork,
        expectedContract,
      }),
      success: false,
    };
  }
  if (tx && contractRet && contractRet !== 'SUCCESS') {
    return {
      ...baseTransfer({
        txHash,
        fromAddress,
        toAddress,
        tokenContract,
        rawAmount,
        decimals,
        symbol: row.token_info?.symbol ?? 'USDT',
        blockNumber: BigInt(info.blockNumber),
        blockTimestampMs: BigInt(row.block_timestamp ?? info.blockTimeStamp ?? 0),
        currentBlock,
        chainNetwork,
        expectedContract,
      }),
      success: false,
    };
  }

  const success = receiptResult === 'SUCCESS' && (contractRet === 'SUCCESS' || contractRet === '');
  const blockNumber = BigInt(info.blockNumber);
  return {
    ...baseTransfer({
      txHash,
      fromAddress,
      toAddress,
      tokenContract,
      rawAmount,
      decimals,
      symbol: row.token_info?.symbol ?? 'USDT',
      blockNumber,
      blockTimestampMs: BigInt(row.block_timestamp ?? info.blockTimeStamp ?? 0),
      currentBlock,
      chainNetwork,
      expectedContract,
    }),
    success: success && blockNumber > 0n,
  };
}

function baseTransfer(args: {
  txHash: string;
  fromAddress: string;
  toAddress: string;
  tokenContract: string;
  rawAmount: bigint;
  decimals: number;
  symbol: string;
  blockNumber: bigint;
  blockTimestampMs: bigint;
  currentBlock: bigint;
  chainNetwork: TronChainNetwork;
  expectedContract: string;
}): VerifiedTrc20Transfer {
  const amount = tokenRawToDecimal(args.rawAmount, args.decimals);
  void args.expectedContract;
  return {
    txHash: args.txHash,
    fromAddress: args.fromAddress,
    toAddress: args.toAddress,
    rawAmount: args.rawAmount.toString(),
    amount: amount.toString(),
    decimals: args.decimals,
    symbol: args.symbol,
    tokenContract: args.tokenContract,
    blockNumber: args.blockNumber,
    blockTimestampMs: args.blockTimestampMs,
    confirmations: confirmationsFromBlocks(args.currentBlock, args.blockNumber),
    success: true,
    chain: 'TRON',
    chainNetwork: args.chainNetwork,
    tokenStandard: 'TRC20',
    assetCode: 'USDT',
  };
}

export function transferRowsFromLogs(params: {
  txHash: string;
  info: TronTransactionInfo;
  expectedContract: string;
}): TronGridTrc20Row[] {
  const canonical = tryNormalizeTronTxHash(params.txHash) ?? tryNormalizeTronTxHash(params.info.id);
  if (!canonical) return [];
  const rows: TronGridTrc20Row[] = [];
  const logs = params.info.log ?? [];
  for (const log of logs) {
    const topic0 = (log.topics?.[0] ?? '').replace(/^0x/i, '').toLowerCase();
    if (topic0 !== TRC20_TRANSFER_TOPIC) continue;
    const contract = hexToTronAddress(log.address ?? '');
    if (!contract) continue;
    if (
      params.expectedContract &&
      contract !== params.expectedContract
    ) {
      continue;
    }
    const fromAddress = hexToTronAddress(log.topics?.[1] ?? '');
    const toAddress = hexToTronAddress(log.topics?.[2] ?? '');
    const data = (log.data ?? '').replace(/^0x/i, '');
    if (!fromAddress || !toAddress || !data) continue;
    let value: string;
    try {
      value = BigInt(`0x${data}`).toString();
    } catch {
      continue;
    }
    rows.push({
      transaction_id: canonical,
      token_info: {
        symbol: 'USDT',
        address: contract,
        decimals: USDT_TRC20_DECIMALS,
        name: 'Tether USD',
      },
      block_timestamp: params.info.blockTimeStamp,
      from: fromAddress,
      to: toAddress,
      type: 'Transfer',
      value,
    });
  }
  return rows;
}

/** @deprecated Prefer transferRowsFromLogs — first matching USDT Transfer only. */
export function transferRowFromLogs(params: {
  txHash: string;
  info: TronTransactionInfo;
  expectedContract: string;
}): TronGridTrc20Row | null {
  return transferRowsFromLogs(params)[0] ?? null;
}

export function serializeVerified(
  transfer: VerifiedTrc20Transfer,
): Prisma.InputJsonValue {
  return {
    txHash: transfer.txHash,
    fromAddress: transfer.fromAddress,
    toAddress: transfer.toAddress,
    rawAmount: transfer.rawAmount,
    amount: transfer.amount,
    tokenContract: transfer.tokenContract,
    blockNumber: transfer.blockNumber.toString(),
    confirmations: transfer.confirmations,
    success: transfer.success,
    chainNetwork: transfer.chainNetwork,
  };
}
