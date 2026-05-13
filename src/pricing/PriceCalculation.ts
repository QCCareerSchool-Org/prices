import Big from 'big.js';

import { applyPromoCodeDiscounts } from './promoCodeDiscounts';
import { applyPromoCodeFreeCourses } from './promoCodeFreeCourses';
import { PromoCodes } from './PromoCodes';
import { courseSort, getDefaultCourseSort } from './sortCourses';
import { studentDiscountAmount } from './studentDiscountAmount';
import { validateDiscounts } from './validateDiscounts';
import { calculatePlans } from '../calculatePlans';
import { lookupCurrency } from '../data/lookupCurrency';
import { lookupPrice } from '../data/lookupPrice';
import { defaultCurrencyCode } from '../defaultCurrencyCode';
import type { Currency } from '../domain/currency';
import type { CurrencyCode } from '../domain/currencyCode';
import type { NoShipping } from '../domain/noShipping';
import type { CoursePrice, Price } from '../domain/price';
import type { PriceOptions } from '../domain/priceQuery';
import type { RawPrice } from '../domain/rawPrice';
import { ClientError, ServerError } from '../lib/errors';
import { freeMap } from '../lib/freeMap';
import { noShipCountry } from '../lib/helper-functions';
import { sumBigArray } from '../lib/sumBigArray';
import { noShippingMessage } from '../noShippingMessage';
import { notesAndDisclaimers } from '../notesAndDisclaimers';
import { clamp } from './clamp';

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

  private readonly promoCodes: PromoCodes;

  private somePartsMissing = false;

  public constructor(private readonly requestedCourses: string[], private readonly countryCode: string, private readonly provinceCode: string | undefined, private readonly options: PriceOptions | undefined) {
    this.noShipping = noShipCountry(countryCode) ? 'REQUIRED' : options?.noShipping ? 'APPLIED' : 'ALLOWED' as NoShipping;
    this.now = process.env.NODE_ENV !== 'production'
      ? options?.dateOverride ?? new Date()
      : new Date();
    this.promoCodes = new PromoCodes(this.now, options);
    this.currencyCode = defaultCurrencyCode(countryCode);
  }

  public async calculate(): Promise<Price> {
    const rawPrices = await this.lookupRawPrices();
    this.currencyCode = this.getCurrencyCode(rawPrices);
    this.somePartsMissing = rawPrices.some(p => p.installments === 0);

    this.courseResults = rawPrices.map(r => this.createCoursePrice(r));

    this.courseResults.sort(byCostAscending);

    this.applyDefaultFreeCourses();

    this.courseResults.sort(getDefaultCourseSort(this.promoCodes));

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

    const [ notes, disclaimers, promoWarnings ] = notesAndDisclaimers(this.promoCodes, this.requestedCourses, this.countryCode, this.noShipping);

    return this.collateResults(await lookupCurrency(this.currencyCode), notes, disclaimers, promoWarnings);
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
      throw new ServerError(`Invalid currency code: ${currencyCode}`);
    }

    // make sure each price row uses the same currency
    if (rawPrices.some(p => p.currencyCode !== currencyCode)) {
      throw new ServerError(`Currency mismatch: ${this.requestedCourses.toString()} ${this.countryCode} ${this.provinceCode}`);
    }

    return currencyCode;
  }

  private collateResults(currency: Currency, notes: string[], disclaimers: string[], promoWarnings: string[]): Price {
    const firstResult = this.courseResults[0];
    if (!firstResult) {
      throw new ServerError('No results');
    }

    const partPlanAvailable = this.courseResults.every(c => typeof c.plans.part !== 'undefined');
    return {
      countryCode: this.countryCode,
      provinceCode: this.provinceCode,
      currency,
      cost: this.sum(c => c.cost),
      multiCourseDiscount: this.sum(c => c.multiCourseDiscount),
      promoDiscount: this.sum(c => c.promoDiscount),
      shippingDiscount: this.sum(c => c.shippingDiscount),
      discountedCost: this.sum(c => c.discountedCost),
      plans: {
        full: {
          discount: this.sum(c => c.plans.full.discount),
          deposit: this.sum(c => c.plans.full.deposit),
          installmentSize: this.sum(c => c.plans.full.installmentSize),
          installments: 0,
          remainder: this.sum(c => c.plans.full.remainder),
          total: this.sum(c => c.plans.full.total),
          originalDeposit: this.sum(c => c.plans.full.originalDeposit),
          originalInstallments: 0,
        },
        part: partPlanAvailable
          ? {
            discount: this.sum(c => c.plans.part?.discount ?? 0),
            deposit: this.sum(c => c.plans.part?.deposit ?? 0),
            installmentSize: this.sum(c => c.plans.part?.installmentSize ?? 0),
            installments: firstResult.plans.part?.installments ?? 1,
            remainder: this.sum(c => c.plans.part?.remainder ?? 0),
            total: this.sum(c => c.plans.part?.total ?? 0),
            originalDeposit: this.sum(c => c.plans.part?.originalDeposit ?? 0),
            originalInstallments: firstResult.plans.part?.originalInstallments ?? 1,
          }
          : undefined,
      },
      shipping: this.sum(c => c.shipping),
      disclaimers,
      notes,
      promoWarnings,
      noShipping: this.noShipping,
      noShippingMessage: noShippingMessage(this.noShipping, this.requestedCourses, this.countryCode),
      promoCodeRecognized: this.promoCodes.recognized,
      promoCode: this.promoCodes.recognized ? this.options?.promoCode : undefined,
      courses: this.courseResults,
    };
  }

  private sum(value: (course: CoursePrice) => number): number {
    return parseFloat(this.courseResults.map(course => Big(value(course))).reduce(sumBigArray, Big(0)).toFixed(2));
  }

  /** Sets courses that should always be free */
  private applyDefaultFreeCourses(): void {
    for (const [ index, courseResult ] of this.courseResults.entries()) {
      // FA is free if taking DG
      if (this.options?.discountAll !== true && courseResult.code === 'FA' && this.courseResults.some(c => c.code === 'DG')) {
        this.courseResults[index] = freeMap(courseResult);
        continue;
      }

      // VD and DB are free if taking I2
      if ((courseResult.code === 'VD' || courseResult.code === 'DB') && this.courseResults.some(c => c.code === 'I2')) {
        this.courseResults[index] = freeMap(courseResult);
      }
    }
  }

  private applyPromoCodeFreeCourses(): void {
    applyPromoCodeFreeCourses(this.courseResults, this.promoCodes);
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
        throw new ServerError('No element found');
      }

      if (typeof first.plans.part === 'undefined') {
        throw new ServerError('Part plan undefined');
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
    for (const [ index, courseResult ] of this.courseResults.entries()) {
      if (courseResult.free) {
        continue;
      }

      if (!this.shouldGetMultiCourseDiscount(index)) {
        continue;
      }

      const minimumPrice = parseFloat(Big(courseResult.cost).minus(courseResult.shipping).minus(courseResult.multiCourseDiscount).minus(courseResult.promoDiscount).toFixed(2));
      const desiredMultiCourseDiscount = (
        this.promoCodes.applies('SKINCARE60') && courseResult.code === 'SK' && this.courseResults.find(c => c.code === 'MZ')) ||
        [ 'SAVE60', 'PORTFOLIO60', 'QCLASHES60', 'COLORWHEEL60' ].some(code => this.promoCodes.applies(code)) ||
        this.promoCodes.applies('LIVEEVENT60') ||
        (this.promoCodes.applies('ORGANIZING60') && courseResult.code === 'PO') ||
        (this.promoCodes.applies('CORPORATE60') && courseResult.code === 'CP') ||
        (this.promoCodes.applies('STYLING60') && courseResult.code === 'PF') ||
        (this.promoCodes.applies('PORTDEV60') && courseResult.code === 'PW') ||
        (this.promoCodes.applies('DAYCARE60') && courseResult.code === 'DD') ||
        (this.promoCodes.applies('SFX60') && courseResult.code === 'SF') ||
        (this.promoCodes.applies('BUSINESS60') && (courseResult.code === 'EB' || courseResult.code === 'DB')) ||
        (this.promoCodes.applies('TRAINING60') && (courseResult.code === 'DT' || courseResult.code === 'DC'))
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
      throw new ClientError('invalid discount signature');
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
    applyPromoCodeDiscounts(this.courseResults, this.promoCodes, this.currencyCode);
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
          throw new ClientError(`invalid depositOverride: no key for ${course}`);
        }
      }

      if (Object.keys(depositOverrides).length !== this.requestedCourses.length) {
        throw new ClientError(`invalid depositOverride: expected ${this.requestedCourses.length} keys`);
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
    if (this.options?.discountAll) {
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

    const partInstallments = p.installments ? Math.round(this.options?.discountAll ? p.installments / 2 : p.installments) : 1; // the number of installments must be at least 1 and must be a whole number

    const partInstallmentSize = p.installments ? parseFloat(Big(partTotal).minus(partDeposit).div(partInstallments).round(2, 0).toFixed(2)) : 0; // always round down so that the actual price will never be more than the quoted price

    const partRemainder = p.installments ? parseFloat(Big(partTotal).minus(partDeposit).minus(Big(partInstallmentSize).times(partInstallments)).toFixed(2)) : undefined;

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
      plans: {
        full: {
          discount: fullDiscount,
          deposit: fullTotal,
          installmentSize: 0,
          installments: 0,
          remainder: 0,
          total: fullTotal,
          originalDeposit: fullTotal,
          originalInstallments: 0,
        },
        part: partInstallments
          ? {
            discount: partDiscount,
            deposit: partDeposit,
            installmentSize: partInstallmentSize,
            installments: partInstallments,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            remainder: partRemainder!,
            total: partTotal,
            originalDeposit: partDeposit,
            originalInstallments: partInstallments,
          }
          : undefined,
      },
      shipping,
      free: false,
      discountMessage: null,
    };
  }
}
