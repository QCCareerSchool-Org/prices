import type { RowDataPacket } from 'mysql2';

import type { CurrencyCode } from '@/domain/currencyCode';
import type { RawCurrency } from '@/domain/rawCurrency';
import { ServerError } from '@/lib/errors';
import { pool } from '@/pool';

interface CurrencyRow extends RowDataPacket, RawCurrency {}

const sql = 'SELECT code, name, symbol, exchange exchangeRate FROM currencies WHERE code = ? LIMIT 1';

export const lookupCurrency = async (currencyCode: CurrencyCode): Promise<RawCurrency> => {
  await using connection = await pool.getConnection();

  const [ rows ] = await connection.query<CurrencyRow[]>(sql, [ currencyCode ]);
  const result = rows[0];
  if (!result) {
    throw new ServerError('Unable to find currency');
  }
  return result;
};
