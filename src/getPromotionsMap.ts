import { isDesignCourse, isEventAdvancedCourse, isEventFoundationCourse } from './prices';
import { CourseResult, MapFunction, PriceQueryOptions } from './types';

export const getPromotionsMap = (now: Date, options?: PriceQueryOptions): MapFunction<CourseResult, CourseResult> => {
  let conditionSatisfied = false;
  let complete = false;

  const student = options?.discountAll ?? false;

  return (courseResult: CourseResult, index: number, array: CourseResult[]): CourseResult => {
    if (complete) {
      return courseResult;
    }

    // design -- buy any design course and get a second one free
    if (options?.promoCode === 'design' && !student) {
      if (conditionSatisfied && isDesignCourse(courseResult.code)) {
        complete = true;
        return { ...courseResult, free: true };
      }
      if (isDesignCourse(courseResult.code)) {
        conditionSatisfied = true;
      }
    }

    // // design (existing students) -- get VD free when you buy any other event course
    // if (options?.promoCode === 'design' && student) {
    //   if (courseResult.code === 'VD' && array?.some(c => isDesignCourse(c.code, [ 'VD' ]))) {
    //     return { ...courseResult, free: true };
    //   }
    // }

    // event -- buy any foundation course and get one advanced or specialty courses free
    if (options?.promoCode === 'event' && !student) {
      if (conditionSatisfied && isEventAdvancedCourse(courseResult.code)) {
        complete = true;
        return { ...courseResult, free: true };
      }
      if (isEventFoundationCourse(courseResult.code)) {
        conditionSatisfied = true;
      }
    }

    // // event (existing students) -- get VE free when you buy any other event course
    // if (options?.promoCode === 'design' && student) {
    //   if (courseResult.code === 'VE' && array?.some(c => isEventCourse(c.code, [ 'VE' ]))) {
    //     return { ...courseResult, free: true };
    //   }
    // }

    // makeup

    return courseResult;
  };
};
