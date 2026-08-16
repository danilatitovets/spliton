import { TRON_MAINNET_USDT_CONTRACT } from './tron-network.config';
import { resolveTronRuntimeConfig } from './tron-network.config';

describe('tron-network.config', () => {
  const env = { ...process.env };

  afterEach(() => {
    process.env = { ...env };
  });

  it('fail-closed when tron mode has no contract on shasta', () => {
    expect(() =>
      resolveTronRuntimeConfig({
        TRON_PROVIDER_MODE: 'tron',
        TRON_NETWORK: 'shasta',
        TRON_USDT_CONTRACT: '',
      }),
    ).toThrow(/TRON_USDT_CONTRACT/);
  });

  it('rejects mainnet USDT contract on Nile', () => {
    expect(() =>
      resolveTronRuntimeConfig({
        TRON_PROVIDER_MODE: 'tron',
        TRON_NETWORK: 'nile',
        TRON_USDT_CONTRACT: TRON_MAINNET_USDT_CONTRACT,
      }),
    ).toThrow(/network mismatch/i);
  });

  it('accepts explicit mainnet contract', () => {
    const cfg = resolveTronRuntimeConfig({
      TRON_PROVIDER_MODE: 'tron',
      TRON_NETWORK: 'mainnet',
      TRON_USDT_CONTRACT: TRON_MAINNET_USDT_CONTRACT,
    });
    expect(cfg.usdtContract).toBe(TRON_MAINNET_USDT_CONTRACT);
    expect(cfg.chainNetwork).toBe('mainnet');
  });
});
