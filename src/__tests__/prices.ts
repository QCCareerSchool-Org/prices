import { PoolConnection } from 'promise-mysql';

import { prices } from '../prices';
import { Currency, PriceQueryOptions, PriceResult, PriceRow } from '../types';

describe('INTEGRATION prices', () => {
  let connection: { query: jest.Mock };
  let priceRow1: PriceRow;
  let priceRow2: PriceRow;
  let priceRow3: PriceRow;
  let currency: Currency;

  beforeEach(() => {
    connection = {
      query: jest.fn().mockRejectedValue(Error('unexpected call')),
    };

    priceRow1 = {
      code: 'ZU-CA',
      currencyCode: 'CAD',
      cost: 3232.436,
      multiCourseDiscountRate: 0.40,
      deposit: 342.311,
      discount: 22.114,
      partDiscount: 0,
      installments: 14.1,
      courseCode: 'ZU',
      courseName: 'Zergling Herding',
      shipping: 83,
      order: 0,
    };

    priceRow2 = {
      code: 'HQ-CA',
      currencyCode: 'CAD',
      cost: 4983.439,
      multiCourseDiscountRate: 0.60,
      deposit: 232.112,
      discount: 100,
      partDiscount: 0,
      installments: 3.9,
      courseCode: 'HQ',
      courseName: 'Hydralisk Queueing',
      shipping: 12.132,
      order: 0,
    };

    priceRow3 = {
      code: 'UZ-CA',
      currencyCode: 'CAD',
      cost: 4282.21,
      multiCourseDiscountRate: 0.60,
      deposit: 328.87,
      discount: 205.29,
      partDiscount: 0,
      installments: 14.1,
      courseCode: 'UZ',
      courseName: 'Ultralisk Riding',
      shipping: 402.32,
      order: 0,
    };

    currency = {
      code: 'CAD',
      name: 'Canadian Dollars',
      symbol: '$',
      exchangeRate: 0.322,
    };
  });

  it('should resolve to a PriceResult', async () => {
    connection.query.mockResolvedValueOnce([ priceRow2 ]).mockResolvedValueOnce([ currency ]);

    const expected: PriceResult = {
      countryCode: 'CA',
      provinceCode: 'ON',
      currency: {
        code: 'CAD',
        name: 'Canadian Dollars',
        symbol: '$',
        exchangeRate: 0.322,
      },
      cost: 4983.44,
      multiCourseDiscount: 0,
      promoDiscount: 0,
      shippingDiscount: 0,
      discountedCost: 4983.44,
      plans: {
        full: {
          discount: 100,
          deposit: 4883.44,
          installmentSize: 0,
          installments: 0,
          originalDeposit: 4883.44,
          originalInstallments: 0,
          remainder: 0,
          total: 4883.44,
        },
        part: {
          discount: 0,
          deposit: 232.11,
          installmentSize: 1187.83,
          installments: 4,
          originalDeposit: 232.11,
          originalInstallments: 4,
          remainder: 0.01,
          total: 4983.44,
        },
      },
      shipping: 12.13,
      disclaimers: [],
      notes: [],
      promoWarnings: [],
      noShipping: 'ALLOWED',
      noShippingMessage: undefined,
      promoCodeRecognized: undefined,
      courses: [
        {
          code: 'HQ',
          name: 'Hydralisk Queueing',
          primary: true,
          free: false,
          cost: 4983.44,
          discountMessage: null,
          multiCourseDiscountRate: 0.6,
          multiCourseDiscount: 0,
          promoDiscount: 0,
          shippingDiscount: 0,
          discountedCost: 4983.44,
          order: 0,
          plans: {
            full: {
              discount: 100,
              deposit: 4883.44,
              installmentSize: 0,
              installments: 0,
              originalDeposit: 4883.44,
              originalInstallments: 0,
              remainder: 0,
              total: 4883.44,
            },
            part: {
              discount: 0,
              deposit: 232.11,
              installmentSize: 1187.83,
              installments: 4,
              originalDeposit: 232.11,
              originalInstallments: 4,
              remainder: 0.01,
              total: 4983.44,
            },
          },
          shipping: 12.13,
        },
      ],
    };
    await expect(prices(connection as unknown as PoolConnection, [ 'ZU' ], 'CA', 'ON')).resolves.toEqual(expected);
  });

  it('should add the multi-course discount and remove the payment-plan discounts for all courses after the first one if the school is Makeup and the SAVE50 discountCode is used', async () => {
    connection.query
      .mockResolvedValueOnce([ priceRow1 ])
      .mockResolvedValueOnce([ priceRow2 ])
      .mockResolvedValueOnce([ priceRow3 ])
      .mockResolvedValueOnce([ currency ]);

    const expected: PriceResult = {
      countryCode: 'CA',
      provinceCode: 'ON',
      currency: {
        code: 'CAD',
        name: 'Canadian Dollars',
        symbol: '$',
        exchangeRate: 0.322,
      },
      cost: 12498.09,
      multiCourseDiscount: 3862.31,
      promoDiscount: 0,
      shippingDiscount: 0,
      discountedCost: 8635.78,
      plans: {
        full: {
          discount: 100,
          deposit: 8535.78,
          installmentSize: 0,
          installments: 0,
          remainder: 0,
          total: 8535.78,
          originalDeposit: 8535.78,
          originalInstallments: 0,
        },
        part: {
          discount: 0,
          deposit: 903.29,
          installmentSize: 1933.11,
          installments: 4,
          remainder: 0.05,
          total: 8635.78,
          originalDeposit: 903.29,
          originalInstallments: 4,
        },
      },
      shipping: 497.45,
      disclaimers: [],
      notes: [],
      promoWarnings: [],
      noShipping: 'ALLOWED',
      noShippingMessage: undefined,
      promoCodeRecognized: true,
      promoCode: 'SAVE50',
      courses: [
        {
          code: 'HQ',
          name: 'Hydralisk Queueing',
          primary: true,
          free: false,
          cost: 4983.44,
          discountMessage: null,
          multiCourseDiscountRate: 0.6,
          multiCourseDiscount: 0,
          promoDiscount: 0,
          shippingDiscount: 0,
          discountedCost: 4983.44,
          order: 0,
          plans: {
            full: {
              discount: 100,
              deposit: 4883.44,
              installmentSize: 0,
              installments: 0,
              originalDeposit: 4883.44,
              originalInstallments: 0,
              remainder: 0,
              total: 4883.44,
            },
            part: {
              discount: 0,
              deposit: 232.11,
              installmentSize: 1187.83,
              installments: 4,
              originalDeposit: 232.11,
              originalInstallments: 4,
              remainder: 0.01,
              total: 4983.44,
            },
          },
          shipping: 12.13,
        },
        {
          code: 'UZ',
          name: 'Ultralisk Riding',
          primary: false,
          free: false,
          cost: 4282.21,
          discountMessage: null,
          multiCourseDiscountRate: 0.6,
          multiCourseDiscount: 2569.33,
          promoDiscount: 0,
          shippingDiscount: 0,
          discountedCost: 1712.88,
          order: 0,
          plans: {
            full: {
              discount: 0,
              deposit: 1712.88,
              installmentSize: 0,
              installments: 0,
              originalDeposit: 1712.88,
              originalInstallments: 0,
              remainder: 0,
              total: 1712.88,
            },
            part: {
              discount: 0,
              deposit: 328.87,
              installmentSize: 346.00,
              installments: 4,
              originalDeposit: 328.87,
              originalInstallments: 4,
              remainder: 0.01,
              total: 1712.88,
            },
          },
          shipping: 402.32,
        },
        {
          code: 'ZU',
          name: 'Zergling Herding',
          primary: false,
          free: false,
          cost: 3232.44,
          discountMessage: null,
          multiCourseDiscountRate: 0.4,
          multiCourseDiscount: 1292.98,
          promoDiscount: 0,
          shippingDiscount: 0,
          discountedCost: 1939.46,
          order: 0,
          plans: {
            full: {
              discount: 0,
              deposit: 1939.46,
              installmentSize: 0,
              installments: 0,
              originalDeposit: 1939.46,
              originalInstallments: 0,
              remainder: 0,
              total: 1939.46,
            },
            part: {
              discount: 0,
              deposit: 342.31,
              installmentSize: 399.28,
              installments: 4,
              originalDeposit: 342.31,
              originalInstallments: 4,
              remainder: 0.03,
              total: 1939.46,
            },
          },
          shipping: 83,
        },
      ],
    };
    const options: PriceQueryOptions = { school: 'QC Makeup Academy', promoCode: 'SAVE50' };
    await expect(prices(connection as unknown as PoolConnection, [ 'ZU', 'HQ', 'UZ' ], 'CA', 'ON', options)).resolves.toEqual(expected);
  });

  it('should add the multi-course discount and remove the payment-plan discounts for all courses if this is a price for existing students', async () => {
    connection.query
      .mockResolvedValueOnce([ priceRow1 ])
      .mockResolvedValueOnce([ priceRow2 ])
      .mockResolvedValueOnce([ priceRow3 ])
      .mockResolvedValueOnce([ currency ]);

    const expected: PriceResult = {
      countryCode: 'CA',
      provinceCode: 'ON',
      currency: {
        code: 'CAD',
        name: 'Canadian Dollars',
        symbol: '$',
        exchangeRate: 0.322,
      },
      cost: 12498.09,
      multiCourseDiscount: 6852.37,
      promoDiscount: 0,
      shippingDiscount: 0,
      discountedCost: 5645.72,
      plans: {
        full: {
          discount: 0,
          deposit: 5645.72,
          installmentSize: 0,
          installments: 0,
          remainder: 0,
          total: 5645.72,
          originalDeposit: 5645.72,
          originalInstallments: 0,
        },
        part: {
          discount: 0,
          deposit: 903.29,
          installmentSize: 1185.59,
          installments: 4,
          remainder: 0.07,
          total: 5645.72,
          originalDeposit: 903.29,
          originalInstallments: 4,
        },
      },
      shipping: 497.45,
      disclaimers: [],
      notes: [],
      promoWarnings: [],
      noShipping: 'ALLOWED',
      noShippingMessage: undefined,
      promoCodeRecognized: undefined,
      courses: [
        {
          code: 'HQ',
          name: 'Hydralisk Queueing',
          primary: true,
          free: false,
          cost: 4983.44,
          discountMessage: null,
          multiCourseDiscountRate: 0.6,
          multiCourseDiscount: 2990.06,
          promoDiscount: 0,
          shippingDiscount: 0,
          discountedCost: 1993.38,
          order: 0,
          plans: {
            full: {
              discount: 0,
              deposit: 1993.38,
              installmentSize: 0,
              installments: 0,
              originalDeposit: 1993.38,
              originalInstallments: 0,
              remainder: 0,
              total: 1993.38,
            },
            part: {
              discount: 0,
              deposit: 232.11,
              installmentSize: 440.31,
              installments: 4,
              originalDeposit: 232.11,
              originalInstallments: 4,
              remainder: 0.03,
              total: 1993.38,
            },
          },
          shipping: 12.13,
        },
        {
          code: 'UZ',
          name: 'Ultralisk Riding',
          primary: false,
          free: false,
          cost: 4282.21,
          discountMessage: null,
          multiCourseDiscountRate: 0.6,
          multiCourseDiscount: 2569.33,
          promoDiscount: 0,
          shippingDiscount: 0,
          discountedCost: 1712.88,
          order: 0,
          plans: {
            full: {
              discount: 0,
              deposit: 1712.88,
              installmentSize: 0,
              installments: 0,
              originalDeposit: 1712.88,
              originalInstallments: 0,
              remainder: 0,
              total: 1712.88,
            },
            part: {
              discount: 0,
              deposit: 328.87,
              installmentSize: 346.00,
              installments: 4,
              originalDeposit: 328.87,
              originalInstallments: 4,
              remainder: 0.01,
              total: 1712.88,
            },
          },
          shipping: 402.32,
        },
        {
          code: 'ZU',
          name: 'Zergling Herding',
          primary: false,
          free: false,
          cost: 3232.44,
          discountMessage: null,
          multiCourseDiscountRate: 0.4,
          multiCourseDiscount: 1292.98,
          promoDiscount: 0,
          shippingDiscount: 0,
          discountedCost: 1939.46,
          order: 0,
          plans: {
            full: {
              discount: 0,
              deposit: 1939.46,
              installmentSize: 0,
              installments: 0,
              originalDeposit: 1939.46,
              originalInstallments: 0,
              remainder: 0,
              total: 1939.46,
            },
            part: {
              discount: 0,
              deposit: 342.31,
              installmentSize: 399.28,
              installments: 4,
              originalDeposit: 342.31,
              originalInstallments: 4,
              remainder: 0.03,
              total: 1939.46,
            },
          },
          shipping: 83,
        },
      ],
    };
    const options: PriceQueryOptions = { discountAll: true };
    await expect(prices(connection as unknown as PoolConnection, [ 'ZU', 'HQ', 'UZ' ], 'CA', 'ON', options)).resolves.toEqual(expected);
  });

  it('should add the multi-course discount and remove the payment-plan discounts for all courses if this is a price for existing students and add in a student promo discount if studentDiscount is set', async () => {
    connection.query
      .mockResolvedValueOnce([ priceRow1 ])
      .mockResolvedValueOnce([ priceRow2 ])
      .mockResolvedValueOnce([ priceRow3 ])
      .mockResolvedValueOnce([ currency ]);

    const expected: PriceResult = {
      countryCode: 'CA',
      provinceCode: 'ON',
      currency: {
        code: 'CAD',
        name: 'Canadian Dollars',
        symbol: '$',
        exchangeRate: 0.322,
      },
      cost: 12498.09,
      multiCourseDiscount: 6852.37,
      promoDiscount: 150,
      shippingDiscount: 0,
      discountedCost: 5495.72,
      plans: {
        full: {
          discount: 0,
          deposit: 5495.72,
          installmentSize: 0,
          installments: 0,
          remainder: 0,
          total: 5495.72,
          originalDeposit: 5495.72,
          originalInstallments: 0,
        },
        part: {
          discount: 0,
          deposit: 903.29,
          installmentSize: 1148.09,
          installments: 4,
          remainder: 0.07,
          total: 5495.72,
          originalDeposit: 903.29,
          originalInstallments: 4,
        },
      },
      shipping: 497.45,
      disclaimers: [],
      notes: [ 'additional discount' ],
      promoWarnings: [],
      noShipping: 'ALLOWED',
      noShippingMessage: undefined,
      promoCodeRecognized: undefined,
      courses: [
        {
          code: 'HQ',
          name: 'Hydralisk Queueing',
          primary: true,
          free: false,
          cost: 4983.44,
          discountMessage: null,
          multiCourseDiscountRate: 0.6,
          multiCourseDiscount: 2990.06,
          promoDiscount: 50,
          shippingDiscount: 0,
          discountedCost: 1943.38,
          order: 0,
          plans: {
            full: {
              discount: 0,
              deposit: 1943.38,
              installmentSize: 0,
              installments: 0,
              originalDeposit: 1943.38,
              originalInstallments: 0,
              remainder: 0,
              total: 1943.38,
            },
            part: {
              discount: 0,
              deposit: 232.11,
              installmentSize: 427.81,
              installments: 4,
              originalDeposit: 232.11,
              originalInstallments: 4,
              remainder: 0.03,
              total: 1943.38,
            },
          },
          shipping: 12.13,
        },
        {
          code: 'UZ',
          name: 'Ultralisk Riding',
          primary: false,
          free: false,
          cost: 4282.21,
          discountMessage: null,
          multiCourseDiscountRate: 0.6,
          multiCourseDiscount: 2569.33,
          promoDiscount: 50,
          shippingDiscount: 0,
          discountedCost: 1662.88,
          order: 0,
          plans: {
            full: {
              discount: 0,
              deposit: 1662.88,
              installmentSize: 0,
              installments: 0,
              originalDeposit: 1662.88,
              originalInstallments: 0,
              remainder: 0,
              total: 1662.88,
            },
            part: {
              discount: 0,
              deposit: 328.87,
              installmentSize: 333.50,
              installments: 4,
              originalDeposit: 328.87,
              originalInstallments: 4,
              remainder: 0.01,
              total: 1662.88,
            },
          },
          shipping: 402.32,
        },
        {
          code: 'ZU',
          name: 'Zergling Herding',
          primary: false,
          free: false,
          cost: 3232.44,
          discountMessage: null,
          multiCourseDiscountRate: 0.4,
          multiCourseDiscount: 1292.98,
          promoDiscount: 50,
          shippingDiscount: 0,
          discountedCost: 1889.46,
          order: 0,
          plans: {
            full: {
              discount: 0,
              deposit: 1889.46,
              installmentSize: 0,
              installments: 0,
              originalDeposit: 1889.46,
              originalInstallments: 0,
              remainder: 0,
              total: 1889.46,
            },
            part: {
              discount: 0,
              deposit: 342.31,
              installmentSize: 386.78,
              installments: 4,
              originalDeposit: 342.31,
              originalInstallments: 4,
              remainder: 0.03,
              total: 1889.46,
            },
          },
          shipping: 83,
        },
      ],
    };
    const options: PriceQueryOptions = { discountAll: true, studentDiscount: true };
    await expect(prices(connection as unknown as PoolConnection, [ 'ZU', 'HQ', 'UZ' ], 'CA', 'ON', options)).resolves.toEqual(expected);
  });

  it('should add the multi-course discount and remove the payment-plan discounts for all courses if this is a price for existing students, and add in a student promo discount if studentDiscount is set, and add an custom promo discount', async () => {
    connection.query
      .mockResolvedValueOnce([ priceRow1 ])
      .mockResolvedValueOnce([ priceRow2 ])
      .mockResolvedValueOnce([ priceRow3 ])
      .mockResolvedValueOnce([ currency ]);

    const expected: PriceResult = {
      countryCode: 'CA',
      provinceCode: 'ON',
      currency: {
        code: 'CAD',
        name: 'Canadian Dollars',
        symbol: '$',
        exchangeRate: 0.322,
      },
      cost: 12498.09,
      multiCourseDiscount: 6852.37,
      promoDiscount: 2150,
      shippingDiscount: 0,
      discountedCost: 3495.72,
      plans: {
        full: {
          discount: 0,
          deposit: 3495.72,
          installmentSize: 0,
          installments: 0,
          remainder: 0,
          total: 3495.72,
          originalDeposit: 3495.72,
          originalInstallments: 0,
        },
        part: {
          discount: 0,
          deposit: 683.31,
          installmentSize: 703.09,
          installments: 4,
          remainder: 0.05,
          total: 3495.72,
          originalDeposit: 683.31,
          originalInstallments: 4,
        },
      },
      shipping: 497.45,
      disclaimers: [],
      notes: [ 'additional discount' ],
      promoWarnings: [],
      noShipping: 'ALLOWED',
      noShippingMessage: undefined,
      promoCodeRecognized: undefined,
      courses: [
        {
          code: 'HQ',
          name: 'Hydralisk Queueing',
          primary: true,
          free: false,
          cost: 4983.44,
          discountMessage: null,
          multiCourseDiscountRate: 0.6,
          multiCourseDiscount: 2990.06,
          promoDiscount: 1981.25, // not all the custom deposit gets added here because it would make the cost negative (50 + 1931.25 = 1981.25, leaving 68.75 to be added to the next course)
          shippingDiscount: 0,
          discountedCost: 12.13, // the shipping cost remains
          order: 0,
          plans: {
            full: {
              discount: 0,
              deposit: 12.13,
              installmentSize: 0,
              installments: 0,
              originalDeposit: 12.13,
              originalInstallments: 0,
              remainder: 0,
              total: 12.13,
            },
            part: {
              discount: 0,
              deposit: 12.13,
              installmentSize: 0,
              installments: 4,
              originalDeposit: 12.13,
              originalInstallments: 4,
              remainder: 0,
              total: 12.13,
            },
          },
          shipping: 12.13,
        },
        {
          code: 'UZ',
          name: 'Ultralisk Riding',
          primary: false,
          free: false,
          cost: 4282.21,
          discountMessage: null,
          multiCourseDiscountRate: 0.6,
          multiCourseDiscount: 2569.33,
          promoDiscount: 118.75, // 50 + 68.75 left over from previous course
          shippingDiscount: 0,
          discountedCost: 1594.13,
          order: 0,
          plans: {
            full: {
              discount: 0,
              deposit: 1594.13,
              installmentSize: 0,
              installments: 0,
              originalDeposit: 1594.13,
              originalInstallments: 0,
              remainder: 0,
              total: 1594.13,
            },
            part: {
              discount: 0,
              deposit: 328.87,
              installmentSize: 316.31,
              installments: 4,
              originalDeposit: 328.87,
              originalInstallments: 4,
              remainder: 0.02,
              total: 1594.13,
            },
          },
          shipping: 402.32,
        },
        {
          code: 'ZU',
          name: 'Zergling Herding',
          primary: false,
          free: false,
          cost: 3232.44,
          discountMessage: null,
          multiCourseDiscountRate: 0.4,
          multiCourseDiscount: 1292.98,
          promoDiscount: 50,
          shippingDiscount: 0,
          discountedCost: 1889.46,
          order: 0,
          plans: {
            full: {
              discount: 0,
              deposit: 1889.46,
              installmentSize: 0,
              installments: 0,
              originalDeposit: 1889.46,
              originalInstallments: 0,
              remainder: 0,
              total: 1889.46,
            },
            part: {
              discount: 0,
              deposit: 342.31,
              installmentSize: 386.78,
              installments: 4,
              originalDeposit: 342.31,
              originalInstallments: 4,
              remainder: 0.03,
              total: 1889.46,
            },
          },
          shipping: 83,
        },
      ],
    };

    const options: PriceQueryOptions = {
      discount: {
        default: 2000,
      },
      discountSignature: 'CTav4MJwgOIW2nX/QJj+FFr0asFxXz4fkWkYsvQ/HSQIgo1jX7neLxNo94zLVFA8NiMfZn2bAQhTL0gcKKAp5a1DlN/MLdJcA3MDlE42qVKDr08LwbiU75lgGmvrAaXCUaYJy3fTQiqISNxDGmEGPpE8B4nyOkBFVkDi8fom22ouiFfPaE9ZewdnoQyW/MuPn/lEj7Qv0l3EDbmOANCJjfT8d+WJaDGolvhA0WUHlKUNm5XnwP9mfrCeWfXLquuUn72dqAk00N7NKFTZsTh02Z2ePWa7xizKj6iUI+Q8SJbA943slXqR+BfmQTHm4nGVlC8mgk9aGoadJnikYcYioQ==',
      discountAll: true,
      studentDiscount: true,
    };
    await expect(prices(connection as unknown as PoolConnection, [ 'ZU', 'HQ', 'UZ' ], 'CA', 'ON', options)).resolves.toEqual(expected);
  });

  it('should add the multi-course discount and remove the payment-plan discount for all courses if this is a price for existing students, and add in a student promo discount if studentDiscount is set, and add an custom promo discount, and handle shipping discounts', async () => {
    connection.query
      .mockResolvedValueOnce([ priceRow1 ])
      .mockResolvedValueOnce([ priceRow2 ])
      .mockResolvedValueOnce([ priceRow3 ])
      .mockResolvedValueOnce([ currency ]);

    const expected: PriceResult = {
      countryCode: 'CA',
      provinceCode: 'ON',
      currency: {
        code: 'CAD',
        name: 'Canadian Dollars',
        symbol: '$',
        exchangeRate: 0.322,
      },
      cost: 12498.09,
      multiCourseDiscount: 6852.37,
      promoDiscount: 2150,
      shippingDiscount: 497.45,
      discountedCost: 2998.27,
      plans: {
        full: {
          discount: 0,
          deposit: 2998.27,
          installmentSize: 0,
          installments: 0,
          remainder: 0,
          total: 2998.27,
          originalDeposit: 2998.27,
          originalInstallments: 0,
        },
        part: {
          discount: 0,
          deposit: 671.18,
          installmentSize: 581.76,
          installments: 4,
          remainder: 0.05,
          total: 2998.27,
          originalDeposit: 671.18,
          originalInstallments: 4,
        },
      },
      shipping: 497.45,
      disclaimers: [],
      notes: [ 'additional discount' ],
      promoWarnings: [],
      noShipping: 'APPLIED',
      noShippingMessage: 'You have selected to not receive physical course materials. The cost of your courses have been reduced accordingly. You will have access to electronic course materials through the Online Student Center.',
      promoCodeRecognized: undefined,
      courses: [
        {
          code: 'HQ',
          name: 'Hydralisk Queueing',
          primary: true,
          free: false,
          cost: 4983.44,
          discountMessage: null,
          multiCourseDiscountRate: 0.6,
          multiCourseDiscount: 2990.06, // not all the custom deposit gets added here because it would make the cost negative
          promoDiscount: 1981.25,
          shippingDiscount: 12.13,
          discountedCost: 0, // we have to leave 100 here because the full payment plan has a 100 discount
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
              installments: 4,
              originalDeposit: 0,
              originalInstallments: 4,
              remainder: 0,
              total: 0,
            },
          },
          shipping: 12.13,
        },
        {
          code: 'UZ',
          name: 'Ultralisk Riding',
          primary: false,
          free: false,
          cost: 4282.21,
          discountMessage: null,
          multiCourseDiscountRate: 0.6,
          multiCourseDiscount: 2569.33,
          promoDiscount: 118.75,
          shippingDiscount: 402.32,
          discountedCost: 1191.81,
          order: 0,
          plans: {
            full: {
              discount: 0,
              deposit: 1191.81,
              installmentSize: 0,
              installments: 0,
              originalDeposit: 1191.81,
              originalInstallments: 0,
              remainder: 0,
              total: 1191.81,
            },
            part: {
              discount: 0,
              deposit: 328.87,
              installmentSize: 215.73,
              installments: 4,
              originalDeposit: 328.87,
              originalInstallments: 4,
              remainder: 0.02,
              total: 1191.81,
            },
          },
          shipping: 402.32,
        },
        {
          code: 'ZU',
          name: 'Zergling Herding',
          primary: false,
          free: false,
          cost: 3232.44,
          discountMessage: null,
          multiCourseDiscountRate: 0.4,
          multiCourseDiscount: 1292.98,
          promoDiscount: 50,
          shippingDiscount: 83,
          discountedCost: 1806.46,
          order: 0,
          plans: {
            full: {
              discount: 0,
              deposit: 1806.46,
              installmentSize: 0,
              installments: 0,
              originalDeposit: 1806.46,
              originalInstallments: 0,
              remainder: 0,
              total: 1806.46,
            },
            part: {
              discount: 0,
              deposit: 342.31,
              installmentSize: 366.03,
              installments: 4,
              originalDeposit: 342.31,
              originalInstallments: 4,
              remainder: 0.03,
              total: 1806.46,
            },
          },
          shipping: 83,
        },
      ],
    };

    const options = {
      discount: {
        default: 2000,
      },
      discountSignature: 'CTav4MJwgOIW2nX/QJj+FFr0asFxXz4fkWkYsvQ/HSQIgo1jX7neLxNo94zLVFA8NiMfZn2bAQhTL0gcKKAp5a1DlN/MLdJcA3MDlE42qVKDr08LwbiU75lgGmvrAaXCUaYJy3fTQiqISNxDGmEGPpE8B4nyOkBFVkDi8fom22ouiFfPaE9ZewdnoQyW/MuPn/lEj7Qv0l3EDbmOANCJjfT8d+WJaDGolvhA0WUHlKUNm5XnwP9mfrCeWfXLquuUn72dqAk00N7NKFTZsTh02Z2ePWa7xizKj6iUI+Q8SJbA943slXqR+BfmQTHm4nGVlC8mgk9aGoadJnikYcYioQ==',
      discountAll: true,
      studentDiscount: true,
      noShipping: true,
    };
    await expect(prices(connection as unknown as PoolConnection, [ 'ZU', 'HQ', 'UZ' ], 'CA', 'ON', options)).resolves.toEqual(expected);
  });
});
