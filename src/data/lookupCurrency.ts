import type { RowDataPacket } from 'mysql2';

import type { Currency } from '@/domain/currency';
import type { CurrencyCode } from '@/domain/currencyCode';
import { ServerError } from '@/lib/errors';
import { pool } from '@/pool';

interface CurrencyRow extends RowDataPacket, Currency {}

const sql = 'SELECT code, name, symbol, exchange exchangeRate FROM currencies WHERE code = ? LIMIT 1';

export const lookupCurrency = async (currencyCode: CurrencyCode): Promise<Currency> => {
  await using connection = await pool.getConnection();

  const [ rows ] = await connection.query<CurrencyRow[]>(sql, [ currencyCode ]);
  const result = rows[0];
  if (!result) {
    throw new ServerError('Unable to find currency');
  }
  return result;
};
