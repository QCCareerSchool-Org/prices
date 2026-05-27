import { isPrice } from '@/domain/price';
import { closePool } from '@/pool';
import { PriceCalculator } from '@/priceCalculator';

describe('Price Calculator', () => {

  it('Instantiates', () => {
    const courseCodes = [ 'i2' ];
    const countryCode = 'CA';
    const provinceCode = 'ON';
    const calculator = new PriceCalculator(courseCodes, countryCode, provinceCode, {});
    expect(calculator).toBeTruthy();
  });

  it('Returns a price', async () => {
    const courseCodes = [ 'i2' ];
    const countryCode = 'CA';
    const provinceCode = 'ON';
    const calculator = new PriceCalculator(courseCodes, countryCode, provinceCode, {});
    const price = await calculator.calculate();
    expect(isPrice(price)).toEqual(true);
  });

  it('Includes the right data', async () => {
    const courseCodes = [ 'i2', 'aa', 'mz' ];
    const countryCode = 'CA';
    const provinceCode = 'ON';
    const calculator = new PriceCalculator(courseCodes, countryCode, provinceCode, {});
    const price = await calculator.calculate();
    expect(price.countryCode).toEqual(countryCode);
    expect(price.provinceCode).toEqual(provinceCode);
    expect(price.courses.length).toEqual(courseCodes.length);
    for (const courseCode of courseCodes) {
      expect(price.courses.some(c => c.code === courseCode.toUpperCase())).toEqual(true);
    }
  });

  afterAll(async () => {
    await closePool();
  });
});
