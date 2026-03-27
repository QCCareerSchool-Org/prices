import Big from 'big.js';

import { calculatePlans } from '../../calculatePlans';
import { isEventFoundationCourse, isMakeupFoundationCourse } from '../../courses';
import type { PromoCodeSpec } from '../../promoCodes';
import { promoCodeSpecs, specApplies, studentSupport100Specs, studentSupport150Specs, studentSupport50Specs } from '../../promoCodes';
import type { CourseResult, MapFunction, PriceQueryOptions } from '../../types';

export const getPromoCodeDiscountsMap = (now: Date, currencyCode: string, options?: PriceQueryOptions): MapFunction<CourseResult, CourseResult> => {
  const applies = (spec?: PromoCodeSpec): boolean => typeof spec !== 'undefined' && specApplies(spec, now, options?.discountAll, options?.promoCode, options?.school);

  const studentSupport50Applies = studentSupport50Specs.some(applies);
  const studentSupport100Applies = studentSupport100Specs.some(applies);
  const studentSupport150Applies = studentSupport150Specs.some(applies);
  const masterclassApplies = applies(promoCodeSpecs.find(v => v.code === 'MASTERCLASS')) || applies(promoCodeSpecs.find(v => v.code === 'SSMASTERCLASS'));
  const masterclass150Applies = applies(promoCodeSpecs.find(v => v.code === 'MASTERCLASS150'));
  const kit200OffApplies = applies(promoCodeSpecs.find(v => v.code === 'KIT200OFF'));
  const foundation200OApplies = applies(promoCodeSpecs.find(v => v.code === 'FOUNDATION200'));
  const tenPercentApplies = applies(promoCodeSpecs.find(v => v.code === '10PERCENT'));
  const misc50Applies = applies(promoCodeSpecs.find(v => v.code === 'PORTFOLIO50')) || applies(promoCodeSpecs.find(v => v.code === 'FANDECK50')) || applies(promoCodeSpecs.find(v => v.code === 'BRUSHSET50'));
  const fc25Applies = applies(promoCodeSpecs.find(v => v.code === 'FC25PERCENT'));
  const master300Applies = applies(promoCodeSpecs.find(v => v.code === 'MASTER300'));
  const skincare100Applies = applies(promoCodeSpecs.find(v => v.code === 'SKINCARE100'));
  const skincare300Applies = applies(promoCodeSpecs.find(v => v.code === 'SKINCARE300'));
  const mz100Applies = applies(promoCodeSpecs.find(v => v.code === 'MZ100'));

  const dgDiscount = applies(promoCodeSpecs.find(v => v.code === 'DG150'))
    ? 150
    : applies(promoCodeSpecs.find(v => v.code === 'DG200'))
      ? 200
      : applies(promoCodeSpecs.find(v => v.code === 'DG300'))
        ? 300
        : applies(promoCodeSpecs.find(v => v.code === 'DG400'))
          ? 400
          : applies(promoCodeSpecs.find(v => v.code === 'DG500'))
            ? currencyCode === 'GBP' ? 415 : 500
            : applies(promoCodeSpecs.find(v => v.code === 'WOOFGANG'))
              ? 500
              : 0;

  const dtDiscount = applies(promoCodeSpecs.find(v => v.code === 'DT150'))
    ? 150
    : applies(promoCodeSpecs.find(v => v.code === 'DT200'))
      ? 200
      : applies(promoCodeSpecs.find(v => v.code === 'DT300'))
        ? 300
        : applies(promoCodeSpecs.find(v => v.code === 'DT500'))
          ? currencyCode === 'GBP' ? 415 : 500
          : 0;

  let remainingExtraDiscount = applies(promoCodeSpecs.find(v => v.code === '50OFF'))
    ? 50
    : applies(promoCodeSpecs.find(v => v.code === '100OFF'))
      ? currencyCode === 'GBP' ? 75 : 100
      : applies(promoCodeSpecs.find(v => v.code === '150OFF'))
        ? currencyCode === 'GBP' ? 110 : 150
        : applies(promoCodeSpecs.find(v => v.code === '200OFF'))
          ? currencyCode === 'GBP' ? 150 : 200
          : applies(promoCodeSpecs.find(v => v.code === '300OFF'))
            ? 300
            : applies(promoCodeSpecs.find(v => v.code === '400OFF'))
              ? 400
              : applies(promoCodeSpecs.find(v => v.code === 'PET100OFF'))
                ? currencyCode === 'GBP' ? 75 : 100
                : applies(promoCodeSpecs.find(v => v.code === 'PET150OFF'))
                  ? currencyCode === 'GBP' ? 100 : 150
                  : applies(promoCodeSpecs.find(v => v.code === 'PET200OFF'))
                    ? currencyCode === 'GBP' ? 150 : 200
                    : applies(promoCodeSpecs.find(v => v.code === 'PET300OFF'))
                      ? 300 // £300 for UK
                      : applies(promoCodeSpecs.find(v => v.code === 'PET400OFF'))
                        ? 400 // £400 for UK
                        : applies(promoCodeSpecs.find(v => v.code === 'PET500OFF'))
                          ? 500 // £400 for UK
                          : applies(promoCodeSpecs.find(v => v.code === 'DESIGN100OFF')) || applies(promoCodeSpecs.find(v => v.code === 'EVENT100OFF'))
                            ? currencyCode === 'GBP' ? 75 : 100
                            : applies(promoCodeSpecs.find(v => v.code === 'DESIGN200OFF')) || applies(promoCodeSpecs.find(v => v.code === 'EVENT200OFF'))
                              ? currencyCode === 'GBP' ? 150 : 200
                              : applies(promoCodeSpecs.find(v => v.code === 'BOGO200'))
                                ? currencyCode === 'GBP' ? 150 : 200
                                : applies(promoCodeSpecs.find(v => v.code === 'BOGO100')) || applies(promoCodeSpecs.find(v => v.code === 'BOGOCATALYST100'))
                                  ? 100
                                  : applies(promoCodeSpecs.find(v => v.code === '2SPECIALTY100')) || applies(promoCodeSpecs.find(v => v.code === 'SPECIALTY100')) || applies(promoCodeSpecs.find(v => v.code === 'PROFITPIVOT'))
                                    ? 100
                                    : misc50Applies
                                      ? 50
                                      : applies(promoCodeSpecs.find(v => v.code === 'DAYCARE300'))
                                        ? 300
                                        : applies(promoCodeSpecs.find(v => v.code === 'BOGOMZ300'))
                                          ? 300
                                          : applies(promoCodeSpecs.find(v => v.code === 'MAKEUP100'))
                                            ? 100
                                            : applies(promoCodeSpecs.find(v => v.code === 'COACHING50'))
                                              ? 50
                                              : 0;

  const groupDiscountApplies = applies(promoCodeSpecs.find(v => v.code === 'QCGROUP'));

  let masterclassApplied = false;
  let masterclass150Applied = false;
  let foundation200OApplied = false;
  let mz100Applied = false;

  return (courseResult: CourseResult, index: number, array: CourseResult[]): CourseResult => {
    // take 25% off the discounted (before payment-plan discounts) price
    if (groupDiscountApplies && courseResult.primary) {
      const minimumPrice = parseFloat(Big(courseResult.cost).minus(courseResult.shipping).minus(courseResult.multiCourseDiscount).minus(courseResult.promoDiscount).toFixed(2));
      let discountedCost = parseFloat(Big(courseResult.cost).minus(courseResult.shippingDiscount).minus(courseResult.multiCourseDiscount).minus(courseResult.promoDiscount).toFixed(2));
      const extraDiscount = Math.min(Math.round(discountedCost * 0.25 * 100) / 100, minimumPrice);
      // for all promo discounts, add to the existing promo discount value rather than overwriting it
      const promoDiscount = parseFloat(Big(courseResult.promoDiscount).plus(extraDiscount).toFixed(2));
      discountedCost = parseFloat(Big(courseResult.cost).minus(courseResult.shippingDiscount).minus(courseResult.multiCourseDiscount).minus(promoDiscount).toFixed(2));
      const [ full, part ] = calculatePlans(courseResult.plans, discountedCost);
      return {
        ...courseResult,
        promoDiscount,
        discountedCost,
        plans: { full, part },
      };
    }

    // take 10% off the discounted (before payment-plan discounts) price
    if (tenPercentApplies) {
      const minimumPrice = parseFloat(Big(courseResult.cost).minus(courseResult.shipping).minus(courseResult.multiCourseDiscount).minus(courseResult.promoDiscount).toFixed(2));
      let discountedCost = parseFloat(Big(courseResult.cost).minus(courseResult.shippingDiscount).minus(courseResult.multiCourseDiscount).minus(courseResult.promoDiscount).toFixed(2));
      const extraDiscount = Math.min(Math.round(discountedCost * 0.1 * 100) / 100, minimumPrice);
      // for all promo discounts, add to the existing promo discount value rather than overwriting it
      const promoDiscount = parseFloat(Big(courseResult.promoDiscount).plus(extraDiscount).toFixed(2));
      discountedCost = parseFloat(Big(courseResult.cost).minus(courseResult.shippingDiscount).minus(courseResult.multiCourseDiscount).minus(promoDiscount).toFixed(2));
      const [ full, part ] = calculatePlans(courseResult.plans, discountedCost);
      return {
        ...courseResult,
        promoDiscount,
        discountedCost,
        plans: { full, part },
      };
    }

    if (foundation200OApplies && isEventFoundationCourse(courseResult.code) && !foundation200OApplied) {
      foundation200OApplied = true;
      // subtract all the discounts we have so far (use `shipping` instead of `shippingDiscount`) from the cost to determine the lowest possible price we might display (before payment-plan discounts)
      const minimumPrice = parseFloat(Big(courseResult.cost).minus(courseResult.shipping).minus(courseResult.multiCourseDiscount).minus(courseResult.promoDiscount).toFixed(2));
      const extraDiscount = Math.min(minimumPrice, 200);
      // for all promo discounts, add to the existing promo discount value rather than overwriting it
      const promoDiscount = parseFloat(Big(courseResult.promoDiscount).plus(extraDiscount).toFixed(2));
      const discountedCost = parseFloat(Big(courseResult.cost).minus(courseResult.shippingDiscount).minus(courseResult.multiCourseDiscount).minus(promoDiscount).toFixed(2));
      const [ full, part ] = calculatePlans(courseResult.plans, discountedCost);
      return {
        ...courseResult,
        promoDiscount,
        discountedCost,
        plans: { full, part },
      };
    }

    if (kit200OffApplies && isMakeupFoundationCourse(courseResult.code)) {
      // subtract all the discounts we have so far (use `shipping` instead of `shippingDiscount`) from the cost to determine the lowest possible price we might display (before payment-plan discounts)
      const minimumPrice = parseFloat(Big(courseResult.cost).minus(courseResult.shipping).minus(courseResult.multiCourseDiscount).minus(courseResult.promoDiscount).toFixed(2));
      const extraDiscount = Math.min(minimumPrice, currencyCode === 'GBP' ? 100 : 200);
      // for all promo discounts, add to the existing promo discount value rather than overwriting it
      const promoDiscount = parseFloat(Big(courseResult.promoDiscount).plus(extraDiscount).toFixed(2));
      const discountedCost = parseFloat(Big(courseResult.cost).minus(courseResult.shippingDiscount).minus(courseResult.multiCourseDiscount).minus(promoDiscount).toFixed(2));
      const [ full, part ] = calculatePlans(courseResult.plans, discountedCost);
      return {
        ...courseResult,
        promoDiscount,
        discountedCost,
        plans: { full, part },
      };
    }

    if (masterclassApplies && array.some(c => c.code === 'I2') && !masterclassApplied) {
      masterclassApplied = true;
      // subtract all the discounts we have so far (use `shipping` instead of `shippingDiscount`) from the cost to determine the lowest possible price we might display (before payment-plan discounts)
      const minimumPrice = parseFloat(Big(courseResult.cost).minus(courseResult.shipping).minus(courseResult.multiCourseDiscount).minus(courseResult.promoDiscount).toFixed(2));
      const extraDiscount = Math.min(minimumPrice, 200);
      // for all promo discounts, add to the existing promo discount value rather than overwriting it
      const promoDiscount = parseFloat(Big(courseResult.promoDiscount).plus(extraDiscount).toFixed(2));
      const discountedCost = parseFloat(Big(courseResult.cost).minus(courseResult.shippingDiscount).minus(courseResult.multiCourseDiscount).minus(promoDiscount).toFixed(2));
      const [ full, part ] = calculatePlans(courseResult.plans, discountedCost);
      return {
        ...courseResult,
        promoDiscount,
        discountedCost,
        plans: { full, part },
      };
    }

    if (masterclass150Applies && array.some(c => c.code === 'I2') && !masterclass150Applied) {
      masterclass150Applied = true;
      // subtract all the discounts we have so far (use `shipping` instead of `shippingDiscount`) from the cost to determine the lowest possible price we might display (before payment-plan discounts)
      const minimumPrice = parseFloat(Big(courseResult.cost).minus(courseResult.shipping).minus(courseResult.multiCourseDiscount).minus(courseResult.promoDiscount).toFixed(2));
      const extraDiscount = Math.min(minimumPrice, 150);
      // for all promo discounts, add to the existing promo discount value rather than overwriting it
      const promoDiscount = parseFloat(Big(courseResult.promoDiscount).plus(extraDiscount).toFixed(2));
      const discountedCost = parseFloat(Big(courseResult.cost).minus(courseResult.shippingDiscount).minus(courseResult.multiCourseDiscount).minus(promoDiscount).toFixed(2));
      const [ full, part ] = calculatePlans(courseResult.plans, discountedCost);
      return {
        ...courseResult,
        promoDiscount,
        discountedCost,
        plans: { full, part },
      };
    }

    if (dgDiscount && courseResult.code === 'DG') {
      // subtract all the discounts we have so far (use `shipping` instead of `shippingDiscount`) from the cost to determine the lowest possible price we might display (before payment-plan discounts)
      const minimumPrice = parseFloat(Big(courseResult.cost).minus(courseResult.shipping).minus(courseResult.multiCourseDiscount).minus(courseResult.promoDiscount).toFixed(2));
      const extraDiscount = Math.min(minimumPrice, dgDiscount);
      // for all promo discounts, add to the existing promo discount value rather than overwriting it
      const promoDiscount = parseFloat(Big(courseResult.promoDiscount).plus(extraDiscount).toFixed(2));
      const discountedCost = parseFloat(Big(courseResult.cost).minus(courseResult.shippingDiscount).minus(courseResult.multiCourseDiscount).minus(promoDiscount).toFixed(2));
      const [ full, part ] = calculatePlans(courseResult.plans, discountedCost);
      return {
        ...courseResult,
        promoDiscount,
        discountedCost,
        plans: { full, part },
      };
    }

    if (dtDiscount && courseResult.code === 'DT') {
      // subtract all the discounts we have so far (use `shipping` instead of `shippingDiscount`) from the cost to determine the lowest possible price we might display (before payment-plan discounts)
      const minimumPrice = parseFloat(Big(courseResult.cost).minus(courseResult.shipping).minus(courseResult.multiCourseDiscount).minus(courseResult.promoDiscount).toFixed(2));
      const extraDiscount = Math.min(minimumPrice, dtDiscount);
      // for all promo discounts, add to the existing promo discount value rather than overwriting it
      const promoDiscount = parseFloat(Big(courseResult.promoDiscount).plus(extraDiscount).toFixed(2));
      const discountedCost = parseFloat(Big(courseResult.cost).minus(courseResult.shippingDiscount).minus(courseResult.multiCourseDiscount).minus(promoDiscount).toFixed(2));
      const [ full, part ] = calculatePlans(courseResult.plans, discountedCost);
      return {
        ...courseResult,
        promoDiscount,
        discountedCost,
        plans: { full, part },
      };
    }

    if (mz100Applies && array.some(c => c.code === 'MZ') && !mz100Applied) {
      mz100Applied = true;
      // subtract all the discounts we have so far (use `shipping` instead of `shippingDiscount`) from the cost to determine the lowest possible price we might display (before payment-plan discounts)
      const minimumPrice = parseFloat(Big(courseResult.cost).minus(courseResult.shipping).minus(courseResult.multiCourseDiscount).minus(courseResult.promoDiscount).toFixed(2));
      const extraDiscount = Math.min(minimumPrice, 100);
      // for all promo discounts, add to the existing promo discount value rather than overwriting it
      const promoDiscount = parseFloat(Big(courseResult.promoDiscount).plus(extraDiscount).toFixed(2));
      const discountedCost = parseFloat(Big(courseResult.cost).minus(courseResult.shippingDiscount).minus(courseResult.multiCourseDiscount).minus(promoDiscount).toFixed(2));
      const [ full, part ] = calculatePlans(courseResult.plans, discountedCost);
      return {
        ...courseResult,
        promoDiscount,
        discountedCost,
        plans: { full, part },
      };
    }

    if (studentSupport50Applies) {
      // subtract all the discounts we have so far (use `shipping` instead of `shippingDiscount`) from the cost to determine the lowest possible price we might display (before payment-plan discounts)
      const minimumPrice = parseFloat(Big(courseResult.cost).minus(courseResult.shipping).minus(courseResult.multiCourseDiscount).minus(courseResult.promoDiscount).toFixed(2));
      const extraDiscount = Math.min(minimumPrice, 50);
      // for all promo discounts, add to the existing promo discount value rather than overwriting it
      const promoDiscount = parseFloat(Big(courseResult.promoDiscount).plus(extraDiscount).toFixed(2));
      const discountedCost = parseFloat(Big(courseResult.cost).minus(courseResult.shippingDiscount).minus(courseResult.multiCourseDiscount).minus(promoDiscount).toFixed(2));
      const [ full, part ] = calculatePlans(courseResult.plans, discountedCost);
      return {
        ...courseResult,
        promoDiscount,
        discountedCost,
        plans: { full, part },
      };
    }

    if (studentSupport100Applies) {
      // subtract all the discounts we have so far (use `shipping` instead of `shippingDiscount`) from the cost to determine the lowest possible price we might display (before payment-plan discounts)
      const minimumPrice = parseFloat(Big(courseResult.cost).minus(courseResult.shipping).minus(courseResult.multiCourseDiscount).minus(courseResult.promoDiscount).toFixed(2));
      const extraDiscount = Math.min(minimumPrice, 100);
      // for all promo discounts, add to the existing promo discount value rather than overwriting it
      const promoDiscount = parseFloat(Big(courseResult.promoDiscount).plus(extraDiscount).toFixed(2));
      const discountedCost = parseFloat(Big(courseResult.cost).minus(courseResult.shippingDiscount).minus(courseResult.multiCourseDiscount).minus(promoDiscount).toFixed(2));
      const [ full, part ] = calculatePlans(courseResult.plans, discountedCost);
      return {
        ...courseResult,
        promoDiscount,
        discountedCost,
        plans: { full, part },
      };
    }

    if (studentSupport150Applies) {
      // subtract all the discounts we have so far (use `shipping` instead of `shippingDiscount`) from the cost to determine the lowest possible price we might display (before payment-plan discounts)
      const minimumPrice = parseFloat(Big(courseResult.cost).minus(courseResult.shipping).minus(courseResult.multiCourseDiscount).minus(courseResult.promoDiscount).toFixed(2));
      const extraDiscount = Math.min(minimumPrice, 150);
      // for all promo discounts, add to the existing promo discount value rather than overwriting it
      const promoDiscount = parseFloat(Big(courseResult.promoDiscount).plus(extraDiscount).toFixed(2));
      const discountedCost = parseFloat(Big(courseResult.cost).minus(courseResult.shippingDiscount).minus(courseResult.multiCourseDiscount).minus(promoDiscount).toFixed(2));
      const [ full, part ] = calculatePlans(courseResult.plans, discountedCost);
      return {
        ...courseResult,
        promoDiscount,
        discountedCost,
        plans: { full, part },
      };
    }

    if (fc25Applies && courseResult.code === 'FC') {
      const discount = parseFloat(Big(courseResult.cost).mul(0.25).toFixed(2));
      // subtract all the discounts we have so far (use `shipping` instead of `shippingDiscount`) from the cost to determine the lowest possible price we might display (before payment-plan discounts)
      const minimumPrice = parseFloat(Big(courseResult.cost).minus(courseResult.shipping).minus(courseResult.multiCourseDiscount).minus(courseResult.promoDiscount).toFixed(2));
      const extraDiscount = Math.min(minimumPrice, discount);
      // for all promo discounts, add to the existing promo discount value rather than overwriting it
      const promoDiscount = parseFloat(Big(courseResult.promoDiscount).plus(extraDiscount).toFixed(2));
      const discountedCost = parseFloat(Big(courseResult.cost).minus(courseResult.shippingDiscount).minus(courseResult.multiCourseDiscount).minus(promoDiscount).toFixed(2));
      const [ full, part ] = calculatePlans(courseResult.plans, discountedCost);
      return {
        ...courseResult,
        promoDiscount,
        discountedCost,
        plans: { full, part },
      };
    }

    if (skincare100Applies && courseResult.code === 'MZ') {
      const discount = 100;
      // subtract all the discounts we have so far (use `shipping` instead of `shippingDiscount`) from the cost to determine the lowest possible price we might display (before payment-plan discounts)
      const minimumPrice = parseFloat(Big(courseResult.cost).minus(courseResult.shipping).minus(courseResult.multiCourseDiscount).minus(courseResult.promoDiscount).toFixed(2));
      const extraDiscount = Math.min(minimumPrice, discount);
      // for all promo discounts, add to the existing promo discount value rather than overwriting it
      const promoDiscount = parseFloat(Big(courseResult.promoDiscount).plus(extraDiscount).toFixed(2));
      const discountedCost = parseFloat(Big(courseResult.cost).minus(courseResult.shippingDiscount).minus(courseResult.multiCourseDiscount).minus(promoDiscount).toFixed(2));
      const [ full, part ] = calculatePlans(courseResult.plans, discountedCost);
      return {
        ...courseResult,
        promoDiscount,
        discountedCost,
        plans: { full, part },
      };
    }

    if ((skincare300Applies || master300Applies) && courseResult.code === 'MZ') {
      const discount = 300;
      // subtract all the discounts we have so far (use `shipping` instead of `shippingDiscount`) from the cost to determine the lowest possible price we might display (before payment-plan discounts)
      const minimumPrice = parseFloat(Big(courseResult.cost).minus(courseResult.shipping).minus(courseResult.multiCourseDiscount).minus(courseResult.promoDiscount).toFixed(2));
      const extraDiscount = Math.min(minimumPrice, discount);
      // for all promo discounts, add to the existing promo discount value rather than overwriting it
      const promoDiscount = parseFloat(Big(courseResult.promoDiscount).plus(extraDiscount).toFixed(2));
      const discountedCost = parseFloat(Big(courseResult.cost).minus(courseResult.shippingDiscount).minus(courseResult.multiCourseDiscount).minus(promoDiscount).toFixed(2));
      const [ full, part ] = calculatePlans(courseResult.plans, discountedCost);
      return {
        ...courseResult,
        promoDiscount,
        discountedCost,
        plans: { full, part },
      };
    }

    // skip free courses
    if (courseResult.free) {
      return courseResult;
    }

    // skip courses if we have used up all the remaining extra discount
    if (remainingExtraDiscount <= 0) {
      return courseResult;
    }

    // subtract all the discounts we have so far (use `shipping` instead of `shippingDiscount`) from the cost to determine the lowest possible price we might display (before payment-plan discounts)
    const minimumPrice = parseFloat(Big(courseResult.cost).minus(courseResult.shipping).minus(courseResult.multiCourseDiscount).minus(courseResult.promoDiscount).toFixed(2));

    const extraDiscount = Math.min(minimumPrice, remainingExtraDiscount);

    // reduce the remaining extra discount we have left to give to other courses
    remainingExtraDiscount = parseFloat(Big(remainingExtraDiscount).minus(extraDiscount).toFixed(2));

    // for all promo discounts, add to the existing promo discount value rather than overwriting it
    const promoDiscount = parseFloat(Big(courseResult.promoDiscount).plus(extraDiscount).toFixed(2));

    const discountedCost = parseFloat(Big(courseResult.cost).minus(courseResult.shippingDiscount).minus(courseResult.multiCourseDiscount).minus(promoDiscount).toFixed(2));

    const [ full, part ] = calculatePlans(courseResult.plans, discountedCost);

    return {
      ...courseResult,
      promoDiscount,
      discountedCost,
      plans: { full, part },
    };
  };
};
