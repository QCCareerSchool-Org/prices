import Big from 'big.js';

import { shouldGetMultiCourseDiscount } from './shouldGetMultiCourseDiscount';
import { calculatePlans } from '../../calculatePlans';
import type { PromoCodeSpec } from '../../promoCodes';
import { promoCodeSpecs, specApplies } from '../../promoCodes';
import type { CourseResult, MapFunction, PriceQueryOptions } from '../../types';

/**
 * Creates a map function that adds the multi-course discount to course results
 *
 * @param options the PriceQueryOptions
 */
export const getMultiCourseDiscountMap = (now: Date, options?: PriceQueryOptions): MapFunction<CourseResult, CourseResult> => {
  const applies = (spec?: PromoCodeSpec): boolean => typeof spec !== 'undefined' && specApplies(spec, now, options?.discountAll, options?.promoCode, options?.school);

  const skincare60Applies = applies(promoCodeSpecs.find(v => v.code === 'SKINCARE60'));
  const nathansDayApplies = applies(promoCodeSpecs.find(v => v.code === 'NATHANSDAY'));
  const wedding21MakeupApplies = applies(promoCodeSpecs.find(v => v.code === 'WEDDING21' && v.schools?.includes('QC Makeup Academy')));
  const sfx50Applies = applies(promoCodeSpecs.find(v => v.code === 'SFX50'));
  const save60Applies = [ 'SAVE60', 'PORTFOLIO60', 'QCLASHES60', 'COLORWHEEL60' ].some(promoCode => applies(promoCodeSpecs.find(v => v.code === promoCode)));
  const organizing60Applies = applies(promoCodeSpecs.find(v => v.code === 'ORGANIZING60'));
  const styling60Applies = applies(promoCodeSpecs.find(v => v.code === 'STYLING60'));
  const portdev60Applies = applies(promoCodeSpecs.find(v => v.code === 'PORTDEV60'));
  const corporate60Applies = applies(promoCodeSpecs.find(v => v.code === 'CORPORATE60'));
  const daycare60Applies = applies(promoCodeSpecs.find(v => v.code === 'DAYCARE60'));
  const liveEvent60Applies = applies(promoCodeSpecs.find(v => v.code === 'LIVEEVENT60'));

  const sfx60Applies = applies(promoCodeSpecs.find(v => v.code === 'SFX60'));
  const business60Applies = applies(promoCodeSpecs.find(v => v.code === 'BUSINESS60'));
  const training60Applies = applies(promoCodeSpecs.find(v => v.code === 'TRAINING60'));

  return (courseResult: CourseResult, index: number, array: CourseResult[]) => {
    // skip free courses
    if (courseResult.free) {
      return courseResult;
    }

    if (
      shouldGetMultiCourseDiscount(now, index, options) ||
      (nathansDayApplies && index > 0) ||
      (liveEvent60Applies && index > 0) ||
      (skincare60Applies && courseResult.code === 'SK' && array.find(c => c.code === 'MZ')) ||
      (wedding21MakeupApplies && courseResult.code === 'HS' && array.find(c => c.code === 'MZ')) ||
      (sfx50Applies && courseResult.code === 'SF' && array.find(c => c.code === 'MZ'))
    ) {

      // subtract all the discounts we have so far (use `shipping` instead of `shippingDiscount`) from the cost to determine the lowest possible price we might display (before payment-plan discounts)
      const minimumPrice = parseFloat(Big(courseResult.cost).minus(courseResult.shipping).minus(courseResult.multiCourseDiscount).minus(courseResult.promoDiscount).toFixed(2));

      // the amount we'd like to give
      const desiredMultiCourseDiscount = (
        skincare60Applies && courseResult.code === 'SK' && array.find(c => c.code === 'MZ')) ||
        save60Applies ||
        liveEvent60Applies ||
        (organizing60Applies && courseResult.code === 'PO') ||
        (corporate60Applies && courseResult.code === 'CP') ||
        (styling60Applies && courseResult.code === 'PF') ||
        (portdev60Applies && courseResult.code === 'PW') ||
        (daycare60Applies && courseResult.code === 'DD') ||
        (sfx60Applies && courseResult.code === 'SF') ||
        (business60Applies && (courseResult.code === 'EB' || courseResult.code === 'DB')) ||
        (training60Applies && (courseResult.code === 'DT' || courseResult.code === 'DC'))
        ? parseFloat(Big(courseResult.cost).times(0.6).toFixed(2))
        : parseFloat(Big(courseResult.cost).times(courseResult.multiCourseDiscountRate).toFixed(2));

      // the true amount we'll give
      const multiCourseDiscount = Math.min(minimumPrice, desiredMultiCourseDiscount);

      const multiCourseDiscountRate = parseFloat(Big(multiCourseDiscount).div(courseResult.cost).toFixed(2));

      const discountedCost = parseFloat(Big(courseResult.cost).minus(courseResult.shippingDiscount).minus(multiCourseDiscount).minus(courseResult.promoDiscount).toFixed(2));

      const [ full, part ] = calculatePlans(courseResult.plans, discountedCost, true);

      return {
        ...courseResult,
        multiCourseDiscountRate,
        multiCourseDiscount,
        discountedCost,
        discountMessage: multiCourseDiscount === desiredMultiCourseDiscount ? null : `${Math.round(multiCourseDiscount / courseResult.cost * 100)}% Discount`, // override the discount message if we gave a different discount
        plans: { full, part },
      };
    }

    return courseResult;
  };
};
