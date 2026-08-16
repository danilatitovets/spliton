import { TronDepositProvider } from './tron-deposit.provider';
import { tronFetchJson } from '../tron/tron-http.client';
import {
  TRONGRID_TRC20_PAGE_FIXTURE,
  TRONGRID_TRC20_SUCCESS_FIXTURE,
  TRON_TX_BY_ID_SUCCESS_FIXTURE,
  TRON_TX_INFO_SUCCESS_FIXTURE,
} from '../fixtures/trongrid-trc20.fixtures';
import { TRON_MAINNET_USDT_CONTRACT } from '../tron/tron-network.config';

jest.mock('../tron/tron-http.client', () => ({
  tronFetchJson: jest.fn(),
  TronProviderError: class TronProviderError extends Error {
    constructor(
      message: string,
      readonly code: string,
      readonly status?: number,
    ) {
      super(message);
    }
  },
}));

const fetchJson = tronFetchJson as jest.MockedFunction<typeof tronFetchJson>;

describe('TronDepositProvider pagination', () => {
  const env = { ...process.env };

  afterEach(() => {
    process.env = { ...env };
    fetchJson.mockReset();
  });

  function provider() {
    process.env.TRON_PROVIDER_MODE = 'tron';
    process.env.TRON_NETWORK = 'mainnet';
    process.env.TRON_USDT_CONTRACT = TRON_MAINNET_USDT_CONTRACT;
    process.env.TRON_PROVIDER_URL = 'https://api.trongrid.io';
    process.env.TRON_PAGE_SIZE = '50';
    process.env.TRON_MAX_PAGES_PER_ADDRESS = '5';
    return new TronDepositProvider();
  }

  it('pages until empty fingerprint and hydrates SUCCESS transfers', async () => {
    const page1 = TRONGRID_TRC20_PAGE_FIXTURE(50, 'fp-2');
    const page2 = TRONGRID_TRC20_PAGE_FIXTURE(10, null);
    fetchJson.mockImplementation(async (url, options) => {
      if (String(url).includes('/wallet/getnowblock')) {
        return { block_header: { raw_data: { number: 85_375_198 } } };
      }
      if (String(url).includes('/wallet/gettransactioninfobyid')) {
        return {
          ...TRON_TX_INFO_SUCCESS_FIXTURE,
          id: (options?.body as { value?: string })?.value,
        };
      }
      if (String(url).includes('/wallet/gettransactionbyid')) {
        return TRON_TX_BY_ID_SUCCESS_FIXTURE;
      }
      if (String(url).includes('fingerprint=fp-2')) return page2;
      return page1;
    });

    const out = await provider().fetchTrc20Incoming(
      TRONGRID_TRC20_SUCCESS_FIXTURE.data[0]!.to,
      { watermarkTimestamp: 0n, fingerprint: null },
    );
    expect(out.items).toHaveLength(60);
    expect(out.hasMore).toBe(false);
    expect(out.items.every((item) => item.success && item.tokenContract === TRON_MAINNET_USDT_CONTRACT)).toBe(
      true,
    );
  });

  it('returns empty page without crediting', async () => {
    fetchJson.mockImplementation(async (url) => {
      if (String(url).includes('/wallet/getnowblock')) {
        return { block_header: { raw_data: { number: 85_375_198 } } };
      }
      return { data: [], success: true };
    });
    const out = await provider().fetchTrc20Incoming(
      TRONGRID_TRC20_SUCCESS_FIXTURE.data[0]!.to,
      { watermarkTimestamp: 0n, fingerprint: null },
    );
    expect(out.items).toEqual([]);
    expect(out.hasMore).toBe(false);
  });
});
