import Big from 'big.js';

import { CourseResult } from './types';

/**
 * Map function that sets the first CourseResult's `primary` value to `true` and ajusts other CourseResults'
 * `plans.part.installments`, `plans.part.installmentSize`, and `plans.part.remainder` accordingly to line
 * up with the first CourseResult
 *
 * @param c the CourseResult
 * @param i the index
 * @param a the array of CourseResults
 */
export const primaryMap = (c: CourseResult, i: number, a: CourseResult[]): CourseResult => {
  if (i === 0) {
    return { ...c, primary: true };
  } else {
    const installments = a[0].plans.part.installments;
    const installmentSize = parseFloat(Big(c.discountedCost).minus(c.plans.part.deposit).div(installments).round(2, 0).toFixed(2));
    const remainder = parseFloat(Big(c.discountedCost).minus(c.plans.part.deposit).minus(Big(installmentSize).times(installments)).toFixed(2));
    return {
      ...c,
      plans: {
        ...c.plans,
        part: {
          ...c.plans.part,
          installments,
          installmentSize,
          remainder,
          originalInstallments: installments,
        },
      },
    };
  }
};
