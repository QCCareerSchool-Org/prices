import faker from 'faker';

import { getExtraDiscountMap } from './getExtraDiscountMap';
import { validateDiscounts } from './validateDiscounts';
import type { CourseResult, CurrencyCode, PriceQueryOptions } from '../../types';

jest.mock('./validateDiscounts');

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
    expect(() => getExtraDiscountMap(currencyCode)).toThrow('invalid discount signature');
  });

  describe('the returned function', () => {

    let courseResults: CourseResult[];

    beforeEach(() => {
      courseResults = [
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
          order: 0,
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
          order: 0,
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
          promoDiscount: 5000, // note: some promo discount already applied
          shippingDiscount: 0,
          discountedCost: 78340.43,
          order: 0,
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
          order: 0,
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
        {
          code: 'DW',
          name: 'Destination Wedding Planning',
          primary: false,
          free: false,
          cost: 94954.43,
          discountMessage: null,
          multiCourseDiscountRate: 0.2,
          multiCourseDiscount: 18990.89,
          promoDiscount: 65000,
          shippingDiscount: 0,
          discountedCost: 10963.54,
          order: 0,
          plans: {
            full: {
              discount: 10000,
              deposit: 963.54,
              installmentSize: 0,
              installments: 0,
              originalDeposit: 963.54,
              originalInstallments: 0,
              remainder: 0,
              total: 963.54,
            },
            part: {
              discount: 200,
              deposit: 763.54,
              installmentSize: 5000,
              installments: 2,
              originalDeposit: 763.54,
              originalInstallments: 2,
              remainder: 0,
              total: 10763.54,
            },
          },
          shipping: 100.00,
        },
      ];
    });

    it('should map course results to course results with a promo discount added if options.discount is set', () => {
      const currencyCode = faker.finance.currencyCode() as CurrencyCode;
      const options: PriceQueryOptions = {
        discount: {
          default: 126046.09,
        },
      };

      (validateDiscounts as jest.Mock).mockReturnValue(true);

      const extraDiscountsMap = getExtraDiscountMap(currencyCode, options);

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
          order: 0,
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
          promoDiscount: 43654, // 43654 promo discount added (126046.09 - 43654 = 82392.09 remaining for other courses )
          shippingDiscount: 0,
          discountedCost: 328.43,
          order: 0,
          plans: {
            full: {
              discount: 328.43,
              deposit: 0,
              installmentSize: 0,
              installments: 0,
              originalDeposit: 0,
              originalInstallments: 0,
              remainder: 0,
              total: 0,
            },
            part: {
              discount: 328.43,
              deposit: 0,
              installmentSize: 0,
              installments: 7,
              originalDeposit: 0,
              originalInstallments: 7,
              remainder: 0,
              total: 0,
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
          promoDiscount: 74106, // 69106 promo discount added to existing 5000 (82392.09 - 69106 = 13286.09 remaining to add to other courses)
          shippingDiscount: 0,
          discountedCost: 4234.43,
          order: 0,
          plans: {
            full: {
              discount: 4234.43,
              deposit: 0,
              installmentSize: 0,
              installments: 0,
              originalDeposit: 0,
              originalInstallments: 0,
              remainder: 0,
              total: 0,
            },
            part: {
              discount: 4234.43,
              deposit: 0,
              installmentSize: 0,
              installments: 12,
              originalDeposit: 0,
              originalInstallments: 12,
              remainder: 0,
              total: 0,
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
          promoDiscount: 4323.23, // 4323.23 promo discount added (13286.09 - 4323.23 = 8962.86 remaining to be added to other courses)
          shippingDiscount: 100,
          discountedCost: 0,
          order: 0,
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
              installments: 2,
              originalDeposit: 0,
              originalInstallments: 2,
              remainder: 0,
              total: 0,
            },
          },
          shipping: 100.00,
        },
        {
          code: 'DW',
          name: 'Destination Wedding Planning',
          primary: false,
          free: false,
          cost: 94954.43,
          discountMessage: null,
          multiCourseDiscountRate: 0.2,
          multiCourseDiscount: 18990.89,
          promoDiscount: 73962.86, // 8962.68 promo discount added to existing 65000 (none remaining to be added to other courses)
          shippingDiscount: 0,
          discountedCost: 2000.68,
          order: 0,
          plans: {
            full: {
              discount: 2000.68,
              deposit: 0,
              installmentSize: 0,
              installments: 0,
              originalDeposit: 0,
              originalInstallments: 0,
              remainder: 0,
              total: 0,
            },
            part: {
              discount: 200,
              deposit: 763.54,
              installmentSize: 518.57,
              installments: 2,
              originalDeposit: 763.54,
              originalInstallments: 2,
              remainder: 0,
              total: 1800.68,
            },
          },
          shipping: 100.00,
        },
      ];

      expect(courseResults.map(extraDiscountsMap)).toEqual(expected);
    });
  });
});
