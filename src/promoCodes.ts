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

const studentSupportNames = [ 'NATHAN', 'EMILY', 'HEATHER', 'TAYLOR', 'KAYLA', 'PAMELA', 'SASHA', 'SHANNON', 'SONA' ];

const studentSupportSchools: School[] = [ 'QC Makeup Academy', 'QC Design School', 'QC Event School', 'QC Pet Studies', 'QC Wellness Studies' ];

export const studentSupport50Specs: PromoCodeSpec[] = studentSupportNames.map<PromoCodeSpec>(name => ({
  code: name + '50',
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
  { code: 'ELITE', student: 'DENIED', schools: [ 'QC Makeup Academy' ] },
  { code: 'FREEPRO', student: 'DENIED', schools: [ 'QC Makeup Academy' ] },
  { code: 'EXPERT', student: 'DENIED', schools: [ 'QC Event School' ] },
  { code: 'QCLASHES', student: 'ALLOWED', schools: [ 'QC Makeup Academy' ] },
  { code: 'BOGO', student: 'DENIED', schools: [ 'QC Design School', 'QC Event School', 'QC Makeup Academy' ] },
  { code: 'LUMINOUS', student: 'DENIED', schools: [ 'QC Makeup Academy' ] },
  { code: 'PROLUMINOUS', student: 'DENIED', schools: [ 'QC Makeup Academy' ] },
  { code: 'BLACK FRIDAY', student: 'DENIED', schools: [ 'QC Makeup Academy', 'QC Design School', 'QC Event School' ] },
  { code: 'SKINCARE', student: 'DENIED', schools: [ 'QC Makeup Academy' ] },
  { code: 'EVENTFREECOURSE', student: 'DENIED', schools: [ 'QC Event School' ] },
  { code: 'SPECIALTY', student: 'DENIED', schools: [ 'QC Event School' ] },
  { code: '2SPECIALTY', student: 'DENIED', schools: [ 'QC Event School' ] },
  { code: 'MCSPECIALTY', student: 'DENIED', schools: [ 'QC Event School' ] },
  { code: 'SSMCSPECIALTY', student: 'DENIED', schools: [ 'QC Event School' ] },
  { code: 'FREELUXURY', student: 'DENIED', schools: [ 'QC Event School' ] },
  { code: 'MASTERCLASS', student: 'DENIED', schools: [ 'QC Design School' ] },
  { code: 'SSMASTERCLASS', student: 'DENIED', schools: [ 'QC Design School' ] },
  { code: 'MASTERCLASS150', student: 'DENIED', schools: [ 'QC Design School' ] },
  { code: 'LUXURYDESTINATION', student: 'DENIED', schools: [ 'QC Event School' ] },
  { code: 'KIT200OFF', student: 'DENIED', schools: [ 'QC Makeup Academy' ] },
  { code: 'FREEADVANCED', student: 'DENIED', schools: [ 'QC Makeup Academy' ] },
  ...studentSupport50Specs,
  ...studentSupport150Specs,
  { code: 'DG150', student: 'DENIED', schools: [ 'QC Pet Studies' ] },
  { code: 'DG200', student: 'DENIED', schools: [ 'QC Pet Studies' ] },
  { code: 'DG300', student: 'DENIED', schools: [ 'QC Pet Studies' ] },
  { code: 'DT150', student: 'DENIED', schools: [ 'QC Pet Studies' ] },
  { code: 'DT200', student: 'DENIED', schools: [ 'QC Pet Studies' ] },
  { code: 'DT300', student: 'DENIED', schools: [ 'QC Pet Studies' ] },
  { code: '50OFF', student: 'DENIED', schools: [ 'QC Wellness Studies' ] },
  { code: '100OFF', student: 'DENIED', schools: [ 'QC Wellness Studies' ] },
  { code: '150OFF', student: 'DENIED', schools: [ 'QC Wellness Studies' ] },
  { code: 'PET100OFF', student: 'DENIED', schools: [ 'QC Pet Studies' ] },
  { code: 'PET150OFF', student: 'DENIED', schools: [ 'QC Pet Studies' ] },
  { code: 'PET200OFF', student: 'DENIED', schools: [ 'QC Pet Studies' ] },
  { code: 'PET300OFF', student: 'DENIED', schools: [ 'QC Pet Studies' ] },
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
