export type TronChainNetwork = 'mainnet' | 'nile' | 'shasta';

export type VerifiedTrc20Transfer = {
  txHash: string;
  fromAddress: string;
  toAddress: string;
  rawAmount: string;
  amount: string;
  decimals: number;
  symbol: string;
  tokenContract: string;
  blockNumber: bigint;
  blockTimestampMs: bigint;
  confirmations: number;
  success: boolean;
  chain: 'TRON';
  chainNetwork: TronChainNetwork;
  tokenStandard: 'TRC20';
  assetCode: 'USDT';
};

export type Trc20TransferPage = {
  items: VerifiedTrc20Transfer[];
  fingerprint: string | null;
  hasMore: boolean;
};

export type AddressScanCursor = {
  watermarkTimestamp: bigint;
  fingerprint: string | null;
};

export type ProviderHealth = {
  ok: boolean;
  mode: string;
  message?: string;
  lastBlock?: string;
  network?: string;
  usdtContract?: string;
};

export const DEPOSIT_BLOCKCHAIN_PROVIDER = Symbol(
  'DEPOSIT_BLOCKCHAIN_PROVIDER',
);

export interface DepositBlockchainProvider {
  readonly mode: string;
  health(): Promise<ProviderHealth>;
  getNowBlock(): Promise<bigint>;
  fetchTrc20Incoming(
    address: string,
    cursor: AddressScanCursor,
  ): Promise<Trc20TransferPage>;
  getVerifiedTransfer(txHash: string): Promise<VerifiedTrc20Transfer | null>;
  getVerifiedTransfers(txHash: string): Promise<VerifiedTrc20Transfer[]>;
}
