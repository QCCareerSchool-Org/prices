import type { CourseResult, MapFunction } from '../../../types';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getDefaultFreeMakeupNewStudentMap = (now: Date): MapFunction<CourseResult, CourseResult> => {
  return (courseResult: CourseResult): CourseResult => courseResult; // no promotion
};
