import type { CurrencyCode } from './currencyCode';

export interface RawCurrency {
  code: CurrencyCode;
  symbol: string;
  name: string;
  exchangeRate: number;
}
