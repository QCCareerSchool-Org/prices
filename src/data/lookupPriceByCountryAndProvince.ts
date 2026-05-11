import type { PriceRow } from './lookupPrice';
import { pool } from '../pool';

const sqlLookupPrice = `
SELECT
  p.course_code code,
  p.currency_code currencyCode,
  p.cost,
  p.secondary_discount multiCourseDiscountRate,
  p.discount,
  p.part_discount partDiscount,
  p.deposit,
  p.installments,
  p.course_code courseCode,
  c.name courseName,
  p.shipping,
  c.order
FROM
  prices p
LEFT JOIN
  courses c ON c.code = p.course_code
WHERE
  NOT p.enabled = 0 AND p.course_code = ?`;

export async function lookupPriceByCountryAndProvince(courseCode: string, countryCode: string | null, provinceCode: string | null): Promise<PriceRow[]> {
  console.log(courseCode, countryCode, provinceCode);
  await using connection = await pool.getConnection();

  if (countryCode === null) {
    const sql = `${sqlLookupPrice} AND country_code IS NULL AND province_code IS NULL`;
    const [ rows ] = await connection.query<PriceRow[]>(sql, [ courseCode ]);
    return rows;
  } else if (provinceCode === null) {
    const sql = `${sqlLookupPrice} AND country_code = ? AND province_code IS NULL`;
    const [ rows ] = await connection.query<PriceRow[]>(sql, [ courseCode, countryCode ]);
    return rows;
  }
  const sql = `${sqlLookupPrice} AND country_code = ? AND province_code = ?`;
  const [ rows ] = await connection.query<PriceRow[]>(sql, [ courseCode, countryCode, provinceCode ]);
  return rows;
}
