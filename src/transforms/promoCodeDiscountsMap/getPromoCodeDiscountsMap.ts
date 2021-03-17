import { CourseResult, MapFunction, PriceQueryOptions } from '../../types';

export const getPromoCodeDiscountsMap = (now: Date, options?: PriceQueryOptions): MapFunction<CourseResult, CourseResult> => {
  return (courseResult: CourseResult): CourseResult => {
    return courseResult;
  };
};
