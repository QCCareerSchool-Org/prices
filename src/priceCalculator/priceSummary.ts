import Big from 'big.js';

import type { CoursePrice } from './coursePrice';
import type { Currency } from './currency';
import type { PromoCodeCalculator } from './promoCodeCalculator';
import type { PriceDTO } from '../domain/price';
import type { PriceOptions } from '../domain/priceQuery';

export class PriceSummary {
  public constructor(
    private readonly coursePrices: CoursePrice[],
    private readonly currency: Currency,
    private readonly countryCode: string,
    private readonly provinceCode: string | undefined,
    private readonly noShipping: boolean,
    private readonly promoCodes: PromoCodeCalculator,
    private readonly options: PriceOptions,
    private readonly notes: string[],
    private readonly disclaimers: string[],
    private readonly promoWarnings: string[],
  ) { /* empty */ }

  public toDTO(): PriceDTO {
    const price: PriceDTO = {
      countryCode: this.countryCode,
      provinceCode: this.provinceCode,
      currency: this.currency.toDTO(),
      cost: 0,
      multiCourseDiscount: 0,
      promoDiscount: 0,
      discountedCost: 0,
      plans: {
        full: { discount: 0, deposit: 0, installmentSize: 0, installments: 0, remainder: 0, total: 0, originalDeposit: 0, originalInstallments: 0 },
        part: { discount: 0, deposit: 0, installmentSize: 0, installments: 0, remainder: 0, total: 0, originalDeposit: 0, originalInstallments: 0 },
      },
      disclaimers: this.disclaimers,
      notes: this.notes,
      promoWarnings: this.promoWarnings,
      noShipping: this.noShipping,
      promoCodeRecognized: this.promoCodes.recognized,
      promoCode: this.promoCodes.recognized ? this.options.promoCode : undefined,
      courses: [],
    };

    const firstCourseResult = this.coursePrices[0];
    if (!firstCourseResult) {
      return price;
    }

    let cost = Big(0);
    let multiCourseDiscount = Big(0);
    let promoDiscount = Big(0);
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

    for (const coursePrice of this.coursePrices) {
      cost = cost.plus(coursePrice.cost);
      multiCourseDiscount = multiCourseDiscount.plus(coursePrice.multiCourseDiscount);
      promoDiscount = promoDiscount.plus(coursePrice.promoDiscount);
      discountedCost = discountedCost.plus(coursePrice.discountedCost);
      fullDiscount = fullDiscount.plus(coursePrice.plans.full.discount);
      fullDeposit = fullDeposit.plus(coursePrice.plans.full.deposit);
      fullInstallmentSize = fullInstallmentSize.plus(coursePrice.plans.full.installmentSize);
      fullRemainder = fullRemainder.plus(coursePrice.plans.full.remainder);
      fullTotal = fullTotal.plus(coursePrice.plans.full.total);
      fullOriginalDeposit = fullOriginalDeposit.plus(coursePrice.plans.full.originalDeposit);
      partDiscount = partDiscount.plus(coursePrice.plans.part.discount);
      partDeposit = partDeposit.plus(coursePrice.plans.part.deposit);
      partInstallmentSize = partInstallmentSize.plus(coursePrice.plans.part.installmentSize);
      partRemainder = partRemainder.plus(coursePrice.plans.part.remainder);
      partTotal = partTotal.plus(coursePrice.plans.part.total);
      partOriginalDeposit = partOriginalDeposit.plus(coursePrice.plans.part.originalDeposit);
    }

    price.cost = cost.toNumber();
    price.multiCourseDiscount = multiCourseDiscount.toNumber();
    price.promoDiscount = promoDiscount.toNumber();
    price.discountedCost = discountedCost.toNumber();

    price.plans.full.discount = fullDiscount.toNumber();
    price.plans.full.deposit = fullDeposit.toNumber();
    price.plans.full.installmentSize = fullInstallmentSize.toNumber();
    price.plans.full.installments = 0;
    price.plans.full.remainder = fullRemainder.toNumber();
    price.plans.full.total = fullTotal.toNumber();
    price.plans.full.originalDeposit = fullOriginalDeposit.toNumber();
    price.plans.full.originalInstallments = 0;

    price.plans.part.discount = partDiscount.toNumber();
    price.plans.part.deposit = partDeposit.toNumber();
    price.plans.part.installmentSize = partInstallmentSize.toNumber();
    price.plans.part.installments = firstCourseResult.plans.part.installments.toNumber();
    price.plans.part.remainder = partRemainder.toNumber();
    price.plans.part.total = partTotal.toNumber();
    price.plans.part.originalDeposit = partOriginalDeposit.toNumber();
    price.plans.part.originalInstallments = firstCourseResult.plans.part.originalInstallments.toNumber();

    price.courses = this.coursePrices.map(c => c.toDTO());

    return price;
  }
}
