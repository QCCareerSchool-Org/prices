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

  // if this is the first course then no discount applies
  if (index === 0) {
    return false;
  }

  const applies = (spec?: PromoCodeSpec): boolean => typeof spec !== 'undefined' && specApplies(spec, now, options?.discountAll, options?.promoCode, options?.school);

  const save50Applies = applies(promoCodeSpecs.find(p => p.code === 'SAVE50'));

  // if the SAVE50 promo code applies the course gets the multi-course-discount
  if (save50Applies) {
    return true;
  }

  // if the school is 'QC Career School', 'QC Event School', etc. the course gets the multi-course discount
  if (options?.school === 'QC Career School' || options?.school === 'QC Event School' || options?.school === 'QC Pet Studies' || options?.school === 'QC Wellness Studies' || options?.school === 'Winghill Writing School') {
    return true;
  }

  // and the school is 'QC Design School' and the date is before May 17, 2021 at 09:00 the course gets the multi-course discount
  if (options?.school === 'QC Design School' && now.getTime() < Date.UTC(2021, 4, 17, 13)) {
    return true;
  }

  // and the school is 'QC Makeup Academy' and the date is before than March 29, 2021 at 09:00 the course gets the multi-course discount
  if (options?.school === 'QC Makeup Academy' && now.getTime() < Date.UTC(2021, 2, 29, 13)) {
    return true;
  }

  // otherwise no multi-course discount
  return false;
};
