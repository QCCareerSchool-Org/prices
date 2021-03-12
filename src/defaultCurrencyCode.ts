import { audCountry, gbpCountry, nzdCountry } from '@qccareerschool/helper-functions';
import { CurrencyCode } from './types';

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
  } else {
    return 'USD';
  }
};
