import faker from 'faker';
import { CourseResult, MapFunction } from '../../../types';

import { getDefaultFreeEventExistingStudentMap } from './existingStudentMap';

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

describe('getDefaultFreeEventExistingStudentMap', () => {

  it('should be a function', () => {
    expect(typeof getDefaultFreeEventExistingStudentMap).toBe('function');
  });

  it('should return a function', () => {
    const now = faker.date.recent();
    expect(typeof getDefaultFreeEventExistingStudentMap(now)).toBe('function');
  });

  describe('the returned function', () => {
    let freeCoursesMap: MapFunction<CourseResult, CourseResult>;

    beforeEach(() => {
      const now = faker.date.recent();
      freeCoursesMap = getDefaultFreeEventExistingStudentMap(now);
    });

    it('should not set any courses to free', () => {
      const courseResults: CourseResult[] = [
        { ...fakeCourseResult, code: 'DW' },
        { ...fakeCourseResult, code: 'MZ' },
        { ...fakeCourseResult, code: 'EP' },
        { ...fakeCourseResult, code: 'LW' },
        { ...fakeCourseResult, code: 'VE' },
        { ...fakeCourseResult, code: 'CE' },
      ];
      const expected: CourseResult[] = [
        { ...fakeCourseResult, code: 'DW' },
        { ...fakeCourseResult, code: 'MZ' },
        { ...fakeCourseResult, code: 'EP' },
        { ...fakeCourseResult, code: 'LW' },
        { ...fakeCourseResult, code: 'VE' },
        { ...fakeCourseResult, code: 'CE' },
      ];
      expect(courseResults.map(freeCoursesMap)).toEqual(expected);
    });
  });
});
