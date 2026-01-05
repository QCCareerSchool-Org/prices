import { freeMap } from '../../../lib/freeMap';
import type { CourseResult, MapFunction } from '../../../types';

export const getDefaultFreeEventExistingStudentMap = (now: Date): MapFunction<CourseResult, CourseResult> => {
  return (courseResult: CourseResult, index: number, array: CourseResult[]): CourseResult => {

    if (now.getTime() < Date.UTC(2023, 2, 18, 4)) { // 2023-03-18T00:00 (04:00 UTC)
      // free VE with any course
      if (courseResult.code === 'VE' && array.length > 1) {
        return freeMap(courseResult);
      }
    }

    return courseResult;
  };
};
