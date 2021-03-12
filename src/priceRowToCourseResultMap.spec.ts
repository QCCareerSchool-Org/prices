import { priceRowToCourseResultMap } from './priceRowToCourseResultMap';
import { CourseResult, PriceRow } from './types';

describe('getPriceRowToCourseResultMap', () => {
  it('should be a function', () => {
    expect(typeof priceRowToCourseResultMap).toBe('function');
  });

  it('should map PriceRows to CourseResult, rounding off decimal to the appropraite precision', () => {
    const priceRow: PriceRow = {
      code: 'ZU-CA',
      currencyCode: 'CAD',
      cost: 3232.436,
      multiCourseDiscountRate: 0.40,
      deposit: 342.311,
      discount: 22.114,
      installments: 3.9,
      courseCode: 'ZU',
      courseName: 'Zergling Herding',
      shipping: 83.113,
    };
    const courseResult: CourseResult = {
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
    expect(priceRowToCourseResultMap(priceRow)).toEqual(courseResult);
  });
});
