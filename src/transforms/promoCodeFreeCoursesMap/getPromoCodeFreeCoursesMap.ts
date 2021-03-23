import { promoCodeSpecs, promoCodeApplies } from '../../promoCodes';
import { CourseResult, MapFunction, PriceQueryOptions } from '../../types';
import { freeMap } from '../defaultFreeCourseMap/getDefaultFreeCourseMap';

export const getPromoCodeFreeCourseMap = (now: Date, options?: PriceQueryOptions): MapFunction<CourseResult, CourseResult> => {
  const student = options?.discountAll ?? false;

  const foundIt = promoCodeSpecs.find(v => v.code === 'FOUNDIT');
  const foundItApplies = foundIt && promoCodeApplies(foundIt, now, student, options?.promoCode, options?.school);

  return (courseResult: CourseResult, index: number, array: CourseResult[]): CourseResult => {

    if (foundItApplies) {
      if (courseResult.code === 'VM' && array.some(c => c.code === 'MZ')) {
        return freeMap(courseResult);
      }
    }

    return courseResult;
  };
};
