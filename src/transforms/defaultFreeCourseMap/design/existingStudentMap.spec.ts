import faker from 'faker';
import { CourseResult, MapFunction } from '../../../types';

import { getDefaultFreeDesignExistingStudentMap } from './existingStudentMap';

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

describe('getDefaultFreeDesignExistingStudentMap', () => {

  it('should be a function', () => {
    expect(typeof getDefaultFreeDesignExistingStudentMap).toBe('function');
  });

  it('should return a function', () => {
    const now = faker.date.recent();
    expect(typeof getDefaultFreeDesignExistingStudentMap(now)).toBe('function');
  });

  describe('the returned function', () => {
    let freeCoursesMap: MapFunction<CourseResult, CourseResult>;

    beforeEach(() => {
      const now = faker.date.recent();
      freeCoursesMap = getDefaultFreeDesignExistingStudentMap(now);
    });

    it('should set VD to free if any other design course is selected', () => {
      const courseResults: CourseResult[] = [
        { ...fakeCourseResult, code: 'VD' }, // VD course
        { ...fakeCourseResult, code: 'PO' }, // other design course
      ];
      const expected: CourseResult[] = [
        { ...fakeCourseResult, code: 'VD', free: true, multiCourseDiscountRate: 0, multiCourseDiscount: fakeCourseResult.cost, promoDiscount: 0, shippingDiscount: 0, discountedCost: 0, shipping: 0, plans: { ...fakeCourseResult.plans, full: { discount: 0, deposit: 0, installmentSize: 0, installments: 0, remainder: 0, total: 0, originalDeposit: 0, originalInstallments: 0 }, part: { discount: 0, deposit: 0, installmentSize: 0, installments: 0, remainder: 0, total: 0, originalDeposit: 0, originalInstallments: 0 } } },
        { ...fakeCourseResult, code: 'PO' },
      ];
      expect(courseResults.map(freeCoursesMap)).toEqual(expected);
    });

    it('should not set VD to free if no other course is selected', () => {
      const courseResults: CourseResult[] = [
        { ...fakeCourseResult, code: 'VD' }, // VD course
      ];
      expect(courseResults.map(freeCoursesMap)).toEqual(courseResults);
    });

    it('should not set VD to free if none of the other selected are design courses', () => {
      const courseResults: CourseResult[] = [
        { ...fakeCourseResult, code: 'VD' }, // VD course
        { ...fakeCourseResult, code: 'MZ' }, // non-design course
        { ...fakeCourseResult, code: 'EP' }, // non-design course
      ];
      expect(courseResults.map(freeCoursesMap)).toEqual(courseResults);
    });

    it('should not set VD to free if there\'s another design course but it\'s also VD (this shouldn\'t happen)', () => {
      const courseResults: CourseResult[] = [
        { ...fakeCourseResult, code: 'VD' }, // VD course
        { ...fakeCourseResult, code: 'VD' }, // same course
      ];
      expect(courseResults.map(freeCoursesMap)).toEqual(courseResults);
    });
  });
});
