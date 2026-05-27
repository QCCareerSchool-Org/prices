import type { CoursePrice } from './coursePrice';
import { ppaFreeCourseCodes } from './promoCodeCalculator';
import { isDesignCourse, isEventFoundationCourse, isEventSpecialtyCourse } from '../courses';
import type { PriceOptions } from '@/domain/priceQuery';

export class FreeCourseApplicator {
  private static readonly allAccessFreeCourses: Record<string, string[]> = {
    AA: [ 'EP', 'CP', 'ED', 'DW', 'LW', 'PE', 'FL', 'EB', 'VE' ],
    AM: [ 'MZ', 'MA', 'SK', 'SF', 'MW', 'HS', 'AB', 'PW', 'PF' ],
  };

  public constructor(
    private readonly coursePrices: CoursePrice[],
    private readonly promoCode: string | undefined,
    private readonly options: PriceOptions,
  ) { /* empty */ }

  public applyDefaultFreeCourses(): void {
    for (const coursePrice of this.coursePrices) {
      // FA is free if taking DG
      if (this.options.discountAll !== true && coursePrice.code === 'FA' && this.coursePrices.some(c => c.code === 'DG')) {
        coursePrice.makeFree();
        continue;
      }

      // VD and DB are free if taking I2
      if (this.options.discountAll !== true && (coursePrice.code === 'VD' || coursePrice.code === 'DB') && this.coursePrices.some(c => c.code === 'I2')) {
        coursePrice.makeFree();
      }
    }

    // apply free all-access program courses
    for (const [ paidCourse, freeCourses ] of Object.entries(FreeCourseApplicator.allAccessFreeCourses)) {
      if (this.coursePrices.some(c => c.code === paidCourse && !c.free)) {
        for (const coursePrice of this.coursePrices) {
          if (freeCourses.includes(coursePrice.code)) {
            coursePrice.makeFree();
          }
        }
      }
    }
  }

  public applyPromoCodeFreeCourses(): void {
    let applied = false;
    let count = 0;

    for (let index = 0; index < this.coursePrices.length; index++) {
      const coursePrice = this.coursePrices[index];
      if (!coursePrice) {
        throw Error('Course price not found');
      }

      if (this.promoCode === 'FREEPRO') {
        if (coursePrice.code === 'MW' && this.coursePrices.some(c => c.code === 'MZ')) {
          coursePrice.makeFree();
          continue;
        }
      }

      if (this.promoCode === 'EXPERT' && !applied) {
        if (isEventSpecialtyCourse(coursePrice.code) && this.coursePrices.some(c => isEventFoundationCourse(c.code))) {
          applied = true;
          coursePrice.makeFree();
          continue;
        }
      }

      if ([ 'BOGO', 'BOGOCATALYST', 'BOGOCATALYST100' ].includes(this.promoCode ?? '') && !applied) {
        if (this.coursePrices.length >= 2) {
          applied = true;
          coursePrice.makeFree();
          continue;
        }
      }

      if (this.promoCode === 'BOGO2ANY' && count < 2) {
        if ((this.coursePrices.length >= 2 && count < 1) || this.coursePrices.length >= 3) {
          count++;
          coursePrice.makeFree();
          continue;
        }
      }

      if ([ 'BOGOMZ', 'BOGOMZ300' ].includes(this.promoCode ?? '') && !applied) {
        if (coursePrice.code !== 'MZ' && this.coursePrices.some(c => c.code === 'MZ')) {
          applied = true;
          coursePrice.makeFree();
          continue;
        }
      }

      if ([ 'SKINCARE', 'SKINCARE100', 'SKINCARE300' ].includes(this.promoCode ?? '')) {
        if (coursePrice.code === 'SK' && this.coursePrices.some(c => c.code === 'MZ')) {
          coursePrice.makeFree();
          continue;
        }
      }

      if (this.promoCode === 'FREESTYLE') {
        if (coursePrice.code === 'PF' && this.coursePrices.some(c => c.code === 'MZ')) {
          coursePrice.makeFree();
          continue;
        }
      }

      if (this.promoCode === 'EVENTFREECOURSE' && !applied) {
        if (this.coursePrices.length >= 2 && index < this.coursePrices.length - 1 && this.coursePrices.some(c => isEventFoundationCourse(c.code))) {
          applied = true;
          coursePrice.makeFree();
          continue;
        }
      }

      if ([ 'SPECIALTY', 'SPECIALTY100' ].includes(this.promoCode ?? '') && !applied) {
        if (this.coursePrices.some(c => isEventFoundationCourse(c.code) && isEventSpecialtyCourse(coursePrice.code))) {
          applied = true;
          coursePrice.makeFree();
          continue;
        }
      }

      if ([ '2SPECIALTY', 'MCSPECIALTY', 'SSMCSPECIALTY', '2SPECIALTY100' ].includes(this.promoCode ?? '') && count < 2) {
        if (this.coursePrices.some(c => isEventFoundationCourse(c.code) && isEventSpecialtyCourse(coursePrice.code))) {
          count++;
          coursePrice.makeFree();
          continue;
        }
      }

      if (this.promoCode === '2SPECIALTYED' && count < 2) {
        if (this.coursePrices.some(c => isEventFoundationCourse(c.code) && c.code !== 'ED') && (isEventSpecialtyCourse(coursePrice.code) || coursePrice.code === 'ED')) {
          count++;
          coursePrice.makeFree();
          continue;
        }
      }

      // two free specialty courses, but ED is considered a specialty course
      if (this.promoCode === 'PROFITPIVOT' && count < 2) {
        if (this.coursePrices.some(c => isEventFoundationCourse(c.code) && c.code !== 'ED') && (isEventSpecialtyCourse(coursePrice.code) || coursePrice.code === 'ED')) {
          count++;
          coursePrice.makeFree();
          continue;
        }
      }

      if (this.promoCode === 'FREELUXURY') {
        if (coursePrice.code === 'LW' && this.coursePrices.some(c => isEventFoundationCourse(c.code))) {
          coursePrice.makeFree();
          continue;
        }
      }

      if ([ 'MASTERCLASS', 'SSMASTERCLASS' ].includes(this.promoCode ?? '') && !applied) {
        if (isDesignCourse(coursePrice.code) && coursePrice.code !== 'I2' && this.coursePrices.some(c => c.code === 'I2')) {
          applied = true;
          coursePrice.makeFree();
          continue;
        }
      }

      if (this.promoCode === 'MASTERCLASS150' && !applied) {
        if (isDesignCourse(coursePrice.code) && coursePrice.code !== 'I2' && this.coursePrices.some(c => c.code === 'I2')) {
          applied = true;
          coursePrice.makeFree();
          continue;
        }
      }

      if (this.promoCode === 'LUXURYDESTINATION') {
        if ((coursePrice.code === 'LW' || coursePrice.code === 'DW') && this.coursePrices.some(c => c.code === 'EP')) {
          coursePrice.makeFree();
          continue;
        }
      }

      if (this.promoCode === 'PROLUMINOUS') {
        if (coursePrice.code === 'MW' && this.coursePrices.some(c => c.code === 'MZ')) {
          coursePrice.makeFree();
          continue;
        }
      }

      if (this.promoCode === 'FREEGLOBAL') {
        if (coursePrice.code === 'GB' && this.coursePrices.some(c => c.code === 'MZ')) {
          coursePrice.makeFree();
          continue;
        }
      }

      if (this.promoCode === 'BOGO100' && !applied) {
        if (this.options.school === 'QC Event School') {
          if (this.coursePrices.length >= 2 && this.coursePrices.some(c => isEventFoundationCourse(c.code))) {
            applied = true;
            coursePrice.makeFree();
            continue;
          }
        } else {
          if (this.coursePrices.length >= 2) {
            applied = true;
            coursePrice.makeFree();
            continue;
          }
        }
      }

      if (this.promoCode === 'BOGO200' && !applied) {
        if (this.coursePrices.length >= 2) {
          applied = true;
          coursePrice.makeFree();
          continue;
        }
      }

      if (this.promoCode === 'DAYCARE300' && !applied) {
        if (this.coursePrices.length >= 2 && coursePrice.code === 'DD') {
          applied = true;
          coursePrice.makeFree();
          continue;
        }
      }

      // discount either VD or VE, but not both, as long as one other (non VD, VE) course is selected
      if (this.promoCode === 'FREEVIRTUAL') {
        if (!applied && (coursePrice.code === 'VD' || coursePrice.code === 'VE') && this.coursePrices.filter(c => c.code !== 'VD' && c.code !== 'VE').length >= 1) {
          applied = true;
          coursePrice.makeFree();
          continue;
        }
      }

      // make CC free as long as some other course of equal or greater value is also selected
      if (this.promoCode === 'FREECOLOR') {
        if (coursePrice.code === 'CC' && this.coursePrices.some(c => c.code !== 'CC' && c.cost >= coursePrice.cost)) {
          coursePrice.makeFree();
          continue;
        }
      }

      if (this.promoCode === 'HALLOWEENSFX') {
        if (coursePrice.code === 'SF' && this.coursePrices.some(c => c.code === 'MZ')) {
          coursePrice.makeFree();
          continue;
        }
      }

      if (this.promoCode === 'FREEPW') {
        if (coursePrice.code === 'PW' && this.coursePrices.some(c => c.code === 'MZ')) {
          coursePrice.makeFree();
          continue;
        }
      }

      // I'm sure this could be better
      if (this.promoCode === 'BOGOVIRTUAL') {
        const virtualSelected = this.coursePrices.some(c => (this.options.school === 'QC Design School' && c.code === 'VD') || (this.options.school === 'QC Event School' && c.code === 'VE'));

        const isVirtual = (this.options.school === 'QC Design School' && coursePrice.code === 'VD') || (this.options.school === 'QC Event School' && coursePrice.code === 'VE');

        if (this.coursePrices.length >= 2) {
          if (virtualSelected) {
            if (isVirtual) {
              coursePrice.makeFree();
              continue;
            }
          }
        }

        if ((this.coursePrices.length >= 2 && !virtualSelected) || (this.coursePrices.length >= 3 && virtualSelected)) {
          if (!isVirtual) {
            if (count === 0) {
              count++;
              coursePrice.makeFree();
              continue;
            }
          }
        }
      }

      if (ppaFreeCourseCodes.includes(this.promoCode ?? '') && index === 0) {
        coursePrice.makeFree();
      }
    }
  }
}
