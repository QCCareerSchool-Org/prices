import { isDesignCourse } from '../../courses';
import { CourseResult, MapFunction, PriceQueryOptions } from '../../types';

export const getDefaultFreeCourseMap = (now: Date, options?: PriceQueryOptions): MapFunction<CourseResult, CourseResult> => {
  let freeDesignCount = 0;

  const student = options?.discountAll ?? false;

  return (courseResult: CourseResult, index: number, array: CourseResult[]): CourseResult => {

    // design -- buy any design course and get a second one free
    if (options?.school === 'QC Design School' && !student) {
      if (freeDesignCount < 1 && isDesignCourse(courseResult.code) && array.filter(c => isDesignCourse(c.code)).length >= 2) {
        freeDesignCount++;
        return freeMap(courseResult);
      }
    }

    // event -- buy EP and get LW and DW free
    if (options?.school === 'QC Event School' && !student) {
      if ((courseResult.code === 'DW' || courseResult.code === 'LW') && array.some(c => c.code === 'EP')) {
        return freeMap(courseResult);
      }
    }

    // pet -- buy DG and get FA free
    if (options?.school === 'QC Pet Studies' && !student) {
      if (courseResult.code === 'FA' && array.some(c => c.code === 'DG')) {
        return freeMap(courseResult);
      }
    }

     // makeup -- buy MZ and get MW free
     if (options?.school === 'QC Makeup Academy' && !student) {
      if (courseResult.code === 'MW' && array.some(c => c.code === 'MZ')) {
        return freeMap(courseResult);
      }
    }

    return courseResult;
  };
};

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
