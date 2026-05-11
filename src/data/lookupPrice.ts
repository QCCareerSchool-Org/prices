import type { RowDataPacket } from 'mysql2';

import { lookupPriceByCountryAndProvince } from './lookupPriceByCountryAndProvince';
import { audCountry, gbpCountry, nzdCountry } from '../lib/helper-functions';
import * as HttpStatus from '../lib/http-status';

export interface PriceRow extends RowDataPacket {
  // noShipping: number;
  code: string;
  currencyCode: string;
  cost: number;
  multiCourseDiscountRate: number;
  deposit: number;
  discount: number;
  partDiscount: number;
  installments: number | null;
  courseCode: string;
  courseName: string;
  shipping: number;
  order: number;
}

export const lookupPrice = async (courseCode: string, countryCode: string, provinceCode?: string): Promise<PriceRow> => {
  let result: (PriceRow | undefined)[];

  if (typeof provinceCode !== 'undefined') { // look for this exact country/province combination
    result = await lookupPriceByCountryAndProvince(courseCode, countryCode, provinceCode);
    const price = result[0];
    if (price) {
      return price;
    }
  }

  // look for this exact country
  result = await lookupPriceByCountryAndProvince(courseCode, countryCode, null);
  const price = result[0];
  if (price) {
    return price;
  }

  if (audCountry(countryCode)) { // check for an Australia price
    result = await lookupPriceByCountryAndProvince(courseCode, 'AU', null);
    const audPrice = result[0];
    if (audPrice) {
      return audPrice;
    }
  } else if (gbpCountry(countryCode)) { // check for a UK price
    result = await lookupPriceByCountryAndProvince(courseCode, 'GB', null);
    const gbpPrice = result[0];
    if (gbpPrice) {
      return gbpPrice;
    }
  } else if (nzdCountry(countryCode)) { // check for a New Zealand price
    result = await lookupPriceByCountryAndProvince(courseCode, 'AU', null);
    const nzdPrice = result[0];
    if (nzdPrice) {
      return nzdPrice;
    }
  }

  // check for default price
  result = await lookupPriceByCountryAndProvince(courseCode, null, null);
  const defaultPrice = result[0];
  if (defaultPrice) {
    return defaultPrice;
  }

  throw new HttpStatus.BadRequest(`No pricing information found for course ${courseCode}`);
};
