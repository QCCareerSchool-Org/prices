import { isDesignCourse } from '../../../courses';
import { freeMap } from '../../../lib/freeMap';
import { CourseResult, MapFunction } from '../../../types';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getDefaultFreeDesignExistingStudentMap = (now: Date): MapFunction<CourseResult, CourseResult> => {
  if (now.getTime() >= Date.UTC(2021, 5, 1, 13)) {
    return courseResult => courseResult;
  }
  return (courseResult: CourseResult, index: number, array: CourseResult[]): CourseResult => {
    if (courseResult.code === 'VD' && array.some(c => isDesignCourse(c.code, [ 'VD' ]))) {
      return freeMap(courseResult);
    }
    return courseResult;
  };
};
