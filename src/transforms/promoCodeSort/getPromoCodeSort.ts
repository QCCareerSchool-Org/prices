import { PromoCodeSpec, promoCodeSpecs, specApplies } from '../../promoCodes';
import { CourseResult, PriceQueryOptions } from '../../types';

type SortFunction<T> = (a: T, b: T) => number;

export const getPromoCodeSort = (now: Date, options?: PriceQueryOptions): SortFunction<CourseResult> => {
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

  return (a, b) => (a.free === b.free ? a.cost - b.cost : a.free ? 1 : -1);
};
