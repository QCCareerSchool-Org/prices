import { isEventFoundationCourse, isEventSpecialtyCourse } from '../../courses';
import { freeMap } from '../../lib/freeMap';
import { PromoCodeSpec, promoCodeSpecs, specApplies } from '../../promoCodes';
import { CourseResult, MapFunction, PriceQueryOptions } from '../../types';

export const getPromoCodeFreeCourseMap = (now: Date, options?: PriceQueryOptions): MapFunction<CourseResult, CourseResult> => {
  const applies = (spec?: PromoCodeSpec): boolean => typeof spec !== 'undefined' && specApplies(spec, now, options?.discountAll, options?.promoCode, options?.school);

  const freeProApplies = applies(promoCodeSpecs.find(v => v.code === 'FREEPRO'));
  const expertApplies = applies(promoCodeSpecs.find(v => v.code === 'EXPERT'));
  const bogoApplies = applies(promoCodeSpecs.find(v => v.code === 'BOGO'));

  let expertApplied = false;
  let bogoApplied = false;

  return (courseResult: CourseResult, index: number, array: CourseResult[]): CourseResult => {

    if (freeProApplies) {
      if (courseResult.code === 'MW' && array.some(c => c.code === 'MZ')) {
        return freeMap(courseResult);
      }
    }

    if (expertApplies && !expertApplied) {
      if (isEventSpecialtyCourse(courseResult.code) && array.some(c => isEventFoundationCourse(c.code))) {
        expertApplied = true;
        return freeMap(courseResult);
      }
    }

    if (bogoApplies && !bogoApplied) {
      if (array.length >= 2) {
        bogoApplied = true;
        return freeMap(courseResult);
      }
    }

    return courseResult;
  };
};
