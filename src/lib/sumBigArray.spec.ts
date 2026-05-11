import Big from 'big.js';
import faker from 'faker';

import { sumBigArray } from './sumBigArray';

describe('sumBigArray', () => {

  it('should sum properly', () => {
    const numbers = Array(14).fill(null).map(() => Big(faker.datatype.number()));
    let manualSum = Big(0);
    numbers.forEach(n => {
      manualSum = manualSum.plus(n);
    });
    const result = numbers.reduce(sumBigArray, Big(0));
    expect(manualSum.eq(result)).toBe(true);
  });
});
