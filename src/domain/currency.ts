import type { CurrencyCode } from './currencyCode';
import { isCurrencyCode } from './currencyCode';

export interface CurrencyDTO {
  code: CurrencyCode;
  symbol: string;
  name: string;
  exchangeRate: number;
}

const gbpCountries = new Set([ 'GB', 'IM', 'GG', 'JE', 'GS' ]);
const audCountries = new Set([ 'AU', 'CX', 'CC', 'NR', 'NF', 'HM' ]);
const nzdCountries = new Set([ 'NZ', 'TK', 'NU', 'PN' ]);

export const isCurrency = (obj: unknown): obj is CurrencyDTO => {
  return obj !== null && typeof obj === 'object' &&
    'code' in obj && isCurrencyCode(obj.code) &&
    'symbol' in obj && typeof obj.symbol === 'string' &&
    'name' in obj && typeof obj.name === 'string' &&
    'exchangeRate' in obj && typeof obj.exchangeRate === 'number';
};

/** determines if we charge people from a country in pounds sterling */
export const gbpCountry = (countryCode: string | null): boolean => {
  if (countryCode === null) {
    return false;
  }
  return gbpCountries.has(countryCode.toUpperCase());
};

/** determines if we charge people from a country in Australian dollars */
export const audCountry = (countryCode: string | null): boolean => {
  if (countryCode === null) {
    return false;
  }
  return audCountries.has(countryCode.toUpperCase());
};

/** determines if we charge people from a country in Australian dollars */
export const nzdCountry = (countryCode: string | null): boolean => {
  if (countryCode === null) {
    return false;
  }
  return nzdCountries.has(countryCode.toUpperCase());
};
