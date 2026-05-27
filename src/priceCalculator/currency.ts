import Big from 'big.js';

import type { CurrencyDTO } from '@/domain/currency';
import type { CurrencyCode } from '@/domain/currencyCode';
import type { RawCurrency } from '@/domain/rawCurrency';

export class Currency {
  public code: CurrencyCode;
  public name: string;
  public symbol: string;
  public exchangeRate: Big;

  public constructor(rawCurrency: RawCurrency) {
    this.code = rawCurrency.code;
    this.name = rawCurrency.name;
    this.symbol = rawCurrency.symbol;
    this.exchangeRate = Big(rawCurrency.exchangeRate).round(4);
  }

  public toDTO(): CurrencyDTO {
    return {
      code: this.code,
      name: this.name,
      symbol: this.symbol,
      exchangeRate: this.exchangeRate.toNumber(),
    };
  }
}
