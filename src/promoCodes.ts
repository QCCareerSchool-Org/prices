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
import type { PriceQueryOptions, School } from './types';

export interface PromoCodeSpec {
  code: string;
  schools?: School[];
  student: 'ALLOWED' | 'DENIED' | 'ONLY';
  start?: Date;
  end?: Date;
}

const studentSupportNames = [ 'NATHAN', 'EMILY', 'HEATHER', 'TAYLOR', 'KAYLA', 'PAMELA', 'SASHA', 'SHANNON', 'SONA', 'VICKY', 'MALCOLM' ];

const studentSupportSchools: School[] = [ 'QC Makeup Academy', 'QC Design School', 'QC Event School', 'QC Pet Studies', 'QC Wellness Studies' ];

export const studentSupport50Specs: PromoCodeSpec[] = studentSupportNames.map<PromoCodeSpec>(name => ({
  code: name + '50',
  student: 'ALLOWED',
  schools: studentSupportSchools,
} as const));

export const studentSupport100Specs: PromoCodeSpec[] = studentSupportNames.map<PromoCodeSpec>(name => ({
  code: name + '100',
  student: 'ALLOWED',
  schools: studentSupportSchools,
} as const));

export const studentSupport150Specs: PromoCodeSpec[] = studentSupportNames.map<PromoCodeSpec>(name => ({
  code: name + '150',
  student: 'ALLOWED',
  schools: studentSupportSchools,
} as const));

export const promoCodeSpecs: PromoCodeSpec[] = [
  { code: 'SAVE50', student: 'DENIED', schools: [ 'QC Makeup Academy', 'QC Design School', 'QC Event School' ] },
  { code: 'SAVE60', student: 'ALLOWED' },
  { code: '50OFF', student: 'ALLOWED' },
  { code: 'PORTFOLIO', student: 'ALLOWED' },

  { code: 'ELITE', student: 'DENIED', schools: [ 'QC Makeup Academy' ] },
  { code: 'FREEPRO', student: 'DENIED', schools: [ 'QC Makeup Academy' ] },
  { code: 'QCLASHES', student: 'ALLOWED', schools: [ 'QC Makeup Academy' ] },
  { code: 'QCLASHES60', student: 'ALLOWED', schools: [ 'QC Makeup Academy' ] },
  { code: 'PROLUMINOUS', student: 'DENIED', schools: [ 'QC Makeup Academy' ] },
  { code: 'SKINCARE', student: 'DENIED', schools: [ 'QC Makeup Academy' ] },
  { code: 'SKINCARE100', student: 'DENIED', schools: [ 'QC Makeup Academy' ] },
  { code: 'SKINCARE300', student: 'DENIED', schools: [ 'QC Makeup Academy' ] },
  { code: 'FREEGLOBAL', student: 'DENIED', schools: [ 'QC Makeup Academy' ] },
  { code: 'KIT200OFF', student: 'DENIED', schools: [ 'QC Makeup Academy' ] },
  { code: 'BRUSHSET50', student: 'ALLOWED', schools: [ 'QC Makeup Academy' ] },
  { code: 'MASTER300', student: 'DENIED', schools: [ 'QC Makeup Academy' ] },
  { code: 'HALLOWEENSFX', student: 'DENIED', schools: [ 'QC Makeup Academy' ] },
  { code: 'BOGOMZ', student: 'DENIED', schools: [ 'QC Makeup Academy' ] },
  { code: 'BOGOMZ300', student: 'DENIED', schools: [ 'QC Makeup Academy' ] },
  { code: 'FREESTYLE', student: 'DENIED', schools: [ 'QC Makeup Academy' ] },
  { code: 'STYLING60', student: 'ALLOWED', schools: [ 'QC Makeup Academy' ] },
  { code: 'PORTDEV60', student: 'ALLOWED', schools: [ 'QC Makeup Academy' ] },
  { code: 'FREEPW', student: 'ALLOWED', schools: [ 'QC Makeup Academy' ] },
  { code: 'MAKEUP100', student: 'ALLOWED', schools: [ 'QC Makeup Academy' ] },
  { code: 'MZ100', student: 'ALLOWED', schools: [ 'QC Makeup Academy' ] },
  { code: 'SFX60', student: 'ONLY', schools: [ 'QC Makeup Academy' ] },
  { code: 'COACHING50', student: 'DENIED', schools: [ 'QC Makeup Academy' ] },

  { code: 'ALLACCESS', student: 'DENIED', schools: [ 'QC Event School' ] },
  { code: 'EXPERT', student: 'DENIED', schools: [ 'QC Event School' ] },
  { code: 'BOGO2ANY', student: 'DENIED', schools: [ 'QC Design School', 'QC Event School' ] },
  { code: 'BOGOCATALYST', student: 'DENIED', schools: [ 'QC Design School' ] },
  { code: 'BOGOCATALYST100', student: 'DENIED', schools: [ 'QC Design School' ] },
  { code: 'EVENTFREECOURSE', student: 'DENIED', schools: [ 'QC Event School' ] },
  { code: 'SPECIALTY', student: 'DENIED', schools: [ 'QC Event School' ] },
  { code: 'SPECIALTY100', student: 'DENIED', schools: [ 'QC Event School' ] },
  { code: '2SPECIALTY', student: 'DENIED', schools: [ 'QC Event School' ] },
  { code: '2SPECIALTY100', student: 'DENIED', schools: [ 'QC Event School' ] },
  { code: '2SPECIALTYED', student: 'DENIED', schools: [ 'QC Event School' ] },
  { code: 'MCSPECIALTY', student: 'DENIED', schools: [ 'QC Event School' ] },
  { code: 'SSMCSPECIALTY', student: 'DENIED', schools: [ 'QC Event School' ] },
  { code: 'FREELUXURY', student: 'DENIED', schools: [ 'QC Event School' ] },
  { code: 'MASTERCLASS', student: 'DENIED', schools: [ 'QC Design School' ] },
  { code: 'SSMASTERCLASS', student: 'DENIED', schools: [ 'QC Design School' ] },
  { code: 'MASTERCLASS150', student: 'DENIED', schools: [ 'QC Design School' ] },
  { code: 'LUXURYDESTINATION', student: 'DENIED', schools: [ 'QC Event School' ] },
  { code: 'DESIGN100OFF', student: 'DENIED', schools: [ 'QC Design School' ] },
  { code: 'DESIGN200OFF', student: 'DENIED', schools: [ 'QC Design School' ] },
  { code: 'EVENT100OFF', student: 'DENIED', schools: [ 'QC Event School' ] },
  { code: 'EVENT200OFF', student: 'DENIED', schools: [ 'QC Event School' ] },
  { code: 'FOUNDATION200', student: 'DENIED', schools: [ 'QC Event School' ] },
  { code: 'BOGO100', student: 'DENIED', schools: [ 'QC Design School', 'QC Event School' ] },
  { code: 'BOGO200', student: 'ALLOWED', schools: [ 'QC Design School' ] },
  { code: 'FREEVIRTUAL', student: 'ALLOWED', schools: [ 'QC Design School', 'QC Event School' ] },
  { code: 'PORTFOLIO50', student: 'ALLOWED', schools: [ 'QC Design School', 'QC Event School' ] },
  { code: 'PORTFOLIO60', student: 'ALLOWED', schools: [ 'QC Design School', 'QC Event School', 'QC Makeup Academy' ] },
  { code: 'FANDECK50', student: 'ALLOWED', schools: [ 'QC Design School' ] },
  { code: 'FREECOLOR', student: 'DENIED', schools: [ 'QC Design School' ] },
  { code: 'COLORWHEEL', student: 'ALLOWED', schools: [ 'QC Design School' ] },
  { code: 'COLORWHEEL60', student: 'ALLOWED', schools: [ 'QC Design School' ] },
  { code: 'LIVEEVENT60', student: 'ALLOWED', schools: [ 'QC Event School' ], start: new Date(Date.UTC(2024, 2, 6, 22)), end: new Date(Date.UTC(2024, 2, 13, 22)) },
  { code: 'ORGANIZING60', student: 'ALLOWED', schools: [ 'QC Design School' ] },
  { code: 'CORPORATE60', student: 'ALLOWED', schools: [ 'QC Event School' ] },
  { code: 'BOGOVIRTUAL', student: 'ALLOWED', schools: [ 'QC Design School', 'QC Event School' ] },
  { code: 'BUSINESS60', student: 'ONLY', schools: [ 'QC Design School', 'QC Event School' ] },

  { code: 'WOOFGANG', student: 'DENIED', schools: [ 'QC Pet Studies' ] },
  { code: 'DG150', student: 'DENIED', schools: [ 'QC Pet Studies' ] },
  { code: 'DG200', student: 'DENIED', schools: [ 'QC Pet Studies' ] },
  { code: 'DG300', student: 'DENIED', schools: [ 'QC Pet Studies' ] },
  { code: 'DG400', student: 'DENIED', schools: [ 'QC Pet Studies' ] },
  { code: 'DG500', student: 'DENIED', schools: [ 'QC Pet Studies' ] },
  { code: 'DT150', student: 'DENIED', schools: [ 'QC Pet Studies' ] },
  { code: 'DT200', student: 'DENIED', schools: [ 'QC Pet Studies' ] },
  { code: 'DT300', student: 'DENIED', schools: [ 'QC Pet Studies' ] },
  { code: 'DT500', student: 'DENIED', schools: [ 'QC Pet Studies' ] },
  { code: 'PET100OFF', student: 'DENIED', schools: [ 'QC Pet Studies' ] },
  { code: 'PET150OFF', student: 'DENIED', schools: [ 'QC Pet Studies' ] },
  { code: 'PET200OFF', student: 'DENIED', schools: [ 'QC Pet Studies' ] },
  { code: 'PET300OFF', student: 'DENIED', schools: [ 'QC Pet Studies' ] },
  { code: 'PET400OFF', student: 'DENIED', schools: [ 'QC Pet Studies' ] },
  { code: 'PET500OFF', student: 'DENIED', schools: [ 'QC Pet Studies' ] },
  { code: 'DAYCARE300', student: 'DENIED', schools: [ 'QC Pet Studies' ] },
  { code: 'DAYCARE60', student: 'ALLOWED', schools: [ 'QC Pet Studies' ] },
  { code: 'TRAINING60', student: 'ONLY', schools: [ 'QC Pet Studies' ] },

  { code: 'BOGO', student: 'DENIED', schools: [ 'QC Design School', 'QC Event School', 'QC Pet Studies' ] },
  { code: '100OFF', student: 'DENIED', schools: [ 'QC Design School', 'QC Event School', 'QC Wellness Studies', 'QC Pet Studies' ] },
  { code: '200OFF', student: 'DENIED', schools: [ 'QC Pet Studies', 'QC Wellness Studies' ] },
  { code: '150OFF', student: 'DENIED', schools: [ 'QC Wellness Studies' ] },
  { code: '300OFF', student: 'DENIED', schools: [ 'QC Wellness Studies' ] },
  { code: '400OFF', student: 'DENIED', schools: [ 'QC Wellness Studies' ] },
  { code: '10PERCENT', student: 'ALLOWED', schools: [ 'QC Makeup Academy', 'QC Design School', 'QC Event School', 'QC Pet Studies', 'QC Wellness Studies', 'Winghill Writing School' ] },
  { code: 'FC25PERCENT', student: 'DENIED', schools: [ 'QC Wellness Studies' ] },

  { code: 'QCGROUP', student: 'DENIED' },

  ...studentSupport50Specs,
  ...studentSupport100Specs,
  ...studentSupport150Specs,
];

/**
 * Determines if the promo code supplied matches any of the promo code specifications
 * @param now the current date
 * @param options the price query options
 */
export const promoCodeRecognized = (now: Date, options?: PriceQueryOptions): boolean | undefined => {
  if (options?.promoCode) {
    return promoCodeSpecs.some(p => specApplies(p, now, options.discountAll, options.promoCode, options.school));
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
