/* eslint-disable camelcase */
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import * as helpers from '@qccareerschool/helper-functions';
import * as HttpStatus from '@qccareerschool/http-status';
import { Big } from 'big.js';
import debug from 'debug';
import { PoolConnection } from 'promise-mysql';

const publicKey = fs.readFileSync(path.join(__dirname, '../public.pem'), 'utf8');

const logger = debug('qc:prices');

interface OldPriceQueryOptions {
  discountAll?: boolean;
  discount?: number;
  discountSignature?: string;
  MMFreeMW?: boolean;
  deluxeKit?: boolean;
  portfolio?: boolean;
  campaignId?: string;
  discountCode?: string;
  discountGBP?: number;
  discountSignatureGBP?: string;
}

export interface OldPriceQuery {
  courses?: string[];
  countryCode: string;
  provinceCode: string | null;
  discountAll?: number;
  options?: OldPriceQueryOptions;
  _?: number;
}

export const oldGetPrices = async (
  connection: PoolConnection,
  courses: string[] = [],
  countryCode: string,
  provinceCode: string | null,
  discountAll: number,
  options?: OldPriceQueryOptions,
): Promise<OldPriceResult> => {
  if (typeof discountAll !== 'undefined' && typeof options?.discountAll === 'undefined') {
    if (typeof options === 'undefined') {
      options = { discountAll: discountAll !== 0 };
    }
    options.discountAll = discountAll !== 0;
  }

  if (provinceCode === '') {
    provinceCode = null;
  }

  const now = new Date();
  const PRECISION = 2;

  // //////////////////////////////////////////////////////////////////////////////
  // handle inputs
  // //////////////////////////////////////////////////////////////////////////////

  // normalize course codes to uppercase
  for (let i = 0; i < courses.length; i++) {
    courses[i] = courses[i].toUpperCase();
  }

  let validDiscount = false;

  if (helpers.gbpCountry(countryCode) && typeof options?.discountGBP !== 'undefined') {
    if (typeof options.discountSignatureGBP !== 'undefined') {
      const verify = crypto.createVerify('SHA256');
      verify.update(options.discountGBP.toString());
      if (!verify.verify(publicKey, Buffer.from(options.discountSignatureGBP, 'base64'))) {
        throw new HttpStatus.BadRequest('invalid discount signature');
      }
    } else {
      throw new HttpStatus.BadRequest('invalid discount signature');
    }
    options.discount = options.discountGBP;
    validDiscount = true;
  }

  if (validDiscount === false) {
    if (typeof options?.discount !== 'undefined') {
      if (typeof options.discountSignature !== 'undefined') {
        const verify = crypto.createVerify('SHA256');
        verify.update(options.discount.toString());
        if (!verify.verify(publicKey, Buffer.from(options.discountSignature, 'base64'))) {
          throw new HttpStatus.BadRequest('invalid discount signature');
        }
      } else {
        throw new HttpStatus.BadRequest('invalid discount signature');
      }
      if (helpers.gbpCountry(countryCode)) {
        options.discount *= 0.75;
      }
    }
  }

  // //////////////////////////////////////////////////////////////////////////////
  // start with a default currency based on the country (this could change once we look up prices)
  // //////////////////////////////////////////////////////////////////////////////

  let currency: ICurrency;

  if (countryCode === 'CA') {
    currency = {
      code: 'CAD',
      symbol: '$',
      name: 'Canadian Dollars',
      exchangeRate: 0,
    };
  } else if (countryCode === 'GB') {
    currency = {
      code: 'GBP',
      symbol: '£',
      name: 'pounds sterling',
      exchangeRate: 0,
    };
  } else if (countryCode === 'AU') {
    currency = {
      code: 'AUD',
      symbol: '$',
      name: 'Australian Dollars',
      exchangeRate: 0,
    };
  } else if (countryCode === 'NZ') {
    currency = {
      code: 'NZD',
      symbol: '$',
      name: 'New Zealand Dollars',
      exchangeRate: 0,
    };
  } else {
    currency = {
      code: 'USD',
      symbol: '$',
      name: 'US Dollars',
      exchangeRate: 0,
    };
  }

  // //////////////////////////////////////////////////////////////////////////////
  // initialize the result
  // //////////////////////////////////////////////////////////////////////////////
  const result: OldPriceResult = {
    cost: 0,
    secondaryDiscount: 0,
    discount: { full: 0, accelerated: 0, part: 0 },
    deposit: { full: 0, accelerated: 0, part: 0 },
    installmentSize: { accelerated: 0, part: 0 },
    installments: { accelerated: 0, part: 0 },
    countryCode: null,
    provinceCode: null,
    currency,
    disclaimers: [],
    notes: [],
    noShipping: false,
    numCourses: 0,
    courses: {},
    discountAll: (!!(typeof options?.discountAll !== 'undefined' && options?.discountAll === true)),
    complete: false,
    noShipCountry: helpers.noShipCountry(countryCode),
  };

  // //////////////////////////////////////////////////////////////////////////////
  // figure out promotions
  // //////////////////////////////////////////////////////////////////////////////

  const freeCourses: string[] = []; // array of courses that should be free

  if (typeof options?.MMFreeMW !== 'undefined' && options?.MMFreeMW === true) {
    if (courses.includes('MM') || courses.includes('MZ')) {
      freeCourses.push('MW');
      result.notes.push('free MW course');
    }
  }

  if (typeof options?.deluxeKit !== 'undefined' && options?.deluxeKit === true) {
    if (courses.includes('MM')) {
      result.notes.push('deluxe kit');
      result.disclaimers.push('You will recieve the deluxe makeup kit with your Master Makeup Artistry course.');
    }
  }

  if (typeof options?.portfolio !== 'undefined' && options?.portfolio === true) {
    result.notes.push('portfolio');
  }

  // pet promotion
  if (courses.includes('DG')) {
    freeCourses.push('FA');
  }

  // event promotion
  let foundationCount = 0;
  [ 'EP', 'CP', 'CE', 'WP' ].forEach(course => {
    if (courses.includes(course)) {
      foundationCount++;
    }
  });
  if (foundationCount >= 1) {
    for (const course of [ 'PE', 'DW', 'LW', 'FL', 'ED', 'EB' ]) { // cheapest to most expensive
      if (courses.includes(course)) {
        freeCourses.push(course);
        break;
      }
    }
  }

  // design promotion
  const designCourses = [ 'VD', 'AP', 'MS', 'FS', 'DB', 'CC', 'PO', 'ST', 'I2' ]; // cheapest to most expensive
  let designCount = 0;
  designCourses.forEach(course => {
    if (courses.includes(course)) {
      designCount++;
    }
  });
  if (designCount >= 2) {
    for (const course of designCourses) {
      if (courses.includes(course)) {
        freeCourses.push(course);
        break; // only the first course is free
      }
    }
  }

  // makeup school promotion
  if (now >= new Date('2020-03-11T10:00:00-04:00')) {
    let freeMakeupSelected = false;
    if (courses.includes('MZ')) {
      [ 'PW', 'MW', 'GB', 'SK' ].forEach(c => {
        if (!freeMakeupSelected && courses.includes(c)) {
          freeCourses.push(c);
          freeMakeupSelected = true;
        }
      });
    }
  }

  logger(freeCourses);

  // //////////////////////////////////////////////////////////////////////////////
  // go through the courses array and get the prices from the database
  // //////////////////////////////////////////////////////////////////////////////

  let primaryCourse = '';
  let totalCost = Big(0);
  let secondaryDiscount = Big(0);

  for (const course of courses) {
    const lookup = await lookupPrice(connection, course, countryCode, provinceCode);
    if (lookup === false) {
      throw new HttpStatus.NotFound('Course not found');
    }
    result.courses[course] = lookup;
    result.numCourses++;
  }

  if (courses.length) {

    // //////////////////////////////////////////////////////////////////////////////
    // validate the course currencies and shipping statuses and figure out the
    // primary course and set free courses
    // //////////////////////////////////////////////////////////////////////////////

    primaryCourse = courses[0]; // course code of the most expensive course--default to first course
    let highestCost = result.courses[courses[0]].baseCost; // the cost of the most expensive course

    const currencyCode = result.courses[courses[0]].currency.code; // the currency of the first course

    result.noShipping = result.courses[courses[0]].noShipping; // the shipping status for the first course

    for (const course of courses) {

      // if this course is more expensive, make it the leading candidate for the primary course
      if (result.courses[course].baseCost > highestCost) {
        highestCost = result.courses[course].baseCost;
        primaryCourse = course;
      }

      // if the prices aren't all denominated in the same currency then quit
      if (currencyCode !== result.courses[course].currency.code) {
        logger('currency mismatch');
        throw new HttpStatus.InternalServerError('Shipping mismatch');
      }

      // if the shipping statuses aren't all the same then quit
      if (result.noShipping !== result.courses[course].noShipping) {
        logger('shipping mismatch');
        throw new HttpStatus.InternalServerError('Shipping mismatch');
      }

      if (freeCourses.includes(course)) { // mark this course as free
        result.courses[course].free = true;
        result.courses[course].secondaryDiscount = 1.0;
        result.courses[course].secondaryDiscountAmount = result.courses[course].baseCost;
        result.courses[course].minimumDeposit = 0; // otherwise we end up charging a deposit and negative installments
      }

    } // for (const course of courses)

    result.courses[primaryCourse].primary = true; // mark the primary course as primary

    // if discountAll is false (default), the primary course doesn't get the secondary discount
    // if discountAll is true, then no course is primary and all courses get the secondary discount
    if (result.discountAll === false) {
      result.courses[primaryCourse].secondaryDiscount = 0;
      result.courses[primaryCourse].secondaryDiscountAmount = 0;
    }

    // take these values from the primary course
    result.countryCode = result.courses[primaryCourse].countryCode;
    result.provinceCode = result.courses[primaryCourse].provinceCode;
    result.currency = result.courses[primaryCourse].currency;
    result.installments = result.courses[primaryCourse].installments;

    // figure out aggregate values of for the cost and the discounts
    for (const course of courses) {

      if (result.courses[course].primary === false || result.discountAll === true) { // for any non-primary course

        // non-primary courses don't get the payment plan discounts
        result.courses[course].discount.full = 0;
        result.courses[course].discount.part = 0;
        result.courses[course].discount.accelerated = 0;

        // adopt the payment schedule of the primary course
        result.courses[course].installments.part = result.courses[primaryCourse].installments.part;
        result.courses[course].installments.accelerated = result.courses[primaryCourse].installments.accelerated;
      }

      // add to the running totals
      totalCost = totalCost.plus(result.courses[course].baseCost);
      secondaryDiscount = secondaryDiscount.plus(result.courses[course].secondaryDiscountAmount);
    }
    result.cost = parseFloat(totalCost.toFixed(2));
    result.secondaryDiscount = parseFloat(secondaryDiscount.toFixed(2));

    // take the following values from the primary course
    result.discount.full = result.courses[primaryCourse].discount.full;
    result.discount.accelerated = result.courses[primaryCourse].discount.accelerated;
    result.discount.part = result.courses[primaryCourse].discount.part;

  }

  // //////////////////////////////////////////////////////////////////////////////
  // campaigns
  // //////////////////////////////////////////////////////////////////////////////

  if (typeof options?.discount !== 'undefined') {

    logger('got a hard-coded discount, skipping campaign check');

    result.notes.push('Discount ' + options.discount);

    result.campaign = {
      id: null,
      codeId: null,
      offerType: 'constant',
      minimumPaymentPlan: 'part',
      bonusTitle: '',
      bonusHTML: '',
      potentialDiscount: { rate: 0, full: options.discount, accelerated: options.discount, part: options.discount },
      discount: { rate: 0, full: options.discount, accelerated: options.discount, part: options.discount },
      courseRestrictionType: null,
      courses: [],
      requirementsMet: true,
    };

  } else if (typeof options?.campaignId !== 'undefined' && typeof options?.discountCode !== 'undefined') {

    logger('doing campaign check');

    // look up the campaign

    interface ICampaignRow {
      course_restriction_type: string;
      payment_plan: 'full' | 'accelerated' | 'part';
      offer_type: 'constant' | 'percentage' | 'bonus';
      bonus_title: string;
      bonus_html: string;
      offer_USD: number;
      offer_CAD: number;
      offer_GBP: number;
      offer_AUD: number;
      offer_NZD: number;
      offer_rate: number;
      code_id: number;
    }

    const strDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

    let sql = `SELECT c.course_restriction_type, c.payment_plan, c.offer_type, c.bonus_title, c.bonus_html,
                 c.offer_USD, c.offer_CAD, c.offer_GBP, c.offer_AUD, c.offer_NZD, c.offer_rate, d.id AS code_id
                 FROM dc_campaigns c
                 LEFT JOIN dc_codes d ON d.campaign_id = c.id
                 WHERE c.id = ?
                 AND d.code = ?
                 AND d.enrollment_id IS NULL
                 AND NOT c.active = 0
                 AND ('${strDate}' BETWEEN c.start AND c.end OR '${strDate}' >= c.start AND c.end IS NULL)
                 LIMIT 1`;

    let campaigns: ICampaignRow[] = await connection.query(sql, [ options.campaignId, options.discountCode ]);

    if (campaigns.length === 0) { // search again with a reusable code
      sql = `SELECT c.course_restriction_type, c.payment_plan, c.offer_type, c.bonus_title, c.bonus_html,
               c.offer_USD, c.offer_CAD, c.offer_GBP, c.offer_AUD, c.offer_NZD, c.offer_rate,
               NULL AS code_id
               FROM dc_campaigns c
               WHERE c.id = ?
               AND c.reusable_code = ?
               AND NOT c.active = 0
               AND ('${strDate}' BETWEEN c.start AND c.end OR '${strDate}' >= c.start AND c.end IS NULL)
               LIMIT 1`;

      campaigns = await connection.query(sql, [ options.campaignId, options.discountCode ]);
    }

    if (campaigns.length !== 0) { // we have a campaign row

      interface IRestrictionRow {
        course_code: string;
        name: string;
      }

      // initialize the campaign and store the campaign data
      result.campaign = {
        id: options.campaignId,
        codeId: campaigns[0].code_id,
        offerType: campaigns[0].offer_type,
        minimumPaymentPlan: campaigns[0].payment_plan,
        bonusTitle: '',
        bonusHTML: '',
        potentialDiscount: { rate: 0, full: 0, accelerated: 0, part: 0 },
        discount: { rate: 0, full: 0, accelerated: 0, part: 0 },
        courseRestrictionType: campaigns[0].course_restriction_type,
        courses: [],
        requirementsMet: false,
      };

      // get the list of course_restrictions
      const sqlRestrictions = `
  SELECT
    r.course_code,
    c.name
  FROM
    dc_course_restrictions r
  LEFT JOIN
    courses c ON c.code = r.course_code
  WHERE
    r.campaign_id = ?`;

      const restrictions: IRestrictionRow[] = await connection.query(sqlRestrictions, options.campaignId);

      for (const restriction of restrictions) {
        result.campaign.courses.push(restriction);
      }

      if (result.campaign.courseRestrictionType === null) { // no course restrictions
        result.campaign.requirementsMet = true; // automatically true

      } else if (result.campaign.courseRestrictionType === 'AND') { // all courses must be selected

        result.campaign.requirementsMet = true; // start by assuming we meet all requirements
        for (const restriction of restrictions) { // look for at least one missing course
          let courseFound = false;
          for (const course of courses) {
            if (restriction.course_code === course) { // found a match
              courseFound = true;
              break;
            }
          }
          if (!courseFound) { // if we didn't find a match for this course, then we've failed
            result.campaign.requirementsMet = false;
            break;
          }
        }

      } else if (result.campaign.courseRestrictionType === 'OR') { // at least one course must be selected

        result.campaign.requirementsMet = false; // start by assuming we didn't meet the requirement
        for (const restriction of restrictions) { // look for at least one matching course
          for (const course of courses) {
            if (restriction.course_code === course) { // found a match
              result.campaign.requirementsMet = true;
              break;
            }
          }
          if (result.campaign.requirementsMet) { // stop looking if we've found a match
            break;
          }
        }

      }

      if (result.campaign.offerType === 'constant') { // flat discount

        logger('campaign type: constant');

        // discount depends on the currency being used
        if (result.currency.code === 'USD') {
          result.campaign.potentialDiscount.full = campaigns[0].offer_USD;
          result.campaign.potentialDiscount.accelerated = campaigns[0].offer_USD;
          result.campaign.potentialDiscount.part = campaigns[0].offer_USD;
        } else if (result.currency.code === 'CAD') {
          result.campaign.potentialDiscount.full = campaigns[0].offer_CAD;
          result.campaign.potentialDiscount.accelerated = campaigns[0].offer_CAD;
          result.campaign.potentialDiscount.part = campaigns[0].offer_CAD;
        } else if (result.currency.code === 'GBP') {
          result.campaign.potentialDiscount.full = campaigns[0].offer_GBP;
          result.campaign.potentialDiscount.accelerated = campaigns[0].offer_GBP;
          result.campaign.potentialDiscount.part = campaigns[0].offer_GBP;
        } else if (result.currency.code === 'AUD') {
          result.campaign.potentialDiscount.full = campaigns[0].offer_AUD;
          result.campaign.potentialDiscount.accelerated = campaigns[0].offer_AUD;
          result.campaign.potentialDiscount.part = campaigns[0].offer_AUD;
        } else if (result.currency.code === 'NZD') {
          result.campaign.potentialDiscount.full = campaigns[0].offer_NZD;
          result.campaign.potentialDiscount.accelerated = campaigns[0].offer_NZD;
          result.campaign.potentialDiscount.part = campaigns[0].offer_NZD;
        }

        // remove discount for certain payment plans if they don't apply
        if (result.campaign.minimumPaymentPlan === 'full') { // accelerated and part payment doesn't apply
          result.campaign.potentialDiscount.accelerated = 0;
          result.campaign.potentialDiscount.part = 0;
        } else if (result.campaign.minimumPaymentPlan === 'accelerated') { // part payment doesn't apply
          result.campaign.potentialDiscount.part = 0;
        }

      } else if (result.campaign.offerType === 'percentage') { // percentage discount

        logger('campaign type: percentage');

        const PERCENTAGE_POINTS = 100;

        result.campaign.potentialDiscount.rate = round(campaigns[0].offer_rate / PERCENTAGE_POINTS, PRECISION);

        const fullCost = result.cost - result.secondaryDiscount - result.discount.full;
        result.campaign.potentialDiscount.full = round(fullCost * result.campaign.potentialDiscount.rate, PRECISION);

        if (result.campaign.minimumPaymentPlan === 'part' || result.campaign.minimumPaymentPlan === 'accelerated') {
          const partCost = result.cost - result.secondaryDiscount - result.discount.accelerated;
          result.campaign.potentialDiscount.accelerated =
            round(partCost * result.campaign.potentialDiscount.rate, PRECISION);
        }

        if (result.campaign.minimumPaymentPlan === 'part') {
          const acceleratedCost = result.cost - result.secondaryDiscount - result.discount.part;
          result.campaign.potentialDiscount.part =
            round(acceleratedCost * result.campaign.potentialDiscount.rate, PRECISION);
        }

      } else if (result.campaign.offerType === 'bonus') { // bonus offer--no discount
        result.campaign.bonusTitle = campaigns[0].bonus_title;
        result.campaign.bonusHTML = campaigns[0].bonus_html;
      }

    } // if (campaigns.length !== 0)

  } // if (typeof options.campaignId !== 'undefined' && typeof options.discountCode !== 'undefined')

  if (courses.length) {

    if (typeof result.campaign !== 'undefined' && result.campaign.requirementsMet) {

      result.campaign.discount = result.campaign.potentialDiscount;

      // Due to potential rounding errors, we will calculate the per-course campaign discount seperately from the
      // primary course. We'll first find each non-primary course's discount amounts and store the running total.
      // To calculate the primary course's discounts, subtract the running totals from the total discounts.

      // the running totals
      let totalCampaignDiscountFull = Big(0);
      let totalCampaignDiscountAccelerated = Big(0);
      let totalCampaignDiscountPart = Big(0);

      for (const course of courses) {

        logger(`course = '${course}'`);

        if (course === primaryCourse) { // this is the primary courses
          logger('skipping primary course in campaign discount calculations');
          continue; // skip this course
        }

        const c = result.courses[course]; // a reference to result.courses[course] for brevity and readability

        // const cost = c.baseCost - c.secondaryDiscountAmount;
        const cost = Big(c.baseCost).minus(c.secondaryDiscountAmount);

        // calculate the per-course campaign discounts
        const campaignDiscountFull = cost
          .minus(c.discount.full)
          .div(totalCost.minus(result.discount.full))
          .times(result.campaign.discount.full);
        const campaignDiscountAccelerated = cost
          .minus(c.discount.accelerated)
          .div(totalCost.minus(result.discount.accelerated))
          .times(result.campaign.discount.accelerated);
        const campaignDiscountPart = cost
          .minus(c.discount.part)
          .div(totalCost.minus(result.discount.part))
          .times(result.campaign.discount.part);

        c.campaignDiscount.full = parseFloat(campaignDiscountFull.toFixed(2));
        c.campaignDiscount.accelerated = parseFloat(campaignDiscountAccelerated.toFixed(2));
        c.campaignDiscount.part = parseFloat(campaignDiscountPart.toFixed(2));

        logger(`full =        '${c.campaignDiscount.full}'`);
        logger(`accelerated = '${c.campaignDiscount.accelerated}'`);
        logger(`part =        '${c.campaignDiscount.part}'`);

        // keep track of running totals
        totalCampaignDiscountFull = totalCampaignDiscountFull.plus(c.campaignDiscount.full);
        totalCampaignDiscountAccelerated = totalCampaignDiscountAccelerated.plus(c.campaignDiscount.accelerated);
        totalCampaignDiscountPart = totalCampaignDiscountPart.plus(c.campaignDiscount.part);

        logger(`totalCampaignDiscountFull =        '${totalCampaignDiscountFull}'`);

      } // for (const course of courses)

      // calculate the per-course campaign discounts
      if (courses.length !== 0) {

        result.courses[primaryCourse].campaignDiscount.full =
          parseFloat(Big(result.campaign.discount.full).minus(totalCampaignDiscountFull).toFixed(2));
        result.courses[primaryCourse].campaignDiscount.accelerated =
          parseFloat(Big(result.campaign.discount.accelerated).minus(totalCampaignDiscountAccelerated).toFixed(2));
        result.courses[primaryCourse].campaignDiscount.part =
          parseFloat(Big(result.campaign.discount.part).minus(totalCampaignDiscountPart).toFixed(2));

        logger(`course =      '${primaryCourse}'`);
        logger(`full =        '${result.courses[primaryCourse].campaignDiscount.full}'`);
        logger(`accelerated = '${result.courses[primaryCourse].campaignDiscount.accelerated}'`);
        logger(`part =        '${result.courses[primaryCourse].campaignDiscount.part}'`);
      }

    } // if (result.campaign.requirementsMet)

  } // if (courses.length)

  // //////////////////////////////////////////////////////////////////////////////
  // add disclaimers
  //
  // Note: These strings may be inserted as raw HTML by the front end application
  // Do not include any unescaped user input in them (preferably do not include
  // any user input at all). Also ensure that they are valid HTML with proper
  // closing tags.
  // //////////////////////////////////////////////////////////////////////////////

  if (courses.includes('DG') && helpers.audCountry(countryCode)) {
    result.disclaimers.push('The WAHL clippers and attachment combs will not be provided with your course. ' +
      'QC only supplies the North American version, which is not compatible with power outlets in your country. ' +
      'Your course has therefore been discounted by $280 so that you may purchase your own clippers and combs.');
  }

  if (courses.includes('DG') && helpers.gbpCountry(countryCode)) {
    result.disclaimers.push('The WAHL clippers and attachment combs will not be provided with your course. ' +
      'QC only supplies the North American version, which is not compatible with power outlets in your country. ' +
      'Your course has therefore been discounted by £150 so that you may purchase your own clippers and combs.');
  }

  if (courses.includes('DG') && countryCode === 'NZ') {
    result.disclaimers.push('The WAHL clippers and attachment combs will not be provided with your course. ' +
      'QC only supplies the North American version, which is not compatible with power outlets in your country. ' +
      'Your course has therefore been discounted by $300 so that you may purchase your own clippers and combs.');
  }

  if (courses.includes('EB')) {
    result.disclaimers.push('The Accelerate Your Business Workshop includes electronic course material only.');
  }

  if (courses.includes('FC')) {
    result.disclaimers.push('The Professional Caregiving Course includes electronic course material only.');
  }

  if (courses.includes('FL')) {
    result.disclaimers.push('The Festivals &amp; Live Events Course requires corporate event training.');
  }

  if (courses.includes('PE')) {
    result.disclaimers.push('The Promotional Event Planning Course requires corporate event training.');
  }

  // add a disclaimer for a no-ship enrollment
  if (result.noShipping) {
    const tel = helpers.telephoneNumber(countryCode);
    const noShippingMessage = 'Due to international shipping restrictions, <strong>we do not ship</strong> physical ' +
      'course materials' + (courses.some(makeupCourse) ? ', <u>including makeup kits</u>, ' : ' ') +
      'to your country. The cost of your course' + (courses.length > 1 ? 's have ' : ' has ') +
      'been reduced accordingly. You will have ' +
      'access to electronic course materials through the Online Student Center.';
    result.disclaimers.push(noShippingMessage);
    result.noShippingMessage = noShippingMessage + ' For more information please contact the School at ' +
      `<a style="color:inherit" href="tel:${tel}">${tel}.`;
  }

  // //////////////////////////////////////////////////////////////////////////////
  // calculate the deposits and installments
  // //////////////////////////////////////////////////////////////////////////////

  let totalDepositFull = Big(0);
  let totalDepositAccelerated = Big(0);
  let totalDepositPart = Big(0);

  let totalInstallmentSizePart = Big(0);
  let totalInstallmentSizeAccelerated = Big(0);

  for (const course of courses) {

    logger('Calculating installments and deposits');

    const c = result.courses[course]; // a reference to result.courses[course] for brevity and readability

    const cost = Big(c.baseCost).minus(c.secondaryDiscountAmount);
    logger(`cost is ${cost.toString()}`);

    // calculate the full-payment deposit
    const depositFull = cost.minus(c.discount.full).minus(c.campaignDiscount.full);
    c.deposit.full = parseFloat(depositFull.toFixed(2));
    logger(`full deposit is ${depositFull.toString()}`);

    // recalculate the deposit and installment size
    let installmentSizePart: Big;
    let depositPart: Big;
    if (c.installments.part === 1) {
      installmentSizePart = cost
        .minus(c.discount.part)
        .minus(c.campaignDiscount.part)
        .div(2)
        .round(2);
      depositPart = cost
        .minus(c.discount.part)
        .minus(c.campaignDiscount.part)
        .minus(installmentSizePart);
    } else {
      installmentSizePart = cost
        .minus(c.discount.part)
        .minus(c.campaignDiscount.part)
        .div(c.installments.part + 1)
        .round(0);
      depositPart = cost
        .minus(c.discount.part)
        .minus(c.campaignDiscount.part)
        .minus(installmentSizePart.times(c.installments.part));
      logger(`part installment is ${installmentSizePart.toString()}`);
      logger(`part deposit is ${depositPart.toString()}`);
      if (c.minimumDeposit !== null) { // make sure the deposit is not less than the minimum deposit
        while (depositPart.lt(c.minimumDeposit)) {
          installmentSizePart = installmentSizePart.minus(1);
          depositPart = cost
            .minus(c.discount.part)
            .minus(c.campaignDiscount.part)
            .minus(installmentSizePart.times(c.installments.part));
          logger(`oops--part installment is ${installmentSizePart.toString()}`);
          logger(`oops--part deposit is ${depositPart.toString()}`);
        }
      }
    }
    c.installmentSize.part = parseFloat(installmentSizePart.toFixed(2));
    c.deposit.part = parseFloat(depositPart.toFixed(2));

    let installmentSizeAccelerated = Big(0);
    let depositAccelerated = Big(0);
    if (c.installments.accelerated !== null) { // this course has accelerated payments as well

      logger(`number of accelerated installments: ${c.installments.accelerated}`);
      // recalculate the accelerated deposit and accelerated installment size
      if (c.installments.accelerated === 1) {
        logger('1 installment: dividing by 2...');
        installmentSizeAccelerated = cost
          .minus(c.discount.accelerated)
          .minus(c.campaignDiscount.accelerated)
          .div(2)
          .round(2);
        depositAccelerated = cost
          .minus(c.discount.accelerated)
          .minus(c.campaignDiscount.accelerated)
          .minus(installmentSizeAccelerated);
      } else {
        logger('regular installment calculations...');
        installmentSizeAccelerated = cost
          .minus(c.discount.accelerated)
          .minus(c.campaignDiscount.accelerated)
          .div(c.installments.accelerated + 1)
          .round(0);
        depositAccelerated = cost
          .minus(c.discount.accelerated)
          .minus(c.campaignDiscount.accelerated)
          .minus(installmentSizeAccelerated.times(c.installments.accelerated));
        logger(`accelerated installment is ${installmentSizeAccelerated.toString()}`);
        logger(`accelerated deposit is ${depositAccelerated.toString()}`);
        if (c.minimumDeposit !== null) { // make sure the deposit is not less than the minimum deposit
          while (depositAccelerated.lt(c.minimumDeposit)) {
            installmentSizeAccelerated = installmentSizeAccelerated.minus(1);
            depositAccelerated = cost
              .minus(c.discount.accelerated)
              .minus(c.campaignDiscount.accelerated)
              .minus(installmentSizeAccelerated.times(c.installments.accelerated));
            logger(`oops--accelerated installment is ${installmentSizeAccelerated.toString()}`);
            logger(`oops--accelerated deposit is ${depositAccelerated.toString()}`);
          }
        }
      }
      c.installmentSize.accelerated = parseFloat(installmentSizeAccelerated.toFixed(2));
      c.deposit.accelerated = parseFloat(depositAccelerated.toFixed(2));
    }

    // add to the running totals
    totalDepositFull = totalDepositFull.plus(depositFull);
    totalDepositAccelerated = totalDepositAccelerated.plus(depositAccelerated);
    totalDepositPart = totalDepositPart.plus(depositPart);
    logger(`running total full deposit is ${totalDepositFull.toString()}`);
    logger(`running total accelerated deposit is ${totalDepositAccelerated.toString()}`);
    logger(`running total part deposit is ${totalDepositPart.toString()}`);

    totalInstallmentSizePart = totalInstallmentSizePart.plus(installmentSizePart);
    totalInstallmentSizeAccelerated = totalInstallmentSizeAccelerated.plus(installmentSizeAccelerated);
    logger(`running total part instalment is ${totalInstallmentSizePart.toString()}`);
    logger(`running total accelerated instalment is ${totalInstallmentSizeAccelerated.toString()}`);
  }
  result.deposit.full += parseFloat(totalDepositFull.toFixed(2));
  result.deposit.part += parseFloat(totalDepositPart.toFixed(2));
  result.deposit.accelerated += parseFloat(totalDepositAccelerated.toFixed(2));

  result.installmentSize.part = parseFloat(totalInstallmentSizePart.toFixed(2));
  result.installmentSize.accelerated = parseFloat(totalInstallmentSizeAccelerated.toFixed(2));

  if (courses.length) {
    result.complete = true; // mark this as a valid price result
  }

  return result;
};

/**
 * look up the price for a single course
 */
async function lookupPrice(
  connection: PoolConnection,
  courseCode: string,
  countryCode: string,
  provinceCode: string | null,
): Promise<OldCourse | false> {

  interface IPriceRow {
    id: number;
    course_code: string;
    country_code: string;
    province_code: string;
    no_shipping: number;
    currency_code: string;
    cost: number;
    discount: number;
    accelerated_discount: number;
    minimum_deposit: number;
    installments: number;
    accelerated_installments: number;
    secondary_discount: number;
    currency_symbol: string;
    currency_name: string;
    exchange_rate: number;
    course_name: string;
  }

  let sql = null;
  let prices: IPriceRow[];
  const sqlStart = `
SELECT
  p.id,
  p.course_code,
  p.country_code,
  p.province_code,
  p.no_shipping,
  p.currency_code,
  p.cost,
  p.discount,
  p.accelerated_discount,
  p.minimum_deposit,
  p.installments,
  p.accelerated_installments,
  p.secondary_discount,
  c.symbol AS currency_symbol,
  c.name AS currency_name,
  c.exchange AS exchange_rate,
  d.name as course_name
FROM
  prices p
LEFT JOIN
  currencies c ON c.code = p.currency_code
LEFT JOIN
  courses d ON d.code = p.course_code
WHERE
  NOT p.enabled = 0`;

  if (typeof provinceCode !== null) {

    // check for an exact country-and-province price match
    sql = `${sqlStart} AND (course_code = ? AND country_code = ? AND province_code = ?)`;
    prices = await connection.query(sql, [ courseCode, countryCode, provinceCode ]);
    if (prices.length) {
      return createCourse(prices[0]);
    }

  }

  // check for an exact country-only price match
  sql = `${sqlStart} AND (course_code = ? AND country_code = ?)`;
  prices = await connection.query(sql, [ courseCode, countryCode ]);
  if (prices.length) {
    return createCourse(prices[0]);
  }

  if (helpers.audCountry(countryCode)) {

    // check for an Australia price match
    sql = `${sqlStart} AND (course_code = ? AND country_code = 'AU')`;
    prices = await connection.query(sql, courseCode);
    if (prices.length) {
      return createCourse(prices[0]);
    }

  } else if (helpers.gbpCountry(countryCode)) {

    // check for a UK price match
    sql = `${sqlStart} AND (course_code = ? AND country_code = 'GB')`;
    prices = await connection.query(sql, courseCode);
    if (prices.length) {
      return createCourse(prices[0]);
    }

  } else if (helpers.euroCountry(countryCode)) {

    // check for France price match
    sql = `${sqlStart} AND (course_code = ? AND country_code = 'FR')`;
    prices = await connection.query(sql, courseCode);
    if (prices.length) {
      return createCourse(prices[0]);
    }

  }

  if (helpers.noShipCountry(countryCode)) {
    // check for default no-shipping price match
    sql = `${sqlStart} AND (course_code = ? AND country_code IS NULL AND NOT no_shipping = 0)`;
    prices = await connection.query(sql, courseCode);
    if (prices.length) {
      return createCourse(prices[0]);
    }

  } else {

    // check for default price match
    sql = `${sqlStart} AND (course_code = ? AND country_code IS NULL AND no_shipping = 0)`;
    prices = await connection.query(sql, courseCode);
    if (prices.length) {
      return createCourse(prices[0]);
    }

  }

  return false;

  function createCourse(price: IPriceRow): OldCourse {

    // initialize the course
    const course: OldCourse = {
      code: price.course_code,
      name: price.course_name,
      primary: false,
      baseCost: price.cost,
      discount: {
        full: price.discount,
        accelerated: price.accelerated_discount,
        part: 0,
      },
      secondaryDiscount: price.secondary_discount,
      secondaryDiscountAmount: parseFloat(Big(price.cost).times(price.secondary_discount).toString()),
      campaignDiscount: { full: 0, accelerated: 0, part: 0 },
      deposit: {
        full: 0,
        accelerated: 0,
        part: 0,
      },
      installmentSize: {
        accelerated: 0,
        part: 0,
      },
      installments: {
        accelerated: price.accelerated_installments,
        part: price.installments,
      },
      countryCode: price.country_code,
      provinceCode: price.province_code,
      noShipping: price.no_shipping !== 0,
      currency: {
        code: price.currency_code,
        symbol: price.currency_symbol,
        name: price.currency_name,
        exchangeRate: price.exchange_rate,
      },
      minimumDeposit: price.minimum_deposit,
      free: false,
    };

    return course;
  }

}

function makeupCourse(course: string): boolean {
  return [ 'MM', 'MA', 'MZ', 'MK', 'SF', 'HS', 'AB', 'MW', 'PW', 'GB', 'SK' ].includes(course);
}

/**
 * Rounds a number off to the desired number of decimal places.
 * @param num the number to round off
 * @param precision the number of decimal places
 */
function round(num: number, precision: number): number {
  const factor = Math.pow(10, precision);
  const tempNumber = num * factor;
  const roundedTempNumber = Math.round(tempNumber);
  return roundedTempNumber / factor;
}

/**
 * Takes a number and returns it as a string. Prepends '0' for numbers less than 10.
 * @param n the number to convert and pad.
 */
function pad(n: number): string {
  if (n < 10) {
    return `0${n}`;
  }
  return n.toString();
}

interface IOptions {
  discountAll?: boolean;
  discount?: number;
  discountSignature?: string;
  MMFreeMW?: boolean;
  deluxeKit?: boolean;
  portfolio?: boolean;
  campaignId?: string;
  discountCode?: string;
  discountGBP?: number;
  discountSignatureGBP?: string;
}

export interface IInstalmentPlanTypes {
  [key: string]: number;
  accelerated: number;
  part: number;
}

export interface IPlanTypes extends IInstalmentPlanTypes {
  full: number;
}

export interface IDiscountAmounts extends IPlanTypes {
  rate: number;
}

export interface OldCourse {
  code: string;
  name: string;
  primary: boolean;
  baseCost: number;
  discount: IPlanTypes;
  secondaryDiscount: number;
  secondaryDiscountAmount: number;
  campaignDiscount: IPlanTypes;
  deposit: IPlanTypes;
  installmentSize: IInstalmentPlanTypes;
  installments: IInstalmentPlanTypes;
  countryCode: string;
  provinceCode: string;
  noShipping: boolean;
  currency: {
    code: string;
    symbol: string;
    name: string;
    exchangeRate: number;
  };
  minimumDeposit: number;
  free: boolean;
}

export interface ICampaign {
  id: string | null;
  codeId: number | null;
  offerType: 'constant' | 'percentage' | 'bonus';
  minimumPaymentPlan: 'full' | 'accelerated' | 'part';
  bonusTitle: string;
  bonusHTML: string;
  potentialDiscount: IDiscountAmounts;
  discount: IDiscountAmounts;
  courseRestrictionType: string | null;
  courses: {
    course_code: string;
    name: string;
  }[];
  requirementsMet: boolean;
}

export interface ICurrency {
  code: string;
  symbol: string;
  name: string;
  exchangeRate: number;
}

export interface OldPriceResult {
  cost: number;
  secondaryDiscount: number;
  discount: IPlanTypes;
  deposit: IPlanTypes;
  installmentSize: IInstalmentPlanTypes;
  installments: IInstalmentPlanTypes;
  countryCode: string | null;
  provinceCode: string | null;
  currency: ICurrency;
  disclaimers: string[];
  notes: string[];
  campaign?: ICampaign;
  noShipping: boolean;
  noShippingMessage?: string;
  numCourses: number;
  courses: { [course: string]: OldCourse };
  discountAll: boolean;
  complete: boolean;
  noShipCountry: boolean;
}
