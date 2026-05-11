import type { CoursePrice } from '@/domain/price';

/**
 * Sort function for CourseResults
 *
 * Sorts by primary descending, then free ascending, then cost descending, then discounted cost descending
 * @param a the first course result
 * @param b the second course result
 */
export const courseSort = (a: CoursePrice, b: CoursePrice): number => {
  if (a.primary === b.primary) {
    if (a.free === b.free) {
      if (a.cost === b.cost) {
        if (a.discountedCost === b.discountedCost) {
          return b.order - a.order;
        }
        return b.discountedCost - a.discountedCost;
      }
      return b.cost - a.cost;
    }
    return a.free ? 1 : -1;
  }
  return a.primary ? -1 : 1;
};
