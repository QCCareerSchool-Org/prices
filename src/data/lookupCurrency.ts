import type { RowDataPacket } from 'mysql2';

import * as HttpStatus from '../lib/http-status';
import { pool } from '../pool';
import type { Currency, CurrencyCode } from '../types';

interface CurrencyRow extends RowDataPacket {
  code: string;
  symbol: string;
  name: string;
  exchangeRate: number;
}

const sql = 'SELECT code, name, symbol, exchange exchangeRate FROM currencies WHERE code = ? LIMIT 1';

export const lookupCurrency = async (currencyCode: CurrencyCode): Promise<Currency> => {
  await using connection = await pool.getConnection();

  const [ rows ] = await connection.query<CurrencyRow[]>(sql, [ currencyCode ]);
  const result = rows[0];
  if (!result) {
    throw new HttpStatus.InternalServerError('Unable to find currency');
  }
  return result;
};
