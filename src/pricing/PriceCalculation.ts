import Big from 'big.js';

import { CoursePricingState } from './CoursePricingState';
import { applyPromoCodeDiscounts } from './promoCodeDiscounts';
import { applyPromoCodeFreeCourses } from './promoCodeFreeCourses';
import { PromoCodes } from './PromoCodes';
import { byCostAscending, byFreeThenCostDescending, courseSort, getDefaultCourseSort } from './sortCourses';
import { studentDiscountAmount } from './studentDiscountAmount';
import { validateDiscounts } from './validateDiscounts';
import { lookupCurrency } from '../data/lookupCurrency';
import { lookupPrice } from '../data/lookupPrice';
import { audCountry, type Currency, gbpCountry, nzdCountry } from '../domain/currency';
import type { CurrencyCode } from '../domain/currencyCode';
import type { NoShipping } from '../domain/noShipping';
import type { Price } from '../domain/price';
import type { PriceOptions } from '../domain/priceQuery';
import type { RawPrice } from '../domain/rawPrice';
import { ClientError, ServerError } from '../lib/errors';
import { noShipCountry, telephoneNumber } from '../lib/helper-functions';
import { isDesignCourse, isEventFoundationCourse, isEventSpecialtyCourse, isMakeupCourse } from '@/courses';

export class PriceCalculation {
  private static readonly allAccessFreeCourses: Record<string, string[]> = {
    AA: [ 'EP', 'CP', 'ED', 'DW', 'LW', 'PE', 'FL', 'EB', 'VE' ],
    AM: [ 'MZ', 'MA', 'SK', 'SF', 'MW', 'HS', 'AB', 'PW', 'PF' ],
  };

  private readonly courseCodes: string[];

  private courseResults: CoursePricingState[] = [];

  private currency!: Currency;

  private disclaimers: string[] = [];

  private readonly noShipping: NoShipping;

  private notes: string[] = [];

  private readonly now: Date;

  private readonly promoCodes: PromoCodes;

  private promoWarnings: string[] = [];

  private somePartsMissing = false;

  public constructor(courseCodes: string[], private readonly countryCode: string, private readonly provinceCode: string | undefined, private readonly options: PriceOptions) {
    // convert to uppercase and remove duplicates
    this.courseCodes = courseCodes
      .map(c => c.toLocaleUpperCase())
      .filter((item, pos, self) => self.indexOf(item) === pos);

    this.noShipping = noShipCountry(countryCode) ? 'REQUIRED' : options.noShipping ? 'APPLIED' : 'ALLOWED' as NoShipping;
    this.now = process.env.NODE_ENV === 'production' ? new Date() : options.dateOverride ?? new Date();
    this.promoCodes = new PromoCodes(this.now, options);
  }

  public async calculate(): Promise<Price> {
    const rawPrices = await Promise.all(this.courseCodes.map(async c => lookupPrice(c, this.countryCode, this.provinceCode)));
    this.courseResults = rawPrices.map(r => new CoursePricingState(r, this.options.discountAll === true));

    const currencyCode = this.getCurrencyCode(rawPrices);
    this.currency = await lookupCurrency(currencyCode);
    this.somePartsMissing = rawPrices.some(p => p.installments === 0);

    this.courseResults.sort(byCostAscending);

    this.applyDefaultFreeCourses();

    this.courseResults.sort(getDefaultCourseSort(this.promoCodes));

    applyPromoCodeFreeCourses(this.courseResults, this.promoCodes, this.options);

    this.courseResults.sort(byFreeThenCostDescending);

    this.markPrimaryCourses();
    this.applyShippingDiscounts();
    this.applyMultiCourseDiscounts();
    this.applyStudentDiscounts();
    this.applyExtraDiscounts();
    applyPromoCodeDiscounts(this.courseResults, this.promoCodes, this.currency.code);
    this.applyToolsDiscounts();
    this.applyOverrides();

    this.courseResults.sort(courseSort);

    this.notesAndDisclaimers();

    return this.collateResults();
  }

  /** determine the currency we'll be using  */
  private getCurrencyCode(rawPrices: RawPrice[]): CurrencyCode {
    // if we have one or more price rows, pick the currency of the first price row (it doesn't matter which we pick); otherwise choose a currency based on the country
    const currencyCode = rawPrices[0]?.currencyCode ?? this.defaultCurrencyCode(this.countryCode);

    // only accept certain currencies
    if (currencyCode !== 'CAD' && currencyCode !== 'USD' && currencyCode !== 'GBP' && currencyCode !== 'AUD' && currencyCode !== 'NZD') {
      throw new ServerError(`Invalid currency code: ${currencyCode}`);
    }

    // make sure each price row uses the same currency
    if (rawPrices.some(p => p.currencyCode !== currencyCode)) {
      throw new ServerError(`Currency mismatch: ${this.courseCodes.toString()} ${this.countryCode} ${this.provinceCode}`);
    }

    return currencyCode;
  }

  private collateResults(): Price {
    const partPlanAvailable = !this.somePartsMissing;
    let cost = Big(0);
    let multiCourseDiscount = Big(0);
    let promoDiscount = Big(0);
    let shippingDiscount = Big(0);
    let discountedCost = Big(0);
    let fullDiscount = Big(0);
    let fullDeposit = Big(0);
    let fullInstallmentSize = Big(0);
    let fullRemainder = Big(0);
    let fullTotal = Big(0);
    let fullOriginalDeposit = Big(0);
    let partDiscount = Big(0);
    let partDeposit = Big(0);
    let partInstallmentSize = Big(0);
    let partRemainder = Big(0);
    let partTotal = Big(0);
    let partOriginalDeposit = Big(0);
    let shipping = Big(0);

    for (const courseResult of this.courseResults) {
      cost = cost.plus(courseResult.cost);
      multiCourseDiscount = multiCourseDiscount.plus(courseResult.multiCourseDiscount);
      promoDiscount = promoDiscount.plus(courseResult.promoDiscount);
      shippingDiscount = shippingDiscount.plus(courseResult.shippingDiscount);
      discountedCost = discountedCost.plus(courseResult.discountedCost);
      fullDiscount = fullDiscount.plus(courseResult.plans.full.discount);
      fullDeposit = fullDeposit.plus(courseResult.plans.full.deposit);
      fullInstallmentSize = fullInstallmentSize.plus(courseResult.plans.full.installmentSize);
      fullRemainder = fullRemainder.plus(courseResult.plans.full.remainder);
      fullTotal = fullTotal.plus(courseResult.plans.full.total);
      fullOriginalDeposit = fullOriginalDeposit.plus(courseResult.plans.full.originalDeposit);
      partDiscount = partDiscount.plus(courseResult.plans.part.discount);
      partDeposit = partDeposit.plus(courseResult.plans.part.deposit);
      partInstallmentSize = partInstallmentSize.plus(courseResult.plans.part.installmentSize);
      partRemainder = partRemainder.plus(courseResult.plans.part.remainder);
      partTotal = partTotal.plus(courseResult.plans.part.total);
      partOriginalDeposit = partOriginalDeposit.plus(courseResult.plans.part.originalDeposit);
      shipping = shipping.plus(courseResult.shipping);
    }

    return {
      countryCode: this.countryCode,
      provinceCode: this.provinceCode,
      currency: this.currency,
      cost: cost.toNumber(),
      multiCourseDiscount: multiCourseDiscount.toNumber(),
      promoDiscount: promoDiscount.toNumber(),
      shippingDiscount: shippingDiscount.toNumber(),
      discountedCost: discountedCost.toNumber(),
      plans: {
        full: {
          discount: fullDiscount.toNumber(),
          deposit: fullDeposit.toNumber(),
          installmentSize: fullInstallmentSize.toNumber(),
          installments: 0,
          remainder: fullRemainder.toNumber(),
          total: fullTotal.toNumber(),
          originalDeposit: fullOriginalDeposit.toNumber(),
          originalInstallments: 0,
        },
        part: partPlanAvailable
          ? {
            discount: partDiscount.toNumber(),
            deposit: partDeposit.toNumber(),
            installmentSize: partInstallmentSize.toNumber(),
            installments: this.courseResults[0]?.plans.part.installments ?? 1,
            remainder: partRemainder.toNumber(),
            total: partTotal.toNumber(),
            originalDeposit: partOriginalDeposit.toNumber(),
            originalInstallments: this.courseResults[0]?.plans.part.originalInstallments ?? 1,
          }
          : undefined,
      },
      shipping: shipping.toNumber(),
      disclaimers: this.disclaimers,
      notes: this.notes,
      promoWarnings: this.promoWarnings,
      noShipping: this.noShipping,
      noShippingMessage: this.noShippingMessage(),
      promoCodeRecognized: this.promoCodes.recognized,
      promoCode: this.promoCodes.recognized ? this.options.promoCode : undefined,
      courses: this.courseResults.map(c => c.toCoursePrice()),
    };
  }

  /** Sets courses that should always be free */
  private applyDefaultFreeCourses(): void {
    for (const courseResult of this.courseResults) {
      // FA is free if taking DG
      if (this.options.discountAll !== true && courseResult.code === 'FA' && this.courseResults.some(c => c.code === 'DG')) {
        courseResult.makeFree();
        continue;
      }

      // VD and DB are free if taking I2
      if ((courseResult.code === 'VD' || courseResult.code === 'DB') && this.courseResults.some(c => c.code === 'I2')) {
        courseResult.makeFree();
      }
    }

    // apply free all-access program courses
    for (const [ paidCourse, freeCourses ] of Object.entries(PriceCalculation.allAccessFreeCourses)) {
      if (this.courseResults.some(c => c.code === paidCourse && !c.free)) {
        for (const courseResult of this.courseResults) {
          if (freeCourses.includes(courseResult.code)) {
            courseResult.makeFree();
          }
        }
      }
    }
  }

  private markPrimaryCourses(): void {
    for (const [ index, courseResult ] of this.courseResults.entries()) {
      if (index === 0) {
        courseResult.primary = true;
        continue;
      }

      if (this.somePartsMissing) {
        continue;
      }

      courseResult.plans.part.originalInstallments = this.courseResults[0]?.plans.part.installments ?? 1;
      courseResult.plans.part.installments = courseResult.plans.part.originalInstallments;
      courseResult.plans.part.installmentSize = parseFloat(Big(courseResult.discountedCost).minus(courseResult.plans.part.deposit).div(courseResult.plans.part.installments).round(2, 0).toFixed(2));
      courseResult.plans.part.remainder = parseFloat(Big(courseResult.discountedCost).minus(courseResult.plans.part.deposit).minus(Big(courseResult.plans.part.installmentSize).times(courseResult.plans.part.installments)).toFixed(2));
    }
  }

  private applyShippingDiscounts(): void {
    for (const courseResult of this.courseResults) {
      if (courseResult.free) {
        continue;
      }

      if (this.noShipping === 'FORBIDDEN' || this.noShipping === 'ALLOWED') {
        continue;
      }

      courseResult.applyShippingDiscount();
    }
  }

  private applyMultiCourseDiscounts(): void {
    const promoCode = this.promoCodes.code;

    for (let index = 0; index < this.courseResults.length; index++) {
      const courseResult = this.courseResults[index];
      if (!courseResult) {
        throw new ServerError('courseResult not defined');
      }

      if (courseResult.free) {
        continue;
      }

      if (!this.shouldGetMultiCourseDiscount(index)) {
        continue;
      }

      const desiredMultiCourseDiscount = (
        promoCode === 'SKINCARE60' && courseResult.code === 'SK' && this.courseResults.find(c => c.code === 'MZ')) ||
        [ 'SAVE60', 'PORTFOLIO60', 'QCLASHES60', 'COLORWHEEL60' ].includes(promoCode ?? '') ||
        promoCode === 'LIVEEVENT60' ||
        (promoCode === 'ORGANIZING60' && courseResult.code === 'PO') ||
        (promoCode === 'CORPORATE60' && courseResult.code === 'CP') ||
        (promoCode === 'STYLING60' && courseResult.code === 'PF') ||
        (promoCode === 'PORTDEV60' && courseResult.code === 'PW') ||
        (promoCode === 'DAYCARE60' && courseResult.code === 'DD') ||
        (promoCode === 'SFX60' && courseResult.code === 'SF') ||
        (promoCode === 'BUSINESS60' && (courseResult.code === 'EB' || courseResult.code === 'DB')) ||
        (promoCode === 'TRAINING60' && (courseResult.code === 'DT' || courseResult.code === 'DC'))
        ? parseFloat(Big(courseResult.cost).times(0.6).toFixed(2))
        : parseFloat(Big(courseResult.cost).times(courseResult.multiCourseDiscountRate).toFixed(2));

      courseResult.applyMultiCourseDiscount(desiredMultiCourseDiscount);
    }
  }

  private applyStudentDiscounts(): void {
    if (this.options.studentDiscount !== true) {
      return;
    }

    for (const courseResult of this.courseResults) {
      if (courseResult.free) {
        continue;
      }

      const minimumPrice = courseResult.minimumPrice();
      const discount = Math.min(minimumPrice, studentDiscountAmount(this.currency.code));
      courseResult.addPromoDiscount(discount);
    }
  }

  private applyExtraDiscounts(): void {
    if (!validateDiscounts(this.options)) {
      throw new ClientError('invalid discount signature');
    }

    let remainingExtraDiscount = Big(this.options.discount ? this.options.discount[this.currency.code] ?? this.options.discount.default : 0);

    for (const courseResult of this.courseResults) {
      if (courseResult.free || remainingExtraDiscount.lte(0)) {
        continue;
      }

      const minimumPrice = courseResult.minimumPrice();
      const discount = Math.min(minimumPrice, parseFloat(remainingExtraDiscount.toFixed(2)));
      remainingExtraDiscount = remainingExtraDiscount.minus(discount);
      courseResult.addPromoDiscount(discount);
    }
  }

  private applyToolsDiscounts(): void {
    if (this.options.withoutTools !== true) {
      return;
    }

    const dgDiscountAmount = this.currency.code === 'GBP' ? 150 : 200;

    for (const courseResult of this.courseResults) {
      if (courseResult.free || courseResult.code !== 'DG') {
        continue;
      }

      const minimumPrice = courseResult.minimumPrice();
      const discount = Math.min(minimumPrice, dgDiscountAmount);
      courseResult.addPromoDiscount(discount);
    }
  }

  private applyOverrides(): void {
    if (this.somePartsMissing) {
      return;
    }

    const depositOverrides = this.options.depositOverrides;
    const installmentsOverride = this.options.installmentsOverride;

    if (typeof depositOverrides !== 'undefined') {
      for (const course of this.courseCodes) {
        if (typeof depositOverrides[course] === 'undefined') {
          throw new ClientError(`invalid depositOverride: no key for ${course}`);
        }
      }

      if (Object.keys(depositOverrides).length !== this.courseCodes.length) {
        throw new ClientError(`invalid depositOverride: expected ${this.courseCodes.length} keys`);
      }
    }

    if (typeof installmentsOverride !== 'undefined') {
      if (installmentsOverride < 1) {
        throw new ClientError('Invalid installmentsOverride: must be greater than or equal to 1');
      }

      if (installmentsOverride > 24) {
        throw new ClientError('Invalid installmentsOverride: must be less than 24');
      }
    }

    for (const courseResult of this.courseResults) {
      if (!depositOverrides?.[courseResult.code] || !installmentsOverride) {
        continue;
      }

      const deposit = depositOverrides[courseResult.code] ?? 0;
      const installments = Math.round(installmentsOverride);
      const installmentSize = parseFloat(Big(courseResult.discountedCost).minus(courseResult.plans.part.discount).minus(deposit).div(installments).round(2, 0).toFixed(2));
      const remainder = parseFloat(Big(courseResult.discountedCost).minus(courseResult.plans.part.discount).minus(deposit).minus(Big(installmentSize).times(installments)).toFixed(2));

      courseResult.plans.part.deposit = deposit;
      courseResult.plans.part.installments = installments;
      courseResult.plans.part.installmentSize = installmentSize;
      courseResult.plans.part.remainder = remainder;
    }
  }

  private shouldGetMultiCourseDiscount(index: number): boolean {
    // when discountAll is true all courses get the multi-course discount
    if (this.options.discountAll) {
      return true;
    }

    // the first course should not get the discount
    return index > 0;
  };

  private defaultCurrencyCode(countryCode: string): CurrencyCode {
    if (countryCode === 'CA') {
      return 'CAD';
    } else if (gbpCountry(countryCode)) {
      return 'GBP';
    } else if (audCountry(countryCode)) {
      return 'AUD';
    } else if (nzdCountry(countryCode)) {
      return 'NZD';
    }
    return 'USD';
  };

  /**
   * Note: These strings may be inserted as raw HTML by the front end application
   * Do not include any unescaped user input in them (preferably do not include
   * any user input at all). Also ensure that they are valid HTML with proper
   * closing tags.
   */
  private notesAndDisclaimers(): void {
    this.notes = [];
    this.disclaimers = [];
    this.promoWarnings = [];

    // studentDiscount option
    if (this.options.studentDiscount) {
      this.notes.push('additional discount');
    }

    // ELITE promo code
    if (this.promoCodes.code === 'ELITE') {
      if (this.noShipping === 'APPLIED') {
        this.promoWarnings.push('You entered the <strong>ELITE</strong> promo code, but have chosen to not have any materials shipped. You will not receive any makeup kits.');
      } else if (this.noShipping === 'REQUIRED') {
        this.promoWarnings.push('You entered the <strong>ELITE</strong> promo code, but we do not ship to your country. You will not receive any makeup kits.');
      } else { // 'ALLOWED', 'FORBIDDEN'
        if (!this.courseCodes.includes('MZ')) {
          this.promoWarnings.push('You have entered the <strong>ELITE</strong> promo code but have not selected the <strong>Master Makeup Artistry</strong> course.');
        }
      }
    }

    // FREEPRO promo code
    if (this.promoCodes.code === 'FREEPRO') {
      if (!this.courseCodes.includes('MZ') && !this.courseCodes.includes('MW')) {
        this.promoWarnings.push('You have entered the <strong>FREEPRO</strong> promo code but have not selected the <strong>Master Makeup Artistry</strong> and <strong>Pro Makeup Workshop</strong> courses.');
      } else if (!this.courseCodes.includes('MZ')) {
        this.promoWarnings.push('You have entered the <strong>FREEPRO</strong> promo code but have not selected the <strong>Master Makeup Artistry</strong> course.');
      } else if (!this.courseCodes.includes('MW')) {
        this.promoWarnings.push('You have entered the <strong>FREEPRO</strong> promo code but have not selected the <strong>Pro Makeup Workshop</strong> course.');
      }
    }

    // SAVE50 promo code
    if (this.promoCodes.code === 'SAVE50') {
      if (this.courseCodes.length < 2) {
        this.promoWarnings.push('You have entered the <strong>SAVE50</strong> promo code but have not selected more than one course. Select additional courses above to take advantage of this promotion.');
      }
    }

    // EXPERT promo code
    if (this.promoCodes.code === 'EXPERT') {
      if (!this.courseCodes.some(c => isEventFoundationCourse(c))) {
        this.promoWarnings.push('You have entered the <strong>EXPERT</strong> promo code but have not selected a Foundation course.');
      } else if (!this.courseCodes.some(c => isEventSpecialtyCourse(c))) {
        this.promoWarnings.push('You have entered the <strong>EXPERT</strong> promo code but have not selected a Specialty course.');
      }
    }

    // QCLASHES promo code
    if (this.promoCodes.code === 'QCLASHES' || this.promoCodes.code === 'QCLASHES60') {
      if (this.courseCodes.some(c => [ 'MZ', 'SK', 'AB', 'SF', 'HS', 'GB' ].includes(c))) {
        this.disclaimers.push('You\'ll receive bonus lashes in your makeup kit');
        this.notes.push('bonus lashes');
      } else {
        this.promoWarnings.push(`Unfortunately the <strong>QCLASHES</strong> code is not valid with the course${this.courseCodes.length === 1 ? '' : 's'} you have selected.`);
        this.promoWarnings.push('Please chose at least one course from Master Makeup Artistry, Skincare, Airbrush Makeup Workshop, Special FX Makeup, Hair Styling Essentials, or Global Beauty.');
      }
    }

    // BOGO promo code
    if (this.promoCodes.code === 'BOGO') {
      if (this.courseCodes.length === 0) {
        this.promoWarnings.push('You have entered the <strong>BOGO</strong> promo code, but you haven\'t selected any courses.');
      } else if (this.courseCodes.length < 2) {
        this.promoWarnings.push('You have entered the <strong>BOGO</strong> promo code, but you haven\'t selected a free second course.');
      }
    }

    // SKINCARE
    if (this.promoCodes.code === 'SKINCARE') {
      if (!this.courseCodes.includes('MZ')) {
        this.promoWarnings.push('You have entered the <strong>SKINCARE</strong> promo code, but you haven\'t selected the <strong>Master Makeup Artistry</strong> course');
      } else {
        if (!this.courseCodes.includes('SK')) {
          this.promoWarnings.push('You have entered the <strong>SKINCARE</strong> promo code, but you haven\'t selected the <strong>Skincare</strong> course');
        }
      }
    }

    // EVENTFREECOURSE promo code
    if (this.promoCodes.code === 'EVENTFREECOURSE') {
      if (!this.courseCodes.some(c => isEventFoundationCourse(c))) {
        this.promoWarnings.push('You have entered the <strong>EVENTFREECOURSE</strong> promo code, but you haven\'t selected a <strong>foundation</strong> course');
      } else {
        if (this.courseCodes.length < 2) {
          this.promoWarnings.push('You have entered the <strong>EVENTFREECOURSE</strong> promo code, but you haven\'t selected a free course');
        }
      }
    }

    // SPECIALTY promo code
    if (this.promoCodes.code === 'SPECIALTY') {
      if (!this.courseCodes.some(c => isEventFoundationCourse(c))) {
        this.promoWarnings.push('You have entered the <strong>SPECIALTY</strong> promo code, but you haven\'t selected a <strong>Foundation</strong> course');
      } else {
        const specialtyCount = this.courseCodes.filter(c => isEventSpecialtyCourse(c)).length;
        if (specialtyCount === 0) {
          this.promoWarnings.push('You have entered the <strong>SPECIALTY</strong> promo code, but you haven\'t selected any free <strong>Specialty</strong> courses');
        }
      }
    }

    // 2SPECIALTY and MCSPECIALTY promo codes
    [ '2SPECIALTY', 'MCSPECIALTY', 'SSMCSPECIALTY', '2SPECIALTY100' ].forEach(code => {
      if (this.promoCodes.code === code) {
        if (!this.courseCodes.some(c => isEventFoundationCourse(c))) {
          this.promoWarnings.push(`You have entered the <strong>${code}</strong> promo code, but you haven't selected a <strong>Foundation</strong> course`);
        } else {
          const specialtyCount = this.courseCodes.filter(c => isEventSpecialtyCourse(c)).length;
          if (specialtyCount === 0) {
            this.promoWarnings.push(`You have entered the <strong>${code}</strong> promo code, but you haven't selected any free <strong>Specialty</strong> courses`);
          } else if (specialtyCount === 1) {
            this.promoWarnings.push(`You have entered the <strong>${code}</strong> promo code, but you haven't selected a second free <strong>Specialty</strong> course`);
          }
        }
      }
    });

    // FREELUXURY promo code
    if (this.promoCodes.code === 'FREELUXURY') {
      if (!this.courseCodes.some(c => isEventFoundationCourse(c))) {
        this.promoWarnings.push('You have entered the <strong>FREELUXURY</strong> promo code, but you haven\'t selected a <strong>Foundation</strong> course');
      } else if (!this.courseCodes.includes('LW')) {
        this.promoWarnings.push('You have entered the <strong>FREELUXURY</strong> promo code, but you haven\'t selected the free <strong>Luxury Wedding Planning</strong> course');
      }
    }

    // PROLUMINOUS promo code
    if (this.promoCodes.code === 'PROLUMINOUS') {
      if (!this.courseCodes.includes('MZ')) {
        this.promoWarnings.push('You have entered the <strong>PROLUMINOUS</strong> promo code, but you haven\'t selected the <strong>Master Makeup Artistry</strong> course.');
        this.disclaimers.push('You\'ll get the Luminous Makeup Collection');
      } else {
        if (!this.courseCodes.includes('MW')) {
          this.promoWarnings.push('You have entered the <strong>PROLUMINOUS</strong> promo code, but you haven\'t selected your free <strong>Pro Makeup Workshop</strong>.');
        }
      }
    }

    // FREEGLOBAL promo code
    if (this.promoCodes.code === 'FREEGLOBAL') {
      if (!this.courseCodes.includes('MZ')) {
        this.promoWarnings.push('You have entered the <strong>FREEGLOBAL</strong> promo code, but you haven\'t selected the <strong>Master Makeup Artistry</strong> course.');
      } else {
        this.disclaimers.push('You\'ll get the Luminous Makeup Collection');
        if (!this.courseCodes.includes('GB')) {
          this.promoWarnings.push('You have entered the <strong>FREEGLOBAL</strong> promo code, but you haven\'t selected your free <strong>Global Beauty Workshop</strong>.');
        }
      }
    }

    // PORTFOLIO50 promo code
    if (this.promoCodes.code === 'PORTFOLIO' || this.promoCodes.code === 'PORTFOLIO50' || this.promoCodes.code === 'PORTFOLIO60') {
      if (this.courseCodes.length > 0) {
        this.disclaimers.push('You\'ll get the free leather portfolio');
        this.notes.push('portfolio');
      }
    }

    // FANDECK promo code
    if (this.promoCodes.code === 'FANDECK50') {
      if (this.courseCodes.length > 0) {
        this.disclaimers.push('You\'ll get the free color fan deck');
        this.notes.push('color fan deck');
      }
    }

    // BRUSHSET50 promo code
    if (this.promoCodes.code === 'BRUSHSET50') {
      if (this.courseCodes.length > 0) {
        this.disclaimers.push('You\'ll get the free bonus brush set');
        this.notes.push('brush set');
      }
    }

    if (this.options.school === 'QC Wellness Studies' && this.courseCodes.length >= 1) {
      if (this.options.discountAll) {
        // nothing
      } else {
        // this.disclaimers.push('You\'ll get the leather portfolio');
        // this.notes.push('leather portfolio');
      }
    }

    if (this.options.school === 'QC Pet Studies' && this.courseCodes.length >= 1) {
      if (this.options.discountAll) {
        // nothing
      } else {
        // this.disclaimers.push('You\'ll get the pack of 20 dog bows');
        // this.notes.push('dog bows');
      }
    }

    if (this.options.school === 'QC Makeup Academy' && this.courseCodes.length >= 1) {
      if (this.options.discountAll) {
        if (this.now >= new Date('2025-01-29T03:00-0500') && this.now < new Date('2025-02-01T03:00-0500')) {
          this.disclaimers.push('You\'ll get the free leather portfolio');
          this.notes.push('portfolio');
        }
      } else {
        if (this.now >= new Date('2025-01-29T03:00-0500') && this.now < new Date('2025-02-01T03:00-0500')) {
          this.disclaimers.push('You\'ll get the free bonus lashes');
          this.notes.push('lashes set');
        }
      }
    }

    if (this.options.school === 'QC Event School' && this.courseCodes.length >= 1) {
      if (this.options.discountAll) {
        if (this.now >= new Date('2025-01-29T03:00-0500') && this.now < new Date('2025-02-01T03:00-0500')) {
          this.disclaimers.push('You\'ll get the free leather portfolio');
          this.notes.push('portfolio');
        }
      } else {
        // nothing
      }
    }

    if (this.options.school === 'QC Design School' && this.courseCodes.length >= 1) {
      if (this.options.discountAll) {
        if (this.now >= new Date('2025-01-29T03:00') && this.now < new Date('2025-02-01T03:00')) {
          this.disclaimers.push('You\'ll get the free leather portfolio');
          this.notes.push('portfolio');
        }
      } else {
        // nothing
      }
    }

    if (this.promoCodes.code === 'DG150' || this.promoCodes.code === 'DG200' || this.promoCodes.code === 'DG300') {
      if (!this.courseCodes.includes('DG')) {
        this.promoWarnings.push('You have entered a discount promo code for <strong>Dog Grooming</strong>, but you haven\'t selected the course');
      }
    }

    if (this.promoCodes.code === 'DT150' || this.promoCodes.code === 'DT200' || this.promoCodes.code === 'DT300') {
      if (!this.courseCodes.includes('DT')) {
        this.promoWarnings.push('You have entered a discount promo code for <strong>Dog Training</strong>, but you haven\'t selected the course');
      }
    }

    [ 'MASTERCLASS', 'SSMASTERCLASS' ].forEach(code => {
      if (this.promoCodes.code === code) {
        if (!this.courseCodes.includes('I2')) {
          this.promoWarnings.push(`You have entered the <strong>${code}</strong> promo code, but you haven't selected the <strong>Interior Decorating</strong> course`);
        }
      }
    });

    if (this.promoCodes.code === 'LUXURYWEDDING') {
      if (!this.courseCodes.includes('EP')) {
        this.promoWarnings.push('You have entered the <strong>LUXURYWEDDING</strong> promo code, but you haven\'t selected the <strong>Event & Wedding Planning</strong> course');
      } else {
        if (!this.courseCodes.includes('LW')) {
          this.promoWarnings.push('You have entered the <strong>LUXURYWEDDING</strong> promo code, but you haven\'t selected your free <strong>Luxury Wedding & Event Planning</strong> course');
        }
        if (!this.courseCodes.includes('DW')) {
          this.promoWarnings.push('You have entered the <strong>LUXURYWEDDING</strong> promo code, but you haven\'t selected your free <strong>Desination Wedding Planning</strong> course');
        }
      }
    }

    if (this.promoCodes.code === 'KIT200OFF') {
      if (!this.courseCodes.includes('MZ')) {
        this.promoWarnings.push('You have entered the <strong>KIT200OFF</strong> promo code, but you haven\'t selected the <strong>Master Makeup Artistry</strong> course');
      }
    }

    if (this.promoCodes.code === 'WOOFGANG') {
      this.disclaimers.push('This promotion is only available to Woof Gang Bakery employees, managers and store owners.');
    }

    if (this.courseCodes.includes('FL') && !this.courseCodes.includes('AA')) {
      this.disclaimers.push('The Festivals &amp; Live Events Course requires corporate event training.');
    }

    if (this.courseCodes.includes('PE') && !this.courseCodes.includes('AA')) {
      this.disclaimers.push('The Promotional Event Planning Course requires corporate event training.');
    }

    if (this.options.withoutTools) {
      this.notes.push('No tools');
    }

    if (this.promoCodes.code === 'BOGOCATALYST' || this.promoCodes.code === 'BOGOCATALYST100') {
      this.disclaimers.push('You\'ll get the Career Catalyst Toolkit');
      this.notes.push('Career Catalyst Toolkit');
    }

    if (this.promoCodes.code === 'COLORWHEEL' || this.promoCodes.code === 'COLORWHEEL60') {
      this.disclaimers.push('You\'ll get a free color wheel');
      this.notes.push('color wheel');
    }

  };

  private noShippingMessage(): string | undefined {
    if (this.noShipping === 'REQUIRED') {
      const tel = telephoneNumber(this.countryCode);
      return 'Due to international shipping restrictions, <strong>we do not ship</strong> textbooks, kits, or bonus items to your country. ' +
        'The cost of your course' + (this.courseCodes.length > 1 ? 's have ' : ' has ') +
        'been reduced accordingly. You will have access to electronic course materials through the Online Student Center.' +
        (this.courseCodes.some(c => isDesignCourse(c)) ? ' You will need to source your own design tools to complete your assignments. Please refer to your welcome email for more information.' : '') +
        (this.courseCodes.some(c => isMakeupCourse(c)) ? ' You will have to source your own makeup and tools. Please refer to your course guide for the materials required for each assignment.' : '') +
        ` For more information please contact the School at <a style="color:inherit;white-space:nowrap;" href="tel:${tel}">${tel}.`;
    } else if (this.noShipping === 'APPLIED') {
      return 'You have selected to not receive physical textbooks, kits, or bonus items. ' +
        'The cost of your course' + (this.courseCodes.length > 1 ? 's have ' : ' has ') +
        'been reduced accordingly. You will have access to electronic course materials through the Online Student Center.' +
        (this.courseCodes.some(c => isDesignCourse(c)) ? ' You will need to source your own design tools to complete your assignments. Please refer to your welcome email for more information.' : '') +
        (this.courseCodes.some(c => isMakeupCourse(c)) ? ' You will have to source your own makeup and tools. Please refer to your course guide for the materials required for each assignment.' : '');
    }
  };
}
