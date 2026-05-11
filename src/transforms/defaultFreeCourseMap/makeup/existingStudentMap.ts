import type { MapFunction } from '@/domain/mapFunction';
import type { CoursePrice } from '@/domain/price';
import { freeMap } from '@/lib/freeMap';

export const getDefaultFreeMakeupExistingStudentMap = (now: Date): MapFunction<CoursePrice, CoursePrice> => {
  return (courseResult: CoursePrice, index: number, array: CoursePrice[]): CoursePrice => {

    if (now.getTime() < Date.UTC(2023, 2, 18, 4)) { // 2023-03-18T00:00 (04:00 UTC)
      // free VM with any course
      if (courseResult.code === 'VM' && array.length > 1) {
        return freeMap(courseResult);
      }
    }

    return courseResult;
  };
};
