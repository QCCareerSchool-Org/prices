import { noShipCountry } from '@qccareerschool/helper-functions';
import HttpStatus from '@qccareerschool/http-status';
import { PoolConnection } from 'promise-mysql';

import { NoShipping, PriceQueryOptions, PriceResult } from './types';
import { collateResults } from './collateResults';
import { priceRowToCourseResultMap } from './priceRowToCourseResultMap';
import { primaryMap } from './primaryMap';
import { getPromotionsMap } from './getPromotionsMap';
import { getDiscountsMap } from './getDiscountsMap';
import { getOverridesMap } from './getOverridesMap';
import { courseSort } from './courseSort';
import { getNotes } from './getNotes';
import { getDisclaimers } from './getDisclaimers';
import { lookupPrice } from './lookupPrice';
import { defaultCurrencyCode } from './defaultCurrencyCode';
import { noShippingMessage } from './noShippingMessage';
import { lookupCurrency } from './lookupCurrency';
import { getShippingMap } from './getShippingMap';

export async function prices(
  connection: PoolConnection,
  courses: string[] = [],
  countryCode: string,
  provinceCode?: string,
  options?: PriceQueryOptions,
): Promise<PriceResult> {
  // convert all course codes to upper case for easier comparison later
  courses = courses.map(c => c.toUpperCase());

  // don't allow people from Ontario to enroll in DG or FA
  if (countryCode === 'CA' && provinceCode === 'ON') {
    courses = courses.filter(course => course !== 'DG' && course !== 'FA');
  }

  // determine whether we'll be shipping materials or not
  const noShipping: NoShipping = noShipCountry(countryCode) ? 'REQUIRED' : options?.noShipping ? 'APPLIED' : 'ALLOWED' as NoShipping;

  // look up all the prices
  const priceRows = await Promise.all(courses.map(course => lookupPrice(connection, course, countryCode, provinceCode)));

  // determine the currency we'll be using
  const currencyCode = priceRows.length ? priceRows[0].currencyCode : defaultCurrencyCode(countryCode);
  if (currencyCode !== 'CAD' && currencyCode !== 'USD' && currencyCode !== 'GBP' && currencyCode !== 'AUD' && currencyCode !== 'NZD') {
    throw Error(`Invalid currency code: ${currencyCode}`);
  }

  // make sure the currency of each PriceRow is the same
  priceRows.forEach(p => {
    if (p.currencyCode !== currencyCode) {
      throw new HttpStatus.InternalServerError(`Currency mismatch: ${courses} ${countryCode} ${provinceCode}`);
    }
  });

  const now = new Date();

  // prepare the courses result
  const courseResults = priceRows
    .map(priceRowToCourseResultMap)
    .sort((a, b) => b.cost - a.cost) // sort by cost
    .map(getPromotionsMap(now, options))
    .sort((a, b) => a.free === b.free ? b.cost - a.cost : a.free ? 1 : -1) // sort by free, then cost
    .map(primaryMap) // mark first course primary and adjust other courses' installments
    .map(getShippingMap(noShipping, options)) // apply shipping discounts
    .map(getDiscountsMap(currencyCode, options)) // apply multi-course, student, and custom discounts
    .map(getOverridesMap(courses, options?.depositOverrides, options?.installmentsOverride)) // update the courseResults based on the sales agent's overrides
    .sort(courseSort);

  // look up the currency
  const currency = await lookupCurrency(connection, currencyCode);

  return collateResults(
    countryCode,
    provinceCode ?? null,
    currency,
    courseResults,
    getDisclaimers(courses, countryCode),
    getNotes(courses, noShipping, options),
    noShipping,
    noShippingMessage(noShipping, courses, countryCode),
  );
}

// type CalulatePricesFunction = (p: PriceRow, i: number, a?: PriceRow[]) => CourseResult;

// /**
//  * Returns a function that maps a PriceRow to a CourseResult
//  * @param options
//  * @param noShipping
//  * @param currencyCode
//  * @param freeCourses
//  */
// export const getCalculatePrices = (options: PriceQueryOptions | undefined, noShipping: NoShipping, currencyCode: CurrencyCode, freeCourses: string[]): CalulatePricesFunction => {

//   // determine the promotional discount
//   let promoDiscount: number;
//   const currencySpecificDiscount = options?.discount?.[currencyCode];
//   if (typeof currencySpecificDiscount !== 'undefined') {
//     promoDiscount = currencySpecificDiscount;
//   } else {
//     promoDiscount = options?.discount?.default ?? 0;
//   }

//   // all courses will have the same number of installments as the primary course
//   let originalPartInstallments: number;
//   let partInstallments: number;

//   const calculatePrices = (p: PriceRow, i: number, a?: PriceRow[]): CourseResult => {

//     if (i === 0) {
//       // all courses wll have the same number of installments as the primary course
//       originalPartInstallments = p.installments;
//       partInstallments = originalPartInstallments;
//       if (typeof options?.installmentsOverride !== 'undefined') {
//         if (options?.installmentsOverride < 1) {
//           throw new HttpStatus.BadRequest('Invalid installmentsOverride: must be greater than or equal to 1');
//         }
//         if (options?.installmentsOverride > 24) {
//           throw new HttpStatus.BadRequest('Invalid installmentsOverride: must be less than 24');
//         }
//         partInstallments = Math.round(options?.installmentsOverride);
//       }
//     }

//     const free = freeCourses.includes(p.courseCode);
//     const multiCourseDiscount = free ? p.cost : options?.discountAll || i !== 0 ? parseFloat(Big(p.cost).times(p.multiCourseDiscountRate).toFixed(2)) : 0;
//     let coursePromoDiscount = i === 0 ? promoDiscount : 0;
//     if (options?.studentDiscount && !free) {
//       coursePromoDiscount = parseFloat(Big(coursePromoDiscount).plus(p.currencyCode === 'GBP' ? 25 : 50).toFixed(2));
//     }
//     const shippingDiscount = free ? 0 : noShipping === 'APPLIED' || noShipping === 'REQUIRED' ? p.shipping : 0;
//     const discountedCost = parseFloat(Big(p.cost).minus(multiCourseDiscount).minus(coursePromoDiscount).minus(shippingDiscount).toFixed(2));

//     const fullDiscount = i === 0 && !options?.discountAll ? p.discount : 0; // payment plan discounts only apply to the primary course
//     const partDiscount = 0; // no payment plan discounts on part plan
//     const fullTotal = Math.max(0, parseFloat(Big(discountedCost).minus(fullDiscount).toFixed(2)));
//     const partTotal = Math.max(0, parseFloat(Big(discountedCost).minus(partDiscount).toFixed(2)));
//     const originalPartDeposit = p.deposit ? p.deposit : parseFloat(Big(p.cost).div(Big(p.installments).plus(1)).round(2, 0).toFixed(2));
//     let partDeposit = originalPartDeposit;
//     if (typeof options?.depositOverrides?.[p.courseCode] !== 'undefined') {
//       const depositOverride = options?.depositOverrides?.[p.courseCode];
//       // minimum deposit can't be too large
//       if (depositOverride > (free ? 0 : partTotal)) {
//         throw new HttpStatus.BadRequest(`invalid depositOverride for ${p.courseCode}: ${depositOverride} greater than total cost of ${free ? 0 : partTotal}`);
//       }
//       // minimum deposit can't be too small
//       if (depositOverride < (free ? 0 : partDeposit)) {
//         throw new HttpStatus.BadRequest(`invalid depositOverride for ${p.courseCode}: ${depositOverride} is less than default of ${free ? 0 : partDeposit}`);
//       }
//       partDeposit = depositOverride;
//     }
//     const partInstallmentSize = parseFloat(Big(partTotal).minus(partDeposit).div(partInstallments).round(2, 0).toFixed(2));
//     const partRemainder = parseFloat(Big(partTotal).minus(partDeposit).minus(Big(partInstallmentSize).times(partInstallments)).toFixed());

//     if (partTotal < 0 || fullTotal < 0) {
//       throw new HttpStatus.InternalServerError('Invalid price calculation');
//     }

//     return {
//       code: p.courseCode,
//       name: p.courseName,
//       primary: i === 0,
//       cost: p.cost,
//       multiCourseDiscount,
//       promoDiscount: coursePromoDiscount,
//       shippingDiscount,
//       discountedCost,
//       plans: {
//         full: {
//           discount: free ? 0 : fullDiscount,
//           deposit: free ? 0 : fullTotal,
//           installmentSize: 0,
//           installments: 0,
//           remainder: 0,
//           total: free ? 0 : fullTotal,
//           originalDeposit: free ? 0 : fullTotal,
//           originalInstallments: 0,
//         },
//         part: {
//           discount: free ? 0 : partDiscount,
//           deposit: free ? 0 : partDeposit,
//           installmentSize: free ? 0 : partInstallmentSize,
//           installments: free ? 0 : partInstallments,
//           remainder: free ? 0 : partRemainder,
//           total: free ? 0 : partTotal,
//           originalDeposit: free ? 0 : originalPartDeposit,
//           originalInstallments: free ? 0 : originalPartInstallments,
//         },
//       },
//       shipping: free ? 0 : p.shipping,
//       free,
//       discountMessage: free || multiCourseDiscount === 0 ? null : `${Math.round(p.multiCourseDiscountRate * 100)}% Discount`,
//     };
//   };

//   return calculatePrices;
// };

const makeupCourses = [ 'MM', 'MA', 'MZ', 'MK', 'SF', 'HS', 'AB', 'MW', 'PW', 'GB', 'SK', 'PA', 'PF', 'VM' ];
const designCourses = [ 'I2', 'ST', 'PO', 'FS', 'CC', 'AP', 'DB', 'MS', 'VD', 'FD' ];
const eventCourses = [ 'EP', 'CP', 'CE', 'WP', 'FD', 'ED', 'EB', 'LW', 'DW', 'FL', 'PE', 'TT', 'TG', 'VE' ];

export const isMakeupCourse = (course: string, exclude?: string[]): boolean => {
  return makeupCourses.filter(c => exclude?.includes(c)).includes(course);
};

export const isDesignCourse = (course: string, exclude?: string[]): boolean => {
  return designCourses.filter(c => exclude?.includes(c)).includes(course);
};

export const isEventCourse = (course: string, exclude?: string[]): boolean => {
  return eventCourses.filter(c => exclude?.includes(c)).includes(course);
};

export const isEventFoundationCourse = (course: string): boolean => {
  return [ 'EP', 'CP', 'CE', 'WP', 'FD' ].includes(course);
};

export const isEventAdvancedCourse = (course: string): boolean => {
  return [ 'ED', 'EB', 'LW', 'DW', 'FL', 'PE', 'TT', 'TG', 'VE' ].includes(course);
};
