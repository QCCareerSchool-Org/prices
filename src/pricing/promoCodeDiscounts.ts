import Big from 'big.js';

import type { CoursePricingState } from './CoursePricingState';
import { PromoCodes } from './PromoCodes';
import { isEventFoundationCourse, isMakeupFoundationCourse, isPetCourse } from '../courses';
import { bigMin } from '@/lib/bigMin';

const getPetDiscount = (promoCode: string | undefined, currencyCode: string): Big | undefined => {
  switch (promoCode) {
    case 'PET100OFF':
      return Big(currencyCode === 'GBP' ? 75 : 100);
    case 'PET150OFF':
      return Big(currencyCode === 'GBP' ? 100 : 150);
    case 'PET200OFF':
      return Big(currencyCode === 'GBP' ? 150 : 200);
    case 'PET300OFF':
      return Big(300);
    case 'PET400OFF':
      return Big(400);
    case 'PET500OFF':
      return Big(500);
  }
};

const getDogGroomingDiscount = (promoCode: string | undefined, currencyCode: string): Big | undefined => {
  switch (promoCode) {
    case 'DG150':
      return Big(150);
    case 'DG200':
      return Big(200);
    case 'DG300':
      return Big(300);
    case 'DG400':
      return Big(400);
    case 'DG500':
      return Big(currencyCode === 'GBP' ? 415 : 500);
    case 'WOOFGANG':
      return Big(500);
  }
};

const getDogTrainingDiscount = (promoCode: string | undefined, currencyCode: string): Big | undefined => {
  switch (promoCode) {
    case 'DT150':
      return Big(150);
    case 'DT200':
      return Big(200);
    case 'DT300':
      return Big(300);
    case 'DT500':
      return Big(currencyCode === 'GBP' ? 415 : 500);
  }
};

const getExtraPromoDiscount = (promoCode: string | undefined, currencyCode: string): Big | undefined => {
  switch (promoCode) {
    case '50OFF':
      return Big(50);
    case '100OFF':
      return Big(currencyCode === 'GBP' ? 75 : 100);
    case '150OFF':
      return Big(currencyCode === 'GBP' ? 110 : 150);
    case '200OFF':
    case 'BOGO200':
      return Big(currencyCode === 'GBP' ? 150 : 200);
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

  if ([ 'DESIGN100OFF', 'EVENT100OFF' ].includes(promoCode ?? '')) {
    return Big(currencyCode === 'GBP' ? 75 : 100);
  }

  if ([ 'DESIGN200OFF', 'EVENT200OFF' ].includes(promoCode ?? '')) {
    return Big(currencyCode === 'GBP' ? 150 : 200);
  }

  if ([ 'BOGO100', 'BOGOCATALYST100', '2SPECIALTY100', 'SPECIALTY100', 'PROFITPIVOT' ].includes(promoCode ?? '')) {
    return Big(100);
  }

  if ([ 'PORTFOLIO50', 'FANDECK50', 'BRUSHSET50' ].includes(promoCode ?? '')) {
    return Big(50);
  }
};

const safeApply = (courseResult: CoursePricingState, discount: Big): void => {
  courseResult.addPromoDiscount(bigMin(courseResult.discountedCost, discount));
};

export const applyPromoCodeDiscounts = (courseResults: CoursePricingState[], promoCodes: PromoCodes, currencyCode: string): void => {
  const dogGroomingDiscount = getDogGroomingDiscount(promoCodes.code, currencyCode);
  const dogTrainingDiscount = getDogTrainingDiscount(promoCodes.code, currencyCode);
  let petDiscount = getPetDiscount(promoCodes.code, currencyCode);
  let remainingExtraDiscount = getExtraPromoDiscount(promoCodes.code, currencyCode);

  const doPetDiscount = (courseResult: CoursePricingState) => {
    if (!petDiscount || petDiscount.lte(0)) {
      return;
    }

    if (!isPetCourse(courseResult.code)) {
      return;
    }

    const extraDiscount = bigMin(courseResult.discountedCost, petDiscount);
    safeApply(courseResult, extraDiscount);
    petDiscount = petDiscount.minus(extraDiscount);
  };

  let applied = false;

  const doOneTimeDiscount = (courseResult: CoursePricingState) => {
    if (applied) {
      return;
    }

    if (promoCodes.code === 'FOUNDATION200' && isEventFoundationCourse(courseResult.code)) {
      safeApply(courseResult, Big(200));
      applied = true;
      return;
    }

    // take a flat amount off
    if (promoCodes.code === 'KIT200OFF' && isMakeupFoundationCourse(courseResult.code)) {
      safeApply(courseResult, Big(currencyCode === 'GBP' ? 100 : 200));
      applied = true;
      return;
    }

    if ([ 'MASTERCLASS', 'SSMASTERCLASS' ].includes(promoCodes.code ?? '') && courseResults.some(c => c.code === 'I2')) {
      safeApply(courseResult, Big(200));
      applied = true;
      return;
    }

    if (promoCodes.code === 'MASTERCLASS150' && courseResults.some(c => c.code === 'I2')) {
      safeApply(courseResult, Big(150));
      applied = true;
      return;
    }

    if (promoCodes.code === 'MZ100' && courseResults.some(c => c.code === 'MZ')) {
      safeApply(courseResult, Big(100));
      applied = true;
      return;
    };
  };

  const doGeneralDiscount = (courseResult: CoursePricingState) => {
    if (!remainingExtraDiscount || remainingExtraDiscount.lte(0)) {
      return;
    }

    const extraDiscount = bigMin(courseResult.discountedCost, remainingExtraDiscount);
    courseResult.setPromoDiscount(extraDiscount);
    remainingExtraDiscount = remainingExtraDiscount.minus(extraDiscount);
  };

  for (const courseResult of courseResults) {
    // skip free courses
    if (courseResult.free) {
      continue;
    }

    // take a flat amount off DG
    if (dogGroomingDiscount && courseResult.code === 'DG') {
      safeApply(courseResult, dogGroomingDiscount);
      continue;
    }

    // take a flat amount off DT
    if (dogTrainingDiscount && courseResult.code === 'DT') {
      safeApply(courseResult, dogTrainingDiscount);
      continue;
    }

    // take 25% off every discounted price (before payment-plan discounts)
    if (promoCodes.code === 'QCGROUP' && courseResult.primary) {
      safeApply(courseResult, courseResult.discountedCost.times(0.25).round(2));
      continue;
    }

    // take 25% off every discounted price (before payment-plan discounts)
    if (promoCodes.code === '10PERCENT') {
      safeApply(courseResult, courseResult.discountedCost.times(0.1).round(2));
      continue;
    }

    // take 25% of FC
    if (promoCodes.code === 'FC25PERCENT' && courseResult.code === 'FC') {
      const discount = courseResult.cost.times(0.25).round(2);
      safeApply(courseResult, discount);
      continue;
    }

    // take a flat amount off MZ
    if (promoCodes.code === 'SKINCARE100' && courseResult.code === 'MZ') {
      safeApply(courseResult, Big(100));
      continue;
    }

    // take a flat amount off MZ
    if ([ 'SKINCARE300', 'MASTER300' ].includes(promoCodes.code ?? '') && courseResult.code === 'MZ') {
      safeApply(courseResult, Big(300));
      continue;
    }

    if (PromoCodes.studentSupport50Codes.includes(promoCodes.code ?? '')) {
      safeApply(courseResult, Big(50));
      continue;
    }

    if (PromoCodes.studentSupport100Codes.includes(promoCodes.code ?? '')) {
      safeApply(courseResult, Big(100));
      continue;
    }

    if (PromoCodes.studentSupport150Codes.includes(promoCodes.code ?? '')) {
      safeApply(courseResult, Big(150));
      continue;
    }

    doOneTimeDiscount(courseResult);

    doGeneralDiscount(courseResult);

    doPetDiscount(courseResult);
  }
};
