/* eslint-disable @typescript-eslint/member-ordering */
import rawGroomCodes from '../codes/GROOM.json';
import type { PriceOptions } from '../domain/priceQuery';
import type { School } from '../domain/school';

export interface PromoCodeSpec {
  code: string;
  schools?: School[];
  student: 'ALLOWED' | 'DENIED' | 'ONLY';
  start?: Date;
  end?: Date;
}

export class PromoCodes {
  private static readonly studentSupportNames = [ 'NATHAN', 'EMILY', 'HEATHER', 'TAYLOR', 'KAYLA', 'PAMELA', 'SASHA', 'SHANNON', 'SONA', 'VICKY', 'MALCOLM' ];

  private static readonly groomCodes: readonly string[] = rawGroomCodes;

  public static readonly ppaFreeCourseCodes: readonly string[] = PromoCodes.groomCodes.map(name => 'GROOM' + name);

  public static readonly studentSupport50Codes: readonly string[] = PromoCodes.studentSupportNames.map(name => name + '50');

  public static readonly studentSupport100Codes: readonly string[] = PromoCodes.studentSupportNames.map(name => name + '100');

  public static readonly studentSupport150Codes: readonly string[] = PromoCodes.studentSupportNames.map(name => name + '150');

  private static readonly studentSupportSchools: School[] = [ 'QC Makeup Academy', 'QC Design School', 'QC Event School', 'QC Pet Studies', 'QC Wellness Studies' ];

  private static readonly studentSupport50Specs: PromoCodeSpec[] = PromoCodes.studentSupport50Codes.map<PromoCodeSpec>(name => ({
    code: name,
    student: 'ALLOWED',
    schools: PromoCodes.studentSupportSchools,
  }));

  private static readonly studentSupport100Specs: PromoCodeSpec[] = PromoCodes.studentSupport100Codes.map<PromoCodeSpec>(name => ({
    code: name,
    student: 'ALLOWED',
    schools: PromoCodes.studentSupportSchools,
  }));

  private static readonly studentSupport150Specs: PromoCodeSpec[] = PromoCodes.studentSupport150Codes.map<PromoCodeSpec>(name => ({
    code: name,
    student: 'ALLOWED',
    schools: PromoCodes.studentSupportSchools,
  }));

  private static readonly ppaFreeCourseSpecs: PromoCodeSpec[] = PromoCodes.ppaFreeCourseCodes.map<PromoCodeSpec>(name => ({
    code: name,
    student: 'DENIED',
    schools: [ 'Paw Parent Academy' ],
  }));

  public static readonly specs: PromoCodeSpec[] = [
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
    { code: 'ORGANIZING60', student: 'ALLOWED', schools: [ 'QC Design School' ] },
    { code: 'CORPORATE60', student: 'ALLOWED', schools: [ 'QC Event School' ] },
    { code: 'BOGOVIRTUAL', student: 'ALLOWED', schools: [ 'QC Design School', 'QC Event School' ] },
    { code: 'BUSINESS60', student: 'ONLY', schools: [ 'QC Design School', 'QC Event School' ] },
    { code: 'PROFITPIVOT', student: 'DENIED', schools: [ 'QC Event School' ] },
    { code: 'VDDBFREE', student: 'DENIED', schools: [ 'QC Design School' ] },

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

    { code: 'GROOM', student: 'DENIED', schools: [ 'Paw Parent Academy' ] },

    { code: 'QCGROUP', student: 'DENIED' },

    ...PromoCodes.studentSupport50Specs,
    ...PromoCodes.studentSupport100Specs,
    ...PromoCodes.studentSupport150Specs,
    ...PromoCodes.ppaFreeCourseSpecs,
  ];

  private readonly specsByCode = new Map<string, PromoCodeSpec[]>();

  public constructor(
    public readonly now: Date,
    public readonly options: PriceOptions | undefined,
  ) {
    for (const spec of PromoCodes.specs) {
      this.specsByCode.set(spec.code, [ ...(this.specsByCode.get(spec.code) ?? []), spec ]);
    }
  }

  public applies(code: string): boolean {
    return this.findSpecs(code).some(spec => this.specApplies(spec));
  }

  public get recognized(): boolean | undefined {
    if (this.options?.promoCode) {
      return PromoCodes.specs.some(spec => this.specApplies(spec));
    }
  }

  private specApplies(spec: PromoCodeSpec): boolean {
    const options = this.options;

    if (typeof options?.promoCode === 'undefined') {
      return false;
    }

    return options.promoCode === spec.code
      && (typeof spec.schools === 'undefined' || (typeof options.school !== 'undefined' && spec.schools.includes(options.school)))
      && (typeof spec.start === 'undefined' || this.now >= spec.start)
      && (typeof spec.end === 'undefined' || this.now < spec.end)
      && (spec.student === 'ALLOWED' || (spec.student === 'DENIED' && !options.discountAll) || (spec.student === 'ONLY' && !!options.discountAll));
  }

  private findSpecs(code: string): PromoCodeSpec[] {
    return this.specsByCode.get(code) ?? [];
  }
}
