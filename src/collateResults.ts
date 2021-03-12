import Big from 'big.js';

import { sumBigArray } from './lib/sumBigArray';
import { CourseResult, Currency, PriceResult, NoShipping } from './types';

/**
 * Creates the final response by combining the values from each course
 *
 * @param countryCode
 * @param provinceCode
 * @param currency
 * @param courseResults
 * @param disclaimers
 * @param notes
 * @param noShipping
 * @param noShippingMessage
 */
 export const collateResults = (
  countryCode: string,
  provinceCode: string | null,
  currency: Currency,
  courseResults: CourseResult[],
  disclaimers: string[],
  notes: string[],
  noShipping: NoShipping,
  noShippingMessage?: string
): PriceResult => ({
  countryCode,
  provinceCode: provinceCode ?? undefined,
  currency,
  cost: parseFloat(courseResults.map(p => Big(p.cost)).reduce(sumBigArray, Big(0)).toFixed(2)),
  multiCourseDiscount: parseFloat(courseResults.map(c => Big(c.multiCourseDiscount)).reduce(sumBigArray, Big(0)).toFixed(2)),
  promoDiscount: parseFloat(courseResults.map(c => Big(c.promoDiscount)).reduce(sumBigArray, Big(0)).toFixed(2)),
  shippingDiscount: parseFloat(courseResults.map(c => Big(c.shippingDiscount)).reduce(sumBigArray, Big(0)).toFixed(2)),
  discountedCost: parseFloat(courseResults.map(c => Big(c.discountedCost)).reduce(sumBigArray, Big(0)).toFixed(2)),
  plans: {
    full: {
      discount: parseFloat(courseResults.map(c => Big(c.plans.full.discount)).reduce(sumBigArray, Big(0)).toFixed(2)),
      deposit: parseFloat(courseResults.map(c => Big(c.plans.full.deposit)).reduce(sumBigArray, Big(0)).toFixed(2)),
      installmentSize: parseFloat(courseResults.map(c => Big(c.plans.full.installmentSize)).reduce(sumBigArray, Big(0)).toFixed(2)),
      installments: 0,
      remainder: parseFloat(courseResults.map(c => Big(c.plans.full.remainder)).reduce(sumBigArray, Big(0)).toFixed(2)),
      total: parseFloat(courseResults.map(c => Big(c.plans.full.total)).reduce(sumBigArray, Big(0)).toFixed(2)),
      originalDeposit: parseFloat(courseResults.map(c => Big(c.plans.full.originalDeposit)).reduce(sumBigArray, Big(0)).toFixed(2)),
      originalInstallments: 0,
    },
    part: {
      discount: parseFloat(courseResults.map(c => Big(c.plans.part.discount)).reduce(sumBigArray, Big(0)).toFixed(2)),
      deposit: parseFloat(courseResults.map(c => Big(c.plans.part.deposit)).reduce(sumBigArray, Big(0)).toFixed(2)),
      installmentSize: parseFloat(courseResults.map(c => Big(c.plans.part.installmentSize)).reduce(sumBigArray, Big(0)).toFixed(2)),
      installments: courseResults.length ? courseResults[0].plans.part.installments : 0,
      remainder: parseFloat(courseResults.map(c => Big(c.plans.part.remainder)).reduce(sumBigArray, Big(0)).toFixed(2)),
      total: parseFloat(courseResults.map(c => Big(c.plans.part.total)).reduce(sumBigArray, Big(0)).toFixed(2)),
      originalDeposit: parseFloat(courseResults.map(c => Big(c.plans.part.originalDeposit)).reduce(sumBigArray, Big(0)).toFixed(2)),
      originalInstallments: courseResults.length ? courseResults[0].plans.part.originalInstallments : 0,
    },
  },
  shipping: parseFloat(courseResults.map(c => Big(c.shipping)).reduce(sumBigArray, Big(0)).toFixed(2)),
  disclaimers,
  notes,
  noShipping,
  noShippingMessage,
  courses: courseResults,
});
