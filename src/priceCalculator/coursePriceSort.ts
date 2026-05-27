import type { CoursePrice } from './coursePrice';

export const byCostAscending = (a: CoursePrice, b: CoursePrice): number => {
  return a.cost.eq(b.cost) ? b.order - a.order : a.cost.minus(b.cost).toNumber();
};

export const byFreeThenCostAscending = (a: CoursePrice, b: CoursePrice): number => {
  if (a.free === b.free) {
    if (a.cost.eq(b.cost)) {
      if (a.code === 'I2') {
        return 1;
      }
      if (b.code === 'I2') {
        return -1;
      }
    }
    return a.cost.eq(b.cost) ? b.order - a.order : a.cost.minus(b.cost).toNumber();
  }
  return a.free ? 1 : -1;
};

export const byFreeThenCostDescending = (a: CoursePrice, b: CoursePrice): number => {
  return a.free === b.free
    ? (a.cost.eq(b.cost) ? a.order - b.order : b.cost.minus(a.cost).toNumber())
    : a.free ? 1 : -1;
};

/**
 * Sort function for CourseResults
 *
 * Sorts by primary descending, then free ascending, then cost descending, then discounted cost descending
 * @param a the first course result
 * @param b the second course result
 */
export const finalSort = (a: CoursePrice, b: CoursePrice): number => {
  if (a.primary === b.primary) {
    if (a.free === b.free) {
      if (a.cost.eq(b.cost)) {
        if (a.discountedCost.eq(b.discountedCost)) {
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
