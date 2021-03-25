import { promoCodeSpecs, promoCodeApplies, PromoCodeSpec } from '../../promoCodes';
import { CourseResult, MapFunction, PriceQueryOptions } from '../../types';
import { freeMap } from '../defaultFreeCourseMap/getDefaultFreeCourseMap';

export const getPromoCodeFreeCourseMap = (now: Date, options?: PriceQueryOptions): MapFunction<CourseResult, CourseResult> => {
  const student = options?.discountAll ?? false;

  const applies = (spec?: PromoCodeSpec) => spec && promoCodeApplies(spec, now, student, options?.promoCode, options?.school);

  const foundItApplies = applies(promoCodeSpecs.find(v => v.code === 'FOUNDIT'));
  const freeProApplies = applies(promoCodeSpecs.find(v => v.code === 'FOUNDIT'));

  return (courseResult: CourseResult, index: number, array: CourseResult[]): CourseResult => {

    if (foundItApplies) {
      if (courseResult.code === 'VM' && array.some(c => c.code === 'MZ')) {
        return freeMap(courseResult);
      }
    }

    if (freeProApplies) {
      if (courseResult.code === 'MW' && array.some(c => c.code === 'MZ')) {
        return freeMap(courseResult);
      }
    }

    return courseResult;
  };
};
