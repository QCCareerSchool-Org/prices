import type { CoursePricingState } from './CoursePricingState';
import { PromoCodes } from './PromoCodes';
import { isDesignCourse, isEventFoundationCourse, isEventSpecialtyCourse } from '../courses';
import type { PriceOptions } from '@/domain/priceQuery';

export const applyPromoCodeFreeCourses = (courseResults: CoursePricingState[], promoCodes: PromoCodes, options: PriceOptions | undefined): void => {
  let applied = false;
  let count = 0;

  const applyPromoCodeFreeCourse = (courseResult: CoursePricingState, index: number, array: CoursePricingState[]): void => {

    if (promoCodes.code === 'FREEPRO') {
      if (courseResult.code === 'MW' && array.some(c => c.code === 'MZ')) {
        courseResult.makeFree();
        return;
      }
    }

    if (promoCodes.code === 'EXPERT' && !applied) {
      if (isEventSpecialtyCourse(courseResult.code) && array.some(c => isEventFoundationCourse(c.code))) {
        applied = true;
        courseResult.makeFree();
        return;
      }
    }

    if ([ 'BOGO', 'BOGOCATALYST', 'BOGOCATALYST100' ].includes(promoCodes.code ?? '') && !applied) {
      if (array.length >= 2) {
        applied = true;
        courseResult.makeFree();
        return;
      }
    }

    if (promoCodes.code === 'BOGO2ANY' && count < 2) {
      if ((array.length >= 2 && count < 1) || array.length >= 3) {
        count++;
        courseResult.makeFree();
        return;
      }
    }

    if ([ 'BOGOMZ', 'BOGOMZ300' ].includes(promoCodes.code ?? '') && !applied) {
      if (courseResult.code !== 'MZ' && array.some(c => c.code === 'MZ')) {
        applied = true;
        courseResult.makeFree();
        return;
      }
    }

    if ([ 'SKINCARE', 'SKINCARE100', 'SKINCARE300' ].includes(promoCodes.code ?? '')) {
      if (courseResult.code === 'SK' && array.some(c => c.code === 'MZ')) {
        courseResult.makeFree();
        return;
      }
    }

    if (promoCodes.code === 'FREESTYLE') {
      if (courseResult.code === 'PF' && array.some(c => c.code === 'MZ')) {
        courseResult.makeFree();
        return;
      }
    }

    if (promoCodes.code === 'EVENTFREECOURSE' && !applied) {
      if (array.length >= 2 && index < array.length - 1 && array.some(c => isEventFoundationCourse(c.code))) {
        applied = true;
        courseResult.makeFree();
        return;
      }
    }

    if ([ 'SPECIALTY', 'SPECIALTY100' ].includes(promoCodes.code ?? '') && !applied) {
      if (array.some(c => isEventFoundationCourse(c.code) && isEventSpecialtyCourse(courseResult.code))) {
        applied = true;
        courseResult.makeFree();
        return;
      }
    }

    if ([ '2SPECIALTY', 'MCSPECIALTY', 'SSMCSPECIALTY', '2SPECIALTY100' ].includes(promoCodes.code ?? '') && count < 2) {
      if (array.some(c => isEventFoundationCourse(c.code) && isEventSpecialtyCourse(courseResult.code))) {
        count++;
        courseResult.makeFree();
        return;
      }
    }

    if (promoCodes.code === '2SPECIALTYED' && count < 2) {
      if (array.some(c => isEventFoundationCourse(c.code) && c.code !== 'ED') && (isEventSpecialtyCourse(courseResult.code) || courseResult.code === 'ED')) {
        count++;
        courseResult.makeFree();
        return;
      }
    }

    // two free specialty courses, but ED is considered a specialty course
    if (promoCodes.code === 'PROFITPIVOT' && count < 2) {
      if (array.some(c => isEventFoundationCourse(c.code) && c.code !== 'ED') && (isEventSpecialtyCourse(courseResult.code) || courseResult.code === 'ED')) {
        count++;
        courseResult.makeFree();
        return;
      }
    }

    if (promoCodes.code === 'FREELUXURY') {
      if (courseResult.code === 'LW' && array.some(c => isEventFoundationCourse(c.code))) {
        courseResult.makeFree();
        return;
      }
    }

    if ([ 'MASTERCLASS', 'SSMASTERCLASS' ].includes(promoCodes.code ?? '') && !applied) {
      if (isDesignCourse(courseResult.code) && courseResult.code !== 'I2' && array.some(c => c.code === 'I2')) {
        applied = true;
        courseResult.makeFree();
        return;
      }
    }

    if (promoCodes.code === 'MASTERCLASS150' && !applied) {
      if (isDesignCourse(courseResult.code) && courseResult.code !== 'I2' && array.some(c => c.code === 'I2')) {
        applied = true;
        courseResult.makeFree();
        return;
      }
    }

    if (promoCodes.code === 'LUXURYDESTINATION') {
      if ((courseResult.code === 'LW' || courseResult.code === 'DW') && array.some(c => c.code === 'EP')) {
        courseResult.makeFree();
        return;
      }
    }

    if (promoCodes.code === 'PROLUMINOUS') {
      if (courseResult.code === 'MW' && array.some(c => c.code === 'MZ')) {
        courseResult.makeFree();
        return;
      }
    }

    if (promoCodes.code === 'FREEGLOBAL') {
      if (courseResult.code === 'GB' && array.some(c => c.code === 'MZ')) {
        courseResult.makeFree();
        return;
      }
    }

    if (promoCodes.code === 'BOGO100' && !applied) {
      if (options?.school === 'QC Event School') {
        if (array.length >= 2 && array.some(c => isEventFoundationCourse(c.code))) {
          applied = true;
          courseResult.makeFree();
          return;
        }
      } else {
        if (array.length >= 2) {
          applied = true;
          courseResult.makeFree();
          return;
        }
      }
    }

    if (promoCodes.code === 'BOGO200' && !applied) {
      if (array.length >= 2) {
        applied = true;
        courseResult.makeFree();
        return;
      }
    }

    if (promoCodes.code === 'DAYCARE300' && !applied) {
      if (array.length >= 2 && courseResult.code === 'DD') {
        applied = true;
        courseResult.makeFree();
        return;
      }
    }

    // discount either VD or VE, but not both, as long as one other (non VD, VE) course is selected
    if (promoCodes.code === 'FREEVIRTUAL') {
      if (!applied && (courseResult.code === 'VD' || courseResult.code === 'VE') && array.filter(c => c.code !== 'VD' && c.code !== 'VE').length >= 1) {
        applied = true;
        courseResult.makeFree();
        return;
      }
    }

    // make CC free as long as some other course of equal or greater value is also selected
    if (promoCodes.code === 'FREECOLOR') {
      if (courseResult.code === 'CC' && array.some(c => c.code !== 'CC' && c.cost >= courseResult.cost)) {
        courseResult.makeFree();
        return;
      }
    }

    if (promoCodes.code === 'HALLOWEENSFX') {
      if (courseResult.code === 'SF' && array.some(c => c.code === 'MZ')) {
        courseResult.makeFree();
        return;
      }
    }

    if (promoCodes.code === 'FREEPW') {
      if (courseResult.code === 'PW' && array.some(c => c.code === 'MZ')) {
        courseResult.makeFree();
        return;
      }
    }

    // I'm sure this could be better
    if (promoCodes.code === 'BOGOVIRTUAL') {
      const virtualSelected = array.some(c => (options?.school === 'QC Design School' && c.code === 'VD') || (options?.school === 'QC Event School' && c.code === 'VE'));

      const isVirtual = (options?.school === 'QC Design School' && courseResult.code === 'VD') || (options?.school === 'QC Event School' && courseResult.code === 'VE');

      if (array.length >= 2) {
        if (virtualSelected) {
          if (isVirtual) {
            courseResult.makeFree();
            return;
          }
        }
      }

      if ((array.length >= 2 && !virtualSelected) || (array.length >= 3 && virtualSelected)) {
        if (!isVirtual) {
          if (count === 0) {
            count++;
            courseResult.makeFree();
            return;
          }
        }
      }
    }

    if (PromoCodes.ppaFreeCourseCodes.includes(promoCodes.code ?? '') && index === 0) {
      courseResult.makeFree();
    }
  };

  for (const [ index, courseResult ] of courseResults.entries()) {
    applyPromoCodeFreeCourse(courseResult, index, courseResults);
  }
};
