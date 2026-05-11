import type { MapFunction } from '@/domain/mapFunction';
import type { CoursePrice } from '@/domain/price';
import { freeMap } from '@/lib/freeMap';

export const getDefaultFreeEventNewStudentMap = (now: Date): MapFunction<CoursePrice, CoursePrice> => {
  if (now.getTime() >= Date.UTC(2021, 5, 9, 13)) { // after June 9, 2021 at 09:00 we use promo codes
    return courseResult => courseResult;
  }
  return (courseResult: CoursePrice, index: number, array: CoursePrice[]): CoursePrice => {
    // buy a foundation course and get LW and DW free
    if ((courseResult.code === 'LW' || courseResult.code === 'DW') && array.some(c => c.code === 'EP')) {
      return freeMap(courseResult);
    }
    return courseResult;
  };
};
