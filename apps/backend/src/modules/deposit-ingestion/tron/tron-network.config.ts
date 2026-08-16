export const TRON_MAINNET_USDT_CONTRACT =
  'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';
export const TRON_NILE_USDT_CONTRACT = 'TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf';

export type TronChainNetwork = 'mainnet' | 'nile' | 'shasta';

export type TronRuntimeConfig = {
  mode: 'mock' | 'tron';
  chain: 'TRON';
  chainNetwork: TronChainNetwork;
  tokenStandard: 'TRC20';
  assetCode: 'USDT';
  usdtContract: string;
  decimals: number;
  confirmationsRequired: number;
  providerUrl: string;
  apiKey: string;
  pollIntervalMs: number;
  requestTimeoutMs: number;
  maxPagesPerAddress: number;
  pageSize: number;
  watermarkOverlapMs: number;
};

const NETWORK_DEFAULT_URL: Record<TronChainNetwork, string> = {
  mainnet: 'https://api.trongrid.io',
  nile: 'https://nile.trongrid.io',
  shasta: 'https://api.shasta.trongrid.io',
};

const NETWORK_DEFAULT_USDT: Record<TronChainNetwork, string> = {
  mainnet: TRON_MAINNET_USDT_CONTRACT,
  nile: TRON_NILE_USDT_CONTRACT,
  shasta: '',
};

function parseNetwork(raw: string | undefined): TronChainNetwork {
  const v = (raw ?? 'mainnet').trim().toLowerCase();
  if (v === 'nile' || v === 'shasta' || v === 'mainnet') return v;
  throw new Error(`Unsupported TRON_NETWORK: ${raw}`);
}

function parsePositiveInt(raw: string | undefined, fallback: number): number {
  if (!raw?.trim()) return fallback;
  if (!/^[0-9]+$/.test(raw.trim())) return fallback;
  const n = Number.parseInt(raw.trim(), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export function resolveTronRuntimeConfig(
  env: NodeJS.ProcessEnv = process.env,
): TronRuntimeConfig {
  const mode = (env.TRON_PROVIDER_MODE ?? 'mock').trim().toLowerCase() === 'tron'
    ? 'tron'
    : 'mock';
  const chainNetwork = parseNetwork(env.TRON_NETWORK);
  const configuredContract = (env.TRON_USDT_CONTRACT ?? '').trim();
  const usdtContract = configuredContract || NETWORK_DEFAULT_USDT[chainNetwork];

  if (mode === 'tron' && !usdtContract) {
    throw new Error(
      'TRON_USDT_CONTRACT is required when TRON_PROVIDER_MODE=tron',
    );
  }
  if (
    mode === 'tron' &&
    chainNetwork === 'nile' &&
    usdtContract === TRON_MAINNET_USDT_CONTRACT
  ) {
    throw new Error(
      'TRON network mismatch: Nile cannot use mainnet USDT contract',
    );
  }
  if (
    mode === 'tron' &&
    chainNetwork === 'mainnet' &&
    usdtContract === TRON_NILE_USDT_CONTRACT
  ) {
    throw new Error(
      'TRON network mismatch: mainnet cannot use Nile USDT contract',
    );
  }

  const providerUrl = (
    env.TRON_PROVIDER_URL?.trim() || NETWORK_DEFAULT_URL[chainNetwork]
  ).replace(/\/$/, '');

  const confirmationsRequired = parsePositiveInt(
    env.TRON_CONFIRMATIONS_REQUIRED ?? env.TRON_CONFIRMATIONS,
    20,
  );

  return {
    mode,
    chain: 'TRON',
    chainNetwork,
    tokenStandard: 'TRC20',
    assetCode: 'USDT',
    usdtContract,
    decimals: 6,
    confirmationsRequired,
    providerUrl,
    apiKey: env.TRON_API_KEY?.trim() ?? '',
    pollIntervalMs: Math.max(
      5000,
      parsePositiveInt(env.TRON_POLL_INTERVAL ?? env.DEPOSIT_SCAN_INTERVAL_MS, 15000),
    ),
    requestTimeoutMs: parsePositiveInt(env.TRON_HTTP_TIMEOUT_MS, 15000),
    maxPagesPerAddress: parsePositiveInt(env.TRON_MAX_PAGES_PER_ADDRESS, 50),
    pageSize: Math.min(200, parsePositiveInt(env.TRON_PAGE_SIZE, 200)),
    watermarkOverlapMs: parsePositiveInt(env.TRON_SCAN_OVERLAP_MS, 10 * 60 * 1000),
  };
}

export function sameTronAddress(a: string, b: string): boolean {
  const left = a.trim();
  const right = b.trim();
  if (!left || !right) return false;
  return left === right;
}
