import { mapTrc20Row } from '../providers/tron-trc20.mapper';
import {
  LIVE_USDT_TRC20_TX_HASH,
  TRONGRID_TRC20_SUCCESS_FIXTURE,
  TRON_TX_BY_ID_SUCCESS_FIXTURE,
  TRON_TX_INFO_SUCCESS_FIXTURE,
} from './trongrid-trc20.fixtures';
import { TRON_MAINNET_USDT_CONTRACT } from '../tron/tron-network.config';

/**
 * Parser verification against a recorded real TronGrid mainnet USDT TRC-20 transfer.
 * Does not credit any ledger. Optional live fetch: TRON_LIVE_PARSER=1.
 */
describe('live TronGrid USDT parser verification (read-only)', () => {
  it('extracts txHash, from, to, amount, contract, block, SUCCESS from recorded mainnet payload', () => {
    const mapped = mapTrc20Row({
      row: TRONGRID_TRC20_SUCCESS_FIXTURE.data[0]!,
      info: TRON_TX_INFO_SUCCESS_FIXTURE,
      tx: TRON_TX_BY_ID_SUCCESS_FIXTURE,
      currentBlock: 85_375_198n,
      chainNetwork: 'mainnet',
      expectedContract: TRON_MAINNET_USDT_CONTRACT,
    });
    expect(mapped?.txHash).toBe(LIVE_USDT_TRC20_TX_HASH);
    expect(mapped?.fromAddress).toBe('TKx29eiTfFinZhYoi3FbaMWyud8NMdZnMb');
    expect(mapped?.toAddress).toBe('TQW7nzmx2FqUtrA2UA211WJVPZnJXxUud8');
    expect(mapped?.amount).toBe('2700');
    expect(mapped?.tokenContract).toBe(TRON_MAINNET_USDT_CONTRACT);
    expect(mapped?.blockNumber).toBe(85_375_179n);
    expect(mapped?.success).toBe(true);
  });

  it('optionally re-fetches the same public tx from TronGrid', async () => {
    if (process.env.TRON_LIVE_PARSER !== '1') return;
    const list = await fetch(
      `https://api.trongrid.io/v1/accounts/TQW7nzmx2FqUtrA2UA211WJVPZnJXxUud8/transactions/trc20?limit=20&only_to=true`,
    );
    expect(list.ok).toBe(true);
    const body = (await list.json()) as { data?: Array<{ transaction_id?: string }> };
    const row = body.data?.find((item) => item.transaction_id === LIVE_USDT_TRC20_TX_HASH);
    expect(row?.transaction_id).toBe(LIVE_USDT_TRC20_TX_HASH);
  });
});
