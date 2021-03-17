import faker from 'faker';
import { CourseResult } from '../../types';

import { getDefaultFreeCourseMap } from './getDefaultFreeCourseMap';

const fakeCourseResult = {
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

describe('getFreeCoursesMap', () => {

  it('should be a function', () => {
    expect(typeof getDefaultFreeCourseMap).toBe('function');
  });

  it('should return a function', () => {
    const now = faker.date.recent();
    expect(typeof getDefaultFreeCourseMap(now)).toBe('function');
  });

  describe('event promotion', () => {

    it('should set DW to free if EP is selected when options.school is \'QC Event School\' and options.discountAll is not true', () => {
      const now = faker.date.recent();
      const freeCoursesMap = getDefaultFreeCourseMap(now, { school: 'QC Event School' });
      const courseResults: CourseResult[] = [
        { ...fakeCourseResult, code: 'DW' },
        { ...fakeCourseResult, code: 'EP' },
        { ...fakeCourseResult, code: 'MZ' },
        { ...fakeCourseResult, code: 'FD' },
      ];
      const expected: CourseResult[] = [
        { ...fakeCourseResult, code: 'DW', free: true, cost: 0, multiCourseDiscountRate: 0, multiCourseDiscount: 0, promoDiscount: 0, shippingDiscount: 0, discountedCost: 0, shipping: 0, plans: { ...fakeCourseResult.plans, full: { discount: 0, deposit: 0, installmentSize: 0, installments: 0, remainder: 0, total: 0, originalDeposit: 0, originalInstallments: 0 }, part: { discount: 0, deposit: 0, installmentSize: 0, installments: 0, remainder: 0, total: 0, originalDeposit: 0, originalInstallments: 0 } } },
        { ...fakeCourseResult, code: 'EP' },
        { ...fakeCourseResult, code: 'MZ' },
        { ...fakeCourseResult, code: 'FD' },
      ];
      expect(courseResults.map(freeCoursesMap)).toEqual(expected);
    });

    it('should set LW to free if EP is selected when options.school is \'QC Event School\' and options.discountAll is not true', () => {
      const now = faker.date.recent();
      const freeCoursesMap = getDefaultFreeCourseMap(now, { school: 'QC Event School' });
      const courseResults: CourseResult[] = [
        { ...fakeCourseResult, code: 'EP' },
        { ...fakeCourseResult, code: 'MZ' },
        { ...fakeCourseResult, code: 'LW' },
        { ...fakeCourseResult, code: 'FD' },
      ];
      const expected: CourseResult[] = [
        { ...fakeCourseResult, code: 'EP' },
        { ...fakeCourseResult, code: 'MZ' },
        { ...fakeCourseResult, code: 'LW', free: true, cost: 0, multiCourseDiscountRate: 0, multiCourseDiscount: 0, promoDiscount: 0, shippingDiscount: 0, discountedCost: 0, shipping: 0, plans: { ...fakeCourseResult.plans, full: { discount: 0, deposit: 0, installmentSize: 0, installments: 0, remainder: 0, total: 0, originalDeposit: 0, originalInstallments: 0 }, part: { discount: 0, deposit: 0, installmentSize: 0, installments: 0, remainder: 0, total: 0, originalDeposit: 0, originalInstallments: 0 } } },
        { ...fakeCourseResult, code: 'FD' },
      ];
      expect(courseResults.map(freeCoursesMap)).toEqual(expected);
    });

    it('should set DW and LW to free if EP is selected when options.school is \'QC Event School\' and options.discountAll is not true', () => {
      const now = faker.date.recent();
      const freeCoursesMap = getDefaultFreeCourseMap(now, { school: 'QC Event School' });
      const courseResults: CourseResult[] = [
        { ...fakeCourseResult, code: 'DW' },
        { ...fakeCourseResult, code: 'EP' },
        { ...fakeCourseResult, code: 'MZ' },
        { ...fakeCourseResult, code: 'LW' },
        { ...fakeCourseResult, code: 'FD' },
      ];
      const expected: CourseResult[] = [
        { ...fakeCourseResult, code: 'DW', free: true, cost: 0, multiCourseDiscountRate: 0, multiCourseDiscount: 0, promoDiscount: 0, shippingDiscount: 0, discountedCost: 0, shipping: 0, plans: { ...fakeCourseResult.plans, full: { discount: 0, deposit: 0, installmentSize: 0, installments: 0, remainder: 0, total: 0, originalDeposit: 0, originalInstallments: 0 }, part: { discount: 0, deposit: 0, installmentSize: 0, installments: 0, remainder: 0, total: 0, originalDeposit: 0, originalInstallments: 0 } } },
        { ...fakeCourseResult, code: 'EP' },
        { ...fakeCourseResult, code: 'MZ' },
        { ...fakeCourseResult, code: 'LW', free: true, cost: 0, multiCourseDiscountRate: 0, multiCourseDiscount: 0, promoDiscount: 0, shippingDiscount: 0, discountedCost: 0, shipping: 0, plans: { ...fakeCourseResult.plans, full: { discount: 0, deposit: 0, installmentSize: 0, installments: 0, remainder: 0, total: 0, originalDeposit: 0, originalInstallments: 0 }, part: { discount: 0, deposit: 0, installmentSize: 0, installments: 0, remainder: 0, total: 0, originalDeposit: 0, originalInstallments: 0 } } },
        { ...fakeCourseResult, code: 'FD' },
      ];
      expect(courseResults.map(freeCoursesMap)).toEqual(expected);
    });

    it('should not set DW nor LW to free if EP is not selected when options.school is \'QC Event School\' and options.discountAll is not true', () => {
      const now = faker.date.recent();
      const freeCoursesMap = getDefaultFreeCourseMap(now, { school: 'QC Event School' });
      const courseResults: CourseResult[] = [
        { ...fakeCourseResult, code: 'DW' },
        { ...fakeCourseResult, code: 'MZ' },
        { ...fakeCourseResult, code: 'LW' },
        { ...fakeCourseResult, code: 'FD' },
      ];
      const expected: CourseResult[] = [
        { ...fakeCourseResult, code: 'DW' },
        { ...fakeCourseResult, code: 'MZ' },
        { ...fakeCourseResult, code: 'LW' },
        { ...fakeCourseResult, code: 'FD' },
      ];
      expect(courseResults.map(freeCoursesMap)).toEqual(expected);
    });

    it('should not set DW nor LW to free if EP is selected and options.school is \'QC Event School\' but options.discountAll is true', () => {
      const now = faker.date.recent();
      const freeCoursesMap = getDefaultFreeCourseMap(now, { school: 'QC Design School', discountAll: true });
      const courseResults: CourseResult[] = [
        { ...fakeCourseResult, code: 'DW' },
        { ...fakeCourseResult, code: 'EP' },
        { ...fakeCourseResult, code: 'MZ' },
        { ...fakeCourseResult, code: 'LW' },
        { ...fakeCourseResult, code: 'FD' },
      ];
      const expected: CourseResult[] = [
        { ...fakeCourseResult, code: 'DW' },
        { ...fakeCourseResult, code: 'EP' },
        { ...fakeCourseResult, code: 'MZ' },
        { ...fakeCourseResult, code: 'LW' },
        { ...fakeCourseResult, code: 'FD' },
      ];
      expect(courseResults.map(freeCoursesMap)).toEqual(expected);
    });

    it('should not set DW nor LW to free if EP is selected but options.school is not \'QC Event School\'', () => {
      const now = faker.date.recent();
      const freeCoursesMap = getDefaultFreeCourseMap(now, { school: 'QC Design School' });
      const courseResults: CourseResult[] = [
        { ...fakeCourseResult, code: 'DW' },
        { ...fakeCourseResult, code: 'EP' },
        { ...fakeCourseResult, code: 'MZ' },
        { ...fakeCourseResult, code: 'LW' },
        { ...fakeCourseResult, code: 'FD' },
      ];
      const expected: CourseResult[] = [
        { ...fakeCourseResult, code: 'DW' },
        { ...fakeCourseResult, code: 'EP' },
        { ...fakeCourseResult, code: 'MZ' },
        { ...fakeCourseResult, code: 'LW' },
        { ...fakeCourseResult, code: 'FD' },
      ];
      expect(courseResults.map(freeCoursesMap)).toEqual(expected);
    });
  });

  describe('design promotion', () => {

    it('should set the first design course we see as free if there are other design courses and options.school is \'QC Design School\' and options.discountAll is not true', () => {
      const now = faker.date.recent();
      const freeCoursesMap = getDefaultFreeCourseMap(now, { school: 'QC Design School' });
      const courseResults: CourseResult[] = [
        { ...fakeCourseResult, code: 'HS' },
        { ...fakeCourseResult, code: 'PO' },
        { ...fakeCourseResult, code: 'I2' },
        { ...fakeCourseResult, code: 'MZ' },
      ];
      const expected: CourseResult[] = [
        { ...fakeCourseResult, code: 'HS' },
        { ...fakeCourseResult, code: 'PO', free: true, cost: 0, multiCourseDiscountRate: 0, multiCourseDiscount: 0, promoDiscount: 0, shippingDiscount: 0, discountedCost: 0, shipping: 0, plans: { ...fakeCourseResult.plans, full: { discount: 0, deposit: 0, installmentSize: 0, installments: 0, remainder: 0, total: 0, originalDeposit: 0, originalInstallments: 0 }, part: { discount: 0, deposit: 0, installmentSize: 0, installments: 0, remainder: 0, total: 0, originalDeposit: 0, originalInstallments: 0 } } },
        { ...fakeCourseResult, code: 'I2' },
        { ...fakeCourseResult, code: 'MZ' },
      ];
      expect(courseResults.map(freeCoursesMap)).toEqual(expected);
    });

    it('should not set the first design course we see as free if there are no other design courses and options.school is \'QC Design School\' and options.discountAll is not true', () => {
      const now = faker.date.recent();
      const freeCoursesMap = getDefaultFreeCourseMap(now, { school: 'QC Design School' });
      const courseResults: CourseResult[] = [
        { ...fakeCourseResult, code: 'HS' },
        { ...fakeCourseResult, code: 'PO' },
        { ...fakeCourseResult, code: 'MZ' },
      ];
      const expected: CourseResult[] = [
        { ...fakeCourseResult, code: 'HS' },
        { ...fakeCourseResult, code: 'PO' },
        { ...fakeCourseResult, code: 'MZ' },
      ];
      expect(courseResults.map(freeCoursesMap)).toEqual(expected);
    });

    it('should not set any but the first design course we see as free if there are other design courses and options.school is \'QC Design School\' and options.discountAll is not true', () => {
      const now = faker.date.recent();
      const freeCoursesMap = getDefaultFreeCourseMap(now, { school: 'QC Design School' });
      const courseResults: CourseResult[] = [
        { ...fakeCourseResult, code: 'HS' },
        { ...fakeCourseResult, code: 'PO' },
        { ...fakeCourseResult, code: 'I2' },
        { ...fakeCourseResult, code: 'ST' },
        { ...fakeCourseResult, code: 'FS' },
        { ...fakeCourseResult, code: 'MZ' },
        { ...fakeCourseResult, code: 'VD' },
      ];
      const expected: CourseResult[] = [
        { ...fakeCourseResult, code: 'HS' },
        { ...fakeCourseResult, code: 'PO', free: true, cost: 0, multiCourseDiscountRate: 0, multiCourseDiscount: 0, promoDiscount: 0, shippingDiscount: 0, discountedCost: 0, shipping: 0, plans: { ...fakeCourseResult.plans, full: { discount: 0, deposit: 0, installmentSize: 0, installments: 0, remainder: 0, total: 0, originalDeposit: 0, originalInstallments: 0 }, part: { discount: 0, deposit: 0, installmentSize: 0, installments: 0, remainder: 0, total: 0, originalDeposit: 0, originalInstallments: 0 } } },
        { ...fakeCourseResult, code: 'I2' },
        { ...fakeCourseResult, code: 'ST' },
        { ...fakeCourseResult, code: 'FS' },
        { ...fakeCourseResult, code: 'MZ' },
        { ...fakeCourseResult, code: 'VD' },
      ];
      expect(courseResults.map(freeCoursesMap)).toEqual(expected);
    });

    it('should not set courses free if options.discountAll is true', () => {
      const now = faker.date.recent();
      const freeCoursesMap = getDefaultFreeCourseMap(now, { school: 'QC Design School', discountAll: true });
      const courseResults: CourseResult[] = [
        { ...fakeCourseResult, code: 'HS' },
        { ...fakeCourseResult, code: 'PO' },
        { ...fakeCourseResult, code: 'I2' },
        { ...fakeCourseResult, code: 'ST' },
        { ...fakeCourseResult, code: 'FS' },
        { ...fakeCourseResult, code: 'MZ' },
        { ...fakeCourseResult, code: 'VD' },
      ];
      const expected: CourseResult[] = [
        { ...fakeCourseResult, code: 'HS' },
        { ...fakeCourseResult, code: 'PO' },
        { ...fakeCourseResult, code: 'I2' },
        { ...fakeCourseResult, code: 'ST' },
        { ...fakeCourseResult, code: 'FS' },
        { ...fakeCourseResult, code: 'MZ' },
        { ...fakeCourseResult, code: 'VD' },
      ];
      expect(courseResults.map(freeCoursesMap)).toEqual(expected);
    });

    it('should not set courses free if options.school is not \'QC Design School\'', () => {
      const now = faker.date.recent();
      const freeCoursesMap = getDefaultFreeCourseMap(now, { school: 'QC Makeup Academy' });
      const courseResults: CourseResult[] = [
        { ...fakeCourseResult, code: 'HS' },
        { ...fakeCourseResult, code: 'PO' },
        { ...fakeCourseResult, code: 'I2' },
        { ...fakeCourseResult, code: 'ST' },
        { ...fakeCourseResult, code: 'FS' },
        { ...fakeCourseResult, code: 'MZ' },
        { ...fakeCourseResult, code: 'VD' },
      ];
      const expected: CourseResult[] = [
        { ...fakeCourseResult, code: 'HS' },
        { ...fakeCourseResult, code: 'PO' },
        { ...fakeCourseResult, code: 'I2' },
        { ...fakeCourseResult, code: 'ST' },
        { ...fakeCourseResult, code: 'FS' },
        { ...fakeCourseResult, code: 'MZ' },
        { ...fakeCourseResult, code: 'VD' },
      ];
      expect(courseResults.map(freeCoursesMap)).toEqual(expected);
    });
  });
});
