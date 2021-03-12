import { NoShipping, PriceQueryOptions } from './types';

export const getNotes = (courses: string[], noShipping: NoShipping, options?: PriceQueryOptions): string[] => {
  const notes: string[] = [];

  // studentDiscount option
  if (options?.studentDiscount) {
    notes.push('additional discount');
  }

  // deluxeKit option
  if (options?.deluxeKit === true && (noShipping === 'ALLOWED' || noShipping === 'FORBIDDEN')) {
    if (courses.includes('MZ')) {
      notes.push('deluxe/elite/better kit');
    }
  }

  // MMFreeMW option
  if (options?.MMFreeMW === true) {
    if (courses.includes('MM') || courses.includes('MZ')) {
      notes.push('free MW course');
    }
  }

  // portfolio option
  if (options?.portfolio === true) {
    notes.push('portfolio');
  }

  return notes;
};
