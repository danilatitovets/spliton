import { resolveThrottleConfig } from './throttle.config';

export default () => ({
  app: {
    serviceName: 'spliton-backend',
    port: Number(process.env.PORT ?? 4001),
    frontendOrigin:
      process.env.FRONTEND_ORIGIN?.trim() || 'http://localhost:3000',
    corsOrigin: process.env.CORS_ORIGIN?.trim() || null,
    nodeEnv: process.env.NODE_ENV ?? 'development',
  },
  wallet: {
    defaultAssetCode: 'USDT',
    defaultNetwork: 'TRC20',
    minWithdrawalUsdt: process.env.MIN_WITHDRAWAL_USDT ?? '50',
    defaultWithdrawalFeeUsdt: process.env.WITHDRAWAL_FEE_USDT ?? '5',
    sharedDepositAddress:
      process.env.NODE_ENV === 'production'
        ? ''
        : process.env.DEPOSIT_SHARED_ADDRESS?.trim() || '',
  },
  throttle: resolveThrottleConfig(),
  tron: {
    mode: process.env.TRON_PROVIDER_MODE ?? 'mock',
    network: process.env.TRON_NETWORK ?? 'mainnet',
    providerUrl: process.env.TRON_PROVIDER_URL ?? '',
    apiKey: process.env.TRON_API_KEY ?? '',
    confirmations: Number.parseInt(
      process.env.TRON_CONFIRMATIONS_REQUIRED ?? process.env.TRON_CONFIRMATIONS ?? '20',
      10,
    ) || 20,
    pollIntervalMs: process.env.TRON_POLL_INTERVAL ?? process.env.DEPOSIT_SCAN_INTERVAL_MS ?? '15000',
    usdtContract: process.env.TRON_USDT_CONTRACT ?? '',
  },
});
