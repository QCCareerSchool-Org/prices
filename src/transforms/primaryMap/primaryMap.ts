import Big from 'big.js';
import { logger } from '../../logger';

import { CourseResult } from '../../types';

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
  try {
    if (i === 0) {
      return { ...c, primary: true };
    }
    const partInstallments = a[0].plans.part.installments;
    const partInstallmentSize = parseFloat(Big(c.discountedCost).minus(c.plans.part.deposit).div(partInstallments).round(2, 0).toFixed(2));
    const partRemainder = parseFloat(Big(c.discountedCost).minus(c.plans.part.deposit).minus(Big(partInstallmentSize).times(partInstallments)).toFixed(2));
    return {
      ...c,
      plans: {
        ...c.plans,
        part: {
          ...c.plans.part,
          installments: partInstallments,
          installmentSize: partInstallmentSize,
          remainder: partRemainder,
          originalInstallments: partInstallments,
        },
      },
    };
  } catch (err) {
    logger.error('Erorr in primaryMap', err, a);
    throw err;
  }
};
