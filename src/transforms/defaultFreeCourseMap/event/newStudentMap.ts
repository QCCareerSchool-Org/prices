import { isEventFoundationCourse, isEventSpecialtyCourse } from '../../../courses';
import { freeMap } from '../../../lib/freeMap';
import { CourseResult, MapFunction } from '../../../types';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getDefaultFreeEventNewStudentMap = (now: Date): MapFunction<CourseResult, CourseResult> => {
  let freeEventCount = 0;
  const maxFreeEventCount = 1;

  return (courseResult: CourseResult, index: number, array: CourseResult[]): CourseResult => {

    // buy a foundation course and get any specialty course free (max 1)
    if (freeEventCount < maxFreeEventCount && isEventSpecialtyCourse(courseResult.code) && array.some(c => isEventFoundationCourse(c.code))) {
      freeEventCount++;
      return freeMap(courseResult);
    }

    return courseResult;
  };
};
