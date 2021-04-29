import Big from 'big.js';

import { calculatePlans } from '../../calculatePlans';
import { promoCodeApplies, PromoCodeSpec, promoCodeSpecs } from '../../promoCodes';
import { CourseResult, MapFunction, PriceQueryOptions } from '../../types';
import { shouldGetMultiCourseDiscount } from './shouldGetMultiCourseDiscount';

/**
 * Creates a map function that adds the multi-course discount to course results
 *
 * @param options the PriceQueryOptions
 */
export const getMultiCourseDiscountMap = (now: Date, options?: PriceQueryOptions): MapFunction<CourseResult, CourseResult> => {
  const student = options?.discountAll ?? false;

  const applies = (spec?: PromoCodeSpec) => spec && promoCodeApplies(spec, now, student, options?.promoCode, options?.school);

  const skincare60Applies = applies(promoCodeSpecs.find(v => v.code === 'SKINCARE60'));
  const nathansDayApplies = applies(promoCodeSpecs.find(v => v.code === 'NATHANSDAY'));

  return (courseResult: CourseResult, index: number, array: CourseResult[]) => {
    // skip free courses
    if (courseResult.free) {
      return courseResult;
    }

    // skip courses that shouldn't get the multi-course discount
    if (!(nathansDayApplies && index > 0) && !(skincare60Applies && index > 0 && courseResult.code === 'SK' && array.find(c => c.code === 'MZ')) && !shouldGetMultiCourseDiscount(now, index, options)) {
      return courseResult;
    }

    // subtract all the discounts we have so far (use `shipping` instead of `shippingDiscount`) from the cost to determine the lowest possible price we might display (before payment-plan discounts)
    const minimumPrice = parseFloat(Big(courseResult.cost).minus(courseResult.shipping).minus(courseResult.multiCourseDiscount).minus(courseResult.promoDiscount).toFixed(2));

    // the amount we'd like to give
    const desiredMultiCourseDiscount = skincare60Applies && courseResult.code === 'SK' && array.find(c => c.code === 'MZ')
      ? parseFloat(Big(courseResult.cost).times(0.6).toFixed(2))
      : parseFloat(Big(courseResult.cost).times(courseResult.multiCourseDiscountRate).toFixed(2));

    // the true amount we'll give
    const multiCourseDiscount = Math.min(minimumPrice, desiredMultiCourseDiscount);

    const discountedCost = parseFloat(Big(courseResult.cost).minus(courseResult.shippingDiscount).minus(multiCourseDiscount).minus(courseResult.promoDiscount).toFixed(2));

    const [ full, part ] = calculatePlans(courseResult.plans, discountedCost, true);

    return {
      ...courseResult,
      multiCourseDiscount,
      discountedCost,
      discountMessage: multiCourseDiscount === desiredMultiCourseDiscount ? null : `${Math.round(multiCourseDiscount / courseResult.cost * 100)}% Discount`, // override the discount message if we gave a different discount
      plans: { full, part },
    };
  };
};
