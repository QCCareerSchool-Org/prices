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

const studentSupportNames = [ 'NATHAN', 'AMANDA', 'ANDREW', 'ANNIE', 'CHARLOTTE', 'EMILY', 'GINA', 'HEATHER', 'TAYLOR', 'KAYLA', 'PAMELA', 'SASHA', 'SHANNON' ];

const studentSupportSchools: School[] = [ 'QC Makeup Academy', 'QC Design School', 'QC Event School' ];

export const studentSupport50Specs: PromoCodeSpec[] = studentSupportNames.map<PromoCodeSpec>(name => ({
  code: name + '50',
  student: 'ALLOWED',
  schools: studentSupportSchools,
} as const));

export const promoCodeSpecs: PromoCodeSpec[] = [
  { code: 'SAVE50', student: 'DENIED', schools: [ 'QC Makeup Academy', 'QC Design School', 'QC Event School' ] },
  { code: 'ELITE', student: 'DENIED', schools: [ 'QC Makeup Academy' ] },
  { code: 'ADVANCED100', student: 'DENIED', schools: [ 'QC Makeup Academy' ], start: new Date(Date.UTC(2021, 4, 17, 13)), end: new Date(Date.UTC(2021, 5, 1, 13)) },
  { code: 'FREEPRO', student: 'DENIED', schools: [ 'QC Makeup Academy' ] },
  { code: 'FOUNDIT', student: 'DENIED', schools: [ 'QC Makeup Academy' ], start: new Date(Date.UTC(2021, 2, 29, 13)), end: new Date(Date.UTC(2021, 3, 6, 4)) },
  { code: 'SPRING21', student: 'DENIED', schools: [ 'QC Makeup Academy' ], start: new Date(Date.UTC(2021, 3, 6, 13)) },
  { code: 'HAPPYMAY', student: 'DENIED', schools: [ 'QC Makeup Academy' ], start: new Date(Date.UTC(2021, 4, 1, 12)), end: new Date(Date.UTC(2021, 4, 3, 13)) },
  { code: 'SKINCARE60', student: 'DENIED', schools: [ 'QC Makeup Academy' ], start: new Date(Date.UTC(2021, 4, 3, 13)), end: new Date(Date.UTC(2021, 4, 17, 13)) },
  { code: 'NATHANSDAY', student: 'DENIED', schools: [ 'QC Makeup Academy' ], start: new Date(Date.UTC(2021, 3, 30, 13)), end: new Date(Date.UTC(2021, 4, 3, 13)) },
  { code: 'MOTHERSDAY', student: 'DENIED', schools: [ 'QC Makeup Academy' ], start: new Date(Date.UTC(2021, 4, 5, 4)), end: new Date(Date.UTC(2021, 5, 1, 13)) }, // May 5 at 00:00 to June 1 at 09:00
  { code: 'SPRING100', student: 'DENIED', schools: [ 'QC Design School' ], start: new Date(Date.UTC(2021, 5, 1, 13)), end: new Date(Date.UTC(2021, 5, 12, 4)) }, // June 1 at 09:00 to June 12 at 00:00
  { code: 'MAY21', student: 'DENIED', schools: [ 'QC Design School' ], start: new Date(Date.UTC(2021, 4, 17, 13)), end: new Date(Date.UTC(2021, 5, 1, 13)) }, // May 17 at 09:00 to June 1 at 09:00
  { code: 'LEVELUP', student: 'DENIED', schools: [ 'QC Makeup Academy' ], start: new Date(Date.UTC(2021, 4, 15, 13)), end: new Date(Date.UTC(2021, 4, 17, 13)) }, // May 15 at 08:00 to May 17 at 09:00
  { code: 'WEEKEND', student: 'DENIED', schools: [ 'QC Makeup Academy' ], start: new Date(Date.UTC(2021, 4, 29, 12)), end: new Date(Date.UTC(2021, 5, 1, 13)) }, // May 28 at 08:00 to June 1 at 09:00
  { code: 'WEEKEND', student: 'DENIED', schools: [ 'QC Design School' ], start: new Date(Date.UTC(2021, 4, 29, 12)), end: new Date(Date.UTC(2021, 5, 1, 13)) }, // May 28 at 08:00 to June 1 at 09:00
  { code: 'JUNE21', student: 'DENIED', schools: [ 'QC Design School' ], start: new Date(Date.UTC(2021, 5, 1, 13)) }, // June 1 at 09:00
  { code: 'WEDDING21', student: 'DENIED', schools: [ 'QC Event School' ], start: new Date(2021, 5, 9, 9), end: new Date(2021, 5, 28, 9) }, // June 9 at 09:00 to June 28 at 09:00
  { code: 'EXPERT', student: 'DENIED', schools: [ 'QC Event School' ], start: new Date(2021, 5, 9, 9), end: new Date(2021, 5, 28, 9) }, // June 9 at 09:00 to June 28 at 09:00
  { code: 'SUMMER21', student: 'DENIED', schools: [ 'QC Event School' ], start: new Date(2021, 6, 17, 8), end: new Date(2021, 6, 20) }, // July 17 at 08:00 to July 20 at 00:00
  { code: 'SUMMER21', student: 'DENIED', schools: [ 'QC Makeup Academy' ], start: new Date(2021, 5, 14, 9), end: new Date(2021, 5, 28, 9) }, // June 14 at 09:00 to June 28 at 09:00
  { code: 'SUMMER21', student: 'DENIED', schools: [ 'QC Design School' ], start: new Date(2021, 5, 14, 9), end: new Date(2021, 5, 28, 9) }, // June 14 at 09:00 to June 28 at 09:00
  { code: 'BONUSGIFT', student: 'DENIED', schools: [ 'QC Makeup Academy', 'QC Event School', 'QC Design School' ], start: new Date(2021, 5, 12, 8), end: new Date(2021, 5, 14, 9) }, // June 12 at 08:00 to June 14 at 09:00
  { code: 'DESIGN100', student: 'DENIED', schools: [ 'QC Design School' ], start: new Date(2021, 5, 14, 9) }, // June 14 at 09:00
  { code: 'FATHERSDAY', student: 'DENIED', schools: [ 'QC Makeup Academy', 'QC Event School', 'QC Design School' ], start: new Date(2021, 5, 18, 9, 30), end: new Date(2021, 5, 21, 0) }, // June 18 at 09:30 to June 21 at 00:00
  { code: 'DIVEIN', student: 'DENIED', schools: [ 'QC Makeup Academy', 'QC Design School', 'QC Event School' ], start: new Date(2021, 5, 30, 10), end: new Date(2021, 5, 30, 23, 59, 59, 999) }, // June 30 at 10:00 to June 30 at 23:59:59.999
  { code: 'CANADA154', student: 'DENIED', schools: [ 'QC Makeup Academy', 'QC Design School', 'QC Event School' ], start: new Date(2021, 5, 28, 9, 30), end: new Date(2021, 6, 7, 9, 30) }, // June 28 at 09:30 to July 7 at 09:30
  { code: 'WEDDING21', student: 'ALLOWED', schools: [ 'QC Makeup Academy' ], start: new Date(2021, 6, 6, 10, 30), end: new Date(2021, 6, 17, 23, 59, 59, 999) }, // July 6 at 10:30 to July 17 at 23:59:59.999
  { code: 'DELUXE', student: 'DENIED', schools: [ 'QC Design School' ], start: new Date(2021, 6, 6, 10, 30), end: new Date(2021, 6, 17, 23, 59, 59, 999) }, // July 6 at 10:30 to July 17 at 23:59:59.999
  { code: 'WEDDINGSZN', student: 'DENIED', schools: [ 'QC Event School' ], start: new Date(2021, 6, 6, 10, 30), end: new Date(2021, 6, 17, 23, 59, 59, 999) }, // July 6 at 10:30 to July 17 at 23:59:59.999
  { code: 'QCLASHES', student: 'ALLOWED', schools: [ 'QC Makeup Academy' ] },
  { code: 'DELUXE21', student: 'DENIED', schools: [ 'QC Design School' ], start: new Date(2021, 6, 17, 8), end: new Date(2021, 6, 20) }, // July 17 at 08:00 to July 20 at 00:00
  { code: 'GLOWUP', student: 'DENIED', schools: [ 'QC Makeup Academy' ], start: new Date(2021, 6, 19, 9, 30), end: new Date(2021, 6, 31) }, // July 19 at 09:30 to July 31 at 00:00
  { code: 'FASTPASS', student: 'DENIED', schools: [ 'QC Event School' ], start: new Date(2021, 6, 19, 9, 30), end: new Date(2021, 6, 31) }, // July 19 at 09:30 to July 31 at 00:00
  { code: 'JULY21', student: 'DENIED', schools: [ 'QC Design School' ], start: new Date(2021, 6, 19, 9, 30), end: new Date(2021, 6, 31) }, // July 19 at 09:30 to July 31 at 00:00
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
