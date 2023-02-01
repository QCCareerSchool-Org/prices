import Big from 'big.js';

import { calculatePlans } from '../../calculatePlans';
import { isMakeupFoundationCourse } from '../../courses';
import { PromoCodeSpec, promoCodeSpecs, specApplies, studentSupport150Specs, studentSupport50Specs } from '../../promoCodes';
import { CourseResult, MapFunction, PriceQueryOptions } from '../../types';

export const getPromoCodeDiscountsMap = (now: Date, currencyCode: string, options?: PriceQueryOptions): MapFunction<CourseResult, CourseResult> => {
  const applies = (spec?: PromoCodeSpec): boolean => typeof spec !== 'undefined' && specApplies(spec, now, options?.discountAll, options?.promoCode, options?.school);

  const studentSupport50Applies = studentSupport50Specs.some(applies);
  const studentSupport150Applies = studentSupport150Specs.some(applies);
  const masterclassApplies = applies(promoCodeSpecs.find(v => v.code === 'MASTERCLASS')) || applies(promoCodeSpecs.find(v => v.code === 'SSMASTERCLASS'));
  const masterclass150Applies = applies(promoCodeSpecs.find(v => v.code === 'MASTERCLASS150'));
  const kit200OffApplies = applies(promoCodeSpecs.find(v => v.code === 'KIT200OFF'));

  const dgDiscount = applies(promoCodeSpecs.find(v => v.code === 'DG150'))
    ? 150
    : applies(promoCodeSpecs.find(v => v.code === 'DG200'))
      ? 200
      : applies(promoCodeSpecs.find(v => v.code === 'DG300'))
        ? 300
        : applies(promoCodeSpecs.find(v => v.code === 'WOOFGANG'))
          ? 500
          : 0;

  const dtDiscount = applies(promoCodeSpecs.find(v => v.code === 'DT150'))
    ? 150
    : applies(promoCodeSpecs.find(v => v.code === 'DT200'))
      ? 200
      : applies(promoCodeSpecs.find(v => v.code === 'DT300'))
        ? 300
        : 0;

  let remainingExtraDiscount = applies(promoCodeSpecs.find(v => v.code === '50OFF'))
    ? 50
    : applies(promoCodeSpecs.find(v => v.code === '100OFF'))
      ? 100
      : applies(promoCodeSpecs.find(v => v.code === '150OFF'))
        ? currencyCode === 'GBP' ? 110 : 150
        : applies(promoCodeSpecs.find(v => v.code === 'PET100OFF'))
          ? currencyCode === 'GBP' ? 75 : 100
          : applies(promoCodeSpecs.find(v => v.code === 'PET150OFF'))
            ? currencyCode === 'GBP' ? 100 : 150
            : applies(promoCodeSpecs.find(v => v.code === 'PET200OFF'))
              ? currencyCode === 'GBP' ? 150 : 200
              : applies(promoCodeSpecs.find(v => v.code === 'PET300OFF'))
                ? 300 // £300 for UK
                : applies(promoCodeSpecs.find(v => v.code === 'DESIGN100OFF')) || applies(promoCodeSpecs.find(v => v.code === 'EVENT100OFF'))
                  ? currencyCode === 'GBP' ? 75 : 100
                  : applies(promoCodeSpecs.find(v => v.code === 'BOGO200'))
                    ? currencyCode === 'GBP' ? 150 : 200
                    : applies(promoCodeSpecs.find(v => v.code === 'BOGO100'))
                      ? currencyCode === 'GBP' ? 75 : 100
                      : applies(promoCodeSpecs.find(v => v.code === '2SPECIALTY100'))
                        ? currencyCode === 'GBP' ? 75 : 100
                        : 0;

  let masterclassApplied = false;
  let masterclass150Applied = false;

  return (courseResult: CourseResult, index: number, array: CourseResult[]): CourseResult => {
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
