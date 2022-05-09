import { isDesignCourse, isEventFoundationCourse, isEventSpecialtyCourse, isMakeupAdvancedCourse } from '../../courses';
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
  const eventFreeCourseApplies = applies(promoCodeSpecs.find(v => v.code === 'EVENTFREECOURSE'));
  const freeSpecialtyApplies = applies(promoCodeSpecs.find(v => v.code === 'SPECIALTY'));
  const twoFreeSpecialtyApplies = applies(promoCodeSpecs.find(v => v.code === '2SPECIALTY')) || applies(promoCodeSpecs.find(v => v.code === 'MCSPECIALTY'));
  const freeLuxuryApplies = applies(promoCodeSpecs.find(v => v.code === 'FREELUXURY'));
  const masterClassApplies = applies(promoCodeSpecs.find(v => v.code === 'MASTERCLASS'));
  const luxuryDestinationApplies = applies(promoCodeSpecs.find(v => v.code === 'LUXURYDESTINATION'));
  const freeAdvancedApplies = applies(promoCodeSpecs.find(v => v.code === 'FREEADVANCED'));
  const proLuminousApplies = applies(promoCodeSpecs.find(v => v.code === 'PROLUMINOUS'));

  let expertApplied = false;
  let bogoApplied = false;
  let blackFridayCount = 0;
  let eventFreeCourseApplied = false;
  let freeSpecialtyApplied = false;
  let twoFreeSpecialtyCount = 0;
  let masterClassApplied = false;
  let freeAdvancedApplied = false;

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
      if (options?.school === 'QC Makeup Academy') {
        if (array.length >= 2 && index < array.length - 1 && ![ 'AB', 'SF', 'HS' ].includes(courseResult.code)) {
          bogoApplied = true;
          return freeMap(courseResult);
        }
      } else {
        if (array.length >= 2) {
          bogoApplied = true;
          return freeMap(courseResult);
        }
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

    if (eventFreeCourseApplies && !eventFreeCourseApplied) {
      if (array.length >= 2 && index < array.length - 1 && array.some(c => isEventFoundationCourse(c.code))) {
        eventFreeCourseApplied = true;
        return freeMap(courseResult);
      }
    }

    if (freeSpecialtyApplies && !freeSpecialtyApplied) {
      if (array.some(c => isEventFoundationCourse(c.code) && isEventSpecialtyCourse(courseResult.code))) {
        freeSpecialtyApplied = true;
        return freeMap(courseResult);
      }
    }

    if (twoFreeSpecialtyApplies && twoFreeSpecialtyCount < 2) {
      if (array.some(c => isEventFoundationCourse(c.code) && isEventSpecialtyCourse(courseResult.code))) {
        twoFreeSpecialtyCount++;
        return freeMap(courseResult);
      }
    }

    if (freeLuxuryApplies) {
      if (courseResult.code === 'LW' && array.some(c => isEventFoundationCourse(c.code))) {
        return freeMap(courseResult);
      }
    }

    if (masterClassApplies && !masterClassApplied) {
      if (isDesignCourse(courseResult.code) && courseResult.code !== 'I2' && array.some(c => c.code === 'I2')) {
        masterClassApplied = true;
        return freeMap(courseResult);
      }
    }

    if (luxuryDestinationApplies) {
      if ((courseResult.code === 'LW' || courseResult.code === 'DW') && array.some(c => c.code === 'EP')) {
        return freeMap(courseResult);
      }
    }

    if (freeAdvancedApplies && !freeAdvancedApplied) {
      if (isMakeupAdvancedCourse(courseResult.code) && array.some(c => c.code === 'MZ')) {
        freeAdvancedApplied = true;
        return freeMap(courseResult);
      }
    }

    if (proLuminousApplies) {
      if (courseResult.code === 'MW' && array.some(c => c.code === 'MZ')) {
        return freeMap(courseResult);
      }
    }

    return courseResult;
  };
};
