import { PromoCodeSpec, promoCodeSpecs, specApplies } from '../../promoCodes';
import { PriceQueryOptions } from '../../types';

/**
 * Determines whether a course should get the multi-course discount or not
 * @param index the index for this course (0 = first)
 * @param options the price query options supplied with the prices request
 */
export const shouldGetMultiCourseDiscount = (now: Date, index: number, options?: PriceQueryOptions): boolean => {
  // when discountAll is true all courses get the multi-course discount
  if (options?.discountAll) {
    return true;
  }

  // the first course should not get the discount
  return index > 0;
};
