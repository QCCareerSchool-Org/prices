import type { PoolConnection } from 'promise-mysql';

import * as HttpStatus from './lib/http-status';
import type { Currency, CurrencyCode } from './types';

export const lookupCurrency = async (connection: PoolConnection, currencyCode: CurrencyCode): Promise<Currency> => {
  const sql = 'SELECT code, name, symbol, exchange exchangeRate FROM currencies WHERE code = ? LIMIT 1';
  const currencyResult: (Currency | undefined)[] = await connection.query(sql, currencyCode);
  const result = currencyResult[0];
  if (!result) {
    throw new HttpStatus.InternalServerError('Unable to find currency');
  }
  return result;
};
