"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.oldGetPrices = void 0;
var helpers = __importStar(require("@qccareerschool/helper-functions"));
var HttpStatus = __importStar(require("@qccareerschool/http-status"));
var big_js_1 = require("big.js");
var crypto_1 = __importDefault(require("crypto"));
var debug_1 = __importDefault(require("debug"));
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var publicKey = fs_1.default.readFileSync(path_1.default.join(__dirname, '../public.pem'), 'utf8');
var logger = debug_1.default('qc:prices');
exports.oldGetPrices = function (connection, courses, countryCode, provinceCode, discountAll, options) { return __awaiter(void 0, void 0, void 0, function () {
    var now, PRECISION, i, validDiscount, verify, verify, currency, result, freeCourses, foundationCount, _i, _a, course, designCourses, designCount, _b, designCourses_1, course, freeMakeupSelected_1, primaryCourse, totalCost, secondaryDiscount, _c, courses_1, course, lookup, highestCost, currencyCode, _d, courses_2, course, _e, courses_3, course, strDate, sql, campaigns, sqlRestrictions, restrictions, _f, restrictions_1, restriction, _g, restrictions_2, restriction, courseFound, _h, courses_4, course, _j, restrictions_3, restriction, _k, courses_5, course, PERCENTAGE_POINTS, fullCost, partCost, acceleratedCost, totalCampaignDiscountFull, totalCampaignDiscountAccelerated, totalCampaignDiscountPart, _l, courses_6, course, c, cost, campaignDiscountFull, campaignDiscountAccelerated, campaignDiscountPart, tel, noShippingMessage, totalDepositFull, totalDepositAccelerated, totalDepositPart, totalInstallmentSizePart, totalInstallmentSizeAccelerated, _m, courses_7, course, c, cost, depositFull, installmentSizePart, depositPart, installmentSizeAccelerated, depositAccelerated;
    return __generator(this, function (_o) {
        switch (_o.label) {
            case 0:
                if (typeof discountAll !== 'undefined' && typeof (options === null || options === void 0 ? void 0 : options.discountAll) === 'undefined') {
                    if (typeof options === 'undefined') {
                        options = { discountAll: discountAll !== 0 };
                    }
                    options.discountAll = discountAll !== 0;
                }
                if (provinceCode === '') {
                    provinceCode = null;
                }
                now = new Date();
                PRECISION = 2;
                ////////////////////////////////////////////////////////////////////////////////
                // handle inputs
                ////////////////////////////////////////////////////////////////////////////////
                // normalize course codes to uppercase
                for (i = 0; i < courses.length; i++) {
                    courses[i] = courses[i].toUpperCase();
                }
                logger(courses);
                // don't allow people from Ontario to enroll in DG or FA
                if (countryCode === 'CA' && provinceCode === 'ON') {
                    courses = courses.filter(function (value) { return value !== 'DG' && value !== 'FA'; });
                }
                validDiscount = false;
                if (helpers.gbpCountry(countryCode) && typeof (options === null || options === void 0 ? void 0 : options.discountGBP) !== 'undefined') {
                    if (typeof options.discountSignatureGBP !== 'undefined') {
                        verify = crypto_1.default.createVerify('SHA256');
                        verify.update(options.discountGBP.toString());
                        if (!verify.verify(publicKey, Buffer.from(options.discountSignatureGBP, 'base64'))) {
                            throw new HttpStatus.BadRequest('invalid discount signature');
                        }
                    }
                    else {
                        throw new HttpStatus.BadRequest('invalid discount signature');
                    }
                    options.discount = options.discountGBP;
                    validDiscount = true;
                }
                if (validDiscount === false) {
                    if (typeof (options === null || options === void 0 ? void 0 : options.discount) !== 'undefined') {
                        if (typeof options.discountSignature !== 'undefined') {
                            verify = crypto_1.default.createVerify('SHA256');
                            verify.update(options.discount.toString());
                            if (!verify.verify(publicKey, Buffer.from(options.discountSignature, 'base64'))) {
                                throw new HttpStatus.BadRequest('invalid discount signature');
                            }
                        }
                        else {
                            throw new HttpStatus.BadRequest('invalid discount signature');
                        }
                        if (helpers.gbpCountry(countryCode)) {
                            options.discount *= 0.75;
                        }
                    }
                }
                if (countryCode === 'CA') {
                    currency = {
                        code: 'CAD',
                        symbol: '$',
                        name: 'Canadian Dollars',
                        exchangeRate: 0,
                    };
                }
                else if (countryCode === 'GB') {
                    currency = {
                        code: 'GBP',
                        symbol: '£',
                        name: 'pounds sterling',
                        exchangeRate: 0,
                    };
                }
                else if (countryCode === 'AU') {
                    currency = {
                        code: 'AUD',
                        symbol: '$',
                        name: 'Australian Dollars',
                        exchangeRate: 0,
                    };
                }
                else if (countryCode === 'NZ') {
                    currency = {
                        code: 'NZD',
                        symbol: '$',
                        name: 'New Zealand Dollars',
                        exchangeRate: 0,
                    };
                }
                else {
                    currency = {
                        code: 'USD',
                        symbol: '$',
                        name: 'US Dollars',
                        exchangeRate: 0,
                    };
                }
                result = {
                    cost: 0,
                    secondaryDiscount: 0,
                    discount: { full: 0, accelerated: 0, part: 0 },
                    deposit: { full: 0, accelerated: 0, part: 0 },
                    installmentSize: { accelerated: 0, part: 0 },
                    installments: { accelerated: 0, part: 0 },
                    countryCode: null,
                    provinceCode: null,
                    currency: currency,
                    disclaimers: [],
                    notes: [],
                    noShipping: false,
                    numCourses: 0,
                    courses: {},
                    discountAll: (typeof (options === null || options === void 0 ? void 0 : options.discountAll) !== 'undefined' && (options === null || options === void 0 ? void 0 : options.discountAll) === true ? true : false),
                    complete: false,
                    noShipCountry: helpers.noShipCountry(countryCode),
                };
                freeCourses = [];
                if (typeof (options === null || options === void 0 ? void 0 : options.MMFreeMW) !== 'undefined' && (options === null || options === void 0 ? void 0 : options.MMFreeMW) === true) {
                    if (courses.indexOf('MM') !== -1 || courses.indexOf('MZ') !== -1) {
                        freeCourses.push('MW');
                        result.notes.push('free MW course');
                    }
                }
                if (typeof (options === null || options === void 0 ? void 0 : options.deluxeKit) !== 'undefined' && (options === null || options === void 0 ? void 0 : options.deluxeKit) === true) {
                    if (courses.indexOf('MM') !== -1) {
                        result.notes.push('deluxe kit');
                        result.disclaimers.push('You will recieve the deluxe makeup kit with your Master Makeup Artistry course.');
                    }
                }
                if (typeof (options === null || options === void 0 ? void 0 : options.portfolio) !== 'undefined' && (options === null || options === void 0 ? void 0 : options.portfolio) === true) {
                    result.notes.push('portfolio');
                }
                // pet promotion
                if (courses.indexOf('DG') !== -1) {
                    freeCourses.push('FA');
                }
                foundationCount = 0;
                ['EP', 'CP', 'CE', 'WP'].forEach(function (course) {
                    if (courses.indexOf(course) !== -1) {
                        foundationCount++;
                    }
                });
                if (foundationCount >= 1) {
                    for (_i = 0, _a = ['PE', 'DW', 'LW', 'FL', 'ED', 'EB']; _i < _a.length; _i++) { // cheapest to most expensive
                        course = _a[_i];
                        if (courses.includes(course)) {
                            freeCourses.push(course);
                            break;
                        }
                    }
                }
                designCourses = ['VD', 'AP', 'MS', 'FS', 'DB', 'CC', 'PO', 'ST', 'I2'];
                designCount = 0;
                designCourses.forEach(function (course) {
                    if (courses.includes(course)) {
                        designCount++;
                    }
                });
                if (designCount >= 2) {
                    for (_b = 0, designCourses_1 = designCourses; _b < designCourses_1.length; _b++) {
                        course = designCourses_1[_b];
                        if (courses.includes(course)) {
                            freeCourses.push(course);
                            break; // only the first course is free
                        }
                    }
                }
                // makeup school promotion
                if (now >= new Date('2020-03-11T10:00:00-04:00')) {
                    freeMakeupSelected_1 = false;
                    if (courses.includes('MZ')) {
                        ['PW', 'MW', 'GB', 'SK'].forEach(function (c) {
                            if (!freeMakeupSelected_1 && courses.includes(c)) {
                                freeCourses.push(c);
                                freeMakeupSelected_1 = true;
                            }
                        });
                    }
                }
                logger(freeCourses);
                primaryCourse = '';
                totalCost = big_js_1.Big(0);
                secondaryDiscount = big_js_1.Big(0);
                _c = 0, courses_1 = courses;
                _o.label = 1;
            case 1:
                if (!(_c < courses_1.length)) return [3 /*break*/, 4];
                course = courses_1[_c];
                return [4 /*yield*/, lookupPrice(connection, course, countryCode, provinceCode)];
            case 2:
                lookup = _o.sent();
                if (lookup === false) {
                    throw new HttpStatus.NotFound('Course not found');
                }
                result.courses[course] = lookup;
                result.numCourses++;
                _o.label = 3;
            case 3:
                _c++;
                return [3 /*break*/, 1];
            case 4:
                if (courses.length) {
                    ////////////////////////////////////////////////////////////////////////////////
                    // validate the course currencies and shipping statuses and figure out the
                    // primary course and set free courses
                    ////////////////////////////////////////////////////////////////////////////////
                    primaryCourse = courses[0]; // course code of the most expensive course--default to first course
                    highestCost = result.courses[courses[0]].baseCost;
                    currencyCode = result.courses[courses[0]].currency.code;
                    result.noShipping = result.courses[courses[0]].noShipping; // the shipping status for the first course
                    for (_d = 0, courses_2 = courses; _d < courses_2.length; _d++) {
                        course = courses_2[_d];
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
                        if (freeCourses.indexOf(course) !== -1) { // mark this course as free
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
                    for (_e = 0, courses_3 = courses; _e < courses_3.length; _e++) {
                        course = courses_3[_e];
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
                if (!(typeof (options === null || options === void 0 ? void 0 : options.discount) !== 'undefined')) return [3 /*break*/, 5];
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
                return [3 /*break*/, 10];
            case 5:
                if (!(typeof (options === null || options === void 0 ? void 0 : options.campaignId) !== 'undefined' && typeof (options === null || options === void 0 ? void 0 : options.discountCode) !== 'undefined')) return [3 /*break*/, 10];
                logger('doing campaign check');
                strDate = now.getFullYear() + "-" + pad(now.getMonth() + 1) + "-" + pad(now.getDate());
                sql = "SELECT c.course_restriction_type, c.payment_plan, c.offer_type, c.bonus_title, c.bonus_html,\n                 c.offer_USD, c.offer_CAD, c.offer_GBP, c.offer_AUD, c.offer_NZD, c.offer_rate, d.id AS code_id\n                 FROM dc_campaigns c\n                 LEFT JOIN dc_codes d ON d.campaign_id = c.id\n                 WHERE c.id = ?\n                 AND d.code = ?\n                 AND d.enrollment_id IS NULL\n                 AND NOT c.active = 0\n                 AND ('" + strDate + "' BETWEEN c.start AND c.end OR '" + strDate + "' >= c.start AND c.end IS NULL)\n                 LIMIT 1";
                return [4 /*yield*/, connection.query(sql, [options.campaignId, options.discountCode])];
            case 6:
                campaigns = _o.sent();
                if (!(campaigns.length === 0)) return [3 /*break*/, 8];
                sql = "SELECT c.course_restriction_type, c.payment_plan, c.offer_type, c.bonus_title, c.bonus_html,\n               c.offer_USD, c.offer_CAD, c.offer_GBP, c.offer_AUD, c.offer_NZD, c.offer_rate,\n               NULL AS code_id\n               FROM dc_campaigns c\n               WHERE c.id = ?\n               AND c.reusable_code = ?\n               AND NOT c.active = 0\n               AND ('" + strDate + "' BETWEEN c.start AND c.end OR '" + strDate + "' >= c.start AND c.end IS NULL)\n               LIMIT 1";
                return [4 /*yield*/, connection.query(sql, [options.campaignId, options.discountCode])];
            case 7:
                campaigns = _o.sent();
                _o.label = 8;
            case 8:
                if (!(campaigns.length !== 0)) return [3 /*break*/, 10];
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
                sqlRestrictions = "\n  SELECT\n    r.course_code,\n    c.name\n  FROM\n    dc_course_restrictions r\n  LEFT JOIN\n    courses c ON c.code = r.course_code\n  WHERE\n    r.campaign_id = ?";
                return [4 /*yield*/, connection.query(sqlRestrictions, options.campaignId)];
            case 9:
                restrictions = _o.sent();
                for (_f = 0, restrictions_1 = restrictions; _f < restrictions_1.length; _f++) {
                    restriction = restrictions_1[_f];
                    result.campaign.courses.push(restriction);
                }
                if (result.campaign.courseRestrictionType === null) { // no course restrictions
                    result.campaign.requirementsMet = true; // automatically true
                }
                else if (result.campaign.courseRestrictionType === 'AND') { // all courses must be selected
                    result.campaign.requirementsMet = true; // start by assuming we meet all requirements
                    for (_g = 0, restrictions_2 = restrictions; _g < restrictions_2.length; _g++) { // look for at least one missing course
                        restriction = restrictions_2[_g];
                        courseFound = false;
                        for (_h = 0, courses_4 = courses; _h < courses_4.length; _h++) {
                            course = courses_4[_h];
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
                }
                else if (result.campaign.courseRestrictionType === 'OR') { // at least one course must be selected
                    result.campaign.requirementsMet = false; // start by assuming we didn't meet the requirement
                    for (_j = 0, restrictions_3 = restrictions; _j < restrictions_3.length; _j++) { // look for at least one matching course
                        restriction = restrictions_3[_j];
                        for (_k = 0, courses_5 = courses; _k < courses_5.length; _k++) {
                            course = courses_5[_k];
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
                    }
                    else if (result.currency.code === 'CAD') {
                        result.campaign.potentialDiscount.full = campaigns[0].offer_CAD;
                        result.campaign.potentialDiscount.accelerated = campaigns[0].offer_CAD;
                        result.campaign.potentialDiscount.part = campaigns[0].offer_CAD;
                    }
                    else if (result.currency.code === 'GBP') {
                        result.campaign.potentialDiscount.full = campaigns[0].offer_GBP;
                        result.campaign.potentialDiscount.accelerated = campaigns[0].offer_GBP;
                        result.campaign.potentialDiscount.part = campaigns[0].offer_GBP;
                    }
                    else if (result.currency.code === 'AUD') {
                        result.campaign.potentialDiscount.full = campaigns[0].offer_AUD;
                        result.campaign.potentialDiscount.accelerated = campaigns[0].offer_AUD;
                        result.campaign.potentialDiscount.part = campaigns[0].offer_AUD;
                    }
                    else if (result.currency.code === 'NZD') {
                        result.campaign.potentialDiscount.full = campaigns[0].offer_NZD;
                        result.campaign.potentialDiscount.accelerated = campaigns[0].offer_NZD;
                        result.campaign.potentialDiscount.part = campaigns[0].offer_NZD;
                    }
                    // remove discount for certain payment plans if they don't apply
                    if (result.campaign.minimumPaymentPlan === 'full') { // accelerated and part payment doesn't apply
                        result.campaign.potentialDiscount.accelerated = 0;
                        result.campaign.potentialDiscount.part = 0;
                    }
                    else if (result.campaign.minimumPaymentPlan === 'accelerated') { // part payment doesn't apply
                        result.campaign.potentialDiscount.part = 0;
                    }
                }
                else if (result.campaign.offerType === 'percentage') { // percentage discount
                    logger('campaign type: percentage');
                    PERCENTAGE_POINTS = 100;
                    result.campaign.potentialDiscount.rate = round(campaigns[0].offer_rate / PERCENTAGE_POINTS, PRECISION);
                    fullCost = result.cost - result.secondaryDiscount - result.discount.full;
                    result.campaign.potentialDiscount.full = round(fullCost * result.campaign.potentialDiscount.rate, PRECISION);
                    if (result.campaign.minimumPaymentPlan === 'part' || result.campaign.minimumPaymentPlan === 'accelerated') {
                        partCost = result.cost - result.secondaryDiscount - result.discount.accelerated;
                        result.campaign.potentialDiscount.accelerated =
                            round(partCost * result.campaign.potentialDiscount.rate, PRECISION);
                    }
                    if (result.campaign.minimumPaymentPlan === 'part') {
                        acceleratedCost = result.cost - result.secondaryDiscount - result.discount.part;
                        result.campaign.potentialDiscount.part =
                            round(acceleratedCost * result.campaign.potentialDiscount.rate, PRECISION);
                    }
                }
                else if (result.campaign.offerType === 'bonus') { // bonus offer--no discount
                    result.campaign.bonusTitle = campaigns[0].bonus_title;
                    result.campaign.bonusHTML = campaigns[0].bonus_html;
                }
                _o.label = 10;
            case 10:
                if (courses.length) {
                    if (typeof result.campaign !== 'undefined' && result.campaign.requirementsMet) {
                        result.campaign.discount = result.campaign.potentialDiscount;
                        totalCampaignDiscountFull = big_js_1.Big(0);
                        totalCampaignDiscountAccelerated = big_js_1.Big(0);
                        totalCampaignDiscountPart = big_js_1.Big(0);
                        for (_l = 0, courses_6 = courses; _l < courses_6.length; _l++) {
                            course = courses_6[_l];
                            logger("course = '" + course + "'");
                            if (course === primaryCourse) { // this is the primary courses
                                logger('skipping primary course in campaign discount calculations');
                                continue; // skip this course
                            }
                            c = result.courses[course];
                            cost = big_js_1.Big(c.baseCost).minus(c.secondaryDiscountAmount);
                            campaignDiscountFull = cost
                                .minus(c.discount.full)
                                .div(totalCost.minus(result.discount.full))
                                .times(result.campaign.discount.full);
                            campaignDiscountAccelerated = cost
                                .minus(c.discount.accelerated)
                                .div(totalCost.minus(result.discount.accelerated))
                                .times(result.campaign.discount.accelerated);
                            campaignDiscountPart = cost
                                .minus(c.discount.part)
                                .div(totalCost.minus(result.discount.part))
                                .times(result.campaign.discount.part);
                            c.campaignDiscount.full = parseFloat(campaignDiscountFull.toFixed(2));
                            c.campaignDiscount.accelerated = parseFloat(campaignDiscountAccelerated.toFixed(2));
                            c.campaignDiscount.part = parseFloat(campaignDiscountPart.toFixed(2));
                            logger("full =        '" + c.campaignDiscount.full + "'");
                            logger("accelerated = '" + c.campaignDiscount.accelerated + "'");
                            logger("part =        '" + c.campaignDiscount.part + "'");
                            // keep track of running totals
                            totalCampaignDiscountFull = totalCampaignDiscountFull.plus(c.campaignDiscount.full);
                            totalCampaignDiscountAccelerated = totalCampaignDiscountAccelerated.plus(c.campaignDiscount.accelerated);
                            totalCampaignDiscountPart = totalCampaignDiscountPart.plus(c.campaignDiscount.part);
                            logger("totalCampaignDiscountFull =        '" + totalCampaignDiscountFull + "'");
                        } // for (const course of courses)
                        // calculate the per-course campaign discounts
                        if (courses.length !== 0) {
                            result.courses[primaryCourse].campaignDiscount.full =
                                parseFloat(big_js_1.Big(result.campaign.discount.full).minus(totalCampaignDiscountFull).toFixed(2));
                            result.courses[primaryCourse].campaignDiscount.accelerated =
                                parseFloat(big_js_1.Big(result.campaign.discount.accelerated).minus(totalCampaignDiscountAccelerated).toFixed(2));
                            result.courses[primaryCourse].campaignDiscount.part =
                                parseFloat(big_js_1.Big(result.campaign.discount.part).minus(totalCampaignDiscountPart).toFixed(2));
                            logger("course =      '" + primaryCourse + "'");
                            logger("full =        '" + result.courses[primaryCourse].campaignDiscount.full + "'");
                            logger("accelerated = '" + result.courses[primaryCourse].campaignDiscount.accelerated + "'");
                            logger("part =        '" + result.courses[primaryCourse].campaignDiscount.part + "'");
                        }
                    } // if (result.campaign.requirementsMet)
                } // if (courses.length)
                ////////////////////////////////////////////////////////////////////////////////
                // add disclaimers
                //
                // Note: These strings may be inserted as raw HTML by the front end application
                // Do not include any unescaped user input in them (preferably do not include
                // any user input at all). Also ensure that they are valid HTML with proper
                // closing tags.
                ////////////////////////////////////////////////////////////////////////////////
                if (courses.indexOf('DG') !== -1 && helpers.audCountry(countryCode)) {
                    result.disclaimers.push('The WAHL clippers and attachment combs will not be provided with your course. ' +
                        'QC only supplies the North American version, which is not compatible with power outlets in your country. ' +
                        'Your course has therefore been discounted by $280 so that you may purchase your own clippers and combs.');
                }
                if (courses.indexOf('DG') !== -1 && helpers.gbpCountry(countryCode)) {
                    result.disclaimers.push('The WAHL clippers and attachment combs will not be provided with your course. ' +
                        'QC only supplies the North American version, which is not compatible with power outlets in your country. ' +
                        'Your course has therefore been discounted by £150 so that you may purchase your own clippers and combs.');
                }
                if (courses.indexOf('DG') !== -1 && countryCode === 'NZ') {
                    result.disclaimers.push('The WAHL clippers and attachment combs will not be provided with your course. ' +
                        'QC only supplies the North American version, which is not compatible with power outlets in your country. ' +
                        'Your course has therefore been discounted by $300 so that you may purchase your own clippers and combs.');
                }
                if (courses.indexOf('EB') !== -1) {
                    result.disclaimers.push('The Accelerate Your Business Workshop includes electronic course material only.');
                }
                if (courses.indexOf('FC') !== -1) {
                    result.disclaimers.push('The Professional Caregiving Course includes electronic course material only.');
                }
                if (courses.indexOf('FL') !== -1) {
                    result.disclaimers.push('The Festivals &amp; Live Events Course requires corporate event training.');
                }
                if (courses.indexOf('PE') !== -1) {
                    result.disclaimers.push('The Promotional Event Planning Course requires corporate event training.');
                }
                // add a disclaimer for a no-ship enrollment
                if (result.noShipping) {
                    tel = helpers.telephoneNumber(countryCode);
                    noShippingMessage = 'Due to international shipping restrictions, <strong>we do not ship</strong> physical ' +
                        'course materials' + (courses.some(makeupCourse) ? ', <u>including makeup kits</u>, ' : ' ') +
                        'to your country. The cost of your course' + (courses.length > 1 ? 's have ' : ' has ') +
                        'been reduced accordingly. You will have ' +
                        'access to electronic course materials through the Online Student Center.';
                    result.disclaimers.push(noShippingMessage);
                    result.noShippingMessage = noShippingMessage + ' For more information please contact the School at ' +
                        ("<a style=\"color:inherit\" href=\"tel:" + tel + "\">" + tel + ".");
                }
                totalDepositFull = big_js_1.Big(0);
                totalDepositAccelerated = big_js_1.Big(0);
                totalDepositPart = big_js_1.Big(0);
                totalInstallmentSizePart = big_js_1.Big(0);
                totalInstallmentSizeAccelerated = big_js_1.Big(0);
                for (_m = 0, courses_7 = courses; _m < courses_7.length; _m++) {
                    course = courses_7[_m];
                    logger('Calculating installments and deposits');
                    c = result.courses[course];
                    cost = big_js_1.Big(c.baseCost).minus(c.secondaryDiscountAmount);
                    logger("cost is " + cost.toString());
                    depositFull = cost.minus(c.discount.full).minus(c.campaignDiscount.full);
                    c.deposit.full = parseFloat(depositFull.toFixed(2));
                    logger("full deposit is " + depositFull.toString());
                    installmentSizePart = void 0;
                    depositPart = void 0;
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
                    }
                    else {
                        installmentSizePart = cost
                            .minus(c.discount.part)
                            .minus(c.campaignDiscount.part)
                            .div(c.installments.part + 1)
                            .round(0);
                        depositPart = cost
                            .minus(c.discount.part)
                            .minus(c.campaignDiscount.part)
                            .minus(installmentSizePart.times(c.installments.part));
                        logger("part installment is " + installmentSizePart.toString());
                        logger("part deposit is " + depositPart.toString());
                        if (c.minimumDeposit !== null) { // make sure the deposit is not less than the minimum deposit
                            while (depositPart.lt(c.minimumDeposit)) {
                                installmentSizePart = installmentSizePart.minus(1);
                                depositPart = cost
                                    .minus(c.discount.part)
                                    .minus(c.campaignDiscount.part)
                                    .minus(installmentSizePart.times(c.installments.part));
                                logger("oops--part installment is " + installmentSizePart.toString());
                                logger("oops--part deposit is " + depositPart.toString());
                            }
                        }
                    }
                    c.installmentSize.part = parseFloat(installmentSizePart.toFixed(2));
                    c.deposit.part = parseFloat(depositPart.toFixed(2));
                    installmentSizeAccelerated = big_js_1.Big(0);
                    depositAccelerated = big_js_1.Big(0);
                    if (c.installments.accelerated !== null) { // this course has accelerated payments as well
                        logger("number of accelerated installments: " + c.installments.accelerated);
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
                        }
                        else {
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
                            logger("accelerated installment is " + installmentSizeAccelerated.toString());
                            logger("accelerated deposit is " + depositAccelerated.toString());
                            if (c.minimumDeposit !== null) { // make sure the deposit is not less than the minimum deposit
                                while (depositAccelerated.lt(c.minimumDeposit)) {
                                    installmentSizeAccelerated = installmentSizeAccelerated.minus(1);
                                    depositAccelerated = cost
                                        .minus(c.discount.accelerated)
                                        .minus(c.campaignDiscount.accelerated)
                                        .minus(installmentSizeAccelerated.times(c.installments.accelerated));
                                    logger("oops--accelerated installment is " + installmentSizeAccelerated.toString());
                                    logger("oops--accelerated deposit is " + depositAccelerated.toString());
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
                    logger("running total full deposit is " + totalDepositFull.toString());
                    logger("running total accelerated deposit is " + totalDepositAccelerated.toString());
                    logger("running total part deposit is " + totalDepositPart.toString());
                    totalInstallmentSizePart = totalInstallmentSizePart.plus(installmentSizePart);
                    totalInstallmentSizeAccelerated = totalInstallmentSizeAccelerated.plus(installmentSizeAccelerated);
                    logger("running total part instalment is " + totalInstallmentSizePart.toString());
                    logger("running total accelerated instalment is " + totalInstallmentSizeAccelerated.toString());
                }
                result.deposit.full += parseFloat(totalDepositFull.toFixed(2));
                result.deposit.part += parseFloat(totalDepositPart.toFixed(2));
                result.deposit.accelerated += parseFloat(totalDepositAccelerated.toFixed(2));
                result.installmentSize.part = parseFloat(totalInstallmentSizePart.toFixed(2));
                result.installmentSize.accelerated = parseFloat(totalInstallmentSizeAccelerated.toFixed(2));
                if (courses.length) {
                    result.complete = true; // mark this as a valid price result
                }
                return [2 /*return*/, result];
        }
    });
}); };
/**
 * look up the price for a single course
 */
function lookupPrice(connection, courseCode, countryCode, provinceCode) {
    return __awaiter(this, void 0, void 0, function () {
        function createCourse(price) {
            // initialize the course
            var course = {
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
                secondaryDiscountAmount: parseFloat(big_js_1.Big(price.cost).times(price.secondary_discount).toString()),
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
                noShipping: price.no_shipping === 0 ? false : true,
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
        var sql, prices, sqlStart;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    sql = null;
                    sqlStart = "\nSELECT\n  p.id,\n  p.course_code,\n  p.country_code,\n  p.province_code,\n  p.no_shipping,\n  p.currency_code,\n  p.cost,\n  p.discount,\n  p.accelerated_discount,\n  p.minimum_deposit,\n  p.installments,\n  p.accelerated_installments,\n  p.secondary_discount,\n  c.symbol AS currency_symbol,\n  c.name AS currency_name,\n  c.exchange AS exchange_rate,\n  d.name as course_name\nFROM\n  prices p\nLEFT JOIN\n  currencies c ON c.code = p.currency_code\nLEFT JOIN\n  courses d ON d.code = p.course_code\nWHERE\n  NOT p.enabled = 0";
                    if (!(typeof provinceCode !== null)) return [3 /*break*/, 2];
                    // check for an exact country-and-province price match
                    sql = sqlStart + " AND (course_code = ? AND country_code = ? AND province_code = ?)";
                    return [4 /*yield*/, connection.query(sql, [courseCode, countryCode, provinceCode])];
                case 1:
                    prices = _a.sent();
                    if (prices.length) {
                        return [2 /*return*/, createCourse(prices[0])];
                    }
                    _a.label = 2;
                case 2:
                    // check for an exact country-only price match
                    sql = sqlStart + " AND (course_code = ? AND country_code = ?)";
                    return [4 /*yield*/, connection.query(sql, [courseCode, countryCode])];
                case 3:
                    prices = _a.sent();
                    if (prices.length) {
                        return [2 /*return*/, createCourse(prices[0])];
                    }
                    if (!helpers.audCountry(countryCode)) return [3 /*break*/, 5];
                    // check for an Australia price match
                    sql = sqlStart + " AND (course_code = ? AND country_code = 'AU')";
                    return [4 /*yield*/, connection.query(sql, courseCode)];
                case 4:
                    prices = _a.sent();
                    if (prices.length) {
                        return [2 /*return*/, createCourse(prices[0])];
                    }
                    return [3 /*break*/, 9];
                case 5:
                    if (!helpers.gbpCountry(countryCode)) return [3 /*break*/, 7];
                    // check for a UK price match
                    sql = sqlStart + " AND (course_code = ? AND country_code = 'GB')";
                    return [4 /*yield*/, connection.query(sql, courseCode)];
                case 6:
                    prices = _a.sent();
                    if (prices.length) {
                        return [2 /*return*/, createCourse(prices[0])];
                    }
                    return [3 /*break*/, 9];
                case 7:
                    if (!helpers.euroCountry(countryCode)) return [3 /*break*/, 9];
                    // check for France price match
                    sql = sqlStart + " AND (course_code = ? AND country_code = 'FR')";
                    return [4 /*yield*/, connection.query(sql, courseCode)];
                case 8:
                    prices = _a.sent();
                    if (prices.length) {
                        return [2 /*return*/, createCourse(prices[0])];
                    }
                    _a.label = 9;
                case 9:
                    if (!helpers.noShipCountry(countryCode)) return [3 /*break*/, 11];
                    // check for default no-shipping price match
                    sql = sqlStart + " AND (course_code = ? AND country_code IS NULL AND NOT no_shipping = 0)";
                    return [4 /*yield*/, connection.query(sql, courseCode)];
                case 10:
                    prices = _a.sent();
                    if (prices.length) {
                        return [2 /*return*/, createCourse(prices[0])];
                    }
                    return [3 /*break*/, 13];
                case 11:
                    // check for default price match
                    sql = sqlStart + " AND (course_code = ? AND country_code IS NULL AND no_shipping = 0)";
                    return [4 /*yield*/, connection.query(sql, courseCode)];
                case 12:
                    prices = _a.sent();
                    if (prices.length) {
                        return [2 /*return*/, createCourse(prices[0])];
                    }
                    _a.label = 13;
                case 13: return [2 /*return*/, false];
            }
        });
    });
}
function makeupCourse(course) {
    return ['MM', 'MA', 'MZ', 'MK', 'SF', 'HS', 'AB', 'MW', 'PW', 'GB', 'SK'].indexOf(course) !== -1;
}
/**
 * Rounds a number off to the desired number of decimal places.
 * @param num the number to round off
 * @param precision the number of decimal places
 */
function round(num, precision) {
    var factor = Math.pow(10, precision);
    var tempNumber = num * factor;
    var roundedTempNumber = Math.round(tempNumber);
    return roundedTempNumber / factor;
}
/**
 * Takes a number and returns it as a string. Prepends '0' for numbers less than 10.
 * @param n the number to convert and pad.
 */
function pad(n) {
    if (n < 10) {
        return "0" + n;
    }
    return n.toString();
}
