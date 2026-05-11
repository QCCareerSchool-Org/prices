import Big from 'big.js';

import type { CoursePrice } from '@/domain/price';
import type { RawPrice } from '@/domain/rawPrice';

export const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max);

/**
 * Function that maps a PriceRow to a CoursePrice
 * Doesn't add any discounts or promotions
 *
 * @param p the PriceRow
 * @return a CoursePrice
 */
export const getPriceRowToCoursePriceMap = (student?: boolean) => (p: RawPrice): CoursePrice => {
  const cost = parseFloat(Math.max(0, p.cost).toFixed(2)); // the cost can't be negative

  const shipping = clamp(parseFloat(p.shipping.toFixed(2)), 0, cost); // potential shipping savings can't be negative and can't be greater than cost

  const minimumPrice = parseFloat(Big(cost).minus(shipping).toFixed(2));

  const multiCourseDiscountRate = clamp(parseFloat(p.multiCourseDiscountRate.toFixed(2)), 0, 1); // two decimal places, must be between 0 and 1, inclusive

  const fullDiscount = clamp(parseFloat(p.discount.toFixed(2)), 0, minimumPrice); // the discount can't be greater than the minimum price and can't be negative

  const fullTotal = parseFloat(Big(cost).minus(fullDiscount).toFixed(2));

  const partDiscount = clamp(parseFloat(p.partDiscount.toFixed(2)), 0, minimumPrice);

  const partTotal = parseFloat(Big(cost).minus(partDiscount).toFixed(2));

  const partDeposit = clamp(parseFloat(p.deposit.toFixed(2)), 0, partTotal); // the deposit can't be greater than the cost and can't be negative

  const partInstallments = p.installments ? Math.round(student ? p.installments / 2 : p.installments) : 1; // the number of installments must be at least 1 and must be a whole number

  const partInstallmentSize = p.installments ? parseFloat(Big(partTotal).minus(partDeposit).div(partInstallments).round(2, 0).toFixed(2)) : 0; // always round down so that the actual price will never be more than the quoted price

  const partRemainder = p.installments ? parseFloat(Big(partTotal).minus(partDeposit).minus(Big(partInstallmentSize).times(partInstallments)).toFixed(2)) : undefined;

  return {
    code: p.courseCode,
    name: p.courseName,
    primary: false,
    cost,
    multiCourseDiscountRate,
    multiCourseDiscount: 0,
    promoDiscount: 0,
    shippingDiscount: 0,
    discountedCost: cost,
    order: p.order,
    plans: {
      full: {
        discount: fullDiscount,
        deposit: fullTotal,
        installmentSize: 0,
        installments: 0,
        remainder: 0,
        total: fullTotal,
        originalDeposit: fullTotal,
        originalInstallments: 0,
      },
      part: partInstallments
        ? {
          discount: partDiscount,
          deposit: partDeposit,
          installmentSize: partInstallmentSize,
          installments: partInstallments,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          remainder: partRemainder!,
          total: partTotal,
          originalDeposit: partDeposit,
          originalInstallments: partInstallments,
        }
        : undefined,
    },
    shipping,
    free: false,
    discountMessage: null,
  };
};
