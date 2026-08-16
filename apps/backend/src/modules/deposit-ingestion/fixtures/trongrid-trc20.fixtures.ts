/** Recorded 2026-08-15 from TronGrid mainnet (read-only). Not credited. */

export const LIVE_USDT_TRC20_TX_HASH =
  '6182758a7dd1bfdd005f978285300f8f6dbf93d76171ddb6514d7c0044d2b809';

export const TRONGRID_TRC20_SUCCESS_FIXTURE = {
  data: [
    {
      transaction_id: LIVE_USDT_TRC20_TX_HASH,
      token_info: {
        symbol: 'USDT',
        address: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
        decimals: 6,
        name: 'Tether USD',
      },
      block_timestamp: 1786796664000,
      from: 'TKx29eiTfFinZhYoi3FbaMWyud8NMdZnMb',
      to: 'TQW7nzmx2FqUtrA2UA211WJVPZnJXxUud8',
      type: 'Transfer',
      value: '2700000000',
    },
  ],
  success: true,
  meta: {
    at: 1786797659468,
    fingerprint: 'page-2-fingerprint',
    links: {
      next: 'https://api.trongrid.io/v1/accounts/T/transactions/trc20?fingerprint=page-2-fingerprint',
    },
    page_size: 1,
  },
};

export const TRON_TX_INFO_SUCCESS_FIXTURE = {
  id: LIVE_USDT_TRC20_TX_HASH,
  blockNumber: 85_375_179,
  blockTimeStamp: 1786796664000,
  contract_address: '41a614f803b6fd780986a42c78ec9c7f77e6ded13c',
  receipt: { result: 'SUCCESS' },
  log: [
    {
      address: 'a614f803b6fd780986a42c78ec9c7f77e6ded13c',
      topics: [
        'ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        '0000000000000000000000006d77c87fb6f5837a18911feeb22d4c85ce19e339',
        '0000000000000000000000009f6a4ef3174c8b25c812021646cfe8eda244483e',
      ],
      data: '00000000000000000000000000000000000000000000000000000000a0eebb00',
    },
  ],
};

export const TRON_TX_BY_ID_SUCCESS_FIXTURE = {
  txID: LIVE_USDT_TRC20_TX_HASH,
  ret: [{ contractRet: 'SUCCESS' }],
};

export const TRON_TX_BY_ID_FAILED_FIXTURE = {
  txID: 'failedtx',
  ret: [{ contractRet: 'REVERT' }],
};

export const TRONGRID_TRC20_PAGE_FIXTURE = (count: number, fingerprint: string | null) => ({
  data: Array.from({ length: count }, (_, i) => ({
    ...TRONGRID_TRC20_SUCCESS_FIXTURE.data[0]!,
    transaction_id: `${LIVE_USDT_TRC20_TX_HASH.slice(0, 56)}${i.toString(16).padStart(8, '0')}`,
    block_timestamp: 1786796664000 + i,
    value: '1000000',
  })),
  success: true as const,
  meta: {
    fingerprint,
    links: fingerprint
      ? { next: `https://api.trongrid.io/v1/accounts/T/transactions/trc20?fingerprint=${fingerprint}` }
      : undefined,
    page_size: count,
  },
});
