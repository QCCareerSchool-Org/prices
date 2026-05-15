import type { CoursePricingState } from './CoursePricingState';
import type { PromoCodes } from './PromoCodes';

type SortFunction<T> = (a: T, b: T) => number;

export const getDefaultCourseSort = (promoCodes: PromoCodes): SortFunction<CoursePricingState> => {
  if (promoCodes.code === 'MASTERCLASS') {
    return (a, b) => {
      if (a.free === b.free) {
        if (a.cost.eq(b.cost)) {
          if (a.code === 'I2') {
            return 1;
          }
          if (b.code === 'I2') {
            return -1;
          }
        }
        return a.cost.minus(b.cost).toNumber();
      }
      return a.free ? 1 : -1;
    };
  }

  return (a, b) => (a.free === b.free ? a.cost.minus(b.cost).toNumber() : a.free ? 1 : -1);
};

/**
 * Sort function for CourseResults
 *
 * Sorts by primary descending, then free ascending, then cost descending, then discounted cost descending
 * @param a the first course result
 * @param b the second course result
 */
export const courseSort = (a: CoursePricingState, b: CoursePricingState): number => {
  if (a.primary === b.primary) {
    if (a.free === b.free) {
      if (a.cost === b.cost) {
        if (a.discountedCost === b.discountedCost) {
          return b.order - a.order;
        }
        return b.discountedCost.minus(a.discountedCost).toNumber();
      }
      return b.cost.minus(a.cost).toNumber();
    }
    return a.free ? 1 : -1;
  }
  return a.primary ? -1 : 1;
};

export const byCostAscending = (a: CoursePricingState, b: CoursePricingState): number => (
  a.cost === b.cost ? b.order - a.order : a.cost.minus(b.cost).toNumber()
);

export const byFreeThenCostDescending = (a: CoursePricingState, b: CoursePricingState): number => (
  a.free === b.free
    ? (a.cost === b.cost ? a.order - b.order : b.cost.minus(a.cost).toNumber())
    : a.free ? 1 : -1
);
