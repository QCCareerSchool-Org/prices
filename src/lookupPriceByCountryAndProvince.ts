import { PoolConnection } from 'promise-mysql';
import { PriceRow } from './types';

const sqlLookupPrice = `
SELECT
  p.course_code code,
  p.currency_code currencyCode,
  p.cost,
  p.secondary_discount multiCourseDiscountRate,
  p.discount,
  p.deposit,
  p.installments,
  p.course_code courseCode,
  c.name courseName,
  p.shipping
FROM
  prices p
LEFT JOIN
  courses c ON c.code = p.course_code
WHERE
  NOT p.enabled = 0 AND p.course_code = ?`;

export async function lookupPriceByCountryAndProvince(connection: PoolConnection, courseCode: string, countryCode: string | null, provinceCode: string | null): Promise<PriceRow[]> {
  if (countryCode === null) {
    const sql = `${sqlLookupPrice} AND country_code IS NULL AND province_code IS NULL`;
    return await connection.query(sql, [ courseCode ]);
  } else if (provinceCode === null) {
    const sql = `${sqlLookupPrice} AND country_code = ? AND province_code IS NULL`;
    return await connection.query(sql, [ courseCode, countryCode ]);
  } else {
    const sql = `${sqlLookupPrice} AND country_code = ? AND province_code = ?`;
    return await connection.query(sql, [ courseCode, countryCode, provinceCode ]);
  }
}
