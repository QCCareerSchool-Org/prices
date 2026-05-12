import type { CoursePrice } from '../domain/price';
import type { PriceOptions } from '../domain/priceQuery';
import type { PromoCodeSpec } from '../promoCodes';
import { promoCodeSpecs, specApplies } from '../promoCodes';

type SortFunction<T> = (a: T, b: T) => number;

export const getDefaultCourseSort = (now: Date, options?: PriceOptions): SortFunction<CoursePrice> => {
  const applies = (spec?: PromoCodeSpec): boolean => typeof spec !== 'undefined' && specApplies(spec, now, options?.discountAll, options?.promoCode, options?.school);

  const masterclassApplies = applies(promoCodeSpecs.find(v => v.code === 'MASTERCLASS'));

  if (masterclassApplies) {
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

  return (a, b) => (a.free === b.free ? a.cost - b.cost : a.free ? 1 : -1);
};

/**
 * Sort function for CourseResults
 *
 * Sorts by primary descending, then free ascending, then cost descending, then discounted cost descending
 * @param a the first course result
 * @param b the second course result
 */
export const courseSort = (a: CoursePrice, b: CoursePrice): number => {
  if (a.primary === b.primary) {
    if (a.free === b.free) {
      if (a.cost === b.cost) {
        if (a.discountedCost === b.discountedCost) {
          return b.order - a.order;
        }
        return b.discountedCost - a.discountedCost;
      }
      return b.cost - a.cost;
    }
    return a.free ? 1 : -1;
  }
  return a.primary ? -1 : 1;
};
