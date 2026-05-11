import Big from 'big.js';

import { validateDiscounts } from './validateDiscounts';
import { calculatePlans } from '@/calculatePlans';
import type { CurrencyCode } from '@/domain/currencyCode';
import type { MapFunction } from '@/domain/mapFunction';
import type { CoursePrice } from '@/domain/price';
import type { PriceOptions } from '@/domain/priceQuery';
import * as HttpStatus from '@/lib/http-status';

/**
 * Creates a map function that adds the extra discount to course results
 * Because "extra discount" is not a per-course discount, it is spread amongst the courses in their sorted order. Therefore it should be applied after other promotional discounts
 *
 * @param currencyCode the currency we're displaying prices in
 * @param options the PriceQueryOptions
 */
export const getExtraDiscountMap = (currencyCode: CurrencyCode, options?: PriceOptions): MapFunction<CoursePrice, CoursePrice> => {
  // validate promotional discounts
  if (!validateDiscounts(options)) {
    throw new HttpStatus.BadRequest('invalid discount signature');
  }

  let remainingExtraDiscount = options?.discount ? options.discount[currencyCode] ?? options.discount.default : 0;

  return (courseResult: CoursePrice) => {
    // skip free courses
    if (courseResult.free) {
      return courseResult;
    }

    // skip courses if we have used up all the remaining extra discount
    if (remainingExtraDiscount <= 0) {
      return courseResult;
    }

    // subtract all the discounts we have so far (use `shipping` instead of `shippingDiscount`) from the cost to determine the lowest possible price we might display (before payment-plan discounts)
    const minimumPrice = parseFloat(Big(courseResult.cost).minus(courseResult.shipping).minus(courseResult.multiCourseDiscount).minus(courseResult.promoDiscount).toFixed(2));

    const extraDiscount = Math.min(minimumPrice, remainingExtraDiscount);

    // reduce the remaining extra discount we have left to give to other courses
    remainingExtraDiscount = parseFloat(Big(remainingExtraDiscount).minus(extraDiscount).toFixed(2));

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
  };
};
