import faker from 'faker';

import { courseSort } from './courseSort';
import type { CourseResult } from '../../types';

describe('courseSort', () => {

  it('should return a negative number if a is primary and b is not primary', () => {
    const a = { primary: true } as CourseResult;
    const b = { primary: false } as CourseResult;
    expect(courseSort(a, b)).toBeLessThan(0);
  });

  it('should return a positive number if a is not primary and b is primary', () => {
    const a = { primary: false } as CourseResult;
    const b = { primary: true } as CourseResult;
    expect(courseSort(a, b)).toBeGreaterThan(0);
  });

  it('should return a positive number if a is free and b is not free, when primary is the same', () => {
    const primary = faker.datatype.boolean();
    const a = { primary, free: true } as CourseResult;
    const b = { primary, free: false } as CourseResult;
    expect(courseSort(a, b)).toBeGreaterThan(0);
  });

  it('should return a negative number if a is not free and b is free, when primary is the same', () => {
    const primary = faker.datatype.boolean();
    const a = { primary, free: false } as CourseResult;
    const b = { primary, free: true } as CourseResult;
    expect(courseSort(a, b)).toBeLessThan(0);
  });

  it('should return a negative number if a.cost is greater than b.cost, when primary is the same and free is the same', () => {
    const primary = faker.datatype.boolean();
    const free = faker.datatype.boolean();
    const a = { primary, free, cost: 1000 } as CourseResult;
    const b = { primary, free, cost: 50 } as CourseResult;
    expect(courseSort(a, b)).toBeLessThan(0);
  });

  it('should return a positive number if a.cost is less than b.cost, when primary is the same and free is the same', () => {
    const primary = faker.datatype.boolean();
    const free = faker.datatype.boolean();
    const a = { primary, free, cost: 43 } as CourseResult;
    const b = { primary, free, cost: 94 } as CourseResult;
    expect(courseSort(a, b)).toBeGreaterThan(0);
  });

  it('should return a negative number if a.discountedCost is greater than b.discountedCost, when primary is the same and free is the same and the cost is the same', () => {
    const primary = faker.datatype.boolean();
    const free = faker.datatype.boolean();
    const cost = faker.datatype.number();
    const a = { primary, free, cost, discountedCost: 1000 } as CourseResult;
    const b = { primary, free, cost, discountedCost: 50 } as CourseResult;
    expect(courseSort(a, b)).toBeLessThan(0);
  });

  it('should return a positive number if a.discountedCost is less than b.discountedCost, when primary is the same and free is the same and the cost is the same', () => {
    const primary = faker.datatype.boolean();
    const free = faker.datatype.boolean();
    const cost = faker.datatype.number();
    const a = { primary, free, cost, discountedCost: 43 } as CourseResult;
    const b = { primary, free, cost, discountedCost: 94 } as CourseResult;
    expect(courseSort(a, b)).toBeGreaterThan(0);
  });

  it('should return zero when primary is the same and free is the same and the cost is the same and discountedCost is the same', () => {
    const primary = faker.datatype.boolean();
    const free = faker.datatype.boolean();
    const cost = faker.datatype.number();
    const discountedCost = faker.datatype.number();
    const a = { primary, free, cost, discountedCost } as CourseResult;
    const b = { primary, free, cost, discountedCost } as CourseResult;
    expect(courseSort(a, b)).toBe(0);
  });
});
