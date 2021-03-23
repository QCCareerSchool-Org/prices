import { PriceQueryOptions } from '../../types';
import { shouldGetMultiCourseDiscount } from './shouldGetMultiCourseDiscount';

describe('shouldGetMultiCourseDiscount', () => {

  it('should return true if options.discountAll is true, regardless of index', () => {
    const now = new Date('2021-05-01');
    const options: PriceQueryOptions = { discountAll: true };
    expect(shouldGetMultiCourseDiscount(now, 0, options)).toBe(true);
    expect(shouldGetMultiCourseDiscount(now, 1, options)).toBe(true);
    expect(shouldGetMultiCourseDiscount(now, 2, options)).toBe(true);
    expect(shouldGetMultiCourseDiscount(now, 14, options)).toBe(true);
    expect(shouldGetMultiCourseDiscount(now, -2, options)).toBe(true);
  });

  ([ 'QC Career School', 'QC Design School', 'QC Event School', 'QC Pet Studies', 'QC Wellness Studies', 'Winghill Writing School' ] as const).forEach(school => {
    it(`should return true if options.school is '${school}' and index is greater than 0`, () => {
      const now = new Date('2021-05-01');
      const options: PriceQueryOptions = { school };
      expect(shouldGetMultiCourseDiscount(now, 1, options)).toBe(true);
      expect(shouldGetMultiCourseDiscount(now, 2, options)).toBe(true);
      expect(shouldGetMultiCourseDiscount(now, 14, options)).toBe(true);
    });

    it(`should return false if options.school is '${school}' and index is not greater than 0`, () => {
      const now = new Date('2021-05-01');
      const options: PriceQueryOptions = { school };
      expect(shouldGetMultiCourseDiscount(now, 0, options)).toBe(false);
      expect(shouldGetMultiCourseDiscount(now, -2, options)).toBe(false);
    });
  });

  it('should return true if options.school is \'QC Makeup Academy\' and options.promoCode is \'SAVE50\' and index is greater than 0', () => {
    const options: PriceQueryOptions = { school: 'QC Makeup Academy', promoCode: 'SAVE50' };
    const now = new Date('2021-05-01');
    expect(shouldGetMultiCourseDiscount(now, 1, options)).toBe(true);
    expect(shouldGetMultiCourseDiscount(now, 2, options)).toBe(true);
    expect(shouldGetMultiCourseDiscount(now, 14, options)).toBe(true);
  });

  it('should return false if options.school is \'QC Makeup Academy\' and options.promoCode is \'SAVE50\' and index is not greater than 0', () => {
    const now = new Date('2021-05-01');
    const options: PriceQueryOptions = { school: 'QC Makeup Academy', promoCode: 'SAVE50' };
    expect(shouldGetMultiCourseDiscount(now, 0, options)).toBe(false);
    expect(shouldGetMultiCourseDiscount(now, -2, options)).toBe(false);
  });

  it('should return true if options.school is \'QC Makeup Academy\' and the date is less than 2021-03-28 and index is greater than 0', () => {
    const options: PriceQueryOptions = { school: 'QC Makeup Academy' };
    const now = new Date('2021-03-15');
    expect(shouldGetMultiCourseDiscount(now, 1, options)).toBe(true);
    expect(shouldGetMultiCourseDiscount(now, 2, options)).toBe(true);
    expect(shouldGetMultiCourseDiscount(now, 14, options)).toBe(true);
  });

  it('should return false if options.school is \'QC Makeup Academy\' and the date is less than 2021-03-28 and index is not greater than 0', () => {
    const now = new Date('2021-03-15');
    const options: PriceQueryOptions = { school: 'QC Makeup Academy' };
    expect(shouldGetMultiCourseDiscount(now, 0, options)).toBe(false);
    expect(shouldGetMultiCourseDiscount(now, -2, options)).toBe(false);
  });

  it('should return false if options.school is \'QC Makeup Academy\' and options.promoCode is not \'SAVE50\', regardless of index', () => {
    const now = new Date('2021-05-01');
    const options: PriceQueryOptions = { school: 'QC Makeup Academy' };
    expect(shouldGetMultiCourseDiscount(now, 0, options)).toBe(false);
    expect(shouldGetMultiCourseDiscount(now, 1, options)).toBe(false);
    expect(shouldGetMultiCourseDiscount(now, 2, options)).toBe(false);
    expect(shouldGetMultiCourseDiscount(now, 14, options)).toBe(false);
    expect(shouldGetMultiCourseDiscount(now, -2, options)).toBe(false);
  });

  it('should return false if options.school some other value, regardless of promo code and index', () => {
    const now = new Date('2021-05-01');

    let options = { school: 'Not a Real School' } as unknown as PriceQueryOptions | undefined;
    expect(shouldGetMultiCourseDiscount(now, 0, options)).toBe(false);
    expect(shouldGetMultiCourseDiscount(now, 1, options)).toBe(false);
    expect(shouldGetMultiCourseDiscount(now, 2, options)).toBe(false);
    expect(shouldGetMultiCourseDiscount(now, 14, options)).toBe(false);
    expect(shouldGetMultiCourseDiscount(now, -2, options)).toBe(false);

    options = { school: 'Not a Real School', promoCode: 'SAVE50' } as unknown as PriceQueryOptions;
    expect(shouldGetMultiCourseDiscount(now, 0, options)).toBe(false);
    expect(shouldGetMultiCourseDiscount(now, 1, options)).toBe(false);
    expect(shouldGetMultiCourseDiscount(now, 2, options)).toBe(false);
    expect(shouldGetMultiCourseDiscount(now, 14, options)).toBe(false);
    expect(shouldGetMultiCourseDiscount(now, -2, options)).toBe(false);

    options = { promoCode: 'SAVE50' } as unknown as PriceQueryOptions;
    expect(shouldGetMultiCourseDiscount(now, 0, options)).toBe(false);
    expect(shouldGetMultiCourseDiscount(now, 1, options)).toBe(false);
    expect(shouldGetMultiCourseDiscount(now, 2, options)).toBe(false);
    expect(shouldGetMultiCourseDiscount(now, 14, options)).toBe(false);
    expect(shouldGetMultiCourseDiscount(now, -2, options)).toBe(false);

    options = { } as unknown as PriceQueryOptions;
    expect(shouldGetMultiCourseDiscount(now, 0, options)).toBe(false);
    expect(shouldGetMultiCourseDiscount(now, 1, options)).toBe(false);
    expect(shouldGetMultiCourseDiscount(now, 2, options)).toBe(false);
    expect(shouldGetMultiCourseDiscount(now, 14, options)).toBe(false);
    expect(shouldGetMultiCourseDiscount(now, -2, options)).toBe(false);

    options = undefined;
    expect(shouldGetMultiCourseDiscount(now, 0, options)).toBe(false);
    expect(shouldGetMultiCourseDiscount(now, 1, options)).toBe(false);
    expect(shouldGetMultiCourseDiscount(now, 2, options)).toBe(false);
    expect(shouldGetMultiCourseDiscount(now, 14, options)).toBe(false);
    expect(shouldGetMultiCourseDiscount(now, -2, options)).toBe(false);
  });
});
