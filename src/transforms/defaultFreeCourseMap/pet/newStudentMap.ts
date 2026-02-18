import { freeMap } from '../../../lib/freeMap';
import type { CourseResult, MapFunction } from '../../../types';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getDefaultFreePetNewStudentMap = (now: Date): MapFunction<CourseResult, CourseResult> => {
  return (courseResult: CourseResult, index: number, array: CourseResult[]): CourseResult => {

    // buy DG and get FA free
    if (courseResult.code === 'FA' && array.some(c => c.code === 'DG')) {
      return freeMap(courseResult);
    }

    return courseResult;
  };
};
