import Big from 'big.js';

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
import type { CoursePrice, Plan, Price } from '../domain/price';
import type { PriceOptions } from '../domain/priceQuery';
import type { RawPrice } from '../domain/rawPrice';
import { clamp } from '../lib/clamp';
import { ClientError, ServerError } from '../lib/errors';
import { freeMap } from '../lib/freeMap';
import { noShipCountry, telephoneNumber } from '../lib/helper-functions';
import { isDesignCourse, isEventFoundationCourse, isEventSpecialtyCourse, isMakeupCourse } from '@/courses';

export class PriceCalculation {
  private static readonly allAccessFreeCourses: Record<string, string[]> = {
    AA: [ 'EP', 'CP', 'ED', 'DW', 'LW', 'PE', 'FL', 'EB', 'VE' ],
    AM: [ 'MZ', 'MA', 'SK', 'SF', 'MW', 'HS', 'AB', 'PW', 'PF' ],
  };

  private readonly courseCodes: string[];

  private courseResults: CoursePrice[] = [];

  private currencyCode: CurrencyCode = 'USD';

  private readonly noShipping: NoShipping;

  private readonly now: Date;

  private readonly promoCodes: PromoCodes;

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

  public static calculatePlans(plans: { full: Plan; part?: Plan | undefined }, discountedCost: number, removePlanDiscounts?: boolean): [Plan, Plan | undefined] {

    const fullDiscount = removePlanDiscounts ? 0 : Math.min(discountedCost, plans.full.discount); // can't be larger than the minimum price

    const fullTotal = parseFloat(Big(discountedCost).minus(fullDiscount).toFixed(2));

    const result: [Plan, Plan | undefined] = [
      {
        discount: fullDiscount,
        deposit: fullTotal,
        installmentSize: 0,
        installments: 0,
        remainder: 0,
        total: fullTotal,
        originalDeposit: fullTotal,
        originalInstallments: 0,
      },
      undefined,
    ];

    if (plans.part) {
      const partDiscount = removePlanDiscounts ? 0 : Math.min(discountedCost, plans.part.discount); // can't be larger than the minimum price
      const partTotal = parseFloat(Big(discountedCost).minus(partDiscount).toFixed(2));
      const partDeposit = Math.min(partTotal, plans.part.deposit); // can't be larger than the total price
      const partInstallmentSize = parseFloat(Big(partTotal).minus(partDeposit).div(plans.part.installments).round(2, 0).toFixed(2)); // always round down
      const partRemainder = parseFloat(Big(partTotal).minus(partDeposit).minus(Big(partInstallmentSize).times(plans.part.installments)).toFixed(2));

      result[1] = {
        discount: partDiscount,
        deposit: partDeposit,
        installmentSize: partInstallmentSize,
        installments: plans.part.installments,
        remainder: partRemainder,
        total: partTotal,
        originalDeposit: partDeposit,
        originalInstallments: plans.part.originalInstallments,
      };
    }

    return result;
  };

  public async calculate(): Promise<Price> {
    const rawPrices = await Promise.all(this.courseCodes.map(async c => lookupPrice(c, this.countryCode, this.provinceCode)));

    this.currencyCode = this.getCurrencyCode(rawPrices);
    this.somePartsMissing = rawPrices.some(p => p.installments === 0);

    this.courseResults = rawPrices.map(r => this.createCoursePrice(r));
    console.log(this.courseResults);

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
    applyPromoCodeDiscounts(this.courseResults, this.promoCodes, this.currencyCode);
    this.applyToolsDiscounts();
    this.applyOverrides();

    this.courseResults.sort(courseSort);

    const [ notes, disclaimers, promoWarnings ] = this.notesAndDisclaimers();

    return this.collateResults(await lookupCurrency(this.currencyCode), notes, disclaimers, promoWarnings);
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

  private collateResults(currency: Currency, notes: string[], disclaimers: string[], promoWarnings: string[]): Price {
    let partPlanAvailable = true;
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
      partPlanAvailable &&= typeof courseResult.plans.part !== 'undefined';
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
      partDiscount = partDiscount.plus(courseResult.plans.part?.discount ?? 0);
      partDeposit = partDeposit.plus(courseResult.plans.part?.deposit ?? 0);
      partInstallmentSize = partInstallmentSize.plus(courseResult.plans.part?.installmentSize ?? 0);
      partRemainder = partRemainder.plus(courseResult.plans.part?.remainder ?? 0);
      partTotal = partTotal.plus(courseResult.plans.part?.total ?? 0);
      partOriginalDeposit = partOriginalDeposit.plus(courseResult.plans.part?.originalDeposit ?? 0);
      shipping = shipping.plus(courseResult.shipping);
    }

    return {
      countryCode: this.countryCode,
      provinceCode: this.provinceCode,
      currency,
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
            installments: this.courseResults[0]?.plans.part?.installments ?? 1,
            remainder: partRemainder.toNumber(),
            total: partTotal.toNumber(),
            originalDeposit: partOriginalDeposit.toNumber(),
            originalInstallments: this.courseResults[0]?.plans.part?.originalInstallments ?? 1,
          }
          : undefined,
      },
      shipping: shipping.toNumber(),
      disclaimers,
      notes,
      promoWarnings,
      noShipping: this.noShipping,
      noShippingMessage: this.noShippingMessage(),
      promoCodeRecognized: this.promoCodes.recognized,
      promoCode: this.promoCodes.recognized ? this.options.promoCode : undefined,
      courses: this.courseResults,
    };
  }

  /** Sets courses that should always be free */
  private applyDefaultFreeCourses(): void {
    for (let index = 0; index < this.courseResults.length; index++) {
      const courseResult = this.courseResults[index];
      if (!courseResult) {
        throw new ServerError('courseResult not defined');
      }

      // FA is free if taking DG
      if (this.options.discountAll !== true && courseResult.code === 'FA' && this.courseResults.some(c => c.code === 'DG')) {
        this.courseResults[index] = freeMap(courseResult);
        continue;
      }

      // VD and DB are free if taking I2
      if ((courseResult.code === 'VD' || courseResult.code === 'DB') && this.courseResults.some(c => c.code === 'I2')) {
        this.courseResults[index] = freeMap(courseResult);
      }
    }

    // apply free all-access program courses
    for (const [ paidCourse, freeCourses ] of Object.entries(PriceCalculation.allAccessFreeCourses)) {
      if (this.courseResults.some(c => c.code === paidCourse && !c.free)) {
        for (let index = 0; index < this.courseResults.length; index++) {
          const courseResult = this.courseResults[index];
          if (!courseResult) {
            throw new ServerError('courseResult not defined');
          }

          if (freeCourses.includes(courseResult.code)) {
            this.courseResults[index] = freeMap(courseResult);
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

      if (!courseResult.plans.part) {
        throw new ServerError('Part plan missing');
      }

      courseResult.plans.part.originalInstallments = this.courseResults[0]?.plans.part?.installments ?? 1;
      courseResult.plans.part.installments = courseResult.plans.part.originalInstallments;
      courseResult.plans.part.installmentSize = parseFloat(Big(courseResult.discountedCost).minus(courseResult.plans.part.deposit).div(courseResult.plans.part.installments).round(2, 0).toFixed(2));
      courseResult.plans.part.remainder = parseFloat(Big(courseResult.discountedCost).minus(courseResult.plans.part.deposit).minus(Big(courseResult.plans.part.installmentSize).times(courseResult.plans.part.installments)).toFixed(2));
    }
  }

  private applyShippingDiscounts(): void {
    for (const [ index, courseResult ] of this.courseResults.entries()) {
      if (courseResult.free) {
        continue;
      }

      if (this.noShipping === 'FORBIDDEN' || this.noShipping === 'ALLOWED') {
        continue;
      }

      const shippingDiscount = courseResult.shipping;
      const discountedCost = parseFloat(Big(courseResult.cost).minus(shippingDiscount).minus(courseResult.multiCourseDiscount).minus(courseResult.promoDiscount).toFixed(2));
      const [ full, part ] = PriceCalculation.calculatePlans(courseResult.plans, discountedCost);

      this.courseResults[index] = {
        ...courseResult,
        shippingDiscount,
        discountedCost,
        plans: { full, part },
      };
    }
  }

  private applyMultiCourseDiscounts(): void {
    const promoCode = this.promoCodes.code;

    for (const [ index, courseResult ] of this.courseResults.entries()) {
      if (courseResult.free) {
        continue;
      }

      if (!this.shouldGetMultiCourseDiscount(index)) {
        continue;
      }

      const minimumPrice = parseFloat(Big(courseResult.cost).minus(courseResult.shipping).minus(courseResult.multiCourseDiscount).minus(courseResult.promoDiscount).toFixed(2));
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

      const multiCourseDiscount = Math.min(minimumPrice, desiredMultiCourseDiscount);
      const multiCourseDiscountRate = parseFloat(Big(multiCourseDiscount).div(courseResult.cost).toFixed(2));
      const discountedCost = parseFloat(Big(courseResult.cost).minus(courseResult.shippingDiscount).minus(multiCourseDiscount).minus(courseResult.promoDiscount).toFixed(2));
      const [ full, part ] = PriceCalculation.calculatePlans(courseResult.plans, discountedCost, true);

      this.courseResults[index] = {
        ...courseResult,
        multiCourseDiscountRate,
        multiCourseDiscount,
        discountedCost,
        discountMessage: multiCourseDiscount === desiredMultiCourseDiscount ? null : `${Math.round(multiCourseDiscount / courseResult.cost * 100)}% Discount`,
        plans: { full, part },
      };
    }
  }

  private applyStudentDiscounts(): void {
    if (this.options.studentDiscount !== true) {
      return;
    }

    for (const [ index, courseResult ] of this.courseResults.entries()) {
      if (courseResult.free) {
        continue;
      }

      const minimumPrice = parseFloat(Big(courseResult.cost).minus(courseResult.shipping).minus(courseResult.multiCourseDiscount).minus(courseResult.promoDiscount).toFixed(2));
      const discount = Math.min(minimumPrice, studentDiscountAmount(this.currencyCode));
      const promoDiscount = parseFloat(Big(courseResult.promoDiscount).plus(discount).toFixed(2));
      const discountedCost = parseFloat(Big(courseResult.cost).minus(courseResult.shippingDiscount).minus(courseResult.multiCourseDiscount).minus(promoDiscount).toFixed(2));
      const [ full, part ] = PriceCalculation.calculatePlans(courseResult.plans, discountedCost);

      this.courseResults[index] = {
        ...courseResult,
        promoDiscount,
        discountedCost,
        plans: { full, part },
      };
    }
  }

  private applyExtraDiscounts(): void {
    if (!validateDiscounts(this.options)) {
      throw new ClientError('invalid discount signature');
    }

    let remainingExtraDiscount = Big(this.options.discount ? this.options.discount[this.currencyCode] ?? this.options.discount.default : 0);

    for (const [ index, courseResult ] of this.courseResults.entries()) {
      if (courseResult.free || remainingExtraDiscount.lte(0)) {
        continue;
      }

      const minimumPrice = parseFloat(Big(courseResult.cost).minus(courseResult.shipping).minus(courseResult.multiCourseDiscount).minus(courseResult.promoDiscount).toFixed(2));
      const discount = Math.min(minimumPrice, parseFloat(remainingExtraDiscount.toFixed(2)));
      remainingExtraDiscount = remainingExtraDiscount.minus(discount);

      const promoDiscount = parseFloat(Big(courseResult.promoDiscount).plus(discount).toFixed(2));
      const discountedCost = parseFloat(Big(courseResult.cost).minus(courseResult.shippingDiscount).minus(courseResult.multiCourseDiscount).minus(promoDiscount).toFixed(2));
      const [ full, part ] = PriceCalculation.calculatePlans(courseResult.plans, discountedCost);

      this.courseResults[index] = {
        ...courseResult,
        promoDiscount,
        discountedCost,
        plans: { full, part },
      };
    }
  }

  private applyToolsDiscounts(): void {
    if (this.options.withoutTools !== true) {
      return;
    }

    const dgDiscountAmount = this.currencyCode === 'GBP' ? 150 : 200;

    for (const [ index, courseResult ] of this.courseResults.entries()) {
      if (courseResult.free || courseResult.code !== 'DG') {
        continue;
      }

      const minimumPrice = parseFloat(Big(courseResult.cost).minus(courseResult.shipping).minus(courseResult.multiCourseDiscount).minus(courseResult.promoDiscount).toFixed(2));
      const discount = Math.min(minimumPrice, dgDiscountAmount);
      const promoDiscount = parseFloat(Big(courseResult.promoDiscount).plus(discount).toFixed(2));
      const discountedCost = parseFloat(Big(courseResult.cost).minus(courseResult.shippingDiscount).minus(courseResult.multiCourseDiscount).minus(promoDiscount).toFixed(2));
      const [ full, part ] = PriceCalculation.calculatePlans(courseResult.plans, discountedCost);

      this.courseResults[index] = {
        ...courseResult,
        promoDiscount,
        discountedCost,
        plans: { full, part },
      };
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

    for (const [ index, courseResult ] of this.courseResults.entries()) {
      if (!depositOverrides?.[courseResult.code] || !installmentsOverride) {
        continue;
      }

      if (typeof courseResult.plans.part === 'undefined') {
        throw new ServerError('Part plan undefined');
      }

      const deposit = depositOverrides[courseResult.code] ?? 0;
      const installments = Math.round(installmentsOverride);
      const installmentSize = parseFloat(Big(courseResult.discountedCost).minus(courseResult.plans.part.discount).minus(deposit).div(installments).round(2, 0).toFixed(2));
      const remainder = parseFloat(Big(courseResult.discountedCost).minus(courseResult.plans.part.discount).minus(deposit).minus(Big(installmentSize).times(installments)).toFixed(2));

      this.courseResults[index] = {
        ...courseResult,
        plans: {
          ...courseResult.plans,
          part: {
            ...courseResult.plans.part,
            deposit,
            installments,
            installmentSize,
            remainder,
          },
        },
      };
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

  private createCoursePrice(p: RawPrice): CoursePrice {
    const cost = parseFloat(Math.max(0, p.cost).toFixed(2)); // the cost can't be negative
    const shipping = clamp(parseFloat(p.shipping.toFixed(2)), 0, cost); // potential shipping savings can't be negative and can't be greater than cost
    const minimumPrice = parseFloat(Big(cost).minus(shipping).toFixed(2));
    const multiCourseDiscountRate = clamp(parseFloat(p.multiCourseDiscountRate.toFixed(2)), 0, 1); // two decimal places, must be between 0 and 1, inclusive
    const fullDiscount = clamp(parseFloat(p.discount.toFixed(2)), 0, minimumPrice); // the discount can't be greater than the minimum price and can't be negative
    const fullTotal = parseFloat(Big(cost).minus(fullDiscount).toFixed(2));
    const partDiscount = clamp(parseFloat(p.partDiscount.toFixed(2)), 0, minimumPrice);
    const partTotal = parseFloat(Big(cost).minus(partDiscount).toFixed(2));
    const partDeposit = clamp(parseFloat(p.deposit.toFixed(2)), 0, partTotal); // the deposit can't be greater than the cost and can't be negative
    const partInstallments = p.installments ? Math.round(this.options.discountAll ? p.installments / 2 : p.installments) : 1; // the number of installments must be at least 1 and must be a whole number
    const partInstallmentSize = p.installments ? parseFloat(Big(partTotal).minus(partDeposit).div(partInstallments).round(2, 0).toFixed(2)) : 0; // always round down so that the actual price will never be more than the quoted price
    const partRemainder = p.installments ? parseFloat(Big(partTotal).minus(partDeposit).minus(Big(partInstallmentSize).times(partInstallments)).toFixed(2)) : 0;

    const full = { discount: fullDiscount, deposit: fullTotal, installmentSize: 0, installments: 0, remainder: 0, total: fullTotal, originalDeposit: fullTotal, originalInstallments: 0 };

    const part = partInstallments
      ? { discount: partDiscount, deposit: partDeposit, installmentSize: partInstallmentSize, installments: partInstallments, remainder: partRemainder, total: partTotal, originalDeposit: partDeposit, originalInstallments: partInstallments }
      : undefined;

    return {
      code: p.courseCode,
      name: p.courseName,
      primary: false,
      cost,
      multiCourseDiscountRate,
      multiCourseDiscount: 0,
      promoDiscount: 0,
      shippingDiscount: 0,
      discountedCost: cost,
      order: p.order,
      plans: { full, part },
      shipping,
      free: false,
      discountMessage: null,
    };
  }

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
   * Returns a tuple of string arrays [ notes, disclaimers, promoWarnings ]
   *
   * Note: These strings may be inserted as raw HTML by the front end application
   * Do not include any unescaped user input in them (preferably do not include
   * any user input at all). Also ensure that they are valid HTML with proper
   * closing tags.
   * @param courses the courses
   * @param countryCode the country code
   */
  private notesAndDisclaimers(): [string[], string[], string[]] {
    const notes: string[] = [];
    const disclaimers: string[] = [];
    const promoWarnings: string[] = [];

    const applies = (code: string): boolean => this.promoCodes.code === code;

    // studentDiscount option
    if (this.options.studentDiscount) {
      notes.push('additional discount');
    }

    // ELITE promo code
    if (applies('ELITE')) {
      if (this.noShipping === 'APPLIED') {
        promoWarnings.push('You entered the <strong>ELITE</strong> promo code, but have chosen to not have any materials shipped. You will not receive any makeup kits.');
      } else if (this.noShipping === 'REQUIRED') {
        promoWarnings.push('You entered the <strong>ELITE</strong> promo code, but we do not ship to your country. You will not receive any makeup kits.');
      } else { // 'ALLOWED', 'FORBIDDEN'
        if (!this.courseCodes.includes('MZ')) {
          promoWarnings.push('You have entered the <strong>ELITE</strong> promo code but have not selected the <strong>Master Makeup Artistry</strong> course.');
        }
      }
    }

    // FREEPRO promo code
    if (applies('FREEPRO')) {
      if (!this.courseCodes.includes('MZ') && !this.courseCodes.includes('MW')) {
        promoWarnings.push('You have entered the <strong>FREEPRO</strong> promo code but have not selected the <strong>Master Makeup Artistry</strong> and <strong>Pro Makeup Workshop</strong> courses.');
      } else if (!this.courseCodes.includes('MZ')) {
        promoWarnings.push('You have entered the <strong>FREEPRO</strong> promo code but have not selected the <strong>Master Makeup Artistry</strong> course.');
      } else if (!this.courseCodes.includes('MW')) {
        promoWarnings.push('You have entered the <strong>FREEPRO</strong> promo code but have not selected the <strong>Pro Makeup Workshop</strong> course.');
      }
    }

    // SAVE50 promo code
    if (applies('SAVE50')) {
      if (this.courseCodes.length < 2) {
        promoWarnings.push('You have entered the <strong>SAVE50</strong> promo code but have not selected more than one course. Select additional courses above to take advantage of this promotion.');
      }
    }

    // EXPERT promo code
    if (applies('EXPERT')) {
      if (!this.courseCodes.some(c => isEventFoundationCourse(c))) {
        promoWarnings.push('You have entered the <strong>EXPERT</strong> promo code but have not selected a Foundation course.');
      } else if (!this.courseCodes.some(c => isEventSpecialtyCourse(c))) {
        promoWarnings.push('You have entered the <strong>EXPERT</strong> promo code but have not selected a Specialty course.');
      }
    }

    // QCLASHES promo code
    if (applies('QCLASHES') || applies('QCLASHES60')) {
      if (this.courseCodes.some(c => [ 'MZ', 'SK', 'AB', 'SF', 'HS', 'GB' ].includes(c))) {
        disclaimers.push('You\'ll receive bonus lashes in your makeup kit');
        notes.push('bonus lashes');
      } else {
        promoWarnings.push(`Unfortunately the <strong>QCLASHES</strong> code is not valid with the course${this.courseCodes.length === 1 ? '' : 's'} you have selected.`);
        promoWarnings.push('Please chose at least one course from Master Makeup Artistry, Skincare, Airbrush Makeup Workshop, Special FX Makeup, Hair Styling Essentials, or Global Beauty.');
      }
    }

    // BOGO promo code
    if (applies('BOGO')) {
      if (this.courseCodes.length === 0) {
        promoWarnings.push('You have entered the <strong>BOGO</strong> promo code, but you haven\'t selected any courses.');
      } else if (this.courseCodes.length < 2) {
        promoWarnings.push('You have entered the <strong>BOGO</strong> promo code, but you haven\'t selected a free second course.');
      }
    }

    // SKINCARE
    if (applies('SKINCARE')) {
      if (!this.courseCodes.includes('MZ')) {
        promoWarnings.push('You have entered the <strong>SKINCARE</strong> promo code, but you haven\'t selected the <strong>Master Makeup Artistry</strong> course');
      } else {
        if (!this.courseCodes.includes('SK')) {
          promoWarnings.push('You have entered the <strong>SKINCARE</strong> promo code, but you haven\'t selected the <strong>Skincare</strong> course');
        }
      }
    }

    // EVENTFREECOURSE promo code
    if (applies('EVENTFREECOURSE')) {
      if (!this.courseCodes.some(c => isEventFoundationCourse(c))) {
        promoWarnings.push('You have entered the <strong>EVENTFREECOURSE</strong> promo code, but you haven\'t selected a <strong>foundation</strong> course');
      } else {
        if (this.courseCodes.length < 2) {
          promoWarnings.push('You have entered the <strong>EVENTFREECOURSE</strong> promo code, but you haven\'t selected a free course');
        }
      }
    }

    // SPECIALTY promo code
    if (applies('SPECIALTY')) {
      if (!this.courseCodes.some(c => isEventFoundationCourse(c))) {
        promoWarnings.push('You have entered the <strong>SPECIALTY</strong> promo code, but you haven\'t selected a <strong>Foundation</strong> course');
      } else {
        const specialtyCount = this.courseCodes.filter(c => isEventSpecialtyCourse(c)).length;
        if (specialtyCount === 0) {
          promoWarnings.push('You have entered the <strong>SPECIALTY</strong> promo code, but you haven\'t selected any free <strong>Specialty</strong> courses');
        }
      }
    }

    // 2SPECIALTY and MCSPECIALTY promo codes
    [ '2SPECIALTY', 'MCSPECIALTY', 'SSMCSPECIALTY', '2SPECIALTY100' ].forEach(code => {
      if (applies(code)) {
        if (!this.courseCodes.some(c => isEventFoundationCourse(c))) {
          promoWarnings.push(`You have entered the <strong>${code}</strong> promo code, but you haven't selected a <strong>Foundation</strong> course`);
        } else {
          const specialtyCount = this.courseCodes.filter(c => isEventSpecialtyCourse(c)).length;
          if (specialtyCount === 0) {
            promoWarnings.push(`You have entered the <strong>${code}</strong> promo code, but you haven't selected any free <strong>Specialty</strong> courses`);
          } else if (specialtyCount === 1) {
            promoWarnings.push(`You have entered the <strong>${code}</strong> promo code, but you haven't selected a second free <strong>Specialty</strong> course`);
          }
        }
      }
    });

    // FREELUXURY promo code
    if (applies('FREELUXURY')) {
      if (!this.courseCodes.some(c => isEventFoundationCourse(c))) {
        promoWarnings.push('You have entered the <strong>FREELUXURY</strong> promo code, but you haven\'t selected a <strong>Foundation</strong> course');
      } else if (!this.courseCodes.includes('LW')) {
        promoWarnings.push('You have entered the <strong>FREELUXURY</strong> promo code, but you haven\'t selected the free <strong>Luxury Wedding Planning</strong> course');
      }
    }

    // PROLUMINOUS promo code
    if (applies('PROLUMINOUS')) {
      if (!this.courseCodes.includes('MZ')) {
        promoWarnings.push('You have entered the <strong>PROLUMINOUS</strong> promo code, but you haven\'t selected the <strong>Master Makeup Artistry</strong> course.');
        disclaimers.push('You\'ll get the Luminous Makeup Collection');
      } else {
        if (!this.courseCodes.includes('MW')) {
          promoWarnings.push('You have entered the <strong>PROLUMINOUS</strong> promo code, but you haven\'t selected your free <strong>Pro Makeup Workshop</strong>.');
        }
      }
    }

    // FREEGLOBAL promo code
    if (applies('FREEGLOBAL')) {
      if (!this.courseCodes.includes('MZ')) {
        promoWarnings.push('You have entered the <strong>FREEGLOBAL</strong> promo code, but you haven\'t selected the <strong>Master Makeup Artistry</strong> course.');
      } else {
        disclaimers.push('You\'ll get the Luminous Makeup Collection');
        if (!this.courseCodes.includes('GB')) {
          promoWarnings.push('You have entered the <strong>FREEGLOBAL</strong> promo code, but you haven\'t selected your free <strong>Global Beauty Workshop</strong>.');
        }
      }
    }

    // PORTFOLIO50 promo code
    if (applies('PORTFOLIO') || applies('PORTFOLIO50') || applies('PORTFOLIO60')) {
      if (this.courseCodes.length > 0) {
        disclaimers.push('You\'ll get the free leather portfolio');
        notes.push('portfolio');
      }
    }

    // FANDECK promo code
    if (applies('FANDECK50')) {
      if (this.courseCodes.length > 0) {
        disclaimers.push('You\'ll get the free color fan deck');
        notes.push('color fan deck');
      }
    }

    // BRUSHSET50 promo code
    if (applies('BRUSHSET50')) {
      if (this.courseCodes.length > 0) {
        disclaimers.push('You\'ll get the free bonus brush set');
        notes.push('brush set');
      }
    }

    if (this.options.school === 'QC Wellness Studies' && this.courseCodes.length >= 1) {
      if (this.options.discountAll) {
        // nothing
      } else {
        // disclaimers.push('You\'ll get the leather portfolio');
        // notes.push('leather portfolio');
      }
    }

    if (this.options.school === 'QC Pet Studies' && this.courseCodes.length >= 1) {
      if (this.options.discountAll) {
        // nothing
      } else {
        // disclaimers.push('You\'ll get the pack of 20 dog bows');
        // notes.push('dog bows');
      }
    }

    if (this.options.school === 'QC Makeup Academy' && this.courseCodes.length >= 1) {
      if (this.options.discountAll) {
        if (this.now >= new Date('2025-01-29T03:00-0500') && this.now < new Date('2025-02-01T03:00-0500')) {
          disclaimers.push('You\'ll get the free leather portfolio');
          notes.push('portfolio');
        }
      } else {
        if (this.now >= new Date('2025-01-29T03:00-0500') && this.now < new Date('2025-02-01T03:00-0500')) {
          disclaimers.push('You\'ll get the free bonus lashes');
          notes.push('lashes set');
        }
      }
    }

    if (this.options.school === 'QC Event School' && this.courseCodes.length >= 1) {
      if (this.options.discountAll) {
        if (this.now >= new Date('2025-01-29T03:00-0500') && this.now < new Date('2025-02-01T03:00-0500')) {
          disclaimers.push('You\'ll get the free leather portfolio');
          notes.push('portfolio');
        }
      } else {
        // nothing
      }
    }

    if (this.options.school === 'QC Design School' && this.courseCodes.length >= 1) {
      if (this.options.discountAll) {
        if (this.now >= new Date('2025-01-29T03:00') && this.now < new Date('2025-02-01T03:00')) {
          disclaimers.push('You\'ll get the free leather portfolio');
          notes.push('portfolio');
        }
      } else {
        // nothing
      }
    }

    if (applies('DG150') || applies('DG200') || applies('DG300')) {
      if (!this.courseCodes.includes('DG')) {
        promoWarnings.push('You have entered a discount promo code for <strong>Dog Grooming</strong>, but you haven\'t selected the course');
      }
    }

    if (applies('DT150') || applies('DT200') || applies('DT300')) {
      if (!this.courseCodes.includes('DT')) {
        promoWarnings.push('You have entered a discount promo code for <strong>Dog Training</strong>, but you haven\'t selected the course');
      }
    }

    [ 'MASTERCLASS', 'SSMASTERCLASS' ].forEach(code => {
      if (applies(code)) {
        if (!this.courseCodes.includes('I2')) {
          promoWarnings.push(`You have entered the <strong>${code}</strong> promo code, but you haven't selected the <strong>Interior Decorating</strong> course`);
        }
      }
    });

    if (applies('LUXURYWEDDING')) {
      if (!this.courseCodes.includes('EP')) {
        promoWarnings.push('You have entered the <strong>LUXURYWEDDING</strong> promo code, but you haven\'t selected the <strong>Event & Wedding Planning</strong> course');
      } else {
        if (!this.courseCodes.includes('LW')) {
          promoWarnings.push('You have entered the <strong>LUXURYWEDDING</strong> promo code, but you haven\'t selected your free <strong>Luxury Wedding & Event Planning</strong> course');
        }
        if (!this.courseCodes.includes('DW')) {
          promoWarnings.push('You have entered the <strong>LUXURYWEDDING</strong> promo code, but you haven\'t selected your free <strong>Desination Wedding Planning</strong> course');
        }
      }
    }

    if (applies('KIT200OFF')) {
      if (!this.courseCodes.includes('MZ')) {
        promoWarnings.push('You have entered the <strong>KIT200OFF</strong> promo code, but you haven\'t selected the <strong>Master Makeup Artistry</strong> course');
      }
    }

    if (applies('WOOFGANG')) {
      disclaimers.push('This promotion is only available to Woof Gang Bakery employees, managers and store owners.');
    }

    if (this.courseCodes.includes('FL') && !this.courseCodes.includes('AA')) {
      disclaimers.push('The Festivals &amp; Live Events Course requires corporate event training.');
    }

    if (this.courseCodes.includes('PE') && !this.courseCodes.includes('AA')) {
      disclaimers.push('The Promotional Event Planning Course requires corporate event training.');
    }

    if (this.options.withoutTools) {
      notes.push('No tools');
    }

    if (applies('BOGOCATALYST') || applies('BOGOCATALYST100')) {
      disclaimers.push('You\'ll get the Career Catalyst Toolkit');
      notes.push('Career Catalyst Toolkit');
    }

    if (applies('COLORWHEEL') || applies('COLORWHEEL60')) {
      disclaimers.push('You\'ll get a free color wheel');
      notes.push('color wheel');
    }

    return [ notes, disclaimers, promoWarnings ];
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
