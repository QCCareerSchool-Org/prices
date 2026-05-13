import { PromoCodes } from './PromoCodes';
import { isDesignCourse, isEventFoundationCourse, isEventSpecialtyCourse } from '../courses';
import type { CoursePrice } from '../domain/price';
import { freeMap } from '../lib/freeMap';

const allAccessFreeCourses = [ 'CP', 'ED', 'DW', 'LW', 'PE', 'FL', 'EB', 'VE' ];

export const applyPromoCodeFreeCourses = (courseResults: CoursePrice[], promoCodes: PromoCodes): void => {
  const { options } = promoCodes;
  const applies = (code: string): boolean => promoCodes.applies(code);
  const anyApply = (codes: string[]): boolean => codes.some(code => applies(code));

  let expertApplied = false;
  let bogoApplied = false;
  let eventFreeCourseApplied = false;
  let freeSpecialtyApplied = false;
  let twoFreeSpecialtyCount = 0;
  let profitPivotCount = 0;
  let masterClassApplied = false;
  let masterClass150Applied = false;
  let bogo100Applied = false;
  let bogo200Applied = false;
  let freeVirtualApplied = false;
  let bogoMZApplied = false;
  let daycare300Applied = false;
  let bogo2anyCount = 0;
  let bogoVirtualCount = 0;

  const applyPromoCodeFreeCourse = (courseResult: CoursePrice, index: number, array: CoursePrice[]): CoursePrice => {

    if (applies('FREEPRO')) {
      if (courseResult.code === 'MW' && array.some(c => c.code === 'MZ')) {
        return freeMap(courseResult);
      }
    }

    if (applies('EXPERT') && !expertApplied) {
      if (isEventSpecialtyCourse(courseResult.code) && array.some(c => isEventFoundationCourse(c.code))) {
        expertApplied = true;
        return freeMap(courseResult);
      }
    }

    if (anyApply([ 'BOGO', 'BOGOCATALYST', 'BOGOCATALYST100' ]) && !bogoApplied) {
      if (array.length >= 2) {
        bogoApplied = true;
        return freeMap(courseResult);
      }
    }

    if (applies('BOGO2ANY') && bogo2anyCount < 2) {
      if ((array.length >= 2 && bogo2anyCount < 1) || array.length >= 3) {
        bogo2anyCount++;
        return freeMap(courseResult);
      }
    }

    if (anyApply([ 'BOGOMZ', 'BOGOMZ300' ]) && !bogoMZApplied) {
      if (courseResult.code !== 'MZ' && array.some(c => c.code === 'MZ')) {
        bogoMZApplied = true;
        return freeMap(courseResult);
      }
    }

    if (anyApply([ 'SKINCARE', 'SKINCARE100', 'SKINCARE300' ])) {
      if (courseResult.code === 'SK' && array.some(c => c.code === 'MZ')) {
        return freeMap(courseResult);
      }
    }

    if (applies('FREESTYLE')) {
      if (courseResult.code === 'PF' && array.some(c => c.code === 'MZ')) {
        return freeMap(courseResult);
      }
    }

    if (applies('EVENTFREECOURSE') && !eventFreeCourseApplied) {
      if (array.length >= 2 && index < array.length - 1 && array.some(c => isEventFoundationCourse(c.code))) {
        eventFreeCourseApplied = true;
        return freeMap(courseResult);
      }
    }

    if (anyApply([ 'SPECIALTY', 'SPECIALTY100' ]) && !freeSpecialtyApplied) {
      if (array.some(c => isEventFoundationCourse(c.code) && isEventSpecialtyCourse(courseResult.code))) {
        freeSpecialtyApplied = true;
        return freeMap(courseResult);
      }
    }

    if (anyApply([ '2SPECIALTY', 'MCSPECIALTY', 'SSMCSPECIALTY', '2SPECIALTY100' ]) && twoFreeSpecialtyCount < 2) {
      if (array.some(c => isEventFoundationCourse(c.code) && isEventSpecialtyCourse(courseResult.code))) {
        twoFreeSpecialtyCount++;
        return freeMap(courseResult);
      }
    }

    if (applies('2SPECIALTYED') && twoFreeSpecialtyCount < 2) {
      if (array.some(c => isEventFoundationCourse(c.code) && c.code !== 'ED') && (isEventSpecialtyCourse(courseResult.code) || courseResult.code === 'ED')) {
        twoFreeSpecialtyCount++;
        return freeMap(courseResult);
      }
    }

    // two free specialty courses, but ED is considered a specialty course
    if (applies('PROFITPIVOT') && profitPivotCount < 2) {
      if (array.some(c => isEventFoundationCourse(c.code) && c.code !== 'ED') && (isEventSpecialtyCourse(courseResult.code) || courseResult.code === 'ED')) {
        profitPivotCount++;
        return freeMap(courseResult);
      }
    }

    if (applies('FREELUXURY')) {
      if (courseResult.code === 'LW' && array.some(c => isEventFoundationCourse(c.code))) {
        return freeMap(courseResult);
      }
    }

    if (anyApply([ 'MASTERCLASS', 'SSMASTERCLASS' ]) && !masterClassApplied) {
      if (isDesignCourse(courseResult.code) && courseResult.code !== 'I2' && array.some(c => c.code === 'I2')) {
        masterClassApplied = true;
        return freeMap(courseResult);
      }
    }

    if (applies('MASTERCLASS150') && !masterClass150Applied) {
      if (isDesignCourse(courseResult.code) && courseResult.code !== 'I2' && array.some(c => c.code === 'I2')) {
        masterClass150Applied = true;
        return freeMap(courseResult);
      }
    }

    if (applies('LUXURYDESTINATION')) {
      if ((courseResult.code === 'LW' || courseResult.code === 'DW') && array.some(c => c.code === 'EP')) {
        return freeMap(courseResult);
      }
    }

    if (applies('PROLUMINOUS')) {
      if (courseResult.code === 'MW' && array.some(c => c.code === 'MZ')) {
        return freeMap(courseResult);
      }
    }

    if (applies('FREEGLOBAL')) {
      if (courseResult.code === 'GB' && array.some(c => c.code === 'MZ')) {
        return freeMap(courseResult);
      }
    }

    if (applies('BOGO100') && !bogo100Applied) {
      if (options?.school === 'QC Event School') {
        if (array.length >= 2 && array.some(c => isEventFoundationCourse(c.code))) {
          bogo100Applied = true;
          return freeMap(courseResult);
        }
      } else {
        if (array.length >= 2) {
          bogo100Applied = true;
          return freeMap(courseResult);
        }
      }
    }

    if (applies('BOGO200') && !bogo200Applied) {
      if (array.length >= 2) {
        bogo200Applied = true;
        return freeMap(courseResult);
      }
    }

    if (applies('DAYCARE300') && !daycare300Applied) {
      if (array.length >= 2 && courseResult.code === 'DD') {
        daycare300Applied = true;
        return freeMap(courseResult);
      }
    }

    // discount either VD or VE, but not both, as long as one other (non VD, VE) course is selected
    if (applies('FREEVIRTUAL')) {
      if (!freeVirtualApplied && (courseResult.code === 'VD' || courseResult.code === 'VE') && array.filter(c => c.code !== 'VD' && c.code !== 'VE').length >= 1) {
        freeVirtualApplied = true;
        return freeMap(courseResult);
      }
    }

    // make CC free as long as some other course of equal or greater value is also selected
    if (applies('FREECOLOR')) {
      if (courseResult.code === 'CC' && array.some(c => c.code !== 'CC' && c.cost >= courseResult.cost)) {
        return freeMap(courseResult);
      }
    }

    if (applies('HALLOWEENSFX')) {
      if (courseResult.code === 'SF' && array.some(c => c.code === 'MZ')) {
        return freeMap(courseResult);
      }
    }

    if (applies('FREEPW')) {
      if (courseResult.code === 'PW' && array.some(c => c.code === 'MZ')) {
        return freeMap(courseResult);
      }
    }

    // I'm sure this could be better
    if (applies('BOGOVIRTUAL')) {
      const virtualSelected = array.some(c => (options?.school === 'QC Design School' && c.code === 'VD') || (options?.school === 'QC Event School' && c.code === 'VE'));

      const isVirtual = (options?.school === 'QC Design School' && courseResult.code === 'VD') || (options?.school === 'QC Event School' && courseResult.code === 'VE');

      if (array.length >= 2) {
        if (virtualSelected) {
          if (isVirtual) {
            return freeMap(courseResult);
          }
        }
      }

      if ((array.length >= 2 && !virtualSelected) || (array.length >= 3 && virtualSelected)) {
        if (!isVirtual) {
          if (bogoVirtualCount === 0) {
            bogoVirtualCount++;
            return freeMap(courseResult);
          }
        }
      }
    }

    if (applies('ALLACCESS') && array.some(c => c.code === 'AA')) {
      if (allAccessFreeCourses.includes(courseResult.code)) {
        return freeMap(courseResult);
      }
    }

    if (PromoCodes.ppaFreeCourseCodes.some(code => applies(code)) && index === 0) {
      return freeMap(courseResult);
    }

    return courseResult;
  };

  for (const [ index, courseResult ] of courseResults.entries()) {
    courseResults[index] = applyPromoCodeFreeCourse(courseResult, index, courseResults);
  }
};
