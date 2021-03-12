import Big from 'big.js';

// reduce function to sum Big numbers
export const sumBigArray = (previous: Big, current: Big): Big => previous.plus(current);
