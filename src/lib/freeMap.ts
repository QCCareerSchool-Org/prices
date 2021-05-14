import { CourseResult } from '../types';

export const freeMap = (courseResult: CourseResult): CourseResult => ({
  ...courseResult,
  free: true,
  multiCourseDiscountRate: 0,
  multiCourseDiscount: courseResult.cost,
  promoDiscount: 0,
  shippingDiscount: 0,
  discountedCost: 0,
  plans: {
    ...courseResult.plans,
    full: {
      discount: 0,
      deposit: 0,
      installmentSize: 0,
      installments: 0,
      remainder: 0,
      total: 0,
      originalDeposit: 0,
      originalInstallments: 0,
    },
    part: {
      discount: 0,
      deposit: 0,
      installmentSize: 0,
      installments: 0,
      remainder: 0,
      total: 0,
      originalDeposit: 0,
      originalInstallments: 0,
    },
  },
  shipping: 0,
});
