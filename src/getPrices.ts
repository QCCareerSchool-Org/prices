import type { Price } from './domain/price';
import type { PriceOptions } from './domain/priceQuery';
import { PriceCalculation } from './pricing/PriceCalculation';

export async function getPrices(courses: string[], countryCode: string, provinceCode?: string, options?: PriceOptions): Promise<Price> {
  return new PriceCalculation(courses, countryCode, provinceCode, options).calculate();
}
