"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.sumBigArray = exports.eventCourse = exports.eventAdvancedCourse = exports.eventFoundationCourse = exports.designCourse = exports.makeupCourse = exports.lookupCurrency = exports.lookupPrice = exports.getDisclaimers = exports.courseSort = exports.getCalculatePrices = exports.getPrices = void 0;
var helpers = __importStar(require("@qccareerschool/helper-functions"));
var HttpStatus = __importStar(require("@qccareerschool/http-status"));
var big_js_1 = require("big.js");
var crypto_1 = __importDefault(require("crypto"));
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
var lookupPrice_1 = require("./lookupPrice");
var getFreeCourses_1 = require("./getFreeCourses");
var publicKey = fs_1.default.readFileSync(path_1.default.join(__dirname, '../public.pem'), 'utf8');
function getPrices(connection, courses, countryCode, provinceCode, options) {
    if (courses === void 0) { courses = []; }
    return __awaiter(this, void 0, void 0, function () {
        var depositOverrides_1, notes, disclaimers, noShipping, noShippingDisclaimer, tel, noShippingMessage, priceRows, freeCourses, currencyCode, currency, courseResults;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    courses = courses.map(function (c) { return c.toUpperCase(); });
                    // validate promotional discounts
                    if (!validateDiscounts(options)) {
                        throw new HttpStatus.BadRequest('invalid discount signature');
                    }
                    // validate minimum deposits
                    if (options === null || options === void 0 ? void 0 : options.depositOverrides) {
                        depositOverrides_1 = options.depositOverrides;
                        courses.forEach(function (course) {
                            if (typeof depositOverrides_1[course] === 'undefined') {
                                throw new HttpStatus.BadRequest("invalid depositOverride: no key for " + course);
                            }
                        });
                        if (Object.keys(depositOverrides_1).length !== courses.length) {
                            throw new HttpStatus.BadRequest("invalid depositOverride: expected " + courses.length + " keys");
                        }
                    }
                    // don't allow people from Ontario to enroll in DG or FA
                    if (countryCode === 'CA' && provinceCode === 'ON') {
                        courses = courses.filter(function (course) { return course !== 'DG' && course !== 'FA'; });
                    }
                    notes = [];
                    disclaimers = [];
                    noShipping = helpers.noShipCountry(countryCode) ? 'REQUIRED' : (options === null || options === void 0 ? void 0 : options.noShipping) ? 'APPLIED' : 'ALLOWED';
                    noShippingDisclaimer = getNoShippingDisclaimer(noShipping, courses);
                    if (noShippingDisclaimer) {
                        disclaimers.push(noShippingDisclaimer);
                    }
                    tel = helpers.telephoneNumber(countryCode);
                    noShippingMessage = noShipping === 'REQUIRED' ? noShippingDisclaimer + (" For more information please contact the School at <a style=\"color:inherit\" href=\"tel:" + tel + "\">" + tel + ".") : undefined;
                    // studentDiscount option
                    if (options === null || options === void 0 ? void 0 : options.studentDiscount) {
                        notes.push('additional discount');
                    }
                    // deluxeKit option
                    if ((options === null || options === void 0 ? void 0 : options.deluxeKit) === true) {
                        if (courses.includes('MM')) {
                            notes.push('deluxe kit');
                            disclaimers.push('You will recieve the deluxe makeup kit with your Master Makeup Artistry course.');
                        }
                    }
                    // MMFreeMW option
                    if ((options === null || options === void 0 ? void 0 : options.MMFreeMW) === true) {
                        if (courses.includes('MM') || courses.includes('MZ')) {
                            notes.push('free MW course');
                        }
                    }
                    // portfolio option
                    if ((options === null || options === void 0 ? void 0 : options.portfolio) === true) {
                        notes.push('portfolio');
                    }
                    return [4 /*yield*/, Promise.all(courses.map(function (course) { return exports.lookupPrice(connection, course, countryCode, provinceCode); }))];
                case 1:
                    priceRows = _a.sent();
                    freeCourses = getFreeCourses_1.getFreeCourses(priceRows, options);
                    // sort based on price and free status
                    priceRows = priceRows.sort(function (a, b) {
                        var aFree = freeCourses.includes(a.code);
                        var bFree = freeCourses.includes(b.code);
                        if (aFree === bFree) {
                            return b.cost - a.cost;
                        }
                        return aFree ? 1 : -1;
                    });
                    currencyCode = priceRows.length ? priceRows[0].currencyCode : getDefaultCurrencyCode(countryCode);
                    if (currencyCode !== 'CAD' && currencyCode !== 'USD' && currencyCode !== 'GBP' && currencyCode !== 'AUD' && currencyCode !== 'NZD') {
                        throw Error("Invalid currency code: " + currencyCode);
                    }
                    // make sure we don't have mismatched currencies
                    priceRows.forEach(function (p) {
                        if (p.currencyCode !== currencyCode) {
                            throw new HttpStatus.InternalServerError("Currency mismatch: " + courses + " " + countryCode + " " + provinceCode);
                        }
                    });
                    return [4 /*yield*/, exports.lookupCurrency(connection, currencyCode)];
                case 2:
                    currency = _a.sent();
                    // add course-based disclaimers
                    disclaimers.push.apply(disclaimers, exports.getDisclaimers(courses, countryCode));
                    courseResults = priceRows
                        .map(exports.getCalculatePrices(options, noShipping, currencyCode, freeCourses))
                        .sort(exports.courseSort);
                    if (!(options === null || options === void 0 ? void 0 : options.discountAll) && (options === null || options === void 0 ? void 0 : options.school) === 'QC Makeup Academy' && courseResults.some(function (c) { return c.code === 'MZ'; })) {
                        courseResults = courseResults.map(getBlackFriday2020(currencyCode)).sort(exports.courseSort);
                    }
                    return [2 /*return*/, collateResults(countryCode, provinceCode !== null && provinceCode !== void 0 ? provinceCode : null, currency, courseResults, disclaimers, notes, noShipping, noShippingMessage)];
            }
        });
    });
}
exports.getPrices = getPrices;
/**
 * Returns a map function that applies the black friday "up to $1000 off" discount to the second most expensive makeup course
 * @param courseResult the current CourseResult
 * @param index the position in the array
 */
var getBlackFriday2020 = function (currencyCode, options) {
    var blackFriday2020Applied = false;
    var blackFridayDiscount = currencyCode === 'GBP' ? 600 : 1000;
    var blackFriday2020 = function (courseResult) {
        var _a, _b;
        if (!blackFriday2020Applied && !courseResult.free && courseResult.code !== 'MZ' && exports.makeupCourse(courseResult.code)) {
            blackFriday2020Applied = true;
            var discountedCost = parseFloat(big_js_1.Big(courseResult.cost).minus(courseResult.promoDiscount).toFixed(2));
            var multiCourseDiscount = Math.min(blackFridayDiscount, discountedCost);
            discountedCost = parseFloat(big_js_1.Big(courseResult.cost).minus(multiCourseDiscount).minus(courseResult.promoDiscount).toFixed(2));
            var fullTotal = parseFloat(big_js_1.Big(discountedCost).minus(courseResult.plans.full.discount).toFixed(2));
            var partTotal = discountedCost; // no discount for part payment plan
            var originalPartDeposit = discountedCost > 0 ? Math.min(discountedCost, courseResult.plans.part.deposit) : 0;
            var partDeposit = originalPartDeposit;
            if (typeof ((_a = options === null || options === void 0 ? void 0 : options.depositOverrides) === null || _a === void 0 ? void 0 : _a[courseResult.code]) !== 'undefined') {
                var depositOverride = (_b = options === null || options === void 0 ? void 0 : options.depositOverrides) === null || _b === void 0 ? void 0 : _b[courseResult.code];
                // minimum deposit can't be too large
                if (depositOverride > partTotal) {
                    throw new HttpStatus.BadRequest("invalid depositOverride for " + courseResult.code + ": " + depositOverride + " greater than total cost of " + partTotal);
                }
                // minimum deposit can't be too small
                if (depositOverride < partDeposit) {
                    throw new HttpStatus.BadRequest("invalid depositOverride for " + courseResult.code + ": " + depositOverride + " is less than default of " + partDeposit);
                }
                partDeposit = depositOverride;
            }
            var partInstallments = courseResult.plans.part.installments;
            if (typeof (options === null || options === void 0 ? void 0 : options.installmentsOverride) !== 'undefined') {
                if ((options === null || options === void 0 ? void 0 : options.installmentsOverride) < 1) {
                    throw new HttpStatus.BadRequest('Invalid installmentsOverride: must be greater than or equal to 1');
                }
                if ((options === null || options === void 0 ? void 0 : options.installmentsOverride) > 24) {
                    throw new HttpStatus.BadRequest('Invalid installmentsOverride: must be less than 24');
                }
                partInstallments = Math.round(options === null || options === void 0 ? void 0 : options.installmentsOverride);
            }
            var partInstallmentSize = parseFloat(big_js_1.Big(partTotal).minus(partDeposit).div(partInstallments).round(2, 0).toFixed(2));
            var partRemainder = parseFloat(big_js_1.Big(partTotal).minus(partDeposit).minus(big_js_1.Big(partInstallmentSize).times(partInstallments)).toFixed(2));
            return __assign(__assign({}, courseResult), { multiCourseDiscount: multiCourseDiscount,
                discountedCost: discountedCost, discountMessage: 'Black Friday Special', plans: __assign(__assign({}, courseResult.plans), { full: __assign(__assign({}, courseResult.plans.full), { deposit: fullTotal, installments: 0, installmentSize: 0, remainder: 0, total: fullTotal, originalDeposit: fullTotal }), part: __assign(__assign({}, courseResult.plans.part), { deposit: partDeposit, installmentSize: partInstallmentSize, installments: partInstallments, remainder: partRemainder, total: partTotal, originalDeposit: originalPartDeposit }) }) });
        }
        else {
            return courseResult;
        }
    };
    return blackFriday2020;
};
/**
 * Creates the final response
 * @param countryCode
 * @param provinceCode
 * @param currency
 * @param courseResults
 * @param disclaimers
 * @param notes
 * @param noShipping
 * @param noShippingMessage
 */
var collateResults = function (countryCode, provinceCode, currency, courseResults, disclaimers, notes, noShipping, noShippingMessage) { return ({
    countryCode: countryCode,
    provinceCode: provinceCode !== null && provinceCode !== void 0 ? provinceCode : undefined,
    currency: currency,
    cost: parseFloat(courseResults.map(function (p) { return big_js_1.Big(p.cost); }).reduce(exports.sumBigArray, big_js_1.Big(0)).toFixed(2)),
    multiCourseDiscount: parseFloat(courseResults.map(function (c) { return big_js_1.Big(c.multiCourseDiscount); }).reduce(exports.sumBigArray, big_js_1.Big(0)).toFixed(2)),
    promoDiscount: parseFloat(courseResults.map(function (c) { return big_js_1.Big(c.promoDiscount); }).reduce(exports.sumBigArray, big_js_1.Big(0)).toFixed(2)),
    shippingDiscount: parseFloat(courseResults.map(function (c) { return big_js_1.Big(c.shippingDiscount); }).reduce(exports.sumBigArray, big_js_1.Big(0)).toFixed(2)),
    discountedCost: parseFloat(courseResults.map(function (c) { return big_js_1.Big(c.discountedCost); }).reduce(exports.sumBigArray, big_js_1.Big(0)).toFixed(2)),
    plans: {
        full: {
            discount: parseFloat(courseResults.map(function (c) { return big_js_1.Big(c.plans.full.discount); }).reduce(exports.sumBigArray, big_js_1.Big(0)).toFixed(2)),
            deposit: parseFloat(courseResults.map(function (c) { return big_js_1.Big(c.plans.full.deposit); }).reduce(exports.sumBigArray, big_js_1.Big(0)).toFixed(2)),
            installmentSize: parseFloat(courseResults.map(function (c) { return big_js_1.Big(c.plans.full.installmentSize); }).reduce(exports.sumBigArray, big_js_1.Big(0)).toFixed(2)),
            installments: 0,
            remainder: parseFloat(courseResults.map(function (c) { return big_js_1.Big(c.plans.full.remainder); }).reduce(exports.sumBigArray, big_js_1.Big(0)).toFixed(2)),
            total: parseFloat(courseResults.map(function (c) { return big_js_1.Big(c.plans.full.total); }).reduce(exports.sumBigArray, big_js_1.Big(0)).toFixed(2)),
            originalDeposit: parseFloat(courseResults.map(function (c) { return big_js_1.Big(c.plans.full.originalDeposit); }).reduce(exports.sumBigArray, big_js_1.Big(0)).toFixed(2)),
            originalInstallments: 0,
        },
        part: {
            discount: parseFloat(courseResults.map(function (c) { return big_js_1.Big(c.plans.part.discount); }).reduce(exports.sumBigArray, big_js_1.Big(0)).toFixed(2)),
            deposit: parseFloat(courseResults.map(function (c) { return big_js_1.Big(c.plans.part.deposit); }).reduce(exports.sumBigArray, big_js_1.Big(0)).toFixed(2)),
            installmentSize: parseFloat(courseResults.map(function (c) { return big_js_1.Big(c.plans.part.installmentSize); }).reduce(exports.sumBigArray, big_js_1.Big(0)).toFixed(2)),
            installments: courseResults.length ? courseResults[0].plans.part.installments : 0,
            remainder: parseFloat(courseResults.map(function (c) { return big_js_1.Big(c.plans.part.remainder); }).reduce(exports.sumBigArray, big_js_1.Big(0)).toFixed(2)),
            total: parseFloat(courseResults.map(function (c) { return big_js_1.Big(c.plans.part.total); }).reduce(exports.sumBigArray, big_js_1.Big(0)).toFixed(2)),
            originalDeposit: parseFloat(courseResults.map(function (c) { return big_js_1.Big(c.plans.part.originalDeposit); }).reduce(exports.sumBigArray, big_js_1.Big(0)).toFixed(2)),
            originalInstallments: courseResults.length ? courseResults[0].plans.part.originalInstallments : 0,
        },
    },
    shipping: parseFloat(courseResults.map(function (c) { return big_js_1.Big(c.shipping); }).reduce(exports.sumBigArray, big_js_1.Big(0)).toFixed(2)),
    disclaimers: disclaimers,
    notes: notes,
    noShipping: noShipping,
    noShippingMessage: noShippingMessage,
    courses: courseResults,
}); };
/**
 * Determines if the discount options are valid
 * @param options the options
 */
var validateDiscounts = function (options) {
    if ((options === null || options === void 0 ? void 0 : options.discount) && (options === null || options === void 0 ? void 0 : options.discountSignature)) {
        var verify = crypto_1.default.createVerify('SHA256');
        verify.update(JSON.stringify(options.discount));
        if (!verify.verify(publicKey, Buffer.from(options.discountSignature, 'base64'))) {
            return false;
        }
    }
    return true;
};
var getNoShippingDisclaimer = function (noShipping, courses) {
    if (noShipping === 'REQUIRED') {
        return 'Due to international shipping restrictions, <strong>we do not ship</strong> physical ' +
            'course materials' + (courses.some(exports.makeupCourse) ? ', <u>including makeup kits</u>, ' : ' ') +
            'to your country. The cost of your course' + (courses.length > 1 ? 's have ' : ' has ') +
            'been reduced accordingly. You will have access to electronic course materials through the Online Student Center.' +
            (courses.some(exports.designCourse) ? ' You will need to source your own design tools to complete your assignments. Please refer to your welcome email for more information.' : '') +
            (courses.some(exports.makeupCourse) ? ' You will have to source your own makeup and tools. Please refer to your course guide for the materials required for each assignment.' : '');
    }
    else if (noShipping === 'APPLIED') {
        return 'You have selected to not receive physical ' +
            'course materials' + (courses.some(exports.makeupCourse) ? ', <u>including makeup kits</u>' : '') + '. ' +
            'The cost of your course' + (courses.length > 1 ? 's have ' : ' has ') +
            'been reduced accordingly. You will have access to electronic course materials through the Online Student Center.' +
            (courses.some(exports.designCourse) ? ' You will need to source your own design tools to complete your assignments. Please refer to your welcome email for more information.' : '') +
            (courses.some(exports.makeupCourse) ? ' You will have to source your own makeup and tools. Please refer to your course guide for the materials required for each assignment.' : '');
    }
};
/**
 * Determines the currency we should assume the courses will be priced in based on the country
 * @param countryCode the country code
 */
var getDefaultCurrencyCode = function (countryCode) {
    if (countryCode === 'CA') {
        return 'CAD';
    }
    else if (helpers.gbpCountry(countryCode)) {
        return 'GBP';
    }
    else if (helpers.audCountry(countryCode)) {
        return 'AUD';
    }
    else if (helpers.nzdCountry(countryCode)) {
        return 'NZD';
    }
    else {
        return 'USD';
    }
};
/**
 * Returns a function that maps a PriceRow to a CourseResult
 * @param options
 * @param noShipping
 * @param currencyCode
 * @param freeCourses
 */
exports.getCalculatePrices = function (options, noShipping, currencyCode, freeCourses) {
    var _a, _b, _c;
    // determine the promotional discount
    var promoDiscount;
    var currencySpecificDiscount = (_a = options === null || options === void 0 ? void 0 : options.discount) === null || _a === void 0 ? void 0 : _a[currencyCode];
    if (typeof currencySpecificDiscount !== 'undefined') {
        promoDiscount = currencySpecificDiscount;
    }
    else {
        promoDiscount = (_c = (_b = options === null || options === void 0 ? void 0 : options.discount) === null || _b === void 0 ? void 0 : _b.default) !== null && _c !== void 0 ? _c : 0;
    }
    // all courses will have the same number of installments as the primary course
    var originalPartInstallments;
    var partInstallments;
    var calculatePrices = function (p, i, a) {
        var _a, _b;
        if (i === 0) {
            // all courses wll have the same number of installments as the primary course
            originalPartInstallments = p.installments;
            partInstallments = originalPartInstallments;
            if (typeof (options === null || options === void 0 ? void 0 : options.installmentsOverride) !== 'undefined') {
                if ((options === null || options === void 0 ? void 0 : options.installmentsOverride) < 1) {
                    throw new HttpStatus.BadRequest('Invalid installmentsOverride: must be greater than or equal to 1');
                }
                if ((options === null || options === void 0 ? void 0 : options.installmentsOverride) > 24) {
                    throw new HttpStatus.BadRequest('Invalid installmentsOverride: must be less than 24');
                }
                partInstallments = Math.round(options === null || options === void 0 ? void 0 : options.installmentsOverride);
            }
        }
        var free = freeCourses.includes(p.courseCode);
        var multiCourseDiscount = free ? p.cost : (options === null || options === void 0 ? void 0 : options.discountAll) || i !== 0 ? parseFloat(big_js_1.Big(p.cost).times(p.multiCourseDiscountRate).toFixed(2)) : 0;
        var coursePromoDiscount = i === 0 ? promoDiscount : 0;
        if ((options === null || options === void 0 ? void 0 : options.studentDiscount) && !free) {
            coursePromoDiscount = parseFloat(big_js_1.Big(coursePromoDiscount).plus(p.currencyCode === 'GBP' ? 25 : 50).toFixed(2));
        }
        var shippingDiscount = free ? 0 : noShipping === 'APPLIED' || noShipping === 'REQUIRED' ? p.shipping : 0;
        var discountedCost = parseFloat(big_js_1.Big(p.cost).minus(multiCourseDiscount).minus(coursePromoDiscount).minus(shippingDiscount).toFixed(2));
        var fullDiscount = i === 0 && !(options === null || options === void 0 ? void 0 : options.discountAll) ? p.discount : 0; // payment plan discounts only apply to the primary course
        var partDiscount = 0; // no payment plan discounts on part plan
        var fullTotal = Math.max(0, parseFloat(big_js_1.Big(discountedCost).minus(fullDiscount).toFixed(2)));
        var partTotal = Math.max(0, parseFloat(big_js_1.Big(discountedCost).minus(partDiscount).toFixed(2)));
        var originalPartDeposit = p.deposit ? p.deposit : parseFloat(big_js_1.Big(p.cost).div(big_js_1.Big(p.installments).plus(1)).round(2, 0).toFixed(2));
        var partDeposit = originalPartDeposit;
        if (typeof ((_a = options === null || options === void 0 ? void 0 : options.depositOverrides) === null || _a === void 0 ? void 0 : _a[p.courseCode]) !== 'undefined') {
            var depositOverride = (_b = options === null || options === void 0 ? void 0 : options.depositOverrides) === null || _b === void 0 ? void 0 : _b[p.courseCode];
            // minimum deposit can't be too large
            if (depositOverride > (free ? 0 : partTotal)) {
                throw new HttpStatus.BadRequest("invalid depositOverride for " + p.courseCode + ": " + depositOverride + " greater than total cost of " + (free ? 0 : partTotal));
            }
            // minimum deposit can't be too small
            if (depositOverride < (free ? 0 : partDeposit)) {
                throw new HttpStatus.BadRequest("invalid depositOverride for " + p.courseCode + ": " + depositOverride + " is less than default of " + (free ? 0 : partDeposit));
            }
            partDeposit = depositOverride;
        }
        var partInstallmentSize = parseFloat(big_js_1.Big(partTotal).minus(partDeposit).div(partInstallments).round(2, 0).toFixed(2));
        var partRemainder = parseFloat(big_js_1.Big(partTotal).minus(partDeposit).minus(big_js_1.Big(partInstallmentSize).times(partInstallments)).toFixed());
        if (partTotal < 0 || fullTotal < 0) {
            throw new HttpStatus.InternalServerError('Invalid price calculation');
        }
        return {
            code: p.courseCode,
            name: p.courseName,
            primary: i === 0,
            cost: p.cost,
            multiCourseDiscount: multiCourseDiscount,
            promoDiscount: coursePromoDiscount,
            shippingDiscount: shippingDiscount,
            discountedCost: discountedCost,
            plans: {
                full: {
                    discount: free ? 0 : fullDiscount,
                    deposit: free ? 0 : fullTotal,
                    installmentSize: 0,
                    installments: 0,
                    remainder: 0,
                    total: free ? 0 : fullTotal,
                    originalDeposit: free ? 0 : fullTotal,
                    originalInstallments: 0,
                },
                part: {
                    discount: free ? 0 : partDiscount,
                    deposit: free ? 0 : partDeposit,
                    installmentSize: free ? 0 : partInstallmentSize,
                    installments: free ? 0 : partInstallments,
                    remainder: free ? 0 : partRemainder,
                    total: free ? 0 : partTotal,
                    originalDeposit: free ? 0 : originalPartDeposit,
                    originalInstallments: free ? 0 : originalPartInstallments,
                },
            },
            shipping: free ? 0 : p.shipping,
            free: free,
            discountMessage: free || multiCourseDiscount === 0 ? null : Math.round(p.multiCourseDiscountRate * 100) + "% Discount",
        };
    };
    return calculatePrices;
};
/**
 * Sort function for CourseResults
 *
 * Sorts by primary descending, then free ascending, then cost descending, then discounted cost descending
 * @param a the first course result
 * @param b the second course result
 */
exports.courseSort = function (a, b) {
    if (a.primary === b.primary) {
        if (a.free === b.free) {
            if (a.cost === b.cost) {
                return a.discountedCost - b.discountedCost;
            }
            return b.cost - a.cost;
        }
        return a.free ? 1 : -1;
    }
    return a.primary ? -1 : 1;
};
/**
 * Returns an array of disclaimer strings based on the courses selected and the country code
 *
 * Note: These strings may be inserted as raw HTML by the front end application
 * Do not include any unescaped user input in them (preferably do not include
 * any user input at all). Also ensure that they are valid HTML with proper
 * closing tags.
 * @param courses the courses
 * @param countryCode the country code
 */
exports.getDisclaimers = function (courses, countryCode) {
    var disclaimers = [];
    if (courses.includes('DG') && helpers.audCountry(countryCode)) {
        disclaimers.push('The WAHL clippers and attachment combs will not be provided with your course. ' +
            'QC only supplies the North American version, which is not compatible with power outlets in your country. ' +
            'Your course has therefore been discounted by $280 so that you may purchase your own clippers and combs.');
    }
    if (courses.includes('DG') && helpers.gbpCountry(countryCode)) {
        disclaimers.push('The WAHL clippers and attachment combs will not be provided with your course. ' +
            'QC only supplies the North American version, which is not compatible with power outlets in your country. ' +
            'Your course has therefore been discounted by £150 so that you may purchase your own clippers and combs.');
    }
    if (courses.includes('DG') && helpers.nzdCountry(countryCode)) {
        disclaimers.push('The WAHL clippers and attachment combs will not be provided with your course. ' +
            'QC only supplies the North American version, which is not compatible with power outlets in your country. ' +
            'Your course has therefore been discounted by $300 so that you may purchase your own clippers and combs.');
    }
    if (courses.includes('EB')) {
        disclaimers.push('The Accelerate Your Business Workshop includes electronic course material only.');
    }
    if (courses.includes('FC')) {
        disclaimers.push('The Professional Caregiving Course includes electronic course material only.');
    }
    if (courses.includes('FL')) {
        disclaimers.push('The Festivals &amp; Live Events Course requires corporate event training.');
    }
    if (courses.includes('PE')) {
        disclaimers.push('The Promotional Event Planning Course requires corporate event training.');
    }
    if (courses.includes('PW')) {
        disclaimers.push('The Portfolio Development Workshop includes electronic course material only.');
    }
    if (courses.includes('MW')) {
        disclaimers.push('The Pro Makeup Workshop includes electronic course material only.');
    }
    if (courses.includes('PF')) {
        disclaimers.push('The Fashion Styling Course includes electronic course material only.');
    }
    return disclaimers;
};
exports.lookupPrice = function (connection, courseCode, countryCode, provinceCode) { return __awaiter(void 0, void 0, void 0, function () {
    var result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!(typeof provinceCode !== 'undefined')) return [3 /*break*/, 2];
                return [4 /*yield*/, lookupPrice_1.lookupPriceByCountryAndProvince(connection, courseCode, countryCode, provinceCode)];
            case 1:
                result = _a.sent();
                if (result.length) {
                    return [2 /*return*/, result[0]];
                }
                _a.label = 2;
            case 2: return [4 /*yield*/, lookupPrice_1.lookupPriceByCountryAndProvince(connection, courseCode, countryCode, null)];
            case 3:
                // look for this exact country
                result = _a.sent();
                if (result.length) {
                    return [2 /*return*/, result[0]];
                }
                if (!helpers.audCountry(countryCode)) return [3 /*break*/, 5];
                return [4 /*yield*/, lookupPrice_1.lookupPriceByCountryAndProvince(connection, courseCode, 'AU', null)];
            case 4:
                result = _a.sent();
                if (result.length) {
                    return [2 /*return*/, result[0]];
                }
                return [3 /*break*/, 9];
            case 5:
                if (!helpers.gbpCountry(countryCode)) return [3 /*break*/, 7];
                return [4 /*yield*/, lookupPrice_1.lookupPriceByCountryAndProvince(connection, courseCode, 'GB', null)];
            case 6:
                result = _a.sent();
                if (result.length) {
                    return [2 /*return*/, result[0]];
                }
                return [3 /*break*/, 9];
            case 7:
                if (!helpers.nzdCountry(countryCode)) return [3 /*break*/, 9];
                return [4 /*yield*/, lookupPrice_1.lookupPriceByCountryAndProvince(connection, courseCode, 'AU', null)];
            case 8:
                result = _a.sent();
                if (result.length) {
                    return [2 /*return*/, result[0]];
                }
                _a.label = 9;
            case 9: return [4 /*yield*/, lookupPrice_1.lookupPriceByCountryAndProvince(connection, courseCode, null, null)];
            case 10:
                // check for default price
                result = _a.sent();
                if (result.length) {
                    return [2 /*return*/, result[0]];
                }
                throw new HttpStatus.BadRequest("No pricing information found for course " + courseCode);
        }
    });
}); };
exports.lookupCurrency = function (connection, currencyCode) { return __awaiter(void 0, void 0, void 0, function () {
    var sql, currencyResult;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                sql = 'SELECT code, name, symbol, exchange exchangeRate FROM currencies WHERE code = ? LIMIT 1';
                return [4 /*yield*/, connection.query(sql, currencyCode)];
            case 1:
                currencyResult = _a.sent();
                if (currencyResult.length === 0) {
                    throw new HttpStatus.InternalServerError('Unable to find currency');
                }
                return [2 /*return*/, currencyResult[0]];
        }
    });
}); };
exports.makeupCourse = function (course) {
    return ['MM', 'MA', 'MZ', 'MK', 'SF', 'HS', 'AB', 'MW', 'PW', 'GB', 'SK', 'PA', 'PF', 'VM'].includes(course);
};
exports.designCourse = function (course) {
    return ['I2', 'ST', 'PO', 'FS', 'CC', 'AP', 'DB', 'MS', 'VD'].includes(course);
};
exports.eventFoundationCourse = function (course) {
    return ['EP', 'CP', 'CE', 'WP'].includes(course);
};
exports.eventAdvancedCourse = function (course) {
    return ['ED', 'EB', 'LW', 'DW', 'FL', 'PE', 'TT', 'TG', 'VE'].includes(course);
};
exports.eventCourse = function (course) { return exports.eventFoundationCourse(course) || exports.eventAdvancedCourse(course); };
// reduce function to sum Big numbers
exports.sumBigArray = function (previous, current) { return previous.plus(current); };
