import Big from 'big.js';

import { studentDiscountAmount } from './studentDiscountAmount';
import { calculatePlans } from '../../calculatePlans';
import type { CurrencyCode } from '../../domain/currencyCode';
import type { MapFunction } from '../../domain/mapFunction';
import type { PriceOptions } from '../../domain/priceOptions';
import type { CoursePrice } from '@/domain/price';

/**
 * Creates a map function that adds the student promo discount to course results
 *
 * @param currencyCode the currency we're displaying prices in
 * @param options the PriceQueryOptions
 */
export const getStudentDiscountMap = (currencyCode: CurrencyCode, options?: PriceOptions): MapFunction<CoursePrice, CoursePrice> => {

  return (courseResult: CoursePrice) => {
    // skip free courses
    if (courseResult.free) {
      return courseResult;
    }

    // skip courses when options.studentDiscount is not true
    if (options?.studentDiscount !== true) {
      return courseResult;
    }

    // subtract all the discounts we have so far (use `shipping` instead of `shippingDiscount`) from the cost to determine the lowest possible price we might display (before payment-plan discounts)
    const minimumPrice = parseFloat(Big(courseResult.cost).minus(courseResult.shipping).minus(courseResult.multiCourseDiscount).minus(courseResult.promoDiscount).toFixed(2));

    const studentDiscount = Math.min(minimumPrice, studentDiscountAmount(currencyCode));

    // for all promo discounts, add to the existing promo discount value rather than overwriting it
    const promoDiscount = parseFloat(Big(courseResult.promoDiscount).plus(studentDiscount).toFixed(2));

    const discountedCost = parseFloat(Big(courseResult.cost).minus(courseResult.shippingDiscount).minus(courseResult.multiCourseDiscount).minus(promoDiscount).toFixed(2));

    const [ full, part ] = calculatePlans(courseResult.plans, discountedCost);

    return {
      ...courseResult,
      promoDiscount,
      discountedCost,
      plans: { full, part },
    };
  };
};
