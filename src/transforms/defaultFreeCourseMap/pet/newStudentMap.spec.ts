import faker from 'faker';
import { CourseResult, MapFunction } from '../../../types';

import { getDefaultFreePetNewStudentMap } from './newStudentMap';

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
  order: 0,
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

describe('getDefaultFreePetNewStudentMap', () => {

  it('should be a function', () => {
    expect(typeof getDefaultFreePetNewStudentMap).toBe('function');
  });

  it('should return a function', () => {
    const now = faker.date.recent();
    expect(typeof getDefaultFreePetNewStudentMap(now)).toBe('function');
  });

  describe('the returned function', () => {
    let freeCoursesMap: MapFunction<CourseResult, CourseResult>;

    beforeEach(() => {
      const now = faker.date.recent();
      freeCoursesMap = getDefaultFreePetNewStudentMap(now);
    });

    it('should set FA to free if DG is selected', () => {
      const courseResults: CourseResult[] = [
        { ...fakeCourseResult, code: 'FA' },
        { ...fakeCourseResult, code: 'DG' },
      ];
      const expected: CourseResult[] = [
        { ...fakeCourseResult, code: 'FA', free: true, multiCourseDiscountRate: 0, multiCourseDiscount: fakeCourseResult.cost, promoDiscount: 0, shippingDiscount: 0, discountedCost: 0, shipping: 0, plans: { ...fakeCourseResult.plans, full: { discount: 0, deposit: 0, installmentSize: 0, installments: 0, remainder: 0, total: 0, originalDeposit: 0, originalInstallments: 0 }, part: { discount: 0, deposit: 0, installmentSize: 0, installments: 0, remainder: 0, total: 0, originalDeposit: 0, originalInstallments: 0 } } },
        { ...fakeCourseResult, code: 'DG' },
      ];
      expect(courseResults.map(freeCoursesMap)).toEqual(expected);
    });

    it('should not set FA to free if DG is not selected', () => {
      const courseResults: CourseResult[] = [
        { ...fakeCourseResult, code: 'FA' },
        { ...fakeCourseResult, code: 'DS' },
        { ...fakeCourseResult, code: 'MZ' },
        { ...fakeCourseResult, code: 'EP' },
      ];
      expect(courseResults.map(freeCoursesMap)).toEqual(courseResults);
    });
  });
});
