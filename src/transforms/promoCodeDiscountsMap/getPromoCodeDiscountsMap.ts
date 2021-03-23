import Big from 'big.js';

import { calculatePlans } from '../../calculatePlans';
import { isMakeupAdvancedCourse } from '../../courses';
import { promoCodeApplies, PromoCodeSpec, promoCodeSpecs, studentSupport50Specs } from '../../promoCodes';
import { CourseResult, MapFunction, PriceQueryOptions } from '../../types';

export const getPromoCodeDiscountsMap = (now: Date, options?: PriceQueryOptions): MapFunction<CourseResult, CourseResult> => {
  const student = options?.discountAll ?? false;

  const applies = (spec?: PromoCodeSpec) => spec && promoCodeApplies(spec, now, student, options?.promoCode, options?.school);

  const advanced100Applies = applies(promoCodeSpecs.find(v => v.code === 'ADVANCED100'));
  let advanced100Used = false;

  const studentSupport50Applies = studentSupport50Specs.some(applies);

  return (courseResult: CourseResult): CourseResult => {

    if (advanced100Applies && advanced100Used === false && isMakeupAdvancedCourse(courseResult.code)) {
      // we can only use this promotion once
      advanced100Used = true;

      // subtract all the discounts we have so far (use `shipping` instead of `shippingDiscount`) from the cost to determine the lowest possible price we might display (before payment-plan discounts)
      const minimumPrice = parseFloat(Big(courseResult.cost).minus(courseResult.shipping).minus(courseResult.multiCourseDiscount).minus(courseResult.promoDiscount).toFixed(2));

      const extraDiscount = Math.min(minimumPrice, 100);

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

    return courseResult;
  };
};
