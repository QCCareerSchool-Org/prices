import faker from 'faker';

import { CurrencyCode } from '../../types';
import { studentDiscountAmount } from './studentDiscountAmount';

describe('studentDiscountAmount', () => {

  it('should be a function', () => {
    expect(typeof studentDiscountAmount).toBe('function');
  });

  it('should return 25 when currencyCode is \'GBP\'', () => {
    expect(studentDiscountAmount('GBP')).toBe(25);
  });

  ([ 'CAD', 'USD', 'AUD', 'NZD' ] as const).forEach(currencyCode => {
    it(`should return 50 when currencyCode is '${currencyCode}'`, () => {
      expect(studentDiscountAmount(currencyCode)).toBe(50);
    });
  });

  it('should return 50 otherwise', () => {
    const currencyCode = faker.random.alphaNumeric(5) as CurrencyCode;
    expect(studentDiscountAmount(currencyCode)).toBe(50);
  });
});
