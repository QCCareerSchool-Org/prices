import faker from 'faker';

import { CourseResult, CurrencyCode, PriceQueryOptions } from '../../types';
import { validateDiscounts } from './validateDiscounts';
import { getExtraDiscountMap } from './getExtraDiscountMap';

jest.mock('./validateDiscounts');
jest.mock('./shouldGetMultiCourseDiscount');
jest.mock('./studentDiscount');

describe('getExtraDiscountMap', () => {

  it('should be a function', () => {
    expect(typeof getExtraDiscountMap).toBe('function');
  });

  it('should return a function', () => {
    const currencyCode = faker.random.arrayElement<CurrencyCode>([ 'CAD', 'USD', 'GBP', 'AUD', 'NZD' ]);
    (validateDiscounts as jest.Mock).mockReturnValue(true);
    expect(typeof getExtraDiscountMap(currencyCode)).toBe('function');
  });

  it('should call validateDiscounts with undefined when called with no options', () => {
    const currencyCode = faker.random.arrayElement<CurrencyCode>([ 'CAD', 'USD', 'GBP', 'AUD', 'NZD' ]);
    (validateDiscounts as jest.Mock).mockReturnValue(true);
    getExtraDiscountMap(currencyCode);
    expect(validateDiscounts).toHaveBeenCalledTimes(1);
    expect(validateDiscounts).toHaveBeenCalledWith(undefined);
  });

  it('should call validateDiscounts with options when called with options', () => {
    const currencyCode = faker.random.arrayElement<CurrencyCode>([ 'CAD', 'USD', 'GBP', 'AUD', 'NZD' ]);
    const options: PriceQueryOptions = { promoCode: faker.random.alphaNumeric(32) };
    (validateDiscounts as jest.Mock).mockReturnValue(true);
    getExtraDiscountMap(currencyCode, options);
    expect(validateDiscounts).toHaveBeenCalledTimes(1);
    expect(validateDiscounts).toHaveBeenCalledWith(options);
  });

  it('should throw an error if validateDiscounts returns false', () => {
    const currencyCode = faker.random.arrayElement<CurrencyCode>([ 'CAD', 'USD', 'GBP', 'AUD', 'NZD' ]);
    (validateDiscounts as jest.Mock).mockReturnValue(false);
    expect(() => getExtraDiscountMap(currencyCode)).toThrowError('invalid discount signature');
  });

  it('should return a function that maps course results to course results with a promo discount added if options.studentDiscount is true', () => {
    const currencyCode = faker.finance.currencyCode() as CurrencyCode;
    const options: PriceQueryOptions = { studentDiscount: true };

    (validateDiscounts as jest.Mock).mockReturnValue(true);

    const extraDiscountsMap = getExtraDiscountMap(currencyCode, options);

    const courseResults: CourseResult[] = [
      {
        code: 'I2',
        name: 'Interior Decorating',
        primary: false,
        free: true,
        cost: 0,
        discountMessage: null,
        multiCourseDiscountRate: 0.4,
        multiCourseDiscount: 0,
        promoDiscount: 0,
        shippingDiscount: 0,
        discountedCost: 0,
        plans: {
          full: {
            discount: 0,
            deposit: 0,
            installmentSize: 0,
            installments: 0,
            originalDeposit: 0,
            originalInstallments: 0,
            remainder: 0,
            total: 0,
          },
          part: {
            discount: 0,
            deposit: 0,
            installmentSize: 0,
            installments: 0,
            originalDeposit: 0,
            originalInstallments: 0,
            remainder: 0,
            total: 0,
          },
        },
        shipping: 0,
      },
      {
        code: 'MZ',
        name: 'Master Makeup Artistry',
        primary: true,
        free: false,
        cost: 43982.43,
        discountMessage: null,
        multiCourseDiscountRate: 0.4,
        multiCourseDiscount: 0,
        promoDiscount: 0,
        shippingDiscount: 0,
        discountedCost: 43982.43,
        plans: {
          full: {
            discount: 3490.21,
            deposit: 40492.22,
            installmentSize: 0,
            installments: 0,
            originalDeposit: 40492.22,
            originalInstallments: 0,
            remainder: 0,
            total: 40492.22,
          },
          part: {
            discount: 1289.97,
            deposit: 4783.43,
            installmentSize: 5415.57,
            installments: 7,
            originalDeposit: 4783.43,
            originalInstallments: 7,
            remainder: 0.04,
            total: 42692.46,
          },
        },
        shipping: 328.43,
      },
      {
        code: 'PO',
        name: 'Professional Organizing',
        primary: false,
        free: false,
        cost: 78340.43,
        discountMessage: null,
        multiCourseDiscountRate: 0.6,
        multiCourseDiscount: 0,
        promoDiscount: 0,
        shippingDiscount: 0,
        discountedCost: 78340.43,
        plans: {
          full: {
            discount: 9302.34,
            deposit: 69038.09,
            installmentSize: 0,
            installments: 0,
            originalDeposit: 69038.09,
            originalInstallments: 0,
            remainder: 0,
            total: 69038.09,
          },
          part: {
            discount: 7439.43,
            deposit: 893.43,
            installmentSize: 5833.96,
            installments: 12,
            originalDeposit: 893.43,
            originalInstallments: 12,
            remainder: 0.05,
            total: 7901.00,
          },
        },
        shipping: 4234.43,
      },
      {
        code: 'FD',
        name: 'Floral Design',
        primary: false,
        free: false,
        cost: 4423.23,
        discountMessage: null,
        multiCourseDiscountRate: 0.4,
        multiCourseDiscount: 0,
        promoDiscount: 0,
        shippingDiscount: 100.00,
        discountedCost: 4323.23,
        plans: {
          full: {
            discount: 200.00,
            deposit: 4123.23,
            installmentSize: 0,
            installments: 0,
            originalDeposit: 4123.23,
            originalInstallments: 0,
            remainder: 0,
            total: 4123.23,
          },
          part: {
            discount: 300.00,
            deposit: 23.23,
            installmentSize: 2000.00,
            installments: 2,
            originalDeposit: 23.23,
            originalInstallments: 2,
            remainder: 0.00,
            total: 4023.23,
          },
        },
        shipping: 100.00,
      },
    ];
    const expected: CourseResult[] = [
      {
        code: 'I2',
        name: 'Interior Decorating',
        primary: false,
        free: true,
        cost: 0,
        discountMessage: null,
        multiCourseDiscountRate: 0.4,
        multiCourseDiscount: 0,
        promoDiscount: 0, // no promo discount added because the course is free
        shippingDiscount: 0,
        discountedCost: 0,
        plans: {
          full: {
            discount: 0,
            deposit: 0,
            installmentSize: 0,
            installments: 0,
            originalDeposit: 0,
            originalInstallments: 0,
            remainder: 0,
            total: 0,
          },
          part: {
            discount: 0,
            deposit: 0,
            installmentSize: 0,
            installments: 0,
            originalDeposit: 0,
            originalInstallments: 0,
            remainder: 0,
            total: 0,
          },
        },
        shipping: 0,
      },
      {
        code: 'MZ',
        name: 'Master Makeup Artistry',
        primary: true,
        free: false,
        cost: 43982.43,
        discountMessage: null,
        multiCourseDiscountRate: 0.4,
        multiCourseDiscount: 0,
        promoDiscount: 5038.32, // promo discount added
        shippingDiscount: 0,
        discountedCost: 38944.11,
        plans: {
          full: {
            discount: 3490.21,
            deposit: 35453.9,
            installmentSize: 0,
            installments: 0,
            originalDeposit: 35453.9,
            originalInstallments: 0,
            remainder: 0,
            total: 35453.9,
          },
          part: {
            discount: 1289.97,
            deposit: 4783.43,
            installmentSize: 4695.81,
            installments: 7,
            originalDeposit: 4783.43,
            originalInstallments: 7,
            remainder: 0.04,
            total: 37654.14,
          },
        },
        shipping: 328.43,
      },
      {
        code: 'PO',
        name: 'Professional Organizing',
        primary: false,
        free: false,
        cost: 78340.43,
        discountMessage: null,
        multiCourseDiscountRate: 0.6,
        multiCourseDiscount: 0,
        promoDiscount: 5038.32, // promo discount added
        shippingDiscount: 0,
        discountedCost: 73302.11,
        plans: {
          full: {
            discount: 9302.34,
            deposit: 63999.77,
            installmentSize: 0,
            installments: 0,
            originalDeposit: 63999.77,
            originalInstallments: 0,
            remainder: 0,
            total: 63999.77,
          },
          part: {
            discount: 7439.43,
            deposit: 893.43,
            installmentSize: 5414.10,
            installments: 12,
            originalDeposit: 893.43,
            originalInstallments: 12,
            remainder: 0.05,
            total: 65862.68,
          },
        },
        shipping: 4234.43,
      },
      {
        code: 'FD',
        name: 'Floral Design',
        primary: false,
        free: false,
        cost: 4423.23,
        discountMessage: null,
        multiCourseDiscountRate: 0.4,
        multiCourseDiscount: 0,
        promoDiscount: 4023.23, // smaller promo discount added because the price can't go negative
        shippingDiscount: 100.00,
        discountedCost: 300.00,
        plans: {
          full: {
            discount: 200.00,
            deposit: 100.00,
            installmentSize: 0,
            installments: 0,
            originalDeposit: 100.00,
            originalInstallments: 0,
            remainder: 0,
            total: 100.00,
          },
          part: {
            discount: 300.00,
            deposit: 0.00,
            installmentSize: 0.00,
            installments: 2,
            originalDeposit: 0.00,
            originalInstallments: 2,
            remainder: 0.00,
            total: 0.00,
          },
        },
        shipping: 100.00,
      },
    ];
    expect(courseResults.map(extraDiscountsMap)).toEqual(expected);
  });
});
