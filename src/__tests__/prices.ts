import * as faker from 'faker';
import Big from 'big.js';
import mysql from 'promise-mysql';

import { lookupCurrency, lookupPrice, sumBigArray, makeupCourse, CourseResult, courseSort, getCalculatePrices, PriceRow } from '../prices';

jest.mock('../price-lookups', () => ({
  lookupPriceByCountryAndProvince: async () => [ {} ],
  lookupPriceByCountry: async () => [ {} ],
}));

describe('sumBigArray', () => {
  test('sums properly', () => {
    const numbers = Array(14).fill(null).map(() => Big(faker.random.number()));
    let manualSum = Big(0);
    numbers.forEach(n => {
      manualSum = manualSum.plus(n);
    });
    const result = numbers.reduce(sumBigArray, Big(0));
    expect(manualSum.eq(result)).toBe(true);
  });
});

describe('lookupCurrency', () => {
  it('should return the first row that matches', async () => {
    const currencyRows = [
      { code: 'CAD', name: 'Canadian Dollars', symbol: '$', exchangeRate: 1.3 },
      { code: 'USD', name: 'US Dollars', symbol: '$', exchangeRate: 1 },
    ]
    const connection = {
      query: () => currencyRows,
    };
    await expect(lookupCurrency(connection as unknown as mysql.PoolConnection, 'CAD')).resolves.toEqual(currencyRows[0]);
  });

  it('should throw an error if no match found', async () => {
    const priceRows: any[] = []
    const connection = {
      query: () => priceRows,
    };
    await expect(lookupCurrency(connection as unknown as mysql.PoolConnection, 'CAD')).rejects.toThrow('Unable to find currency');
  });
});

describe('makeupCourse', () => {
  [ 'MM', 'MA', 'MZ', 'MK', 'SF', 'HS', 'AB', 'MW', 'PW', 'GB', 'SK' ].forEach((course) => {
    it(`should return true for ${course}`, () => {
      expect(makeupCourse(course)).toBe(true);
    });
  });

  it('should return false for other courses', () => {
    expect(makeupCourse('ZZ')).toBe(false);
  });
});

describe('mocking', () => {
  it('should mock', async () => {
    const fakeConnection = {} as mysql.PoolConnection;
    await lookupPrice(fakeConnection, 'MZ', 'CA', 'ON');
  })
})


describe('courseSort', () => {

  it('should return a negative number if a is primary and b is not primary', () => {
    const a = { primary: true } as CourseResult;
    const b = { primary: false } as CourseResult;
    expect(courseSort(a, b)).toBeLessThan(0)
  });

  it('should return a positive number if a is not primary and b is primary', () => {
    const a = { primary: false } as CourseResult;
    const b = { primary: true } as CourseResult;
    expect(courseSort(a, b)).toBeGreaterThan(0)
  });

  it('should return a positive number if a is free and b is not free, when primary is the same', () => {
    const primary = faker.random.boolean();
    const a = { primary, free: true } as CourseResult;
    const b = { primary, free: false } as CourseResult;
    expect(courseSort(a, b)).toBeGreaterThan(0)
  });

  it('should return a negative number if a is not free and b is free, when primary is the same', () => {
    const primary = faker.random.boolean();
    const a = { primary, free: false } as CourseResult;
    const b = { primary, free: true } as CourseResult;
    expect(courseSort(a, b)).toBeLessThan(0)
  });

  it('should return a negative number if a.cost is greater than b.cost, when primary is the same and free is the same', () => {
    const primary = faker.random.boolean();
    const free = faker.random.boolean();
    const a = { primary, free, cost: 1000 } as CourseResult;
    const b = { primary, free, cost: 50 } as CourseResult;
    expect(courseSort(a, b)).toBeLessThan(0)
  });

  it('should return a positive number if a.cost is less than b.cost, when primary is the same and free is the same', () => {
    const primary = faker.random.boolean();
    const free = faker.random.boolean();
    const a = { primary, free, cost: 43 } as CourseResult;
    const b = { primary, free, cost: 94 } as CourseResult;
    expect(courseSort(a, b)).toBeGreaterThan(0)
  });

  it('should return a negative number if a.discountedCost is greater than b.discountedCost, when primary is the same and free is the same and the cost is the same', () => {
    const primary = faker.random.boolean();
    const free = faker.random.boolean();
    const cost = faker.random.number();
    const a = { primary, free, cost, discountedCost: 1000 } as CourseResult;
    const b = { primary, free, cost, discountedCost: 50 } as CourseResult;
    expect(courseSort(a, b)).toBeLessThan(0)
  });

  it('should return a positive number if a.discountedCost is less than b.discountedCost, when primary is the same and free is the same and the cost is the same', () => {
    const primary = faker.random.boolean();
    const free = faker.random.boolean();
    const cost = faker.random.number();
    const a = { primary, free, cost, discountedCost: 43 } as CourseResult;
    const b = { primary, free, cost, discountedCost: 94 } as CourseResult;
    expect(courseSort(a, b)).toBeGreaterThan(0)
  });

  it('should return zero when primary is the same and free is the same and the cost is the same and discountedCost is the same', () => {
    const primary = faker.random.boolean();
    const free = faker.random.boolean();
    const cost = faker.random.number();
    const discountedCost = faker.random.number();
    const a = { primary, free, cost, discountedCost } as CourseResult;
    const b = { primary, free, cost, discountedCost } as CourseResult;
    expect(courseSort(a, b)).toBe(0)
  });
});

describe('getCalculatePrices', () => {

  it('should return a function', () => {
    const options = {};
    const noShipping = faker.random.arrayElement([ 'ALLOWED', 'APPLIED', 'REQUIRED', 'FORBIDDEN' ]) as 'ALLOWED' | 'APPLIED' | 'REQUIRED' | 'FORBIDDEN';
    const currencyCode = faker.random.arrayElement([ 'CAD', 'USD', 'GBP', 'AUD', 'NZD' ]) as 'CAD' | 'USD' | 'GBP' | 'AUD' | 'NZD';
    const freeCourses = [];
    const calculatePrices = getCalculatePrices(options, noShipping, currencyCode, freeCourses);
    expect(typeof calculatePrices).toBe('function');
  });

  describe('calculatePrices', () => {

    describe('when created with no special options and noShipping set to \'ALLOWED\'', () => {

      let calculatePrices;

      beforeEach(() => {
        const options = {};
        const noShipping = 'ALLOWED';
        const currencyCode = 'CAD';
        const freeCourses = [ 'YY', 'PE' ];
        calculatePrices = getCalculatePrices(options, noShipping, currencyCode, freeCourses);
      });

      it('should return a CourseResult', () => {
        const priceRows: PriceRow[] = [
          { currencyCode: 'CAD', cost: 1343, multiCourseDiscountRate: 0.25, deposit: 21, discount: 100, installments: 18, courseCode: 'Z$', courseName: 'Foo', shipping: 23 },
          { currencyCode: 'CAD', cost: 943, multiCourseDiscountRate: 0.25, deposit: 29, discount: 104, installments: 3, courseCode: 't2', courseName: 'Bar', shipping: 43 },
          { currencyCode: 'CAD', cost: 843, multiCourseDiscountRate: 0.45, deposit: 24, discount: 54, installments: 23, courseCode: 'YY', courseName: 'Baz', shipping: 31 },
        ];

        const courseResult1 = calculatePrices(priceRows[0], 0, priceRows);
        const courseResult2 = calculatePrices(priceRows[1], 1, priceRows);
        const courseResult3 = calculatePrices(priceRows[2], 2, priceRows);

        expect(courseResult1.multiCourseDiscount).toBe(0); // the first course doesn't get a multi-course discount

        expect(courseResult1).toEqual({
          code: 'Z$',
          name: 'Foo',
          primary: true,
          free: false,
          cost: 1343,
          multiCourseDiscount: 0,
          promoDiscount: 0,
          shippingDiscount: 0,
          discountedCost: 1343,
          plans: {
            full: { discount: 100, deposit: 1243, installmentSize: 0, installments: 0, remainder: 0, total: 1243, originalDeposit: 1243, originalInstallments: 0 },
            part: { discount: 0, deposit: 21, installmentSize: 73.44, installments: 18, remainder: 0.08, total: 1343, originalDeposit: 21, originalInstallments: 18 },
          },
          shipping: 23,
        });

        expect(courseResult2.plans.full.discount).toBe(0); // no course discount courses after the first
        expect(courseResult2.plans.part.installments).toBe(18); // number installments should be taken from first course

        expect(courseResult2).toEqual({
          code: 't2',
          name: 'Bar',
          primary: false,
          free: false,
          cost: 943,
          multiCourseDiscount: 235.75,
          promoDiscount: 0,
          shippingDiscount: 0,
          discountedCost: 707.25,
          plans: {
            full: { discount: 0, deposit: 707.25, installmentSize: 0, installments: 0, remainder: 0, total: 707.25, originalDeposit: 707.25, originalInstallments: 0 },
            part: { discount: 0, deposit: 29, installmentSize: 37.68, installments: 18, remainder: 0.01, total: 707.25, originalDeposit: 29, originalInstallments: 18 },
          },
          shipping: 43,
        });

        expect(courseResult3.free).toBe(true);

        expect(courseResult3).toEqual({
          code: 'YY',
          name: 'Baz',
          primary: false,
          free: true,
          cost: 843,
          multiCourseDiscount: 843,
          promoDiscount: 0,
          shippingDiscount: 0,
          discountedCost: 0,
          plans: {
            full: { discount: 0, deposit: 0, installmentSize: 0, installments: 0, remainder: 0, total: 0, originalDeposit: 0, originalInstallments: 0 },
            part: { discount: 0, deposit: 0, installmentSize: 0, installments: 0, remainder: 0, total: 0, originalDeposit: 0, originalInstallments: 0 },
          },
          shipping: 0,
        });
      });
    });

    describe('when created with no special options and noShipping set to \'REQUIRED\'', () => {

      let calculatePrices;

      beforeEach(() => {
        const options = {};
        const noShipping = 'REQUIRED';
        const currencyCode = 'CAD';
        const freeCourses = [ 'YY', 'PE' ];
        calculatePrices = getCalculatePrices(options, noShipping, currencyCode, freeCourses);
      });

      it('should return a CourseResult', () => {
        const priceRows: PriceRow[] = [
          { currencyCode: 'CAD', cost: 1343, multiCourseDiscountRate: 0.25, deposit: 21, discount: 100, installments: 18, courseCode: 'Z$', courseName: 'Foo', shipping: 23 },
          { currencyCode: 'CAD', cost: 943, multiCourseDiscountRate: 0.25, deposit: 29, discount: 104, installments: 3, courseCode: 't2', courseName: 'Bar', shipping: 43 },
          { currencyCode: 'CAD', cost: 843, multiCourseDiscountRate: 0.45, deposit: 24, discount: 54, installments: 23, courseCode: 'YY', courseName: 'Baz', shipping: 31 },
        ];

        const courseResult1 = calculatePrices(priceRows[0], 0, priceRows);
        const courseResult2 = calculatePrices(priceRows[1], 1, priceRows);
        const courseResult3 = calculatePrices(priceRows[2], 2, priceRows);

        expect(courseResult1.multiCourseDiscount).toBe(0); // the first course doesn't get a multi-course discount

        expect(courseResult1).toEqual({
          code: 'Z$',
          name: 'Foo',
          primary: true,
          free: false,
          cost: 1343,
          multiCourseDiscount: 0,
          promoDiscount: 0,
          shippingDiscount: 23,
          discountedCost: 1320,
          plans: {
            full: { discount: 100, deposit: 1220, installmentSize: 0, installments: 0, remainder: 0, total: 1220, originalDeposit: 1220, originalInstallments: 0 },
            part: { discount: 0, deposit: 21, installmentSize: 72.16, installments: 18, remainder: 0.12, total: 1320, originalDeposit: 21, originalInstallments: 18 },
          },
          shipping: 23,
        });

        expect(courseResult2.plans.full.discount).toBe(0); // no course discount courses after the first
        expect(courseResult2.plans.part.installments).toBe(18); // number installments should be taken from first course

        expect(courseResult2).toEqual({
          code: 't2',
          name: 'Bar',
          primary: false,
          free: false,
          cost: 943,
          multiCourseDiscount: 235.75,
          promoDiscount: 0,
          shippingDiscount: 43,
          discountedCost: 664.25,
          plans: {
            full: { discount: 0, deposit: 664.25, installmentSize: 0, installments: 0, remainder: 0, total: 664.25, originalDeposit: 664.25, originalInstallments: 0 },
            part: { discount: 0, deposit: 29, installmentSize: 35.29, installments: 18, remainder: 0.03, total: 664.25, originalDeposit: 29, originalInstallments: 18 },
          },
          shipping: 43,
        });

        expect(courseResult3.free).toBe(true);

        expect(courseResult3).toEqual({
          code: 'YY',
          name: 'Baz',
          primary: false,
          free: true,
          cost: 843,
          multiCourseDiscount: 843,
          promoDiscount: 0,
          shippingDiscount: 0,
          discountedCost: 0,
          plans: {
            full: { discount: 0, deposit: 0, installmentSize: 0, installments: 0, remainder: 0, total: 0, originalDeposit: 0, originalInstallments: 0 },
            part: { discount: 0, deposit: 0, installmentSize: 0, installments: 0, remainder: 0, total: 0, originalDeposit: 0, originalInstallments: 0 },
          },
          shipping: 0,
        });
      });
    });
  });
});
