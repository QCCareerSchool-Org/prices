import Big from 'big.js';

import type { Plan } from '@/domain/price';

export interface IPaymentPlan {
  readonly discount: Big;
  readonly deposit: Big;
  readonly installments: Big;
  readonly installmentSize: Big;
  readonly remainder: Big;
  readonly originalDeposit: Big;
  readonly originalInstallments: Big;
  readonly total: Big;
  toPlan: () => Plan;
}

abstract class PaymentPlan implements IPaymentPlan {
  public readonly total: Big = Big(0);
  public readonly discount: Big = Big(0);
  public readonly deposit: Big = Big(0);
  public readonly originalDeposit: Big = Big(0);
  public readonly installments: Big = Big(1);
  public readonly originalInstallments: Big = Big(1);
  public readonly installmentSize: Big = Big(0);
  public readonly remainder: Big = Big(0);

  public toPlan(): Plan {
    return {
      total: this.total.toNumber(),
      discount: this.discount.toNumber(),
      deposit: this.deposit.toNumber(),
      installments: this.installments.toNumber(),
      installmentSize: this.installmentSize.toNumber(),
      remainder: this.remainder.toNumber(),
      originalDeposit: this.originalDeposit.toNumber(),
      originalInstallments: this.originalInstallments.toNumber(),
    };
  }
}

export class FullPaymentPlan extends PaymentPlan {
  public readonly total: Big;
  public readonly discount: Big;
  public readonly deposit: Big;
  public readonly installments = Big(0);
  public readonly installmentSize = Big(0);
  public readonly remainder = Big(0);
  public readonly originalDeposit: Big;
  public readonly originalInstallments = Big(0);

  public constructor(cost: Big, discount: Big) {
    super();

    const total = cost.minus(discount);
    if (total.lt(0)) {
      throw Error('Negative price');
    }

    this.total = total;
    this.discount = discount;
    this.deposit = this.total;
    this.originalDeposit = this.total;
  }
}

export class InstallmentPaymentPlan extends PaymentPlan {
  public readonly total: Big;
  public readonly discount: Big;
  public readonly deposit: Big;
  public readonly originalDeposit: Big;
  public readonly installments: Big;
  public readonly originalInstallments: Big;
  public readonly installmentSize: Big;
  public readonly remainder: Big;

  public constructor(cost: Big, discount: Big, deposit: Big, installments: Big, originalDeposit: Big, originalInstallments: Big) {
    super();

    const total = cost.minus(discount);
    if (total.lt(0)) {
      throw Error('Negative price');
    }

    this.total = total;
    this.discount = discount;
    this.deposit = deposit;
    this.originalDeposit = originalDeposit;
    this.installments = installments;
    this.originalInstallments = originalInstallments;

    const installmentPortion = this.total.minus(deposit);

    if (installments.eq(0)) {
      this.installmentSize = Big(0);
    } else {
      this.installmentSize = installmentPortion.div(installments).round(2, Big.roundDown);
    }

    this.remainder = this.total.minus(deposit).minus(this.installmentSize.times(installments));
  }
}
