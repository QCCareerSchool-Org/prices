import { isDesignCourse } from '../../../courses';
import { freeMap } from '../../../lib/freeMap';
import { CourseResult, MapFunction } from '../../../types';

export const getDefaultFreeDesignNewStudentMap = (now: Date): MapFunction<CourseResult, CourseResult> => {
  let freeDesignCount = 0;

  return (courseResult: CourseResult, index: number, array: CourseResult[]): CourseResult => {
    if (now.getTime() < Date.UTC(2021, 4, 17, 13)) { // May 17 at 09:00

      // get your second course free
      if (freeDesignCount < 1 && isDesignCourse(courseResult.code) && array.filter(c => isDesignCourse(c.code)).length >= 2) {
        freeDesignCount++;
        return freeMap(courseResult);
      }

    }
    return courseResult;
  };
};
