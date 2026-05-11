import Big from 'big.js';

import type { CourseResult } from '../../types';

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

    if (typeof c.plans.part === 'undefined' || a.some(x => typeof x.plans.part === 'undefined')) {
      return {
        ...c,
        plans: {
          ...c.plans,
        },
      };
    }

    const first = a[0];
    if (typeof first === 'undefined') {
      throw Error('No element found');
    }

    if (typeof first.plans.part === 'undefined') {
      throw Error('Part plan undefined');
    }

    const partInstallments = first.plans.part.installments; // can't be undefined
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
    console.error('Erorr in primaryMap', a);
    throw err;
  }
};
