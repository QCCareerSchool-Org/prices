import { noShipCountry } from '@qccareerschool/helper-functions';
import * as HttpStatus from '@qccareerschool/http-status';
import { PoolConnection } from 'promise-mysql';

import { collateResults } from './collateResults';
import { defaultCurrencyCode } from './defaultCurrencyCode';
import { lookupCurrency } from './lookupCurrency';
import { lookupPrice } from './lookupPrice';
import { noShippingMessage } from './noShippingMessage';
import { notesAndDisclaimers } from './notesAndDisclaimers';
import { promoCodeRecognized } from './promoCodes';
import { courseSort } from './transforms/courseSort/courseSort';
import { getDefaultFreeDesignExistingStudentMap } from './transforms/defaultFreeCourseMap/design/existingStudentMap';
import { getDefaultFreeDesignNewStudentMap } from './transforms/defaultFreeCourseMap/design/newStudentMap';
import { getDefaultFreeEventExistingStudentMap } from './transforms/defaultFreeCourseMap/event/existingStudentMap';
import { getDefaultFreeEventNewStudentMap } from './transforms/defaultFreeCourseMap/event/newStudentMap';
import { getDefaultFreeMakeupExistingStudentMap } from './transforms/defaultFreeCourseMap/makeup/existingStudentMap';
import { getDefaultFreeMakeupNewStudentMap } from './transforms/defaultFreeCourseMap/makeup/newStudentMap';
import { getDefaultFreePetExistingStudentMap } from './transforms/defaultFreeCourseMap/pet/existingStudentMap';
import { getDefaultFreePetNewStudentMap } from './transforms/defaultFreeCourseMap/pet/newStudentMap';
import { getExtraDiscountMap } from './transforms/extraDiscountMap/getExtraDiscountMap';
import { getMultiCourseDiscountMap } from './transforms/multiCourseDiscountMap/getMultiCourseDiscountMap';
import { getOverridesMap } from './transforms/overridesMap/getOverridesMap';
import { priceRowToCourseResultMap } from './transforms/priceRowToCourseResultMap/priceRowToCourseResultMap';
import { primaryMap } from './transforms/primaryMap/primaryMap';
import { getPromoCodeDiscountsMap } from './transforms/promoCodeDiscountsMap/getPromoCodeDiscountsMap';
import { getPromoCodeFreeCourseMap } from './transforms/promoCodeFreeCoursesMap/getPromoCodeFreeCoursesMap';
import { getPromoCodeSort } from './transforms/promoCodeSort/getPromoCodeSort';
import { getShippingMap } from './transforms/shippingMap/getShippingMap';
import { getStudentDiscountMap } from './transforms/studentDiscountMap/getStudentDiscountMap';
import { CourseResult, NoShipping, PriceQueryOptions, PriceResult } from './types';

export async function prices(
  connection: PoolConnection,
  courses: string[] = [],
  countryCode: string,
  provinceCode?: string,
  options?: PriceQueryOptions,
): Promise<PriceResult> {
  // look up all the prices from the database
  const priceRows = await Promise.all(
    courses
      .map(c => c.toUpperCase()) // convert all course codes to upper case for easier comparison later
      .filter((item, pos, self) => self.indexOf(item) === pos) // strip out any duplicate courses
      .map(async course => lookupPrice(connection, course, countryCode, provinceCode)), // convert to priceRow promises
  );

  // determine the currency we'll be using
  // if we have one or more price rows, pick the currency of the first price row (it doesn't matter which we pick); otherwise choose a currency based on the country
  const currencyCode = priceRows.length ? priceRows[0].currencyCode : defaultCurrencyCode(countryCode);

  // only accept certain currencies
  if (currencyCode !== 'CAD' && currencyCode !== 'USD' && currencyCode !== 'GBP' && currencyCode !== 'AUD' && currencyCode !== 'NZD') {
    throw Error(`Invalid currency code: ${currencyCode}`);
  }

  // make sure each price row uses the same currency
  if (priceRows.some(p => p.currencyCode !== currencyCode)) {
    throw new HttpStatus.InternalServerError(`Currency mismatch: ${courses} ${countryCode} ${provinceCode}`);
  }

  // determine whether we'll be shipping materials or not
  const noShipping: NoShipping = noShipCountry(countryCode) ? 'REQUIRED' : options?.noShipping ? 'APPLIED' : 'ALLOWED' as NoShipping;

  const now = process.env.NODE_ENV !== 'production'
    ? options?.dateOverride ?? new Date()
    : new Date();

  const freeCourseMap = options?.school === 'QC Design School'
    ? options?.discountAll === true ? getDefaultFreeDesignExistingStudentMap(now) : getDefaultFreeDesignNewStudentMap(now)
    : options?.school === 'QC Event School'
      ? options?.discountAll === true ? getDefaultFreeEventExistingStudentMap(now) : getDefaultFreeEventNewStudentMap(now)
      : options?.school === 'QC Pet Studies'
        ? options?.discountAll === true ? getDefaultFreePetExistingStudentMap(now) : getDefaultFreePetNewStudentMap(now)
        : options?.school === 'QC Makeup Academy'
          ? options?.discountAll === true ? getDefaultFreeMakeupExistingStudentMap(now) : getDefaultFreeMakeupNewStudentMap(now)
          : (c: CourseResult) => c; // identity function (do nothing)

  // const courseResults = priceRows
  //   .map(priceRowToCourseResultMap) // convert to a course result
  //   .sort((a, b) => a.cost - b.cost) // sort by cost in ascending order (cheapest first)
  //   .map(freeCourseMap) // determine which courses shoul be free by default
  //   .sort((a, b) => (a.free === b.free ? a.cost - b.cost : a.free ? 1 : -1)) // sort by free in ascending order (free last), then cost in ascending order (cheapest first)
  //   .sort(getPromoCodeSort(now, options))
  //   .map(getPromoCodeFreeCourseMap(now, options)) // determine which courses should be free based on promo codes
  //   .sort((a, b) => (a.free === b.free ? b.cost - a.cost : a.free ? 1 : -1)) // sort by free in ascending order (free last), then cost in descending order (cheapest last)
  //   .map(primaryMap) // mark first course primary and adjust other courses' installments to match the primary course
  //   .map(getShippingMap(noShipping)) // apply shipping discounts
  //   .map(getMultiCourseDiscountMap(now, options)) // apply multi-course discounts
  //   .map(getStudentDiscountMap(currencyCode, options)) // apply student promotional discounts
  //   .map(getExtraDiscountMap(currencyCode, options)) // apply extra promotional discounts
  //   .map(getPromoCodeDiscountsMap(now, currencyCode, options)) // apply promotional discounts based on promo codes
  //   .map(getOverridesMap(courses, options?.depositOverrides, options?.installmentsOverride)) // update the courseResults based on the sales agent's overrides
  //   .sort(courseSort); // sort by primary, free, cost, discounted cost

  const rand = Math.random().toString(32);
  const c1 = priceRows.map(priceRowToCourseResultMap); // convert to a course result
  console.log(rand, c1);
  const c2 = c1.sort((a, b) => a.cost - b.cost); // sort by cost in ascending order (cheapest first)
  console.log(rand, c2);
  const c3 = c2.map(freeCourseMap); // determine which courses shoul be free by default
  console.log(rand, c3);
  const c4 = c3.sort((a, b) => (a.free === b.free ? a.cost - b.cost : a.free ? 1 : -1)); // sort by free in ascending order (free last), then cost in ascending order (cheapest first)
  console.log(rand, c4);
  const c5 = c4.sort(getPromoCodeSort(now, options));
  console.log(rand, c5);
  const c6 = c5.map(getPromoCodeFreeCourseMap(now, options)); // determine which courses should be free based on promo codes
  console.log(rand, c6);
  const c7 = c6.sort((a, b) => (a.free === b.free ? b.cost - a.cost : a.free ? 1 : -1)); // sort by free in ascending order (free last), then cost in descending order (cheapest last)
  console.log(rand, c7);
  const c8 = c7.map(primaryMap); // mark first course primary and adjust other courses' installments to match the primary course
  console.log(rand, c8);
  const c9 = c8.map(getShippingMap(noShipping)); // apply shipping discounts
  console.log(rand, c9);
  const c10 = c9.map(getMultiCourseDiscountMap(now, options)); // apply multi-course discounts
  console.log(rand, c10);
  const c11 = c10.map(getStudentDiscountMap(currencyCode, options)); // apply student promotional discounts
  console.log(rand, c11);
  const c12 = c11.map(getExtraDiscountMap(currencyCode, options)); // apply extra promotional discounts
  console.log(rand, c12);
  const c13 = c12.map(getPromoCodeDiscountsMap(now, currencyCode, options)); // apply promotional discounts based on promo codes
  console.log(rand, c13);
  const c14 = c13.map(getOverridesMap(courses, options?.depositOverrides, options?.installmentsOverride)); // update the courseResults based on the sales agent's overrides
  console.log(rand, c14);
  const courseResults = c14.sort(courseSort); // sort by primary, free, cost, discounted cost
  console.log(rand, courseResults);

  const [ notes, disclaimers, promoWarnings ] = notesAndDisclaimers(now, courses, countryCode, noShipping, options);

  const recognized = promoCodeRecognized(now, options);

  return collateResults(
    countryCode,
    provinceCode ?? null,
    await lookupCurrency(connection, currencyCode),
    courseResults,
    disclaimers,
    notes,
    promoWarnings,
    noShipping,
    noShippingMessage(noShipping, courses, countryCode),
    recognized,
    recognized ? options?.promoCode : undefined,
  );
}
