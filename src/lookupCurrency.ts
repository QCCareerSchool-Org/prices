import * as HttpStatus from '@qccareerschool/http-status';
import { PoolConnection } from 'promise-mysql';

import { Currency, CurrencyCode } from './types';

export const lookupCurrency = async (connection: PoolConnection, currencyCode: CurrencyCode): Promise<Currency> => {
  const sql = 'SELECT code, name, symbol, exchange exchangeRate FROM currencies WHERE code = ? LIMIT 1';
  const currencyResult: Currency[] = await connection.query(sql, currencyCode);
  if (currencyResult.length === 0) {
    throw new HttpStatus.InternalServerError('Unable to find currency');
  }
  return currencyResult[0];
};
