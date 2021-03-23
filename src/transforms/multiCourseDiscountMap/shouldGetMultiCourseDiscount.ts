import { PriceQueryOptions } from '../../types';

/**
 * Determines whether a course should get the multi-course discount or not
 * @param index the index for this course (0 = first)
 * @param options the price query options supplied with the prices request
 */
export const shouldGetMultiCourseDiscount = (index: number, options?: PriceQueryOptions): boolean => {
  // when discountAll is true all courses get the multi-course discount
  if (options?.discountAll) {
    return true;
  }

  // if this is a course after the first course...
  if (index > 0) {
    // and the school is 'QC Career School', 'QC Design School', etc. the course gets the multi-course discount
    if (options?.school === 'QC Career School' || options?.school === 'QC Design School' || options?.school === 'QC Event School' || options?.school === 'QC Pet Studies' || options?.school === 'QC Wellness Studies' || options?.school === 'Winghill Writing School') {
      return true;
    }
    // and the school is 'QC Makeup Academy' and the promo code is 'SAVE50' the course gets the multi-course discount
    if (options?.school === 'QC Makeup Academy' && options?.promoCode === 'SAVE50') {
      return true;
    }
  }

  // otherwise no multi-course discount
  return false;
};
