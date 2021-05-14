/**
 * When determining which promotions to apply, we look for a particular promo code specification first
 * and then later see if it applies.
 *
 * e.g.
 * const advanced100 = promoCodeSpecs.find(v => v.code === 'ADVANCED100')
 * const advanced100Applies = advanced100 && promoCodeApplies(advanced100, now, options?.discountAll, options?.promoCode, options?.school)
 *
 * We do this, rather than searching by code, because the same code might be present in multiple specs
 * that should result in different promotions.
 *
 * e.g.
 * const mothersdayMakeup = promoCodeSpecs.find(v => v.code === 'MOTHERSDAY' && v.schools.includes('QC Makeup Academy'))
 * const mothersdayDesign = promoCodeSpecs.find(v => v.code === 'MOTHERSDAY' && v.schools.includes('QC Design School'))
 */
import { PriceQueryOptions, School } from './types';

export type PromoCodeSpec = {
  code: string;
  schools?: School[];
  student: 'ALLOWED' | 'DENIED' | 'ONLY';
  start?: Date;
  end?: Date;
};

const studentSupportNames = [ 'NATHAN', 'AMANDA', 'ANDREW', 'ANNIE', 'CHARLOTTE', 'EMILY', 'GINA', 'HEATHER', 'JESS', 'KAYLA', 'PAMELA', 'SASHA', 'SHANNON' ];

const studentSupportSchools: School[] = [ 'QC Makeup Academy', 'QC Design School' ];

export const studentSupport50Specs: PromoCodeSpec[] = studentSupportNames.map<PromoCodeSpec>(name => ({
  code: name + '50',
  student: 'ALLOWED',
  schools: studentSupportSchools,
} as const));

export const promoCodeSpecs: PromoCodeSpec[] = [
  { code: 'SAVE50', student: 'DENIED', schools: [ 'QC Makeup Academy', 'QC Design School' ] },
  { code: 'ELITE', student: 'DENIED', schools: [ 'QC Makeup Academy' ] },
  { code: 'ADVANCED100', student: 'DENIED', schools: [ 'QC Makeup Academy' ], start: new Date(Date.UTC(2021, 4, 17, 13)), end: new Date(Date.UTC(2021, 5, 1, 13)) },
  { code: 'FREEPRO', student: 'DENIED' },
  { code: 'FOUNDIT', student: 'DENIED', schools: [ 'QC Makeup Academy' ], start: new Date(Date.UTC(2021, 2, 29, 13)), end: new Date(Date.UTC(2021, 3, 6, 4)) },
  { code: 'SPRING21', student: 'DENIED', schools: [ 'QC Makeup Academy' ], start: new Date(Date.UTC(2021, 3, 6, 13)) },
  { code: 'HAPPYMAY', student: 'DENIED', schools: [ 'QC Makeup Academy' ], start: new Date(Date.UTC(2021, 4, 1, 12)), end: new Date(Date.UTC(2021, 4, 3, 13)) },
  { code: 'SKINCARE60', student: 'DENIED', schools: [ 'QC Makeup Academy' ], start: new Date(Date.UTC(2021, 4, 3, 13)), end: new Date(Date.UTC(2021, 4, 17, 13)) },
  { code: 'NATHANSDAY', student: 'DENIED', schools: [ 'QC Makeup Academy' ], start: new Date(Date.UTC(2021, 3, 30, 13)), end: new Date(Date.UTC(2021, 4, 3, 13)) },
  { code: 'MOTHERSDAY', student: 'DENIED', schools: [ 'QC Makeup Academy' ], start: new Date(Date.UTC(2021, 4, 5, 4)), end: new Date(Date.UTC(2021, 5, 1, 13)) }, // May 5 at 00:00 to June 1 at 09:00
  { code: 'SPRING100', student: 'DENIED', schools: [ 'QC Design School' ], start: new Date(Date.UTC(2021, 4, 17, 13)), end: new Date(Date.UTC(2021, 5, 1, 13)) }, // May 17 at 09:00 to June 1 at 09:00
  { code: 'MAY21', student: 'DENIED', schools: [ 'QC Design School' ], start: new Date(Date.UTC(2021, 4, 17, 13)), end: new Date(Date.UTC(2021, 5, 1, 13)) }, // May 17 at 09:00 to June 1 at 09:00
  { code: 'LEVELUP', student: 'DENIED', schools: [ 'QC Makeup Academy' ], start: new Date(Date.UTC(2021, 4, 15, 13)), end: new Date(Date.UTC(2021, 4, 17, 13)) }, // May 15 at 08:00 to May 17 at 09:00
  ...studentSupport50Specs,
];

/**
 * Determines if the promo code supplied matches any of the promo code specifications
 * @param now the current date
 * @param options the price query options
 */
export const promoCodeRecognized = (now: Date, options?: PriceQueryOptions): boolean | undefined => {
  if (options?.promoCode) {
    return promoCodeSpecs.some(p => specApplies(p, now, options?.discountAll, options?.promoCode, options?.school));
  }
};

/**
 * Determines whether a promo code applies in certain circumstances
 *
 * @param spec the promo code specification
 * @param now the current date
 * @param student whether this is an existing-student enrollment or not
 * @param code the promo code supplied
 * @param school the school supplied
 */
export const specApplies = (spec: PromoCodeSpec, now: Date, student?: boolean, code?: string, school?: School): boolean => {
  return code === spec.code
    && (typeof spec.schools === 'undefined' || (typeof school !== 'undefined' && spec.schools.includes(school)))
    && (typeof spec.start === 'undefined' || now >= spec.start)
    && (typeof spec.end === 'undefined' || now < spec.end)
    && (spec.student === 'ALLOWED' || (spec.student === 'DENIED' && !student) || (spec.student === 'ONLY' && !!student));
};
