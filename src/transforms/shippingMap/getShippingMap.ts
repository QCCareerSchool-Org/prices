import { calculatePlans } from '../../calculatePlans';
import { CourseResult, NoShipping, Plan, PriceQueryOptions } from '../../types';

/**
 * Maps a CourseResult to another CourseResult with the shippingDiscount applied as needed
 * @param noShipping whether we're allowed to have shipping or not and whether it is applied
 * @param options the options sent with the price request
 */
export const getShippingMap = (noShipping: NoShipping) => (courseResult: CourseResult): CourseResult => {
  // skip free courses
  if (courseResult.free) {
    return courseResult;
  }

  // skip we're still shipping physical materials
  if (noShipping === 'FORBIDDEN' || noShipping === 'ALLOWED') {
    return courseResult;
  }

  // subtract all the discounts we have so far (use `shipping` instead of `shippingDiscount`) from the cost to determine the lowest possible price we might display (before payment-plan discounts)
  const minimumPrice = parseFloat(Big(courseResult.cost).minus(courseResult.shipping).minus(courseResult.multiCourseDiscount).minus(courseResult.promoDiscount).toFixed(2));

  const shippingDiscount = Math.min(minimumPrice, courseResult.shipping);

  const discountedCost = parseFloat(Big(courseResult.cost).minus(shippingDiscount).minus(courseResult.multiCourseDiscount).minus(courseResult.promoDiscount).toFixed(2));

  const [ full, part ] = calculatePlans(courseResult.plans, minimumPrice);

  return {
    ...courseResult,
    shippingDiscount,
    discountedCost,
    plans: { full, part },
    shipping: shippingDiscount, // in case we had to reduce the shipping discount due to minimum price, we should adjust the potential shipping discount as well
  };
};
