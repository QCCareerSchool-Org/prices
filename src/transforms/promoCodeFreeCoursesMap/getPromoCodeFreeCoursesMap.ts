import { isDesignCourse, isEventFoundationCourse, isEventSpecialtyCourse, isMakeupAdvancedCourse, isMakeupFoundationCourse, isMakeupSpecialtyCourse } from '../../courses';
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
  const levelUpApplies = applies(promoCodeSpecs.find(v => v.code === 'LEVELUP'));
  const weekendMakeupApplies = applies(promoCodeSpecs.find(v => v.code === 'WEEKEND' && v.schools?.includes('QC Makeup Academy')));
  const weekendDesignApplies = applies(promoCodeSpecs.find(v => v.code === 'WEEKEND' && v.schools?.includes('QC Design School')));
  const june21DesignApplies = applies(promoCodeSpecs.find(v => v.code === 'JUNE21' && v.schools?.includes('QC Design School')));
  const wedding21Applies = applies(promoCodeSpecs.find(v => v.code === 'WEDDING21'));
  const expertApplies = applies(promoCodeSpecs.find(v => v.code === 'EXPERT'));
  const bonusgiftApplies = applies(promoCodeSpecs.find(v => v.code === 'BONUSGIFT'));
  const summer21EventApplies = applies(promoCodeSpecs.find(v => v.code === 'SUMMER21' && v.schools?.includes('QC Event School')));
  const summer21MakeupApplies = applies(promoCodeSpecs.find(v => v.code === 'SUMMER21' && v.schools?.includes('QC Makeup Academy')));
  const summer21DesignApplies = applies(promoCodeSpecs.find(v => v.code === 'SUMMER21' && v.schools?.includes('QC Design School')));

  let may21Applied = false;
  let spring21Applied = false;
  let nathansDayApplied = false;
  let weekendDesignApplied = false;
  let june21DesignApplied = false;
  let expertApplied = false;
  let summer21EventApplied = false;
  let summer21MakeupApplied = false;
  let bonusgiftApplied = false;
  let summer21DesignApplied = false;

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

    if (levelUpApplies) {
      if (courseResult.code === 'VM' && array.some(c => c.code === 'MZ')) {
        return freeMap(courseResult);
      }
    }

    if (weekendMakeupApplies) {
      if (courseResult.code === 'VM' && array.some(c => c.code === 'MZ')) {
        return freeMap(courseResult);
      }
    }

    if (weekendDesignApplies && !weekendDesignApplied) {
      if (isDesignCourse(courseResult.code) && array.filter(c => isDesignCourse(c.code)).length >= 2) {
        weekendDesignApplied = true;
        return freeMap(courseResult);
      }
    }

    if (june21DesignApplies && !june21DesignApplied) {
      if (isDesignCourse(courseResult.code) && array.filter(c => isDesignCourse(c.code)).length >= 2) {
        june21DesignApplied = true;
        return freeMap(courseResult);
      }
    }

    if (wedding21Applies) {
      if ((courseResult.code === 'DW' || courseResult.code === 'LW') && array.some(c => c.code === 'EP')) {
        return freeMap(courseResult);
      }
    }

    if (bonusgiftApplies) {
      if (options?.school === 'QC Makeup Academy') {
        if (courseResult.code === 'MW' && array.some(c => c.code === 'MZ')) {
          return freeMap(courseResult);
        }
      } else if (options?.school === 'QC Event School') {
        if ((courseResult.code === 'DW' || courseResult.code === 'LW') && array.some(c => c.code === 'EP')) {
          return freeMap(courseResult);
        }
      } else if (options?.school === 'QC Design School' && !bonusgiftApplied) {
        if (isDesignCourse(courseResult.code) && array.filter(c => isDesignCourse(c.code)).length >= 2) {
          bonusgiftApplied = true;
          return freeMap(courseResult);
        }
      }
    }

    if (expertApplies && !expertApplied) {
      if (isEventSpecialtyCourse(courseResult.code) && array.some(c => isEventFoundationCourse(c.code))) {
        expertApplied = true;
        return freeMap(courseResult);
      }
    }

    if (summer21EventApplies && !summer21EventApplied) {
      if (isEventSpecialtyCourse(courseResult.code) && array.some(c => isEventFoundationCourse(c.code))) {
        summer21EventApplied = true;
        return freeMap(courseResult);
      }
    }

    if (summer21MakeupApplies && !summer21MakeupApplied) {
      if (isMakeupSpecialtyCourse(courseResult.code) && array.some(c => isMakeupFoundationCourse(c.code))) {
        summer21MakeupApplied = true;
        return freeMap(courseResult);
      }
    }

    if (summer21DesignApplies && !summer21DesignApplied) {
      if (isDesignCourse(courseResult.code) && array.filter(c => isDesignCourse(c.code)).length >= 2) {
        summer21DesignApplied = true;
        return freeMap(courseResult);
      }
    }

    return courseResult;
  };
};
