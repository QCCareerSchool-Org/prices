import { CourseResult, MapFunction } from '../../../types';

export const getDefaultFreeDesignNewStudentMap = (now: Date): MapFunction<CourseResult, CourseResult> => {
  return courseResult => courseResult; // we use promo codes now
};
