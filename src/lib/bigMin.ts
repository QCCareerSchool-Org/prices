export const bigMin = (...values: Big[]) => values.reduce((min, value) => (value.lt(min) ? value : min));
