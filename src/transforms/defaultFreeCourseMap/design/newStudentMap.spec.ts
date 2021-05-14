import faker from 'faker';
import { CourseResult, MapFunction } from '../../../types';

import { getDefaultFreeDesignNewStudentMap } from './newStudentMap';

const fakeCourseResult: CourseResult = {
  code: 'ZU',
  name: 'Zergling Herding',
  primary: false,
  cost: 3232.44,
  multiCourseDiscountRate: 0.40,
  multiCourseDiscount: 0,
  promoDiscount: 0,
  shippingDiscount: 0,
  discountedCost: 3232.44,
  plans: {
    full: {
      discount: 22.11,
      deposit: 3210.33,
      installmentSize: 0,
      installments: 0,
      remainder: 0,
      total: 3210.33,
      originalDeposit: 3210.33,
      originalInstallments: 0,
    },
    part: {
      discount: 0,
      deposit: 342.31,
      installmentSize: 722.53,
      installments: 4,
      remainder: 0.01,
      total: 3232.44,
      originalDeposit: 342.31,
      originalInstallments: 4,
    },
  },
  shipping: 83.11,
  free: false,
  discountMessage: null,
};

describe('getDefaultFreeDesignNewStudentMap', () => {

  it('should be a function', () => {
    expect(typeof getDefaultFreeDesignNewStudentMap).toBe('function');
  });

  it('should return a function', () => {
    const now = faker.date.recent();
    expect(typeof getDefaultFreeDesignNewStudentMap(now)).toBe('function');
  });

  describe('the returned function', () => {
    let freeCoursesMap: MapFunction<CourseResult, CourseResult>;

    describe('before May 17, 2021 at 09:00', () => {
      const now = new Date(Date.UTC(2021, 4, 16)); // May 16, 2021 at 12:00

      beforeEach(() => {
        freeCoursesMap = getDefaultFreeDesignNewStudentMap(now);
      });

      it('should set the first design course to free if there are other design courses', () => {
        const courseResults: CourseResult[] = [
          { ...fakeCourseResult, code: 'HS' }, // not a design course
          { ...fakeCourseResult, code: 'PO' }, // first design course
          { ...fakeCourseResult, code: 'I2' }, // other design course
          { ...fakeCourseResult, code: 'MZ' }, // not a design course
        ];
        const expected: CourseResult[] = [
          { ...fakeCourseResult, code: 'HS' },
          { ...fakeCourseResult, code: 'PO', free: true, multiCourseDiscountRate: 0, multiCourseDiscount: fakeCourseResult.cost, promoDiscount: 0, shippingDiscount: 0, discountedCost: 0, shipping: 0, plans: { ...fakeCourseResult.plans, full: { discount: 0, deposit: 0, installmentSize: 0, installments: 0, remainder: 0, total: 0, originalDeposit: 0, originalInstallments: 0 }, part: { discount: 0, deposit: 0, installmentSize: 0, installments: 0, remainder: 0, total: 0, originalDeposit: 0, originalInstallments: 0 } } },
          { ...fakeCourseResult, code: 'I2' },
          { ...fakeCourseResult, code: 'MZ' },
        ];
        expect(courseResults.map(freeCoursesMap)).toEqual(expected);
      });

      it('should set at most one design course to free if there are other design courses', () => {
        const courseResults: CourseResult[] = [
          { ...fakeCourseResult, code: 'HS' }, // not a design course
          { ...fakeCourseResult, code: 'PO' }, // first design course
          { ...fakeCourseResult, code: 'I2' }, // other design course
          { ...fakeCourseResult, code: 'ST' }, // other design course
          { ...fakeCourseResult, code: 'FS' }, // other design course
          { ...fakeCourseResult, code: 'MZ' }, // not a design course
          { ...fakeCourseResult, code: 'VD' }, // other design course
        ];
        const expected: CourseResult[] = [
          { ...fakeCourseResult, code: 'HS' },
          { ...fakeCourseResult, code: 'PO', free: true, multiCourseDiscountRate: 0, multiCourseDiscount: fakeCourseResult.cost, promoDiscount: 0, shippingDiscount: 0, discountedCost: 0, shipping: 0, plans: { ...fakeCourseResult.plans, full: { discount: 0, deposit: 0, installmentSize: 0, installments: 0, remainder: 0, total: 0, originalDeposit: 0, originalInstallments: 0 }, part: { discount: 0, deposit: 0, installmentSize: 0, installments: 0, remainder: 0, total: 0, originalDeposit: 0, originalInstallments: 0 } } },
          { ...fakeCourseResult, code: 'I2' },
          { ...fakeCourseResult, code: 'ST' },
          { ...fakeCourseResult, code: 'FS' },
          { ...fakeCourseResult, code: 'MZ' },
          { ...fakeCourseResult, code: 'VD' },
        ];
        expect(courseResults.map(freeCoursesMap)).toEqual(expected);
      });

      it('should not set the first design course we see as free if there are no other design courses', () => {
        const courseResults: CourseResult[] = [
          { ...fakeCourseResult, code: 'HS' }, // not a design course
          { ...fakeCourseResult, code: 'PO' }, // first design couse
          { ...fakeCourseResult, code: 'MZ' }, // not a design course
        ];
        expect(courseResults.map(freeCoursesMap)).toEqual(courseResults);
      });
    });

    describe('after May 17, 2021 at 09:00', () => {
      const now = new Date(Date.UTC(2021, 4, 17, 13)); // May 17, 2021 at 09:00

      beforeEach(() => {
        freeCoursesMap = getDefaultFreeDesignNewStudentMap(now);
      });

      it('should not set any courses to free', () => {
        const courseResults: CourseResult[] = [
          { ...fakeCourseResult, code: 'HS' }, // not a design course
          { ...fakeCourseResult, code: 'PO' }, // first design course
          { ...fakeCourseResult, code: 'I2' }, // other design course
          { ...fakeCourseResult, code: 'ST' }, // other design course
          { ...fakeCourseResult, code: 'FS' }, // other design course
          { ...fakeCourseResult, code: 'MZ' }, // not a design course
          { ...fakeCourseResult, code: 'VD' }, // other design course
        ];
        expect(courseResults.map(freeCoursesMap)).toEqual(courseResults);
      });
    });
  });
});
