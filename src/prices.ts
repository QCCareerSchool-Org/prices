import { noShipCountry } from '@qccareerschool/helper-functions';
import * as HttpStatus from '@qccareerschool/http-status';
import { PoolConnection } from 'promise-mysql';

import { courseSort } from './transforms/courseSort/courseSort';
import { getExtraDiscountMap } from './transforms/extraDiscountMap/getExtraDiscountMap';
import { getDefaultFreeCourseMap } from './transforms/defaultFreeCourseMap/getDefaultFreeCourseMap';
import { getMultiCourseDiscountMap } from './transforms/multiCourseDiscountMap/getMultiCourseDiscountMap';
import { priceRowToCourseResultMap } from './transforms/priceRowToCourseResultMap/priceRowToCourseResultMap';
import { primaryMap } from './transforms/primaryMap/primaryMap';
import { getOverridesMap } from './transforms/overridesMap/getOverridesMap';
import { getShippingMap } from './transforms/shippingMap/getShippingMap';
import { getStudentDiscountMap } from './transforms/studentDiscountMap/getStudentDiscountMap';
import { collateResults } from './collateResults';
import { defaultCurrencyCode } from './defaultCurrencyCode';
import { getDisclaimers } from './getDisclaimers';
import { getNotes } from './getNotes';
import { lookupCurrency } from './lookupCurrency';
import { lookupPrice } from './lookupPrice';
import { noShippingMessage } from './noShippingMessage';
import { promoCodeRecognized } from './promoCodes';
import { NoShipping, PriceQueryOptions, PriceResult } from './types';
import { getPromoCodeDiscountsMap } from './transforms/promoCodeDiscountsMap/getPromoCodeDiscountsMap';
import { getPromoCodeFreeCourseMap } from './transforms/promoCodeFreeCoursesMap/getPromoCodeFreeCoursesMap';

export async function prices(
  connection: PoolConnection,
  courses: string[] = [],
  countryCode: string,
  provinceCode?: string,
  options?: PriceQueryOptions,
): Promise<PriceResult> {
  // look up all the prices from the database
  const priceRows = await Promise.all(courses
    .map(c => c.toUpperCase()) // convert all course codes to upper case for easier comparison later
    .filter(c => countryCode !== 'CA' || provinceCode !== 'ON' || c !== 'DG' && c !== 'FA') // don't allow people from Ontario to enroll in DG or FA
    .filter((item, pos, self) => self.indexOf(item) === pos) // strip out any duplicate courses
    .map(course => lookupPrice(connection, course, countryCode, provinceCode)) // convert to priceRow promises
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

  const now = new Date();

  // prepare the courses result
  const courseResults = priceRows
    .map(priceRowToCourseResultMap) // convert to a course result
    .sort((a, b) => a.cost - b.cost) // sort by cost in ascending order
    .map(getDefaultFreeCourseMap(now, options)) // determine which courses should be free
    .sort((a, b) => a.free === b.free ? a.cost - b.cost : a.free ? 1 : -1) // sort by free in ascending order, then cost in ascending order
    .map(getPromoCodeFreeCourseMap(now, options)) // determine which courses should be free based on promo codes
    .sort((a, b) => a.free === b.free ? b.cost - a.cost : a.free ? 1 : -1) // sort by free in ascending order, then cost in descending order
    .map(primaryMap) // mark first course primary and adjust other courses' installments to match the primary course
    .map(getShippingMap(noShipping)) // apply shipping discounts
    .map(getMultiCourseDiscountMap(options)) // apply multi-course discounts
    .map(getStudentDiscountMap(currencyCode, options)) // apply student promotional discounts
    .map(getExtraDiscountMap(currencyCode, options)) // apply extra promotional discounts
    .map(getPromoCodeDiscountsMap(now, options)) // apply promotional discounts based on promo codes
    .map(getOverridesMap(courses, options?.depositOverrides, options?.installmentsOverride)) // update the courseResults based on the sales agent's overrides
    .sort(courseSort); // sort by primary, free, cost, discounted cost

  return collateResults(
    countryCode,
    provinceCode ?? null,
    await lookupCurrency(connection, currencyCode),
    courseResults,
    getDisclaimers(courses, countryCode),
    getNotes(courses, noShipping, options),
    noShipping,
    noShippingMessage(noShipping, courses, countryCode),
    promoCodeRecognized(options?.school, options?.promoCode),
  );
}
