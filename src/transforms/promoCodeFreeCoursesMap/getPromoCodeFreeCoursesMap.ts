import { isEventFoundationCourse, isEventSpecialtyCourse } from '../../courses';
import { freeMap } from '../../lib/freeMap';
import { PromoCodeSpec, promoCodeSpecs, specApplies } from '../../promoCodes';
import { CourseResult, MapFunction, PriceQueryOptions } from '../../types';

export const getPromoCodeFreeCourseMap = (now: Date, options?: PriceQueryOptions): MapFunction<CourseResult, CourseResult> => {
  const applies = (spec?: PromoCodeSpec): boolean => typeof spec !== 'undefined' && specApplies(spec, now, options?.discountAll, options?.promoCode, options?.school);

  const freeProApplies = applies(promoCodeSpecs.find(v => v.code === 'FREEPRO'));
  const expertApplies = applies(promoCodeSpecs.find(v => v.code === 'EXPERT'));
  const bogoApplies = applies(promoCodeSpecs.find(v => v.code === 'BOGO'));
  const blackFridayApplies = applies(promoCodeSpecs.find(v => v.code === 'BLACK FRIDAY'));
  const skincareApplies = applies(promoCodeSpecs.find(v => v.code === 'SKINCARE'));

  let expertApplied = false;
  let bogoApplied = false;
  let blackFridayCount = 0;

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

    if (blackFridayApplies) {
      switch (options?.school) {
        case 'QC Makeup Academy':
          if (blackFridayCount < 1 && courseResult.code !== 'MZ' && array.some(c => c.code === 'MZ')) {
            blackFridayCount++;
            return freeMap(courseResult);
          }
          break;
        case 'QC Design School':
          if (array.some(c => c.code === 'VD')) { // VD is one of the selections
            if (array.length >= 2) {
              if (courseResult.code === 'VD') {
                return freeMap(courseResult);
              }
            }
            if (array.length >= 3) {
              if (blackFridayCount < 1) {
                blackFridayCount++;
                return freeMap(courseResult);
              }
            }
          } else { // VD is not one of the selections
            if (array.length >= 2) {
              if (blackFridayCount < 1) {
                blackFridayCount++;
                return freeMap(courseResult);
              }
            }
          }
          break;
        case 'QC Event School':
          if (blackFridayCount < 2 && isEventSpecialtyCourse(courseResult.code) && array.some(c => c.code === 'EP')) {
            blackFridayCount++;
            return freeMap(courseResult);
          }
          break;
      }
    }

    if (skincareApplies) {
      if (courseResult.code === 'SK' && array.some(c => c.code === 'MZ')) {
        return freeMap(courseResult);
      }
    }

    return courseResult;
  };
};
