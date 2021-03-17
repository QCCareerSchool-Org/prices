import Big from 'big.js';

import { Plan } from './types';

/**
 * Recalculates the payment plans based on the new minimum price
 * @param plans the existing payment plans
 * @param minimumPrice the new minimum price
 */
export const calculatePlans = (plans: { full: Plan, part: Plan }, minimumPrice: number): [Plan, Plan] => {
  const fullDiscount = Math.min(minimumPrice, plans.full.discount); // can't be larger than the minimum price

  const fullTotal = parseFloat(Big(minimumPrice).minus(fullDiscount).toFixed(2));

  const partDiscount = Math.min(minimumPrice, plans.part.discount); // can't be larger than the minimum price

  const partTotal = parseFloat(Big(minimumPrice).minus(partDiscount).toFixed(2));

  const partDeposit = Math.min(partTotal, plans.part.deposit); // can't be larger than the total price

  const partInstallmentSize = parseFloat(Big(partTotal).minus(partDeposit).div(plans.part.installments).round(2, 0).toFixed(2)); // always round down

  const partRemainder = parseFloat(Big(partTotal).minus(partDeposit).minus(Big(partInstallmentSize).times(plans.part.installments)).toFixed(2));

  return [
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
    {
      discount: partDiscount,
      deposit: partDeposit,
      installmentSize: partInstallmentSize,
      installments: plans.part.installments,
      remainder: partRemainder,
      total: partTotal,
      originalDeposit: partDeposit,
      originalInstallments: plans.part.originalInstallments,
    },
  ];
};
