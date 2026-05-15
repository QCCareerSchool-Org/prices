import Big from 'big.js';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

import type { CoursePrice } from './coursePrice';
import type { Currency } from './currency';
import { PromoCodeCalculator } from './promoCodeCalculator';
import { isEventFoundationCourse, isMakeupFoundationCourse, isPetCourse } from '@/courses';
import type { PriceOptions } from '@/domain/priceQuery';
import { bigMin } from '@/lib/bigMin';
import { ClientError, ServerError } from '@/lib/errors';

const publicKey = fs.readFileSync(path.join(__dirname, '../../public.pem'), 'utf8');

export class DiscountApplicator {
  public constructor(
    private readonly coursePrices: CoursePrice[],
    private readonly promoCodes: PromoCodeCalculator,
    private readonly currency: Currency,
    private readonly options: PriceOptions,
  ) { /* empty */ }

  public applyMultiCourseDiscounts(): void {
    for (let index = 0; index < this.coursePrices.length; index++) {
      const coursePrice = this.coursePrices[index];
      if (!coursePrice) {
        throw new ServerError('coursePrice not defined');
      }

      if (coursePrice.free) {
        continue;
      }

      if (!this.shouldGetMultiCourseDiscount(index)) {
        continue;
      }

      const overrideRate = this.getMultiCourseDiscountRateOverride(coursePrice);
      coursePrice.applyMultiCourseDiscount(overrideRate);
    }
  }

  public applyStudentDiscounts(): void {
    if (!this.options.studentDiscount) {
      return;
    }

    for (const coursePrice of this.coursePrices) {
      if (coursePrice.free) {
        continue;
      }

      coursePrice.addPromoDiscount(this.studentDiscountAmount());
    }
  }

  public applyExtraDiscounts(): void {
    if (!this.options.discount) {
      return;
    }

    if (!this.validateDiscounts()) {
      throw new ClientError('invalid discount signature');
    }

    let remainingExtraDiscount = Big(this.options.discount[this.currency.code] ?? this.options.discount.default);

    for (const coursePrice of this.coursePrices) {
      if (coursePrice.free || coursePrice.multiCourseDiscountApplied || remainingExtraDiscount.lte(0)) {
        continue;
      }

      const reduction = remainingExtraDiscount.gt(coursePrice.discountedCost) ? remainingExtraDiscount : coursePrice.discountedCost;
      remainingExtraDiscount = remainingExtraDiscount.minus(reduction);
      coursePrice.addPromoDiscount(reduction);
    }
  }

  public applyPromoCodeDiscounts(): void {
    const dogGroomingDiscount = this.getDogGroomingDiscount();
    const dogTrainingDiscount = this.getDogTrainingDiscount();
    let petDiscount = this.getPetDiscount();
    let remainingExtraDiscount = this.getExtraPromoDiscount();

    const doPetDiscount = (coursePrice: CoursePrice) => {
      if (!petDiscount || petDiscount.lte(0)) {
        return;
      }

      if (coursePrice.multiCourseDiscountApplied) {
        return;
      }

      if (!isPetCourse(coursePrice.code)) {
        return;
      }

      const extraDiscount = bigMin(coursePrice.discountedCost, petDiscount);
      this.safeApply(coursePrice, extraDiscount);
      petDiscount = petDiscount.minus(extraDiscount);
    };

    let applied = false;

    /**
     * Apply any discounts that can only be applied once
     * @param coursePrice the courseResults
     */
    const doOneTimeDiscount = (coursePrice: CoursePrice): void => {
      if (applied) {
        return;
      }

      if (coursePrice.multiCourseDiscountApplied) {
        return;
      }

      if (this.promoCodes.code === 'FOUNDATION200' && isEventFoundationCourse(coursePrice.code)) {
        this.safeApply(coursePrice, Big(200));
        applied = true;
        return;
      }

      // take a flat amount off
      if (this.promoCodes.code === 'KIT200OFF' && isMakeupFoundationCourse(coursePrice.code)) {
        this.safeApply(coursePrice, Big(this.currency.code === 'GBP' ? 100 : 200));
        applied = true;
        return;
      }

      if ([ 'MASTERCLASS', 'SSMASTERCLASS' ].includes(this.promoCodes.code ?? '') && this.coursePrices.some(c => c.code === 'I2')) {
        this.safeApply(coursePrice, Big(200));
        applied = true;
        return;
      }

      if (this.promoCodes.code === 'MASTERCLASS150' && this.coursePrices.some(c => c.code === 'I2')) {
        this.safeApply(coursePrice, Big(150));
        applied = true;
        return;
      }

      if (this.promoCodes.code === 'MZ100' && this.coursePrices.some(c => c.code === 'MZ')) {
        this.safeApply(coursePrice, Big(100));
        applied = true;
        return;
      };
    };

    const doGeneralDiscount = (coursePrice: CoursePrice) => {
      if (!remainingExtraDiscount || remainingExtraDiscount.lte(0)) {
        return;
      }

      if (coursePrice.multiCourseDiscountApplied) {
        return;
      }

      const extraDiscount = bigMin(coursePrice.discountedCost, remainingExtraDiscount);
      coursePrice.setPromoDiscount(extraDiscount);
      remainingExtraDiscount = remainingExtraDiscount.minus(extraDiscount);
    };

    for (const coursePrice of this.coursePrices) {
      // skip free courses and ones with a multicourseDiscount already applied
      if (coursePrice.free || coursePrice.multiCourseDiscountApplied) {
        continue;
      }

      // take a flat amount off DG
      if (dogGroomingDiscount && coursePrice.code === 'DG') {
        this.safeApply(coursePrice, dogGroomingDiscount);
        continue;
      }

      // take a flat amount off DT
      if (dogTrainingDiscount && coursePrice.code === 'DT') {
        this.safeApply(coursePrice, dogTrainingDiscount);
        continue;
      }

      // take 25% off every discounted price (before payment-plan discounts)
      if (this.promoCodes.code === 'QCGROUP' && coursePrice.primary) {
        this.safeApply(coursePrice, coursePrice.discountedCost.times(0.25).round(2));
        continue;
      }

      // take 25% off every discounted price (before payment-plan discounts)
      if (this.promoCodes.code === '10PERCENT') {
        this.safeApply(coursePrice, coursePrice.discountedCost.times(0.1).round(2));
        continue;
      }

      // take 25% of FC
      if (this.promoCodes.code === 'FC25PERCENT' && coursePrice.code === 'FC') {
        const discount = coursePrice.cost.times(0.25).round(2);
        this.safeApply(coursePrice, discount);
        continue;
      }

      // take a flat amount off MZ
      if (this.promoCodes.code === 'SKINCARE100' && coursePrice.code === 'MZ') {
        this.safeApply(coursePrice, Big(100));
        continue;
      }

      // take a flat amount off MZ
      if ([ 'SKINCARE300', 'MASTER300' ].includes(this.promoCodes.code ?? '') && coursePrice.code === 'MZ') {
        this.safeApply(coursePrice, Big(300));
        continue;
      }

      if (PromoCodeCalculator.studentSupport50Codes.includes(this.promoCodes.code ?? '')) {
        this.safeApply(coursePrice, Big(50));
        continue;
      }

      if (PromoCodeCalculator.studentSupport100Codes.includes(this.promoCodes.code ?? '')) {
        this.safeApply(coursePrice, Big(100));
        continue;
      }

      if (PromoCodeCalculator.studentSupport150Codes.includes(this.promoCodes.code ?? '')) {
        this.safeApply(coursePrice, Big(150));
        continue;
      }

      doOneTimeDiscount(coursePrice);

      doGeneralDiscount(coursePrice);

      doPetDiscount(coursePrice);
    }
  }

  public applyToolsDiscounts(): void {
    if (!this.options.withoutTools) {
      return;
    }

    const dgDiscountAmount = Big(this.currency.code === 'GBP' ? 150 : 200);

    for (const coursePrice of this.coursePrices) {
      if (coursePrice.free || coursePrice.code !== 'DG') {
        continue;
      }

      const reduction = dgDiscountAmount.gt(coursePrice.discountedCost) ? coursePrice.discountedCost : dgDiscountAmount;
      coursePrice.addPromoDiscount(reduction);
    }
  }

  private safeApply(coursePrice: CoursePrice, discount: Big): void {
    coursePrice.addPromoDiscount(bigMin(coursePrice.discountedCost, discount));
  };

  private shouldGetMultiCourseDiscount(index: number): boolean {
    // when discountAll is true all courses get the multi-course discount
    if (this.options.discountAll) {
      return true;
    }

    // the first course should not get the discount
    return index > 0;
  };

  private getMultiCourseDiscountRateOverride(coursePrice: CoursePrice): Big | undefined {
    if ((this.promoCodes.code === 'SKINCARE60' && coursePrice.code === 'SK' && this.coursePrices.find(c => c.code === 'MZ'))) {
      return Big(0.6);
    }

    if ([ 'SAVE60', 'PORTFOLIO60', 'QCLASHES60', 'COLORWHEEL60' ].includes(this.promoCodes.code ?? '')) {
      return Big(0.6);
    }

    if (this.promoCodes.code === 'LIVEEVENT60') {
      return Big(0.6);
    }

    if (this.promoCodes.code === 'ORGANIZING60' && coursePrice.code === 'PO') {
      return Big(0.6);
    }

    if (this.promoCodes.code === 'CORPORATE60' && coursePrice.code === 'CP') {
      return Big(0.6);
    }

    if (this.promoCodes.code === 'STYLING60' && coursePrice.code === 'PF') {
      return Big(0.6);
    }

    if (this.promoCodes.code === 'PORTDEV60' && coursePrice.code === 'PW') {
      return Big(0.6);
    }

    if (this.promoCodes.code === 'DAYCARE60' && coursePrice.code === 'DD') {
      return Big(0.6);
    }

    if (this.promoCodes.code === 'SFX60' && coursePrice.code === 'SF') {
      return Big(0.6);
    }

    if (this.promoCodes.code === 'BUSINESS60' && (coursePrice.code === 'EB' || coursePrice.code === 'DB')) {
      return Big(0.6);
    }

    if (this.promoCodes.code === 'TRAINING60' && (coursePrice.code === 'DT' || coursePrice.code === 'DC')) {
      return Big(0.6);
    }
  }

  private studentDiscountAmount(): Big {
    return this.currency.code === 'GBP' ? Big(25) : Big(50);
  }

  private getPetDiscount(): Big | undefined {
    switch (this.promoCodes.code) {
      case 'PET100OFF':
        return Big(this.currency.code === 'GBP' ? 75 : 100);
      case 'PET150OFF':
        return Big(this.currency.code === 'GBP' ? 100 : 150);
      case 'PET200OFF':
        return Big(this.currency.code === 'GBP' ? 150 : 200);
      case 'PET300OFF':
        return Big(300);
      case 'PET400OFF':
        return Big(400);
      case 'PET500OFF':
        return Big(500);
    }
  }

  private getDogGroomingDiscount(): Big | undefined {
    switch (this.promoCodes.code) {
      case 'DG150':
        return Big(150);
      case 'DG200':
        return Big(200);
      case 'DG300':
        return Big(300);
      case 'DG400':
        return Big(400);
      case 'DG500':
        return Big(this.currency.code === 'GBP' ? 415 : 500);
      case 'WOOFGANG':
        return Big(500);
    }
  }

  private getDogTrainingDiscount(): Big | undefined {
    switch (this.promoCodes.code) {
      case 'DT150':
        return Big(150);
      case 'DT200':
        return Big(200);
      case 'DT300':
        return Big(300);
      case 'DT500':
        return Big(this.currency.code === 'GBP' ? 415 : 500);
    }
  }

  private getExtraPromoDiscount(): Big | undefined {
    switch (this.promoCodes.code) {
      case '50OFF':
        return Big(50);
      case '100OFF':
        return Big(this.currency.code === 'GBP' ? 75 : 100);
      case '150OFF':
        return Big(this.currency.code === 'GBP' ? 110 : 150);
      case '200OFF':
      case 'BOGO200':
        return Big(this.currency.code === 'GBP' ? 150 : 200);
      case '300OFF':
      case 'DAYCARE300':
      case 'BOGOMZ300':
        return Big(300);
      case '400OFF':
        return Big(400);
      case 'MAKEUP100':
        return Big(100);
      case 'COACHING50':
        return Big(50);
    }

    if ([ 'DESIGN100OFF', 'EVENT100OFF' ].includes(this.promoCodes.code ?? '')) {
      return Big(this.currency.code === 'GBP' ? 75 : 100);
    }

    if ([ 'DESIGN200OFF', 'EVENT200OFF' ].includes(this.promoCodes.code ?? '')) {
      return Big(this.currency.code === 'GBP' ? 150 : 200);
    }

    if ([ 'BOGO100', 'BOGOCATALYST100', '2SPECIALTY100', 'SPECIALTY100', 'PROFITPIVOT' ].includes(this.promoCodes.code ?? '')) {
      return Big(100);
    }

    if ([ 'PORTFOLIO50', 'FANDECK50', 'BRUSHSET50' ].includes(this.promoCodes.code ?? '')) {
      return Big(50);
    }
  }

  /**
   * Determines if the discount options are valid
   * @param options the options
  */
  private validateDiscounts(): boolean {
    if (!this.options.discount || !this.options.discountSignature) {
      return true;
    }

    const verify = crypto.createVerify('SHA256');
    verify.update(JSON.stringify(this.options.discount));
    return verify.verify(publicKey, Buffer.from(this.options.discountSignature, 'base64'));
  }
}
