import { CourseResult, MapFunction, PriceQueryOptions } from '../../types';

const makeupCourses = [ 'MM', 'MA', 'MZ', 'MK', 'SF', 'HS', 'AB', 'MW', 'PW', 'GB', 'SK', 'PA', 'PF', 'VM' ];
const designCourses = [ 'I2', 'ST', 'PO', 'FS', 'CC', 'AP', 'DB', 'MS', 'VD', 'FD' ];
const eventCourses = [ 'EP', 'CP', 'CE', 'WP', 'FD', 'ED', 'EB', 'LW', 'DW', 'FL', 'PE', 'TT', 'TG', 'VE' ];

export const isMakeupCourse = (course: string, exclude?: string[]): boolean => {
  return makeupCourses.filter(c => !exclude?.includes(c)).includes(course);
};

export const isDesignCourse = (course: string, exclude?: string[]): boolean => {
  return designCourses.filter(c => !exclude?.includes(c)).includes(course);
};

export const isEventCourse = (course: string, exclude?: string[]): boolean => {
  return eventCourses.filter(c => !exclude?.includes(c)).includes(course);
};

export const isEventFoundationCourse = (course: string): boolean => {
  return [ 'EP', 'CP', 'CE', 'WP', 'FD' ].includes(course);
};

export const isEventAdvancedCourse = (course: string): boolean => {
  return [ 'ED', 'EB', 'LW', 'DW', 'FL', 'PE', 'TT', 'TG', 'VE' ].includes(course);
};

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

    // event -- buy any foundation course and get one advanced or specialty courses free
    if (options?.school === 'QC Event School' && !student) {
      if ((courseResult.code === 'DW' || courseResult.code === 'LW') && array.some(c => c.code === 'EP')) {
        return freeMap(courseResult);
      }
    }

    return courseResult;
  };
};

export const freeMap = (courseResult: CourseResult): CourseResult => ({
  ...courseResult,
  free: true,
  cost: 0,
  multiCourseDiscountRate: 0,
  multiCourseDiscount: 0,
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
