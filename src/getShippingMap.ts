import { CourseResult, NoShipping, PriceQueryOptions } from './types';

/**
 * Maps a CourseResult to another CourseResult with the shippingDiscount applied as needed
 * @param noShipping whether we're allowed to have shipping or not and whether it is applied
 * @param options the options sent with the price request
 */
export const getShippingMap = (noShipping: NoShipping, options?: PriceQueryOptions) => (courseResult: CourseResult): CourseResult => {
  if (noShipping === 'REQUIRED' || options?.noShipping && noShipping === 'APPLIED') {
    return { ...courseResult, shippingDiscount: courseResult.shipping };
  }
  return courseResult;
};
