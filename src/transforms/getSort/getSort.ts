import type { PriceOptions } from '../../domain/priceQuery';
import type { PromoCodeSpec } from '../../promoCodes';
import { promoCodeSpecs, specApplies } from '../../promoCodes';
import type { CoursePrice } from '@/domain/price';

type SortFunction<T> = (a: T, b: T) => number;

export const getSort = (now: Date, options?: PriceOptions): SortFunction<CoursePrice> => {
  const applies = (spec?: PromoCodeSpec): boolean => typeof spec !== 'undefined' && specApplies(spec, now, options?.discountAll, options?.promoCode, options?.school);

  const masterclassApplies = applies(promoCodeSpecs.find(v => v.code === 'MASTERCLASS'));

  if (masterclassApplies) {
    // sort function that puts I2 after other courses with the same cost
    return (a, b) => {
      if (a.free === b.free) {
        if (a.cost === b.cost) {
          if (a.code === 'I2') {
            return 1;
          }
          if (b.code === 'I2') {
            return -1;
          }
        }
        return a.cost - b.cost;
      }
      return a.free ? 1 : -1;
    };
  }

  return (a, b) => (a.free === b.free ? a.cost - b.cost : a.free ? 1 : -1); // sort by free in ascending order (free last), then cost in ascending order (cheapest first)
};
