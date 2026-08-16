import { mapTrc20Row, transferRowFromLogs } from '../providers/tron-trc20.mapper';
import {
  TRONGRID_TRC20_SUCCESS_FIXTURE,
  TRON_TX_BY_ID_FAILED_FIXTURE,
  TRON_TX_BY_ID_SUCCESS_FIXTURE,
  TRON_TX_INFO_SUCCESS_FIXTURE,
} from './trongrid-trc20.fixtures';
import { TRON_MAINNET_USDT_CONTRACT } from '../tron/tron-network.config';

const CONFIRMED_HEAD = 85_375_198n;

describe('TronGrid TRC20 mapper', () => {
  it('parses live TronGrid account TRC20 payload', () => {
    const mapped = mapTrc20Row({
      row: TRONGRID_TRC20_SUCCESS_FIXTURE.data[0]!,
      info: TRON_TX_INFO_SUCCESS_FIXTURE,
      tx: TRON_TX_BY_ID_SUCCESS_FIXTURE,
      currentBlock: CONFIRMED_HEAD,
      chainNetwork: 'mainnet',
      expectedContract: TRON_MAINNET_USDT_CONTRACT,
    });
    expect(mapped).toBeTruthy();
    expect(mapped!.txHash).toBe(TRONGRID_TRC20_SUCCESS_FIXTURE.data[0]!.transaction_id);
    expect(mapped!.toAddress).toBe('TQW7nzmx2FqUtrA2UA211WJVPZnJXxUud8');
    expect(mapped!.fromAddress).toBe('TKx29eiTfFinZhYoi3FbaMWyud8NMdZnMb');
    expect(mapped!.amount).toBe('2700');
    expect(mapped!.rawAmount).toBe('2700000000');
    expect(mapped!.tokenContract).toBe(TRON_MAINNET_USDT_CONTRACT);
    expect(mapped!.blockNumber).toBe(85_375_179n);
    expect(mapped!.success).toBe(true);
    expect(mapped!.confirmations).toBe(20);
  });

  it('marks failed contractRet as unsuccessful', () => {
    const mapped = mapTrc20Row({
      row: TRONGRID_TRC20_SUCCESS_FIXTURE.data[0]!,
      info: TRON_TX_INFO_SUCCESS_FIXTURE,
      tx: TRON_TX_BY_ID_FAILED_FIXTURE,
      currentBlock: CONFIRMED_HEAD,
      chainNetwork: 'mainnet',
      expectedContract: TRON_MAINNET_USDT_CONTRACT,
    });
    expect(mapped?.success).toBe(false);
  });

  it('does not treat missing receipt as SUCCESS', () => {
    const mapped = mapTrc20Row({
      row: TRONGRID_TRC20_SUCCESS_FIXTURE.data[0]!,
      info: { ...TRON_TX_INFO_SUCCESS_FIXTURE, receipt: undefined, result: undefined },
      tx: TRON_TX_BY_ID_SUCCESS_FIXTURE,
      currentBlock: CONFIRMED_HEAD,
      chainNetwork: 'mainnet',
      expectedContract: TRON_MAINNET_USDT_CONTRACT,
    });
    expect(mapped?.success).toBe(false);
  });

  it('drops rows missing required fields', () => {
    expect(
      mapTrc20Row({
        row: { transaction_id: 'x' },
        info: null,
        tx: null,
        currentBlock: 1n,
        chainNetwork: 'mainnet',
        expectedContract: TRON_MAINNET_USDT_CONTRACT,
      }),
    ).toBeNull();
  });

  it('decodes Transfer logs for txHash recovery', () => {
    const row = transferRowFromLogs({
      txHash: TRON_TX_INFO_SUCCESS_FIXTURE.id!,
      info: TRON_TX_INFO_SUCCESS_FIXTURE,
      expectedContract: TRON_MAINNET_USDT_CONTRACT,
    });
    expect(row?.token_info?.address).toBe(TRON_MAINNET_USDT_CONTRACT);
    expect(row?.from).toBe('TKx29eiTfFinZhYoi3FbaMWyud8NMdZnMb');
    expect(row?.to).toBe('TQW7nzmx2FqUtrA2UA211WJVPZnJXxUud8');
    expect(row?.value).toBe('2700000000');
  });
});
