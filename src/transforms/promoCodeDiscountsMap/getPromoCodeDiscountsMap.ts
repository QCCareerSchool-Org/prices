import Big from 'big.js';

import { calculatePlans } from '../../calculatePlans';
import { PromoCodeSpec, specApplies, studentSupport150Specs, studentSupport50Specs } from '../../promoCodes';
import { CourseResult, MapFunction, PriceQueryOptions } from '../../types';

export const getPromoCodeDiscountsMap = (now: Date, currencyCode: string, options?: PriceQueryOptions): MapFunction<CourseResult, CourseResult> => {
  const applies = (spec?: PromoCodeSpec): boolean => typeof spec !== 'undefined' && specApplies(spec, now, options?.discountAll, options?.promoCode, options?.school);

  const studentSupport50Applies = studentSupport50Specs.some(applies);
  const studentSupport150Applies = studentSupport150Specs.some(applies);

  return (courseResult: CourseResult): CourseResult => {
    if (studentSupport50Applies) {
      // subtract all the discounts we have so far (use `shipping` instead of `shippingDiscount`) from the cost to determine the lowest possible price we might display (before payment-plan discounts)
      const minimumPrice = parseFloat(Big(courseResult.cost).minus(courseResult.shipping).minus(courseResult.multiCourseDiscount).minus(courseResult.promoDiscount).toFixed(2));
      const extraDiscount = Math.min(minimumPrice, 50);
      // for all promo discounts, add to the existing promo discount value rather than overwriting it
      const promoDiscount = parseFloat(Big(courseResult.promoDiscount).plus(extraDiscount).toFixed(2));
      const discountedCost = parseFloat(Big(courseResult.cost).minus(courseResult.shippingDiscount).minus(courseResult.multiCourseDiscount).minus(promoDiscount).toFixed(2));
      const [ full, part ] = calculatePlans(courseResult.plans, discountedCost);
      return {
        ...courseResult,
        promoDiscount,
        discountedCost,
        plans: { full, part },
      };
    }

    if (studentSupport150Applies) {
      // subtract all the discounts we have so far (use `shipping` instead of `shippingDiscount`) from the cost to determine the lowest possible price we might display (before payment-plan discounts)
      const minimumPrice = parseFloat(Big(courseResult.cost).minus(courseResult.shipping).minus(courseResult.multiCourseDiscount).minus(courseResult.promoDiscount).toFixed(2));
      const extraDiscount = Math.min(minimumPrice, 150);
      // for all promo discounts, add to the existing promo discount value rather than overwriting it
      const promoDiscount = parseFloat(Big(courseResult.promoDiscount).plus(extraDiscount).toFixed(2));
      const discountedCost = parseFloat(Big(courseResult.cost).minus(courseResult.shippingDiscount).minus(courseResult.multiCourseDiscount).minus(promoDiscount).toFixed(2));
      const [ full, part ] = calculatePlans(courseResult.plans, discountedCost);
      return {
        ...courseResult,
        promoDiscount,
        discountedCost,
        plans: { full, part },
      };
    }

    return courseResult;
  };
};
