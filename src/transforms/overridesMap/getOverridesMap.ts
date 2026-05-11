import Big from 'big.js';

import * as HttpStatus from '../../lib/http-status';
import type { CourseResult, MapFunction, PriceQueryOptions } from '../../types';

export const getOverridesMap = (courses: string[], depositOverrides: PriceQueryOptions['depositOverrides'], installmentsOverride: PriceQueryOptions['installmentsOverride'], somePartsMissing: boolean): MapFunction<CourseResult, CourseResult> => {
  if (somePartsMissing) {
    return (c: CourseResult) => c;
  }

  if (typeof depositOverrides !== 'undefined') {
    // ensure a deposit override exists for each course
    courses.forEach(course => {
      if (typeof depositOverrides[course] === 'undefined') {
        throw new HttpStatus.BadRequest(`invalid depositOverride: no key for ${course}`);
      }
    });
    // ensure there are no missing deposit overrides
    if (Object.keys(depositOverrides).length !== courses.length) {
      throw new HttpStatus.BadRequest(`invalid depositOverride: expected ${courses.length} keys`);
    }
  }

  if (typeof installmentsOverride !== 'undefined') {
    if (installmentsOverride < 1) {
      throw new HttpStatus.BadRequest('Invalid installmentsOverride: must be greater than or equal to 1');
    }
    if (installmentsOverride > 24) {
      throw new HttpStatus.BadRequest('Invalid installmentsOverride: must be less than 24');
    }
  }

  return (courseResult: CourseResult): CourseResult => {
    if (depositOverrides?.[courseResult.code] && installmentsOverride) {
      if (typeof courseResult.plans.part === 'undefined') {
        throw Error('Part plan undefined');
      }
      const deposit = depositOverrides[courseResult.code] ?? 0;
      const installments = Math.round(installmentsOverride);
      const installmentSize = parseFloat(Big(courseResult.discountedCost).minus(courseResult.plans.part.discount).minus(deposit).div(installments).round(2, 0).toFixed(2)); // always round down so that the actual price will never be more than the quoted price
      const remainder = parseFloat(Big(courseResult.discountedCost).minus(courseResult.plans.part.discount).minus(deposit).minus(Big(installmentSize).times(installments)).toFixed(2));
      return {
        ...courseResult,
        plans: {
          ...courseResult.plans,
          part: {
            ...courseResult.plans.part,
            deposit,
            installments,
            installmentSize,
            remainder,
          },
        },
      };
    }

    return courseResult;
  };
};
