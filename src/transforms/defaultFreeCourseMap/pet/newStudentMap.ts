import type { MapFunction } from '@/domain/mapFunction';
import type { CoursePrice } from '@/domain/price';
import { freeMap } from '@/lib/freeMap';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getDefaultFreePetNewStudentMap = (now: Date): MapFunction<CoursePrice, CoursePrice> => {
  return (courseResult: CoursePrice, index: number, array: CoursePrice[]): CoursePrice => {

    // buy DG and get FA free
    if (courseResult.code === 'FA' && array.some(c => c.code === 'DG')) {
      return freeMap(courseResult);
    }

    return courseResult;
  };
};
