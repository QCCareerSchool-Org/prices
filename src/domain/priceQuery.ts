import type { CurrencyCode } from './currencyCode';
import type { School } from './school';

export interface PriceQuery {
  courses?: string[] | undefined;
  countryCode: string;
  provinceCode?: string | undefined;
  options?: PriceOptions | undefined;
}

export interface PriceOptions {
  noShipping?: boolean | undefined;
  discountAll?: boolean | undefined;
  discount?: (Partial<Record<CurrencyCode, number | undefined>> & { default: number }) | undefined;
  discountSignature?: string | undefined;
  depositOverrides?: Record<string, number> | undefined;
  installmentsOverride?: number | undefined;
  studentDiscount?: boolean | undefined;
  withoutTools?: boolean | undefined;
  school?: School | undefined;
  promoCode?: string | undefined;
  dateOverride?: Date | undefined;
}
