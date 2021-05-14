import Big from 'big.js';

import { calculatePlans } from '../../calculatePlans';
import { isDesignCourse, isMakeupAdvancedCourse } from '../../courses';
import { PromoCodeSpec, promoCodeSpecs, specApplies, studentSupport50Specs } from '../../promoCodes';
import { CourseResult, MapFunction, PriceQueryOptions } from '../../types';

export const getPromoCodeDiscountsMap = (now: Date, options?: PriceQueryOptions): MapFunction<CourseResult, CourseResult> => {
  const applies = (spec?: PromoCodeSpec): boolean => typeof spec !== 'undefined' && specApplies(spec, now, options?.discountAll, options?.promoCode, options?.school);

  const advanced100Applies = applies(promoCodeSpecs.find(v => v.code === 'ADVANCED100'));
  const spring100Applies = applies(promoCodeSpecs.find(v => v.code === 'SPRING100'));
  let advanced100Used = false;
  let spring100Used = false;

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

    if (spring100Applies && spring100Used === false && isDesignCourse(courseResult.code)) {
      // we can only use this promotion once
      spring100Used = true;

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

    return courseResult;
  };
};
