import Big from 'big.js';

import type { IPaymentPlan } from './paymentPlan';
import { FullPaymentPlan, InstallmentPaymentPlan } from './paymentPlan';
import type { CoursePriceDTO } from '../domain/price';
import type { RawPrice } from '../domain/rawPrice';

export class CoursePrice {
  private readonly _code: string;
  private readonly _name: string;
  private readonly _cost: Big;
  private _discountedCost: Big;
  private _discountMessage: string | null = null;
  private _free = false;
  private _multiCourseDiscount: Big;
  private _multiCourseDiscountRate: Big;
  private readonly _order: number;
  private _partInstallments: Big;
  private readonly _plans: { full: IPaymentPlan; part: IPaymentPlan };
  private _primary = true;
  private _promoDiscount: Big;
  private _multiCourseDiscountApplied = false;
  private fullDiscount: Big;
  private partDiscount: Big;
  private partDeposit: Big;
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

    this._cost = Big(p.cost).round(2);
    this._multiCourseDiscountRate = Big(p.multiCourseDiscountRate).round(2);
    this._multiCourseDiscount = Big(0);
    this.fullDiscount = Big(p.discount).round(2);
    this.partDiscount = Big(p.partDiscount).round(2);
    this.partDeposit = Big(p.deposit).round(2);
    this.partDepositOverride = this.partDeposit;
    this._partInstallments = Big(p.installments ?? 0);
    this.partInstallmentsOverride = this._partInstallments;
    this._promoDiscount = promoDiscount.round(2);
    this._discountedCost = this._cost.minus(this._multiCourseDiscount).minus(this._promoDiscount);
    this._code = p.courseCode;
    this._name = p.courseName;
    this._order = p.order;
    this._plans = {
      full: this.getFullPlan(),
      part: this.getPartPlan(),
    };
  }

  public get code(): string {
    return this._code;
  }

  public get name(): string {
    return this._name;
  }

  public get cost(): Big {
    return this._cost;
  }

  public get discountedCost(): Big {
    return this._discountedCost;
  }

  public get discountMessage(): string | null {
    return this._discountMessage;
  }

  public get free(): boolean {
    return this._free;
  }

  public get multiCourseDiscount(): Big {
    return this._multiCourseDiscount;
  }

  public get multiCourseDiscountRate(): Big {
    return this._multiCourseDiscountRate;
  }

  public get order(): number {
    return this._order;
  }

  public get plans(): { readonly full: IPaymentPlan; readonly part: IPaymentPlan } {
    return this._plans;
  }

  public get primary(): boolean {
    return this._primary;
  }

  public get partInstallments(): Big {
    return this._partInstallments;
  }

  public get promoDiscount(): Big {
    return this._promoDiscount;
  }

  public get multiCourseDiscountApplied(): boolean {
    return this._multiCourseDiscountApplied;
  }

  public setPromoDiscount(discount: Big): void {
    if (discount.lt(0) || discount.gt(this.cost)) {
      throw Error('Invalid discount');
    }

    this._promoDiscount = discount.round(2);
    this._discountedCost = this.cost.minus(this.multiCourseDiscount).minus(this.promoDiscount);
    this.recalculateFullPlan();
    this.recalculatePartPlan();
  }

  public addPromoDiscount(discount: Big): void {
    if (discount.lt(0)) {
      throw Error('Invalid discount');
    }

    const additionalDiscount = discount.gt(this.discountedCost) ? this.discountedCost : discount.round(2);
    this._promoDiscount = this.promoDiscount.plus(additionalDiscount);
    this._discountedCost = this.cost.minus(this.multiCourseDiscount).minus(this.promoDiscount);
    this.recalculateFullPlan();
    this.recalculatePartPlan();
  }

  public applyMultiCourseDiscount(overrideRate: Big | undefined): void {
    if (overrideRate) {
      if (overrideRate.lt(0) || overrideRate.gt(1)) {
        throw Error('Invalid override rate');
      }

      this._multiCourseDiscountRate = overrideRate;
    }

    this._multiCourseDiscountApplied = true;
    this._promoDiscount = Big(0);
    this._multiCourseDiscount = this.cost.times(this.multiCourseDiscountRate).round(2);
    this._discountedCost = this.cost.minus(this.multiCourseDiscount).minus(this.promoDiscount);
    this._discountMessage = `${this.multiCourseDiscountRate.times(100).round(0).toNumber()}% Discount`;
    this.recalculateFullPlan();
    this.recalculatePartPlan();
  }

  public makeFree(): void {
    this._free = true;
    this._promoDiscount = Big(0);
    this._multiCourseDiscountRate = Big(1);
    this._multiCourseDiscount = this.cost;
    this.fullDiscount = Big(0);
    this.partDiscount = Big(0);
    this.partDeposit = Big(0);
    this.partDepositOverride = Big(0);
    this._partInstallments = Big(0);
    this.partInstallmentsOverride = Big(0);
    this._discountedCost = this.cost.minus(this.multiCourseDiscount).minus(this.promoDiscount);
    this.recalculateFullPlan();
    this.recalculatePartPlan();
  }

  public markSecondary() {
    this._primary = false;
    this.fullDiscount = Big(0);
    this.partDiscount = Big(0);
    this.recalculateFullPlan();
    this.recalculatePartPlan();
  }

  public setPartInstallments(installments: Big) {
    if (installments.lt(0) || installments.gt(24)) {
      throw Error('Invalid installments value');
    }

    this._partInstallments = installments.round(0);
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
    this._plans.full = this.getFullPlan();
  }

  private recalculatePartPlan() {
    this._plans.part = this.getPartPlan();
  }

  private getFullPlan(): FullPaymentPlan {
    return new FullPaymentPlan(this.discountedCost, this.fullDiscount);
  }

  private getPartPlan(): InstallmentPaymentPlan {
    return new InstallmentPaymentPlan(this.discountedCost, this.partDiscount, this.partDepositOverride, this.partInstallmentsOverride, this.partDeposit, this.partInstallments);
  }
}
