import { CourseResult, MapFunction } from '../../../types';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getDefaultFreeDesignExistingStudentMap = (now: Date): MapFunction<CourseResult, CourseResult> => {
  return courseResult => courseResult; // no promo
  // return (courseResult: CourseResult, index: number, array: CourseResult[]): CourseResult => {
  //   if (courseResult.code === 'VD' && array.some(c => isDesignCourse(c.code, [ 'VD' ]))) {
  //     return freeMap(courseResult);
  //   }
  //   return courseResult;
  // };
};
