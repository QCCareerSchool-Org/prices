import Big from 'big.js';

import type { CoursePricingState } from './CoursePricingState';
import { PromoCodes } from './PromoCodes';
import { isEventFoundationCourse, isMakeupFoundationCourse } from '../courses';

const petDiscount = (promoCode: string | undefined, currencyCode: string): number => {
  switch (promoCode) {
    case 'PET100OFF':
      return currencyCode === 'GBP' ? 75 : 100;
    case 'PET150OFF':
      return currencyCode === 'GBP' ? 100 : 150;
    case 'PET200OFF':
      return currencyCode === 'GBP' ? 150 : 200;
    case 'PET300OFF':
      return 300;
    case 'PET400OFF':
      return 400;
    case 'PET500OFF':
      return 500;
    default:
      return 0;
  }
};

const dogGroomingDiscount = (promoCode: string | undefined, currencyCode: string): number => {
  switch (promoCode) {
    case 'DG150':
      return 150;
    case 'DG200':
      return 200;
    case 'DG300':
      return 300;
    case 'DG400':
      return 400;
    case 'DG500':
      return currencyCode === 'GBP' ? 415 : 500;
    case 'WOOFGANG':
      return 500;
    default:
      return 0;
  }
};

const dogTrainingDiscount = (promoCode: string | undefined, currencyCode: string): number => {
  switch (promoCode) {
    case 'DT150':
      return 150;
    case 'DT200':
      return 200;
    case 'DT300':
      return 300;
    case 'DT500':
      return currencyCode === 'GBP' ? 415 : 500;
    default:
      return 0;
  }
};

const extraPromoDiscount = (promoCode: string | undefined, currencyCode: string): number => {
  switch (promoCode) {
    case '50OFF':
      return 50;
    case '100OFF':
      return currencyCode === 'GBP' ? 75 : 100;
    case '150OFF':
      return currencyCode === 'GBP' ? 110 : 150;
    case '200OFF':
    case 'BOGO200':
      return currencyCode === 'GBP' ? 150 : 200;
    case '300OFF':
    case 'DAYCARE300':
    case 'BOGOMZ300':
      return 300;
    case '400OFF':
      return 400;
    case 'MAKEUP100':
      return 100;
    case 'COACHING50':
      return 50;
    default:
      break;
  }

  if ([ 'DESIGN100OFF', 'EVENT100OFF' ].includes(promoCode ?? '')) {
    return currencyCode === 'GBP' ? 75 : 100;
  }

  if ([ 'DESIGN200OFF', 'EVENT200OFF' ].includes(promoCode ?? '')) {
    return currencyCode === 'GBP' ? 150 : 200;
  }

  if ([ 'BOGO100', 'BOGOCATALYST100', '2SPECIALTY100', 'SPECIALTY100', 'PROFITPIVOT' ].includes(promoCode ?? '')) {
    return 100;
  }

  if ([ 'PORTFOLIO50', 'FANDECK50', 'BRUSHSET50' ].includes(promoCode ?? '')) {
    return 50;
  }

  return petDiscount(promoCode, currencyCode);
};

export const applyPromoCodeDiscounts = (courseResults: CoursePricingState[], promoCodes: PromoCodes, currencyCode: string): void => {
  const dgDiscount = dogGroomingDiscount(promoCodes.code, currencyCode);
  const dtDiscount = dogTrainingDiscount(promoCodes.code, currencyCode);
  let remainingExtraDiscount = extraPromoDiscount(promoCodes.code, currencyCode);

  let applied = false;

  const applyDiscount = (courseResult: CoursePricingState, discount: number): void => {
    courseResult.addPromoDiscount(Math.min(courseResult.minimumPrice(), discount));
  };

  const applyPromoCodeDiscount = (courseResult: CoursePricingState, array: CoursePricingState[]): void => {
    // take 25% off the discounted (before payment-plan discounts) price
    if (promoCodes.code === 'QCGROUP' && courseResult.primary) {
      applyDiscount(courseResult, Math.round(courseResult.discountedCost * 0.25 * 100) / 100);
      return;
    }

    // take 10% off the discounted (before payment-plan discounts) price
    if (promoCodes.code === '10PERCENT') {
      applyDiscount(courseResult, Math.round(courseResult.discountedCost * 0.1 * 100) / 100);
      return;
    }

    if (promoCodes.code === 'FOUNDATION200' && isEventFoundationCourse(courseResult.code) && !applied) {
      applied = true;
      applyDiscount(courseResult, 200);
      return;
    }

    if (promoCodes.code === 'KIT200OFF' && isMakeupFoundationCourse(courseResult.code)) {
      applyDiscount(courseResult, currencyCode === 'GBP' ? 100 : 200);
      return;
    }

    if ([ 'MASTERCLASS', 'SSMASTERCLASS' ].includes(promoCodes.code ?? '') && array.some(c => c.code === 'I2') && !applied) {
      applied = true;
      applyDiscount(courseResult, 200);
      return;
    }

    if (promoCodes.code === 'MASTERCLASS150' && array.some(c => c.code === 'I2') && !applied) {
      applied = true;
      applyDiscount(courseResult, 150);
      return;
    }

    if (dgDiscount && courseResult.code === 'DG') {
      applyDiscount(courseResult, dgDiscount);
      return;
    }

    if (dtDiscount && courseResult.code === 'DT') {
      applyDiscount(courseResult, dtDiscount);
      return;
    }

    if (promoCodes.code === 'MZ100' && array.some(c => c.code === 'MZ') && !applied) {
      applied = true;
      applyDiscount(courseResult, 100);
      return;
    }

    if (PromoCodes.studentSupport50Codes.includes(promoCodes.code ?? '')) {
      applyDiscount(courseResult, 50);
      return;
    }

    if (PromoCodes.studentSupport100Codes.includes(promoCodes.code ?? '')) {
      applyDiscount(courseResult, 100);
      return;
    }

    if (PromoCodes.studentSupport150Codes.includes(promoCodes.code ?? '')) {
      applyDiscount(courseResult, 150);
      return;
    }

    if (promoCodes.code === 'FC25PERCENT' && courseResult.code === 'FC') {
      const discount = parseFloat(Big(courseResult.cost).mul(0.25).toFixed(2));
      applyDiscount(courseResult, discount);
      return;
    }

    if (promoCodes.code === 'SKINCARE100' && courseResult.code === 'MZ') {
      applyDiscount(courseResult, 100);
      return;
    }

    if ([ 'SKINCARE300', 'MASTER300' ].includes(promoCodes.code ?? '') && courseResult.code === 'MZ') {
      applyDiscount(courseResult, 300);
      return;
    }

    // skip free courses
    if (courseResult.free) {
      return;
    }

    // skip courses if we have used up all the remaining extra discount
    if (remainingExtraDiscount <= 0) {
      return;
    }

    const extraDiscount = Math.min(courseResult.minimumPrice(), remainingExtraDiscount);

    // reduce the remaining extra discount we have left to give to other courses
    remainingExtraDiscount = parseFloat(Big(remainingExtraDiscount).minus(extraDiscount).toFixed(2));

    courseResult.addPromoDiscount(extraDiscount);
  };

  for (const courseResult of courseResults) {
    applyPromoCodeDiscount(courseResult, courseResults);
  }
};
