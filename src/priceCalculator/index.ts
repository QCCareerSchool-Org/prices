import Big from 'big.js';

import { CoursePrice } from './coursePrice';
import { byCostAscending, byFreeThenCostAscending, byFreeThenCostDescending, finalSort } from './coursePriceSort';
import { Currency } from './currency';
import { DiscountApplicator } from './discountApplicator';
import { FreeCourseApplicator } from './freeCourseApplicator';
import { PriceSummary } from './priceSummary';
import { PricingMessages } from './pricingMessages';
import { PromoCodeCalculator } from './promoCodeCalculator';
import { lookupCurrency } from '../data/lookupCurrency';
import { lookupPrice } from '../data/lookupPrice';
import { audCountry, gbpCountry, nzdCountry } from '../domain/currency';
import type { CurrencyCode } from '../domain/currencyCode';
import type { PriceDTO } from '../domain/price';
import type { PriceOptions } from '../domain/priceQuery';
import type { RawPrice } from '../domain/rawPrice';
import { ClientError, ServerError } from '../lib/errors';
import { noShipCountry } from '../lib/helper-functions';

export class PriceCalculator {
  private readonly courseCodes: string[];

  private coursePrices: CoursePrice[] = [];

  private currency?: Currency;

  private readonly noShipping: boolean;

  private readonly now: Date;

  private readonly promoCodes: PromoCodeCalculator;

  private somePartsMissing = false;

  public constructor(courseCodes: string[], private readonly countryCode: string, private readonly provinceCode: string | undefined, private readonly options: PriceOptions) {
    // convert to uppercase and remove duplicates
    this.courseCodes = courseCodes
      .map(c => c.toLocaleUpperCase())
      .filter((item, pos, self) => self.indexOf(item) === pos);

    this.noShipping = noShipCountry(countryCode);
    this.now = process.env.NODE_ENV === 'production' ? new Date() : options.dateOverride ?? new Date();
    this.promoCodes = new PromoCodeCalculator(this.now, options);
  }

  public async calculate(): Promise<PriceDTO> {
    const rawPrices = await Promise.all(this.courseCodes.map(async c => lookupPrice(c, this.countryCode, this.provinceCode)));
    const currencyCode = this.getCurrencyCode(rawPrices);
    const rawCurrency = await lookupCurrency(currencyCode);
    this.currency = new Currency(rawCurrency);
    this.somePartsMissing = rawPrices.some(p => p.installments === 0);
    this.coursePrices = rawPrices.map(r => new CoursePrice(r));

    const freeCourseApplicator = new FreeCourseApplicator(this.coursePrices, this.promoCodes.code, this.options);

    this.coursePrices.sort(byCostAscending);
    freeCourseApplicator.applyDefaultFreeCourses();

    this.coursePrices.sort(byFreeThenCostAscending);
    freeCourseApplicator.applyPromoCodeFreeCourses();

    this.coursePrices.sort(byFreeThenCostDescending);
    this.markSecondaryCourses();

    const discountCalculator = new DiscountApplicator(this.coursePrices, this.promoCodes.code, this.currency, this.options);
    discountCalculator.applyMultiCourseDiscounts();
    discountCalculator.applyStudentDiscounts();
    discountCalculator.applyExtraDiscounts();
    discountCalculator.applyPromoCodeDiscounts();
    discountCalculator.applyToolsDiscounts();

    this.applyOverrides();
    const pricingMessages = new PricingMessages(this.courseCodes, this.promoCodes.code, this.options, this.noShipping, this.now);
    pricingMessages.calculate();

    this.coursePrices.sort(finalSort);

    return new PriceSummary(this.coursePrices, this.currency, this.countryCode, this.provinceCode, this.noShipping, this.promoCodes, this.options, pricingMessages.notes, pricingMessages.disclaimers, pricingMessages.promoWarnings).toDTO();
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

  private markSecondaryCourses(): void {
    if (this.coursePrices.length === 0) {
      return;
    }

    const firstCourseResult = this.coursePrices[0];
    if (!firstCourseResult) {
      throw Error('coursePrice is undefined');
    }

    for (let i = 1; i < this.coursePrices.length; i++) {
      const coursePrice = this.coursePrices[i];
      if (!coursePrice) {
        throw Error('coursePrice is undefined');
      }

      coursePrice.markSecondary();
      coursePrice.setPartInstallments(firstCourseResult.partInstallments);
    }
  }

  private applyOverrides(): void {
    if (this.somePartsMissing) {
      return;
    }

    // if there's a deposit-override object, make sure we have all the overrides
    if (typeof this.options.depositOverrides !== 'undefined') {
      // check for a deposit for each course
      for (const coursePrice of this.coursePrices) {
        if (typeof this.options.depositOverrides[coursePrice.code] === 'undefined') {
          throw new ClientError(`invalid depositOverride: no key for ${coursePrice.code}`);
        }
      }

      // check that there are no extra courses
      if (Object.keys(this.options.depositOverrides).length !== this.coursePrices.length) {
        throw new ClientError(`invalid depositOverride: expected ${this.coursePrices.length} keys`);
      }
    }

    const installmentOverride = this.options.installmentsOverride
      ? Big(this.options.installmentsOverride).round(0)
      : undefined;

    // if there's an installment-override, make sure it's between 1 and 24
    if (installmentOverride) {
      if (installmentOverride.lt(1)) {
        throw new ClientError('Invalid installmentsOverride: must be greater than or equal to 1');
      }

      if (installmentOverride.gt(24)) {
        throw new ClientError('Invalid installmentsOverride: must be less than 24');
      }
    }

    for (const coursePrice of this.coursePrices) {
      const depositOverride = this.options.depositOverrides?.[coursePrice.code];

      if (depositOverride) {
        coursePrice.overridePartDeposit(Big(depositOverride).round(2));
      }

      if (installmentOverride) {
        coursePrice.overridePartInstallments(installmentOverride);
      }
    }
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

}
