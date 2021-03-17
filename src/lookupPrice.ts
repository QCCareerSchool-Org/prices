import { audCountry, gbpCountry, nzdCountry } from '@qccareerschool/helper-functions';
import * as HttpStatus from '@qccareerschool/http-status';
import { PoolConnection } from 'promise-mysql';

import { lookupPriceByCountryAndProvince } from './lookupPriceByCountryAndProvince';
import { PriceRow } from './types';

export const lookupPrice = async (connection: PoolConnection, courseCode: string, countryCode: string, provinceCode?: string): Promise<PriceRow> => {
  let result: PriceRow[];

  if (typeof provinceCode !== 'undefined') { // look for this exact country/province combination
    result = await lookupPriceByCountryAndProvince(connection, courseCode, countryCode, provinceCode);
    if (result.length) {
      return result[0];
    }
  }

  // look for this exact country
  result = await lookupPriceByCountryAndProvince(connection, courseCode, countryCode, null);
  if (result.length) {
    return result[0];
  }

  if (audCountry(countryCode)) { // check for an Australia price
    result = await lookupPriceByCountryAndProvince(connection, courseCode, 'AU', null);
    if (result.length) {
      return result[0];
    }
  } else if (gbpCountry(countryCode)) { // check for a UK price
    result = await lookupPriceByCountryAndProvince(connection, courseCode, 'GB', null);
    if (result.length) {
      return result[0];
    }
  } else if (nzdCountry(countryCode)) { // check for a New Zealand price
    result = await lookupPriceByCountryAndProvince(connection, courseCode, 'AU', null);
    if (result.length) {
      return result[0];
    }
  }

  // check for default price
  result = await lookupPriceByCountryAndProvince(connection, courseCode, null, null);
  if (result.length) {
    return result[0];
  }

  throw new HttpStatus.BadRequest(`No pricing information found for course ${courseCode}`);
};
