import HttpStatus from '@qccareerschool/http-status';
import Big from 'big.js';

import { CourseResult, CurrencyCode, MapFunction, PriceQueryOptions } from './types';
import { validateDiscounts } from './validateDiscounts';

/**
 * Creates a map function that adds the multiCourseDiscount and promoDiscount to CourseResults
 *
 * @param currencyCode the currency we're displaying prices in
 * @param options the PriceQueryOptions
 */
export const getDiscountsMap = (currencyCode: CurrencyCode, options?: PriceQueryOptions): MapFunction<CourseResult, CourseResult> => {
  // validate promotional discounts
  if (!validateDiscounts(options)) {
    throw new HttpStatus.BadRequest('invalid discount signature');
  }

  let extraDiscount = options?.discount ? options.discount[currencyCode] ?? options.discount.default : 0;

  return (courseResult: CourseResult, index: number) => {
    // when discountAll is true all courses get the multi-course discount
    // otherwise, when the promoCode is 'BOGO' all courses after the first get the multi-course discount
    const multiCourseDiscount = options?.discountAll || options?.promoCode === 'BOGO' && index > 0 ? parseFloat(Big(courseResult.cost).times(courseResult.multiCourseDiscountRate).toFixed(2)) : 0;

    // the initial promoDiscount ($50/£25 for students)
    let promoDiscount = options?.studentDiscount ? currencyCode === 'GBP' ? 25 : 50 : 0;

    // the highest additional promotional discount we can apply without causing the price of the course to go negative (considers the payment plan discounts as well)
    // it's possible that we'd reduce the price of the course to less than the deposit for the part-payment plan; in that case the deposit will be reduced
    const maximumAdditionalPromoDiscount = parseFloat(Big(courseResult.cost).minus(courseResult.shippingDiscount).minus(multiCourseDiscount).minus(promoDiscount).minus(Math.max(courseResult.plans.full.discount, courseResult.plans.part.discount)).toFixed(2));

    // the amount of extra discount we will add to this course
    const additionalPromoDiscount = Math.min(extraDiscount, maximumAdditionalPromoDiscount);

    // keep track of the extra discount that we have applied
    extraDiscount = parseFloat(Big(extraDiscount).minus(additionalPromoDiscount).toFixed(2));

    // the new promoDiscount for this course
    promoDiscount = parseFloat(Big(promoDiscount).plus(additionalPromoDiscount).toFixed(2));

    // the new discountedCost
    const discountedCost = parseFloat(Big(courseResult.cost).minus(courseResult.shippingDiscount).minus(multiCourseDiscount).minus(promoDiscount).toFixed(2));

    // the new full plan discount (we set this to zero if there's a multi-course discount applied)
    const discount = multiCourseDiscount ? 0 : courseResult.plans.full.discount;

    // the new full plan total
    const fullTotal = parseFloat(Big(discountedCost).minus(discount).toFixed(2));

    // the new part plan deposit
    const deposit = Math.min(courseResult.plans.part.deposit, discountedCost);

    // the new part plan installmentSize
    const installmentSize = parseFloat(Big(discountedCost).minus(deposit).div(courseResult.plans.part.installments).round(2, 0).toFixed(2));

    // the new pat plan remainder
    const remainder = parseFloat(Big(discountedCost).minus(deposit).minus(Big(installmentSize).times(courseResult.plans.part.installments)).toFixed(2));
    return {
      ...courseResult,
      multiCourseDiscount,
      promoDiscount,
      discountedCost,
      plans: {
        ...courseResult.plans,
        full: {
          ...courseResult.plans.full,
          discount,
          total: fullTotal,
          deposit: fullTotal,
          originalDeposit: fullTotal,
        },
        part: {
          ...courseResult.plans.part,
          deposit,
          total: discountedCost,
          installmentSize,
          originalDeposit: deposit,
          remainder,
        },
      },
    };
  };
};
