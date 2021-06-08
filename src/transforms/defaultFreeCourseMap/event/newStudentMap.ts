import { freeMap } from '../../../lib/freeMap';
import { CourseResult, MapFunction } from '../../../types';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getDefaultFreeEventNewStudentMap = (now: Date): MapFunction<CourseResult, CourseResult> => {
  if (now.getTime() >= Date.UTC(2021, 5, 9, 13)) { // after June 9, 2021 at 09:00 we use promo codes
    return courseResult => courseResult;
  }
  return (courseResult: CourseResult, index: number, array: CourseResult[]): CourseResult => {
    // buy a foundation course and get LW and DW free
    if ((courseResult.code === 'LW' || courseResult.code === 'DW') && array.some(c => c.code === 'EP')) {
      return freeMap(courseResult);
    }
    return courseResult;
  };
};
