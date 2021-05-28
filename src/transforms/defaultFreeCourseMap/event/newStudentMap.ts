import { isEventFoundationCourse, isEventSpecialtyCourse } from '../../../courses';
import { freeMap } from '../../../lib/freeMap';
import { CourseResult, MapFunction } from '../../../types';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getDefaultFreeEventNewStudentMap = (now: Date): MapFunction<CourseResult, CourseResult> => {

  if (now.getTime() >= Date.UTC(2021, 5, 1, 13)) {

    return (courseResult: CourseResult, index: number, array: CourseResult[]): CourseResult => {

      // buy a foundation course and get LW and DW free
      if ((courseResult.code === 'LW' || courseResult.code === 'DW') && array.some(c => c.code === 'EP')) {
        return freeMap(courseResult);
      }

      return courseResult;
    };

  } else if (now.getTime() >= Date.UTC(2021, 4, 29, 12)) {

    let freeEventCount = 0;
    const maxFreeEventCount = 2;

    return (courseResult: CourseResult, index: number, array: CourseResult[]): CourseResult => {

      // buy a foundation course and get specialty courses free (max 2)
      if (freeEventCount < maxFreeEventCount && isEventSpecialtyCourse(courseResult.code) && array.some(c => isEventFoundationCourse(c.code))) {
        freeEventCount++;
        return freeMap(courseResult);
      }

      return courseResult;
    };
  }

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
