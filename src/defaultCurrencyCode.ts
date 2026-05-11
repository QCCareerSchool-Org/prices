import type { CurrencyCode } from './domain/currencyCode';
import { audCountry, gbpCountry, nzdCountry } from './lib/helper-functions';

/**
 * Determines the currency we should assume the courses will be priced in based on the country
 *
 * @param countryCode the country code
 */
export const defaultCurrencyCode = (countryCode: string): CurrencyCode => {
  if (countryCode === 'CA') {
    return 'CAD';
  } else if (gbpCountry(countryCode)) {
    return 'GBP';
  } else if (audCountry(countryCode)) {
    return 'AUD';
  } else if (nzdCountry(countryCode)) {
    return 'NZD';
  }
  return 'USD';
};
