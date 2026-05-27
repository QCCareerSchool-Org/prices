const currencyCodes = [ 'CAD', 'USD', 'GBP', 'AUD', 'NZD' ] as const;

export type CurrencyCode = typeof currencyCodes[number];

const currencyCodeSet = new Set<CurrencyCode>(currencyCodes);

export const isCurrencyCode = (obj: unknown): obj is CurrencyCode => {
  return typeof obj === 'string' && currencyCodeSet.has(obj as CurrencyCode);
};
