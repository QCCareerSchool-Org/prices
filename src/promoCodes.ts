import { PriceQueryOptions, School } from './types';

export type PromoCodeSpec = {
  code: string;
  schools?: School[];
  student: 'ALLOWED' | 'DENIED' | 'ONLY';
  start?: Date;
  end?: Date;
}

export const studentSupport50Specs: PromoCodeSpec[] = [ 'AMANDA50', 'ANDREW50', 'ANNIE50', 'CHARLOTTE50', 'EMILY50', 'GINA50', 'HEATHER50', 'JESS50', 'KAYLA50', 'PAMELA50', 'SASHA50', 'SHANNON50' ].map(code => ({ code, student: 'DENIED' } as const));

export const promoCodeSpecs: PromoCodeSpec[] = [
  { code: 'SAVE50', student: 'DENIED', schools: [ 'QC Makeup Academy' ] },
  { code: 'ELITE', student: 'DENIED', schools: [ 'QC Makeup Academy' ] },
  { code: 'ADVANCED100', student: 'DENIED', schools: [ 'QC Makeup Academy' ] },
  { code: 'FOUNDIT', student: 'DENIED', schools: [ 'QC Makeup Academy' ], start: new Date('2021-03-18T09:00:00-0400'), end: new Date('2021-04-01T09:00:00-0400') },
  ...studentSupport50Specs,
];

/**
 * Determines if the promo code supplied matches any of the promo code specifications
 * @param now the current date
 * @param options the price query options
 */
export const promoCodeRecognized = (now: Date, options?: PriceQueryOptions): boolean | undefined => {
  if (options?.promoCode) {
    const student = options?.discountAll ?? false;
    return promoCodeSpecs.some(p => promoCodeApplies(p, now, student, options?.promoCode, options?.school));
  }
};

/**
 * Determines whether a promo code applies in certain circumstances
 * @param spec the promo code specification
 * @param now the current date
 * @param student whether this is an existing-student enrollment or not
 * @param code the promo code supplied
 * @param school the school supplied
 */
export const promoCodeApplies = (spec: PromoCodeSpec, now: Date, student: boolean, code?: string, school?: School): boolean => {
  return code === spec.code
    && (typeof spec.schools === 'undefined' || typeof school !== 'undefined' && spec.schools.includes(school))
    && (typeof spec.start === 'undefined' || now >= spec.start)
    && (typeof spec.end === 'undefined' || now < spec.end)
    && (spec.student === 'ALLOWED' || spec.student === 'DENIED' && !student || spec.student === 'ONLY' && student);
};
