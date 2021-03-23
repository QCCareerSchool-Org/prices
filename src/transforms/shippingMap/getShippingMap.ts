import Big from 'big.js';

import { calculatePlans } from '../../calculatePlans';
import { CourseResult, NoShipping } from '../../types';

/**
 * Maps a course tesult to another course result with the shipping discount applied as needed
 *
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

  // unlike other discounts, we don't have to make sure this one is less than the minimum price
  const shippingDiscount = courseResult.shipping;

  const discountedCost = parseFloat(Big(courseResult.cost).minus(shippingDiscount).minus(courseResult.multiCourseDiscount).minus(courseResult.promoDiscount).toFixed(2));

  const [ full, part ] = calculatePlans(courseResult.plans, discountedCost);

  return {
    ...courseResult,
    shippingDiscount,
    discountedCost,
    plans: { full, part },
  };
};
