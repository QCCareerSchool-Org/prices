import Big from 'big.js';

import type { CoursePrice, Plan } from '../domain/price';
import type { RawPrice } from '../domain/rawPrice';
import { clamp } from '../lib/clamp';

class PaymentPlanState {
  public constructor(
    public discount: number,
    public deposit: number,
    public installmentSize: number,
    public installments: number,
    public remainder: number,
    public total: number,
    public originalDeposit: number,
    public originalInstallments: number,
  ) { /* empty */ }

  public static full(discount: number, total: number): PaymentPlanState {
    return new PaymentPlanState(discount, total, 0, 0, 0, total, total, 0);
  }

  public recalculate(discountedCost: number, removePlanDiscounts?: boolean): PaymentPlanState {
    const discount = removePlanDiscounts ? 0 : Math.min(discountedCost, this.discount);
    const total = parseFloat(Big(discountedCost).minus(discount).toFixed(2));
    const deposit = Math.min(total, this.deposit);
    const installmentSize = this.installments === 0 ? 0 : parseFloat(Big(total).minus(deposit).div(this.installments).round(2, 0).toFixed(2));
    const remainder = this.installments === 0 ? 0 : parseFloat(Big(total).minus(deposit).minus(Big(installmentSize).times(this.installments)).toFixed(2));

    return new PaymentPlanState(
      discount,
      deposit,
      installmentSize,
      this.installments,
      remainder,
      total,
      deposit,
      this.originalInstallments,
    );
  }

  public toPlan(): Plan {
    return {
      discount: this.discount,
      deposit: this.deposit,
      installmentSize: this.installmentSize,
      installments: this.installments,
      remainder: this.remainder,
      total: this.total,
      originalDeposit: this.originalDeposit,
      originalInstallments: this.originalInstallments,
    };
  }
}

export class CoursePricingState {
  public code: string;

  public cost: number;

  public discountedCost: number;

  public discountMessage: string | null = null;

  public free = false;

  public multiCourseDiscount = 0;

  public multiCourseDiscountRate: number;

  public name: string;

  public order: number;

  public plans: { full: PaymentPlanState; part: PaymentPlanState };

  public primary = false;

  public promoDiscount = 0;

  public shipping: number;

  public shippingDiscount = 0;

  public constructor(p: RawPrice, discountAll: boolean) {
    const cost = parseFloat(Math.max(0, p.cost).toFixed(2));
    const shipping = clamp(parseFloat(p.shipping.toFixed(2)), 0, cost);
    const minimumPrice = parseFloat(Big(cost).minus(shipping).toFixed(2));
    const multiCourseDiscountRate = clamp(parseFloat(p.multiCourseDiscountRate.toFixed(2)), 0, 1);
    const fullDiscount = clamp(parseFloat(p.discount.toFixed(2)), 0, minimumPrice);
    const fullTotal = parseFloat(Big(cost).minus(fullDiscount).toFixed(2));
    const partDiscount = clamp(parseFloat(p.partDiscount.toFixed(2)), 0, minimumPrice);
    const partTotal = parseFloat(Big(cost).minus(partDiscount).toFixed(2));
    const partDeposit = clamp(parseFloat(p.deposit.toFixed(2)), 0, partTotal);
    const partInstallments = p.installments ? Math.round(discountAll ? p.installments / 2 : p.installments) : 1;
    const partInstallmentSize = p.installments ? parseFloat(Big(partTotal).minus(partDeposit).div(partInstallments).round(2, 0).toFixed(2)) : 0;
    const partRemainder = p.installments ? parseFloat(Big(partTotal).minus(partDeposit).minus(Big(partInstallmentSize).times(partInstallments)).toFixed(2)) : 0;

    this.code = p.courseCode;
    this.name = p.courseName;
    this.cost = cost;
    this.discountedCost = cost;
    this.multiCourseDiscountRate = multiCourseDiscountRate;
    this.order = p.order;
    this.shipping = shipping;
    this.plans = {
      full: PaymentPlanState.full(fullDiscount, fullTotal),
      part: new PaymentPlanState(partDiscount, partDeposit, partInstallmentSize, partInstallments, partRemainder, partTotal, partDeposit, partInstallments),
    };
  }

  public addPromoDiscount(discount: number): void {
    this.promoDiscount = parseFloat(Big(this.promoDiscount).plus(discount).toFixed(2));
    this.refreshPricing();
  }

  public applyMultiCourseDiscount(desiredMultiCourseDiscount: number): void {
    const multiCourseDiscount = Math.min(this.minimumPrice(), desiredMultiCourseDiscount);
    this.multiCourseDiscountRate = parseFloat(Big(multiCourseDiscount).div(this.cost).toFixed(2));
    this.multiCourseDiscount = multiCourseDiscount;
    this.discountMessage = multiCourseDiscount === desiredMultiCourseDiscount ? null : `${Math.round(multiCourseDiscount / this.cost * 100)}% Discount`;
    this.refreshPricing(true);
  }

  public applyShippingDiscount(): void {
    this.shippingDiscount = this.shipping;
    this.refreshPricing();
  }

  public makeFree(): void {
    this.free = true;
    this.multiCourseDiscountRate = 0;
    this.multiCourseDiscount = this.cost;
    this.promoDiscount = 0;
    this.shippingDiscount = 0;
    this.discountedCost = 0;
    this.shipping = 0;
    this.plans = {
      full: PaymentPlanState.full(0, 0),
      part: new PaymentPlanState(0, 0, 0, 1, 0, 0, 0, 0),
    };
  }

  public minimumPrice(): number {
    return parseFloat(Big(this.cost).minus(this.shipping).minus(this.multiCourseDiscount).minus(this.promoDiscount).toFixed(2));
  }

  public refreshPricing(removePlanDiscounts = false): void {
    this.discountedCost = parseFloat(Big(this.cost).minus(this.shippingDiscount).minus(this.multiCourseDiscount).minus(this.promoDiscount).toFixed(2));
    this.recalculatePlans(removePlanDiscounts);
  }

  public toCoursePrice(): CoursePrice {
    return {
      code: this.code,
      name: this.name,
      primary: this.primary,
      cost: this.cost,
      multiCourseDiscountRate: this.multiCourseDiscountRate,
      multiCourseDiscount: this.multiCourseDiscount,
      promoDiscount: this.promoDiscount,
      shippingDiscount: this.shippingDiscount,
      discountedCost: this.discountedCost,
      order: this.order,
      plans: {
        full: this.plans.full.toPlan(),
        part: this.plans.part.toPlan(),
      },
      shipping: this.shipping,
      free: this.free,
      discountMessage: this.discountMessage,
    };
  }

  private recalculatePlans(removePlanDiscounts = false): void {
    this.plans = {
      full: this.plans.full.recalculate(this.discountedCost, removePlanDiscounts),
      part: this.plans.part.recalculate(this.discountedCost, removePlanDiscounts),
    };
  }
}
