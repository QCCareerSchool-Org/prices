import Big from 'big.js';

import { calculatePlans } from '../../calculatePlans';
import type { MapFunction } from '../../domain/mapFunction';
import type { PriceOptions } from '../../domain/priceOptions';
import type { CoursePrice } from '@/domain/price';

export const getToolsDiscountMap = (now: Date, currencyCode: string, options?: PriceOptions): MapFunction<CoursePrice, CoursePrice> => {
  const dgDiscountAmount = currencyCode === 'GBP' ? 150 : 200;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return (courseResult: CoursePrice, index: number, array: CoursePrice[]): CoursePrice => {
    // skip free courses
    if (courseResult.free) {
      return courseResult;
    }

    if (options?.withoutTools && courseResult.code === 'DG') {
      // subtract all the discounts we have so far (use `shipping` instead of `shippingDiscount`) from the cost to determine the lowest possible price we might display (before payment-plan discounts)
      const minimumPrice = parseFloat(Big(courseResult.cost).minus(courseResult.shipping).minus(courseResult.multiCourseDiscount).minus(courseResult.promoDiscount).toFixed(2));
      const extraDiscount = Math.min(minimumPrice, dgDiscountAmount);
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
