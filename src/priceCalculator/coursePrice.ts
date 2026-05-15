import Big from 'big.js';

import type { IPaymentPlan } from './paymentPlan';
import { FullPaymentPlan, InstallmentPaymentPlan } from './paymentPlan';
import type { CoursePriceDTO } from '../domain/price';
import type { RawPrice } from '../domain/rawPrice';

export class CoursePrice {
  public code: string;
  public name: string;

  public cost: Big;
  public discountedCost: Big;
  public discountMessage: string | null = null;
  public free = false;
  public multiCourseDiscount: Big;
  public multiCourseDiscountRate: Big;
  public order: number;
  public plans: { full: IPaymentPlan; part: IPaymentPlan };
  public primary = true;
  public partInstallments: Big;
  public promoDiscount: Big;

  private fullDiscount: Big;
  private partDiscount: Big;
  private readonly partDeposit: Big;
  private partDepositOverride: Big;
  private partInstallmentsOverride: Big;

  public constructor(p: RawPrice, promoDiscount: Big = Big(0)) {
    if (p.cost < 0) {
      throw Error('Cost is less than 0');
    }
    if (p.multiCourseDiscountRate < 0 || p.multiCourseDiscountRate > 1) {
      throw Error('Multi-course discount rate is invalid');
    }
    if (p.discount < 0 || p.discount > p.cost) {
      throw Error('Full Discount is invalid');
    }
    if (p.partDiscount < 0 || p.partDiscount > p.cost) {
      throw Error('Part discount is invalid');
    }
    if (promoDiscount.lt(0) || promoDiscount.gt(p.cost)) {
      throw Error('Invalid discount amount');
    }

    this.cost = Big(p.cost).round(2);
    this.multiCourseDiscountRate = Big(p.multiCourseDiscountRate).round(2);
    this.multiCourseDiscount = Big(0);
    this.fullDiscount = Big(p.discount).round(2);
    this.partDiscount = Big(p.partDiscount).round(2);
    this.partDeposit = Big(p.deposit).round(2);
    this.partDepositOverride = this.partDeposit;
    this.partInstallments = Big(p.installments ?? 0);
    this.partInstallmentsOverride = this.partInstallments;
    this.promoDiscount = promoDiscount.round(2);
    this.discountedCost = this.cost.minus(this.multiCourseDiscount).minus(this.promoDiscount);
    this.code = p.courseCode;
    this.name = p.courseName;
    this.order = p.order;
    this.plans = {
      full: this.getFullPlan(),
      part: this.getPartPlan(),
    };
  }

  public setPromoDiscount(discount: Big): void {
    if (discount.lt(0) || discount.gt(this.cost)) {
      throw Error('Invalid discount');
    }

    this.promoDiscount = discount.round(2);
    this.discountedCost = this.cost.minus(this.multiCourseDiscount).minus(this.promoDiscount);
    this.recalculateFullPlan();
    this.recalculatePartPlan();
  }

  public addPromoDiscount(discount: Big): void {
    if (discount.lt(0)) {
      throw Error('Invalid discount');
    }

    const additionalDiscount = discount.gt(this.discountedCost) ? this.discountedCost : discount.round(2);
    this.promoDiscount = this.promoDiscount.plus(additionalDiscount);
    this.discountedCost = this.cost.minus(this.multiCourseDiscount).minus(this.promoDiscount);
    this.recalculateFullPlan();
    this.recalculatePartPlan();
  }

  public applyMultiCourseDiscount(overrideRate: Big | undefined): void {
    if (overrideRate) {
      if (overrideRate.lt(0) || overrideRate.gt(1)) {
        throw Error('Invalid override rate');
      }

      this.multiCourseDiscountRate = overrideRate;
    }

    this.multiCourseDiscount = this.cost.times(this.multiCourseDiscountRate).round(2);
    this.discountedCost = this.cost.minus(this.multiCourseDiscount).minus(this.promoDiscount);
    this.discountMessage = `${this.multiCourseDiscountRate.times(100).round(0).toNumber()}% Discount`;
    this.recalculateFullPlan();
    this.recalculatePartPlan();
  }

  public makeFree(): void {
    this.free = true;
    this.multiCourseDiscountRate = Big(1);
    this.multiCourseDiscount = this.cost;
    this.discountedCost = this.cost.minus(this.multiCourseDiscount).minus(this.promoDiscount);
    this.recalculateFullPlan();
    this.recalculatePartPlan();
  }

  public markSecondary() {
    this.primary = false;
    this.fullDiscount = Big(0);
    this.partDiscount = Big(0);
    this.recalculateFullPlan();
    this.recalculatePartPlan();
  }

  public setPartInstallments(installments: Big) {
    if (installments.lt(0) || installments.gt(24)) {
      throw Error('Invalid installments value');
    }

    this.partInstallments = installments.round(0);
    this.partInstallmentsOverride = this.partInstallments;
    this.recalculatePartPlan();
  }

  public overridePartDeposit(depositOverride: Big) {
    if (depositOverride.lt(0) || depositOverride.gte(this.discountedCost)) {
      throw Error('Invalid deposit override');
    }

    this.partDepositOverride = depositOverride.round(2);
    this.recalculatePartPlan();
  }

  public overridePartInstallments(installmentsOverride: Big) {
    if (installmentsOverride.lt(0) || installmentsOverride.gt(24)) {
      throw Error('Invalid installments value');
    }

    this.partInstallmentsOverride = installmentsOverride.round(0);
    this.recalculatePartPlan();
  }

  public toDTO(): CoursePriceDTO {
    return {
      code: this.code,
      name: this.name,
      primary: this.primary,
      cost: this.cost.toNumber(),
      multiCourseDiscountRate: this.multiCourseDiscountRate.toNumber(),
      multiCourseDiscount: this.multiCourseDiscount.toNumber(),
      promoDiscount: this.promoDiscount.toNumber(),
      discountedCost: this.discountedCost.toNumber(),
      order: this.order,
      plans: {
        full: this.plans.full.toPlan(),
        part: this.plans.part.toPlan(),
      },
      free: this.free,
      discountMessage: this.discountMessage,
    };
  }

  private recalculateFullPlan() {
    this.plans.full = this.getFullPlan();
  }

  private recalculatePartPlan() {
    this.plans.part = this.getPartPlan();
  }

  private getFullPlan(): FullPaymentPlan {
    return new FullPaymentPlan(this.discountedCost, this.fullDiscount);
  }

  private getPartPlan(): InstallmentPaymentPlan {
    return new InstallmentPaymentPlan(this.discountedCost, this.partDiscount, this.partDepositOverride, this.partInstallmentsOverride, this.partDeposit, this.partInstallments);
  }
}
