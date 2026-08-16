import { Prisma } from '@prisma/client';
import type { VerifiedTrc20Transfer } from '../../src/modules/deposit-ingestion/providers/deposit-blockchain-provider.interface';
import { decimalToTokenRaw } from '../../src/modules/deposit-ingestion/tron/tron-amount';
import { uniqueTrc20Address } from './e2e-trc20-address';
import { TRON_MAINNET_USDT_CONTRACT } from '../../src/modules/deposit-ingestion/tron/tron-network.config';
import { tryNormalizeTronTxHash } from '../../src/modules/deposit-ingestion/tron/tron-tx-hash';
import { canonicalTestTxHash } from './canonical-tx-hash';

export function mockUsdtTransfer(params: {
  txHash: string;
  toAddress: string;
  amount: string;
  fromAddress?: string;
  blockNumber?: bigint;
  success?: boolean;
  tokenContract?: string;
  blockTimestampMs?: bigint;
}): VerifiedTrc20Transfer {
  const amount = new Prisma.Decimal(params.amount);
  const txHash =
    tryNormalizeTronTxHash(params.txHash) ?? canonicalTestTxHash(params.txHash);
  return {
    txHash,
    fromAddress: params.fromAddress ?? uniqueTrc20Address('from'),
    toAddress: params.toAddress,
    rawAmount: decimalToTokenRaw(amount).toString(),
    amount: amount.toString(),
    decimals: 6,
    symbol: 'USDT',
    tokenContract: params.tokenContract ?? TRON_MAINNET_USDT_CONTRACT,
    blockNumber: params.blockNumber ?? 9_990n,
    blockTimestampMs: params.blockTimestampMs ?? BigInt(Date.now()),
    confirmations: 0,
    success: params.success ?? true,
    chain: 'TRON',
    chainNetwork: 'mainnet',
    tokenStandard: 'TRC20',
    assetCode: 'USDT',
  };
}
