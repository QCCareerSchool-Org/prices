import { isDesignCourse, isEventFoundationCourse, isEventSpecialtyCourse, isMakeupAdvancedCourse } from '../../courses';
import { freeMap } from '../../lib/freeMap';
import { PromoCodeSpec, promoCodeSpecs, specApplies } from '../../promoCodes';
import { CourseResult, MapFunction, PriceQueryOptions } from '../../types';

export const getPromoCodeFreeCourseMap = (now: Date, options?: PriceQueryOptions): MapFunction<CourseResult, CourseResult> => {
  const applies = (spec?: PromoCodeSpec): boolean => typeof spec !== 'undefined' && specApplies(spec, now, options?.discountAll, options?.promoCode, options?.school);

  const freeProApplies = applies(promoCodeSpecs.find(v => v.code === 'FREEPRO'));
  const expertApplies = applies(promoCodeSpecs.find(v => v.code === 'EXPERT'));
  const bogoApplies = applies(promoCodeSpecs.find(v => v.code === 'BOGO'));
  const skincareApplies = applies(promoCodeSpecs.find(v => v.code === 'SKINCARE')) || applies(promoCodeSpecs.find(v => v.code === 'SKINCARE300'));
  const eventFreeCourseApplies = applies(promoCodeSpecs.find(v => v.code === 'EVENTFREECOURSE'));
  const freeSpecialtyApplies = applies(promoCodeSpecs.find(v => v.code === 'SPECIALTY'));
  const twoFreeSpecialtyApplies = [ '2SPECIALTY', 'MCSPECIALTY', 'SSMCSPECIALTY', '2SPECIALTY100' ].some(code => applies(promoCodeSpecs.find(v => v.code === code)));
  const freeLuxuryApplies = applies(promoCodeSpecs.find(v => v.code === 'FREELUXURY'));
  const masterClassApplies = applies(promoCodeSpecs.find(v => v.code === 'MASTERCLASS')) || applies(promoCodeSpecs.find(v => v.code === 'SSMASTERCLASS'));
  const masterClass150Applies = applies(promoCodeSpecs.find(v => v.code === 'MASTERCLASS150'));
  const luxuryDestinationApplies = applies(promoCodeSpecs.find(v => v.code === 'LUXURYDESTINATION'));
  const proLuminousApplies = applies(promoCodeSpecs.find(v => v.code === 'PROLUMINOUS'));
  const freeGlobalApplies = applies(promoCodeSpecs.find(v => v.code === 'FREEGLOBAL'));
  const bogo100Applies = applies(promoCodeSpecs.find(v => v.code === 'BOGO100'));
  const bogo200Applies = applies(promoCodeSpecs.find(v => v.code === 'BOGO200'));
  const freeVirtualApplies = applies(promoCodeSpecs.find(v => v.code === 'FREEVIRTUAL'));
  const freeColorApplies = applies(promoCodeSpecs.find(v => v.code === 'FREECOLOR'));

  let expertApplied = false;
  let bogoApplied = false;
  let eventFreeCourseApplied = false;
  let freeSpecialtyApplied = false;
  let twoFreeSpecialtyCount = 0;
  let masterClassApplied = false;
  let masterClass150Applied = false;
  let bogo100Applied = false;
  let bogo200Applied = false;
  let freeVirtualApplied = false;

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

    if (masterClass150Applies && !masterClass150Applied) {
      if (isDesignCourse(courseResult.code) && courseResult.code !== 'I2' && array.some(c => c.code === 'I2')) {
        masterClass150Applied = true;
        return freeMap(courseResult);
      }
    }

    if (luxuryDestinationApplies) {
      if ((courseResult.code === 'LW' || courseResult.code === 'DW') && array.some(c => c.code === 'EP')) {
        return freeMap(courseResult);
      }
    }

    if (proLuminousApplies) {
      if (courseResult.code === 'MW' && array.some(c => c.code === 'MZ')) {
        return freeMap(courseResult);
      }
    }

    if (freeGlobalApplies) {
      if (courseResult.code === 'GB' && array.some(c => c.code === 'MZ')) {
        return freeMap(courseResult);
      }
    }

    if (bogo100Applies && !bogo100Applied) {
      if (array.length >= 2) {
        bogo100Applied = true;
        return freeMap(courseResult);
      }
    }

    if (bogo200Applies && !bogo200Applied) {
      if (array.length >= 2) {
        bogo200Applied = true;
        return freeMap(courseResult);
      }
    }

    // discount either VD or VE, but not both, as long as one other (non VD, VE) course is selected
    if (freeVirtualApplies) {
      if (!freeVirtualApplied && (courseResult.code === 'VD' || courseResult.code === 'VE') && array.filter(c => c.code !== 'VD' && c.code !== 'VE').length >= 1) {
        freeVirtualApplied = true;
        return freeMap(courseResult);
      }
    }

    // make CC free as long as some other course of equal or greater value is also selected
    if (freeColorApplies) {
      if (courseResult.code === 'CC' && array.some(c => c.code !== 'CC' && c.cost >= courseResult.cost)) {
        return freeMap(courseResult);
      }
    }

    return courseResult;
  };
};
