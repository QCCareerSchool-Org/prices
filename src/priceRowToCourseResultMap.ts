import Big from 'big.js';

import { CourseResult, PriceRow } from './types';

/**
 * Function that maps a PriceRow to a CourseResult
 * Doesn't add any discounts or promotions
 *
 * @param p the PriceRow
 * @return a CourseResult
 */
export const priceRowToCourseResultMap = (p: PriceRow): CourseResult => {
  const cost = parseFloat(Big(p.cost).toFixed(2));

  const discount = parseFloat(Big(p.discount).toFixed(2));

  const deposit = parseFloat(Big(p.deposit).toFixed(2));
  const fullTotal = parseFloat(Big(cost).minus(discount).toFixed(2));

  const installments = Math.round(p.installments);
  const partInstallmentSize = parseFloat(Big(cost).minus(deposit).div(installments).round(2, 0).toFixed(2)); // always round down so that the actual price will never be more than the quoted price
  const partRemainder = parseFloat(Big(cost).minus(deposit).minus(Big(partInstallmentSize).times(installments)).toFixed(2));
  return {
    code: p.courseCode,
    name: p.courseName,
    primary: false,
    cost,
    multiCourseDiscountRate: p.multiCourseDiscountRate,
    multiCourseDiscount: 0,
    promoDiscount: 0,
    shippingDiscount: 0,
    discountedCost: cost,
    plans: {
      full: {
        discount: discount,
        deposit: fullTotal,
        installmentSize: 0,
        installments: 0,
        remainder: 0,
        total: fullTotal,
        originalDeposit: fullTotal,
        originalInstallments: 0,
      },
      part: {
        discount: 0,
        deposit,
        installmentSize: partInstallmentSize,
        installments,
        remainder: partRemainder,
        total: cost,
        originalDeposit: deposit,
        originalInstallments: installments,
      },
    },
    shipping: parseFloat(Big(p.shipping).toFixed(2)),
    free: false,
    discountMessage: null,
  };
};
