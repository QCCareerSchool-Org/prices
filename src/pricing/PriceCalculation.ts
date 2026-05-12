import Big from 'big.js';

import { createCoursePrices } from './createCoursePrices';
import { applyPromoCodeDiscounts } from './promoCodeDiscounts';
import { applyPromoCodeFreeCourses } from './promoCodeFreeCourses';
import { shouldGetMultiCourseDiscount } from './shouldGetMultiCourseDiscount';
import { courseSort, getDefaultCourseSort } from './sortCourses';
import { studentDiscountAmount } from './studentDiscountAmount';
import { validateDiscounts } from './validateDiscounts';
import { calculatePlans } from '../calculatePlans';
import { collateResults } from '../collateResults';
import { lookupCurrency } from '../data/lookupCurrency';
import { lookupPrice } from '../data/lookupPrice';
import { defaultCurrencyCode } from '../defaultCurrencyCode';
import type { CurrencyCode } from '../domain/currencyCode';
import type { NoShipping } from '../domain/noShipping';
import type { CoursePrice, Price } from '../domain/price';
import type { PriceOptions } from '../domain/priceQuery';
import type { RawPrice } from '../domain/rawPrice';
import { freeMap } from '../lib/freeMap';
import { noShipCountry } from '../lib/helper-functions';
import * as HttpStatus from '../lib/http-status';
import { noShippingMessage } from '../noShippingMessage';
import { notesAndDisclaimers } from '../notesAndDisclaimers';
import type { PromoCodeSpec } from '../promoCodes';
import { promoCodeRecognized, promoCodeSpecs, specApplies } from '../promoCodes';

const byCostAscending = (a: CoursePrice, b: CoursePrice): number => (
  a.cost === b.cost ? b.order - a.order : a.cost - b.cost
);

const byFreeThenCostDescending = (a: CoursePrice, b: CoursePrice): number => (
  a.free === b.free
    ? (a.cost === b.cost ? a.order - b.order : b.cost - a.cost)
    : a.free ? 1 : -1
);

export class PriceCalculation {
  private courseResults: CoursePrice[] = [];

  private currencyCode: CurrencyCode;

  private readonly noShipping: NoShipping;

  private readonly now: Date;

  private somePartsMissing = false;

  public constructor(
    private readonly requestedCourses: string[],
    private readonly countryCode: string,
    private readonly provinceCode: string | undefined,
    private readonly options: PriceOptions | undefined,
  ) {
    this.noShipping = noShipCountry(countryCode) ? 'REQUIRED' : options?.noShipping ? 'APPLIED' : 'ALLOWED' as NoShipping;
    this.now = process.env.NODE_ENV !== 'production'
      ? options?.dateOverride ?? new Date()
      : new Date();
    this.currencyCode = defaultCurrencyCode(countryCode);
  }

  public async calculate(): Promise<Price> {
    const rawPrices = await this.lookupRawPrices();
    this.currencyCode = this.getCurrencyCode(rawPrices);
    this.somePartsMissing = rawPrices.some(p => p.installments === 0);
    this.courseResults = createCoursePrices(rawPrices, this.options?.discountAll);

    this.applyPricingRules();

    const [ notes, disclaimers, promoWarnings ] = notesAndDisclaimers(this.now, this.requestedCourses, this.countryCode, this.noShipping, this.options);

    const recognized = promoCodeRecognized(this.now, this.options);

    return collateResults(
      this.countryCode,
      this.provinceCode ?? null,
      await lookupCurrency(this.currencyCode),
      this.courseResults,
      disclaimers,
      notes,
      promoWarnings,
      this.noShipping,
      noShippingMessage(this.noShipping, this.requestedCourses, this.countryCode),
      recognized,
      recognized ? this.options?.promoCode : undefined,
    );
  }

  private async lookupRawPrices(): Promise<RawPrice[]> {
    return Promise.all(
      this.requestedCourses
        .filter((item, pos, self) => self.indexOf(item) === pos) // strip out any duplicate courses
        .map(async course => lookupPrice(course.toUpperCase(), this.countryCode, this.provinceCode)), // convert to priceRow promises
    );
  }

  private getCurrencyCode(rawPrices: RawPrice[]): CurrencyCode {
    // determine the currency we'll be using
    // if we have one or more price rows, pick the currency of the first price row (it doesn't matter which we pick); otherwise choose a currency based on the country
    const currencyCode = rawPrices[0]?.currencyCode ?? defaultCurrencyCode(this.countryCode);

    // only accept certain currencies
    if (currencyCode !== 'CAD' && currencyCode !== 'USD' && currencyCode !== 'GBP' && currencyCode !== 'AUD' && currencyCode !== 'NZD') {
      throw Error(`Invalid currency code: ${currencyCode}`);
    }

    // make sure each price row uses the same currency
    if (rawPrices.some(p => p.currencyCode !== currencyCode)) {
      throw new HttpStatus.InternalServerError(`Currency mismatch: ${this.requestedCourses.toString()} ${this.countryCode} ${this.provinceCode}`);
    }

    return currencyCode;
  }

  private applyPricingRules(): void {
    this.courseResults.sort(byCostAscending);

    this.applyDefaultFreeCourses();
    this.courseResults.sort(getDefaultCourseSort(this.now, this.options));

    this.applyPromoCodeFreeCourses();
    this.courseResults.sort(byFreeThenCostDescending);

    this.markPrimaryCourses();
    this.applyShippingDiscounts();
    this.applyMultiCourseDiscounts();
    this.applyStudentDiscounts();
    this.applyExtraDiscounts();
    this.applyPromoCodeDiscounts();
    this.applyToolsDiscounts();
    this.applyOverrides();
    this.courseResults.sort(courseSort);
  }

  private applyDefaultFreeCourses(): void {
    for (const [ index, courseResult ] of this.courseResults.entries()) {
      if (
        this.options?.school === 'QC Design School' &&
        this.options.discountAll === true &&
        this.now.getTime() < Date.UTC(2023, 2, 18, 4) &&
        courseResult.code === 'VD' &&
        this.courseResults.length > 1
      ) {
        this.courseResults[index] = freeMap(courseResult);
        continue;
      }

      if (
        this.options?.school === 'QC Event School' &&
        this.options.discountAll === true &&
        this.now.getTime() < Date.UTC(2023, 2, 18, 4) &&
        courseResult.code === 'VE' &&
        this.courseResults.length > 1
      ) {
        this.courseResults[index] = freeMap(courseResult);
        continue;
      }

      if (
        this.options?.school === 'QC Event School' &&
        this.options.discountAll !== true &&
        this.now.getTime() < Date.UTC(2021, 5, 9, 13) &&
        (courseResult.code === 'LW' || courseResult.code === 'DW') &&
        this.courseResults.some(c => c.code === 'EP')
      ) {
        this.courseResults[index] = freeMap(courseResult);
        continue;
      }

      if (
        this.options?.school === 'QC Pet Studies' &&
        this.options.discountAll !== true &&
        courseResult.code === 'FA' &&
        this.courseResults.some(c => c.code === 'DG')
      ) {
        this.courseResults[index] = freeMap(courseResult);
        continue;
      }

      if (
        this.options?.school === 'QC Makeup Academy' &&
        this.options.discountAll === true &&
        this.now.getTime() < Date.UTC(2023, 2, 18, 4) &&
        courseResult.code === 'VM' &&
        this.courseResults.length > 1
      ) {
        this.courseResults[index] = freeMap(courseResult);
      }
    }
  }

  private applyPromoCodeFreeCourses(): void {
    applyPromoCodeFreeCourses(this.courseResults, this.now, this.options);
  }

  private markPrimaryCourses(): void {
    for (const [ index, courseResult ] of this.courseResults.entries()) {
      if (index === 0) {
        this.courseResults[index] = { ...courseResult, primary: true };
        continue;
      }

      if (typeof courseResult.plans.part === 'undefined' || this.courseResults.some(x => typeof x.plans.part === 'undefined')) {
        this.courseResults[index] = {
          ...courseResult,
          plans: {
            ...courseResult.plans,
          },
        };
        continue;
      }

      const first = this.courseResults[0];
      if (typeof first === 'undefined') {
        throw Error('No element found');
      }

      if (typeof first.plans.part === 'undefined') {
        throw Error('Part plan undefined');
      }

      const partInstallments = first.plans.part.installments;
      const partInstallmentSize = parseFloat(Big(courseResult.discountedCost).minus(courseResult.plans.part.deposit).div(partInstallments).round(2, 0).toFixed(2));
      const partRemainder = parseFloat(Big(courseResult.discountedCost).minus(courseResult.plans.part.deposit).minus(Big(partInstallmentSize).times(partInstallments)).toFixed(2));

      this.courseResults[index] = {
        ...courseResult,
        plans: {
          ...courseResult.plans,
          part: {
            ...courseResult.plans.part,
            installments: partInstallments,
            installmentSize: partInstallmentSize,
            remainder: partRemainder,
            originalInstallments: partInstallments,
          },
        },
      };
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
      const [ full, part ] = calculatePlans(courseResult.plans, discountedCost);

      this.courseResults[index] = {
        ...courseResult,
        shippingDiscount,
        discountedCost,
        plans: { full, part },
      };
    }
  }

  private applyMultiCourseDiscounts(): void {
    const applies = (spec?: PromoCodeSpec): boolean => typeof spec !== 'undefined' && specApplies(spec, this.now, this.options?.discountAll, this.options?.promoCode, this.options?.school);

    const skincare60Applies = applies(promoCodeSpecs.find(v => v.code === 'SKINCARE60'));
    const nathansDayApplies = applies(promoCodeSpecs.find(v => v.code === 'NATHANSDAY'));
    const wedding21MakeupApplies = applies(promoCodeSpecs.find(v => v.code === 'WEDDING21' && v.schools?.includes('QC Makeup Academy')));
    const sfx50Applies = applies(promoCodeSpecs.find(v => v.code === 'SFX50'));
    const save60Applies = [ 'SAVE60', 'PORTFOLIO60', 'QCLASHES60', 'COLORWHEEL60' ].some(promoCode => applies(promoCodeSpecs.find(v => v.code === promoCode)));
    const organizing60Applies = applies(promoCodeSpecs.find(v => v.code === 'ORGANIZING60'));
    const styling60Applies = applies(promoCodeSpecs.find(v => v.code === 'STYLING60'));
    const portdev60Applies = applies(promoCodeSpecs.find(v => v.code === 'PORTDEV60'));
    const corporate60Applies = applies(promoCodeSpecs.find(v => v.code === 'CORPORATE60'));
    const daycare60Applies = applies(promoCodeSpecs.find(v => v.code === 'DAYCARE60'));
    const liveEvent60Applies = applies(promoCodeSpecs.find(v => v.code === 'LIVEEVENT60'));

    const sfx60Applies = applies(promoCodeSpecs.find(v => v.code === 'SFX60'));
    const business60Applies = applies(promoCodeSpecs.find(v => v.code === 'BUSINESS60'));
    const training60Applies = applies(promoCodeSpecs.find(v => v.code === 'TRAINING60'));

    for (const [ index, courseResult ] of this.courseResults.entries()) {
      if (courseResult.free) {
        continue;
      }

      if (
        !shouldGetMultiCourseDiscount(this.now, index, this.options) &&
        !(nathansDayApplies && index > 0) &&
        !(liveEvent60Applies && index > 0) &&
        !(skincare60Applies && courseResult.code === 'SK' && this.courseResults.find(c => c.code === 'MZ')) &&
        !(wedding21MakeupApplies && courseResult.code === 'HS' && this.courseResults.find(c => c.code === 'MZ')) &&
        !(sfx50Applies && courseResult.code === 'SF' && this.courseResults.find(c => c.code === 'MZ'))
      ) {
        continue;
      }

      const minimumPrice = parseFloat(Big(courseResult.cost).minus(courseResult.shipping).minus(courseResult.multiCourseDiscount).minus(courseResult.promoDiscount).toFixed(2));
      const desiredMultiCourseDiscount = (
        skincare60Applies && courseResult.code === 'SK' && this.courseResults.find(c => c.code === 'MZ')) ||
        save60Applies ||
        liveEvent60Applies ||
        (organizing60Applies && courseResult.code === 'PO') ||
        (corporate60Applies && courseResult.code === 'CP') ||
        (styling60Applies && courseResult.code === 'PF') ||
        (portdev60Applies && courseResult.code === 'PW') ||
        (daycare60Applies && courseResult.code === 'DD') ||
        (sfx60Applies && courseResult.code === 'SF') ||
        (business60Applies && (courseResult.code === 'EB' || courseResult.code === 'DB')) ||
        (training60Applies && (courseResult.code === 'DT' || courseResult.code === 'DC'))
        ? parseFloat(Big(courseResult.cost).times(0.6).toFixed(2))
        : parseFloat(Big(courseResult.cost).times(courseResult.multiCourseDiscountRate).toFixed(2));

      const multiCourseDiscount = Math.min(minimumPrice, desiredMultiCourseDiscount);
      const multiCourseDiscountRate = parseFloat(Big(multiCourseDiscount).div(courseResult.cost).toFixed(2));
      const discountedCost = parseFloat(Big(courseResult.cost).minus(courseResult.shippingDiscount).minus(multiCourseDiscount).minus(courseResult.promoDiscount).toFixed(2));
      const [ full, part ] = calculatePlans(courseResult.plans, discountedCost, true);

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
    if (this.options?.studentDiscount !== true) {
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
      const [ full, part ] = calculatePlans(courseResult.plans, discountedCost);

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
      throw new HttpStatus.BadRequest('invalid discount signature');
    }

    let remainingExtraDiscount = this.options?.discount ? this.options.discount[this.currencyCode] ?? this.options.discount.default : 0;

    for (const [ index, courseResult ] of this.courseResults.entries()) {
      if (courseResult.free || remainingExtraDiscount <= 0) {
        continue;
      }

      const minimumPrice = parseFloat(Big(courseResult.cost).minus(courseResult.shipping).minus(courseResult.multiCourseDiscount).minus(courseResult.promoDiscount).toFixed(2));
      const discount = Math.min(minimumPrice, remainingExtraDiscount);
      remainingExtraDiscount = parseFloat(Big(remainingExtraDiscount).minus(discount).toFixed(2));

      const promoDiscount = parseFloat(Big(courseResult.promoDiscount).plus(discount).toFixed(2));
      const discountedCost = parseFloat(Big(courseResult.cost).minus(courseResult.shippingDiscount).minus(courseResult.multiCourseDiscount).minus(promoDiscount).toFixed(2));
      const [ full, part ] = calculatePlans(courseResult.plans, discountedCost);

      this.courseResults[index] = {
        ...courseResult,
        promoDiscount,
        discountedCost,
        plans: { full, part },
      };
    }
  }

  private applyPromoCodeDiscounts(): void {
    applyPromoCodeDiscounts(this.courseResults, this.now, this.currencyCode, this.options);
  }

  private applyToolsDiscounts(): void {
    if (this.options?.withoutTools !== true) {
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
      const [ full, part ] = calculatePlans(courseResult.plans, discountedCost);

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

    const depositOverrides = this.options?.depositOverrides;
    const installmentsOverride = this.options?.installmentsOverride;

    if (typeof depositOverrides !== 'undefined') {
      for (const course of this.requestedCourses) {
        if (typeof depositOverrides[course] === 'undefined') {
          throw new HttpStatus.BadRequest(`invalid depositOverride: no key for ${course}`);
        }
      }

      if (Object.keys(depositOverrides).length !== this.requestedCourses.length) {
        throw new HttpStatus.BadRequest(`invalid depositOverride: expected ${this.requestedCourses.length} keys`);
      }
    }

    if (typeof installmentsOverride !== 'undefined') {
      if (installmentsOverride < 1) {
        throw new HttpStatus.BadRequest('Invalid installmentsOverride: must be greater than or equal to 1');
      }

      if (installmentsOverride > 24) {
        throw new HttpStatus.BadRequest('Invalid installmentsOverride: must be less than 24');
      }
    }

    for (const [ index, courseResult ] of this.courseResults.entries()) {
      if (!depositOverrides?.[courseResult.code] || !installmentsOverride) {
        continue;
      }

      if (typeof courseResult.plans.part === 'undefined') {
        throw Error('Part plan undefined');
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
}
