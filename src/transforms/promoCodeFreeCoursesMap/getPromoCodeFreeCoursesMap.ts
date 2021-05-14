import { isDesignCourse, isMakeupAdvancedCourse } from '../../courses';
import { freeMap } from '../../lib/freeMap';
import { PromoCodeSpec, promoCodeSpecs, specApplies } from '../../promoCodes';
import { CourseResult, MapFunction, PriceQueryOptions } from '../../types';

export const getPromoCodeFreeCourseMap = (now: Date, options?: PriceQueryOptions): MapFunction<CourseResult, CourseResult> => {
  const applies = (spec?: PromoCodeSpec): boolean => typeof spec !== 'undefined' && specApplies(spec, now, options?.discountAll, options?.promoCode, options?.school);

  const foundItApplies = applies(promoCodeSpecs.find(v => v.code === 'FOUNDIT'));
  const freeProApplies = applies(promoCodeSpecs.find(v => v.code === 'FREEPRO'));
  const spring21Applies = applies(promoCodeSpecs.find(v => v.code === 'SPRING21'));
  const happyMayApplies = applies(promoCodeSpecs.find(v => v.code === 'HAPPYMAY'));
  const nathansDayApplies = applies(promoCodeSpecs.find(v => v.code === 'NATHANSDAY'));
  const mothersdayApplies = applies(promoCodeSpecs.find(v => v.code === 'MOTHERSDAY'));
  const may21Applies = applies(promoCodeSpecs.find(v => v.code === 'MAY21'));

  let may21Applied = false;
  let spring21Applied = false;
  let nathansDayApplied = false;

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

    if (spring21Applies && !spring21Applied) {
      if (isMakeupAdvancedCourse(courseResult.code) && array.some(c => c.code === 'MZ')) {
        spring21Applied = true;
        return freeMap(courseResult);
      }
    }

    if (happyMayApplies) {
      if (courseResult.code === 'VM' && array.some(c => c.code === 'MZ')) {
        return freeMap(courseResult);
      }
    }

    if (nathansDayApplies && !nathansDayApplied) {
      if (isMakeupAdvancedCourse(courseResult.code) && array.some(c => c.code === 'MZ')) {
        nathansDayApplied = true;
        return freeMap(courseResult);
      }
    }

    if (mothersdayApplies) {
      if (courseResult.code === 'MW' && array.some(c => c.code === 'MZ')) {
        return freeMap(courseResult);
      }
    }

    if (may21Applies && !may21Applied) {
      if (isDesignCourse(courseResult.code) && array.filter(c => isDesignCourse(c.code)).length >= 2) {
        may21Applied = true;
        return freeMap(courseResult);
      }
    }

    return courseResult;
  };
};
