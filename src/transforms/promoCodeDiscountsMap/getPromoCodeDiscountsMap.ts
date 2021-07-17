import Big from 'big.js';

import { calculatePlans } from '../../calculatePlans';
import { isDesignCourse, isMakeupAdvancedCourse } from '../../courses';
import { PromoCodeSpec, promoCodeSpecs, specApplies, studentSupport50Specs } from '../../promoCodes';
import { CourseResult, MapFunction, PriceQueryOptions } from '../../types';

export const getPromoCodeDiscountsMap = (now: Date, currencyCode: string, options?: PriceQueryOptions): MapFunction<CourseResult, CourseResult> => {
  const applies = (spec?: PromoCodeSpec): boolean => typeof spec !== 'undefined' && specApplies(spec, now, options?.discountAll, options?.promoCode, options?.school);

  const advanced100Applies = applies(promoCodeSpecs.find(v => v.code === 'ADVANCED100'));
  const spring100Applies = applies(promoCodeSpecs.find(v => v.code === 'SPRING100'));
  const design100Applies = applies(promoCodeSpecs.find(v => v.code === 'DESIGN100'));
  const fathersdayApplies = applies(promoCodeSpecs.find(v => v.code === 'FATHERSDAY'));
  const canada154Applies = applies(promoCodeSpecs.find(v => v.code === 'CANADA154'));
  const summer21EventApplies = applies(promoCodeSpecs.find(v => v.code === 'SUMMER21' && v.schools?.includes('QC Event School')));

  let advanced100Used = false;
  let spring100Used = false;
  let design100Used = false;
  let fathersdayUsed = false;
  let canada154Applied = false;
  let summer21EventUsed = false;

  const studentSupport50Applies = studentSupport50Specs.some(applies);

  return (courseResult: CourseResult): CourseResult => {

    if (design100Applies && design100Used === false && isDesignCourse(courseResult.code)) {
      // we can only use this promotion once
      design100Used = true;

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

    if (advanced100Applies && advanced100Used === false && isMakeupAdvancedCourse(courseResult.code)) {
      // we can only use this promotion once
      advanced100Used = true;

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

    if (spring100Applies && spring100Used === false && isDesignCourse(courseResult.code)) {
      // we can only use this promotion once
      spring100Used = true;

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

    if (fathersdayApplies && fathersdayUsed === false && (options?.school === 'QC Event School' || options?.school === 'QC Makeup Academy')) {
      // we can only use this promotion once
      fathersdayUsed = true;

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

    if (canada154Applies && canada154Applied === false) {
      // we can only use this promotion once
      canada154Applied = true;

      // subtract all the discounts we have so far (use `shipping` instead of `shippingDiscount`) from the cost to determine the lowest possible price we might display (before payment-plan discounts)
      const minimumPrice = parseFloat(Big(courseResult.cost).minus(courseResult.shipping).minus(courseResult.multiCourseDiscount).minus(courseResult.promoDiscount).toFixed(2));

      const extraDiscount = Math.min(minimumPrice, 154);

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

    if (summer21EventApplies && summer21EventUsed === false) {
      // we can only use this promotion once
      summer21EventUsed = true;

      // subtract all the discounts we have so far (use `shipping` instead of `shippingDiscount`) from the cost to determine the lowest possible price we might display (before payment-plan discounts)
      const minimumPrice = parseFloat(Big(courseResult.cost).minus(courseResult.shipping).minus(courseResult.multiCourseDiscount).minus(courseResult.promoDiscount).toFixed(2));

      const extraDiscount = Math.min(minimumPrice, currencyCode === 'GBP' ? 25 : 50);

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

    return courseResult;
  };
};
