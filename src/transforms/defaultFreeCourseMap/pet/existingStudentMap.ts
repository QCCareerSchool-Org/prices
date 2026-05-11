import type { MapFunction } from '@/domain/mapFunction';
import type { CoursePrice } from '@/domain/price';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getDefaultFreePetExistingStudentMap = (now: Date): MapFunction<CoursePrice, CoursePrice> => {
  return (courseResult: CoursePrice): CoursePrice => courseResult; // no promotion
};
