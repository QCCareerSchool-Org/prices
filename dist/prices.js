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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sumBigArray = exports.eventCourse = exports.eventAdvancedCourse = exports.eventFoundationCourse = exports.designCourse = exports.makeupCourse = exports.lookupCurrency = exports.lookupPrice = exports.getDisclaimers = exports.courseSort = exports.getCalculatePrices = exports.getPrices = void 0;
const helpers = __importStar(require("@qccareerschool/helper-functions"));
const HttpStatus = __importStar(require("@qccareerschool/http-status"));
const big_js_1 = require("big.js");
const crypto_1 = __importDefault(require("crypto"));
const public_key_1 = __importDefault(require("./public-key"));
const price_lookups_1 = require("./price-lookups");
const get_free_courses_1 = require("./get-free-courses");
async function getPrices(connection, courses, countryCode, provinceCode, options) {
    courses = courses.map(c => c.toUpperCase());
    // validate promotional discounts
    if (!validateDiscounts(options)) {
        throw new HttpStatus.BadRequest('invalid discount signature');
    }
    // validate minimum deposits
    if (options === null || options === void 0 ? void 0 : options.depositOverrides) {
        const depositOverrides = options.depositOverrides;
        courses.forEach(course => {
            if (typeof depositOverrides[course] === 'undefined') {
                throw new HttpStatus.BadRequest(`invalid depositOverride: no key for ${course}`);
            }
        });
        if (Object.keys(depositOverrides).length !== courses.length) {
            throw new HttpStatus.BadRequest(`invalid depositOverride: expected ${courses.length} keys`);
        }
    }
    // don't allow people from Ontario to enroll in DG or FA
    if (countryCode === 'CA' && provinceCode === 'ON') {
        courses = courses.filter((course) => course !== 'DG' && course !== 'FA');
    }
    // initialize the notes
    const notes = [];
    // initialize the disclaimers
    const disclaimers = [];
    // determine whether we'll be shipping materials or not
    const noShipping = helpers.noShipCountry(countryCode) ? 'REQUIRED' : (options === null || options === void 0 ? void 0 : options.noShipping) ? 'APPLIED' : 'ALLOWED';
    const noShippingDisclaimer = getNoShippingDisclaimer(noShipping, courses);
    if (noShippingDisclaimer) {
        disclaimers.push(noShippingDisclaimer);
    }
    const tel = helpers.telephoneNumber(countryCode);
    const noShippingMessage = noShipping === 'REQUIRED' ? noShippingDisclaimer + ` For more information please contact the School at <a style="color:inherit" href="tel:${tel}">${tel}.` : undefined;
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
    // look up all the prices and sort them from most to least expensive
    let priceRows = await Promise.all(courses.map((course) => exports.lookupPrice(connection, course, countryCode, provinceCode)));
    // determine which courses should be free
    const freeCourses = get_free_courses_1.getFreeCourses(priceRows, options);
    // sort based on price and free status
    priceRows = priceRows.sort((a, b) => {
        const aFree = freeCourses.includes(a.code);
        const bFree = freeCourses.includes(b.code);
        if (aFree === bFree) {
            return b.cost - a.cost;
        }
        return aFree ? 1 : -1;
    });
    // determine the currency we'll be using
    const currencyCode = priceRows.length ? priceRows[0].currencyCode : getDefaultCurrencyCode(countryCode);
    if (currencyCode !== 'CAD' && currencyCode !== 'USD' && currencyCode !== 'GBP' && currencyCode !== 'AUD' && currencyCode !== 'NZD') {
        throw Error(`Invalid currency code: ${currencyCode}`);
    }
    // make sure we don't have mismatched currencies
    priceRows.forEach((p) => {
        if (p.currencyCode !== currencyCode) {
            throw new HttpStatus.InternalServerError(`Currency mismatch: ${courses} ${countryCode} ${provinceCode}`);
        }
    });
    // look up the currency
    const currency = await exports.lookupCurrency(connection, currencyCode);
    // add course-based disclaimers
    disclaimers.push(...exports.getDisclaimers(courses, countryCode));
    // prepare the courses result
    let courseResults = priceRows
        .map(exports.getCalculatePrices(options, noShipping, currencyCode, freeCourses))
        .sort(exports.courseSort);
    if (!(options === null || options === void 0 ? void 0 : options.discountAll) && (options === null || options === void 0 ? void 0 : options.school) === 'QC Makeup Academy' && courseResults.some(c => c.code === 'MZ')) {
        courseResults = courseResults.map(getBlackFriday2020(currencyCode)).sort(exports.courseSort);
    }
    return collateResults(countryCode, provinceCode !== null && provinceCode !== void 0 ? provinceCode : null, currency, courseResults, disclaimers, notes, noShipping, noShippingMessage);
}
exports.getPrices = getPrices;
/**
 * Returns a map function that applies the black friday "up to $1000 off" discount to the second most expensive makeup course
 * @param courseResult the current CourseResult
 * @param index the position in the array
 */
const getBlackFriday2020 = (currencyCode, options) => {
    let blackFriday2020Applied = false;
    const blackFridayDiscount = currencyCode === 'GBP' ? 600 : 1000;
    const blackFriday2020 = (courseResult) => {
        var _a, _b;
        if (!blackFriday2020Applied && !courseResult.free && courseResult.code !== 'MZ' && exports.makeupCourse(courseResult.code)) {
            blackFriday2020Applied = true;
            let discountedCost = parseFloat(big_js_1.Big(courseResult.cost).minus(courseResult.promoDiscount).toFixed(2));
            const multiCourseDiscount = Math.min(blackFridayDiscount, discountedCost);
            discountedCost = parseFloat(big_js_1.Big(courseResult.cost).minus(multiCourseDiscount).minus(courseResult.promoDiscount).toFixed(2));
            const fullTotal = parseFloat(big_js_1.Big(discountedCost).minus(courseResult.plans.full.discount).toFixed(2));
            const partTotal = discountedCost; // no discount for part payment plan
            const originalPartDeposit = discountedCost > 0 ? Math.min(discountedCost, courseResult.plans.part.deposit) : 0;
            let partDeposit = originalPartDeposit;
            if (typeof ((_a = options === null || options === void 0 ? void 0 : options.depositOverrides) === null || _a === void 0 ? void 0 : _a[courseResult.code]) !== 'undefined') {
                const depositOverride = (_b = options === null || options === void 0 ? void 0 : options.depositOverrides) === null || _b === void 0 ? void 0 : _b[courseResult.code];
                // minimum deposit can't be too large
                if (depositOverride > partTotal) {
                    throw new HttpStatus.BadRequest(`invalid depositOverride for ${courseResult.code}: ${depositOverride} greater than total cost of ${partTotal}`);
                }
                // minimum deposit can't be too small
                if (depositOverride < partDeposit) {
                    throw new HttpStatus.BadRequest(`invalid depositOverride for ${courseResult.code}: ${depositOverride} is less than default of ${partDeposit}`);
                }
                partDeposit = depositOverride;
            }
            let partInstallments = courseResult.plans.part.installments;
            if (typeof (options === null || options === void 0 ? void 0 : options.installmentsOverride) !== 'undefined') {
                if ((options === null || options === void 0 ? void 0 : options.installmentsOverride) < 1) {
                    throw new HttpStatus.BadRequest('Invalid installmentsOverride: must be greater than or equal to 1');
                }
                if ((options === null || options === void 0 ? void 0 : options.installmentsOverride) > 24) {
                    throw new HttpStatus.BadRequest('Invalid installmentsOverride: must be less than 24');
                }
                partInstallments = Math.round(options === null || options === void 0 ? void 0 : options.installmentsOverride);
            }
            const partInstallmentSize = parseFloat(big_js_1.Big(partTotal).minus(partDeposit).div(partInstallments).round(2, 0).toFixed(2));
            const partRemainder = parseFloat(big_js_1.Big(partTotal).minus(partDeposit).minus(big_js_1.Big(partInstallmentSize).times(partInstallments)).toFixed(2));
            return Object.assign(Object.assign({}, courseResult), { multiCourseDiscount,
                discountedCost, discountMessage: 'Black Friday Special', plans: Object.assign(Object.assign({}, courseResult.plans), { full: Object.assign(Object.assign({}, courseResult.plans.full), { deposit: fullTotal, installments: 0, installmentSize: 0, remainder: 0, total: fullTotal, originalDeposit: fullTotal }), part: Object.assign(Object.assign({}, courseResult.plans.part), { deposit: partDeposit, installmentSize: partInstallmentSize, installments: partInstallments, remainder: partRemainder, total: partTotal, originalDeposit: originalPartDeposit }) }) });
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
const collateResults = (countryCode, provinceCode, currency, courseResults, disclaimers, notes, noShipping, noShippingMessage) => ({
    countryCode,
    provinceCode: provinceCode !== null && provinceCode !== void 0 ? provinceCode : undefined,
    currency,
    cost: parseFloat(courseResults.map((p) => big_js_1.Big(p.cost)).reduce(exports.sumBigArray, big_js_1.Big(0)).toFixed(2)),
    multiCourseDiscount: parseFloat(courseResults.map((c) => big_js_1.Big(c.multiCourseDiscount)).reduce(exports.sumBigArray, big_js_1.Big(0)).toFixed(2)),
    promoDiscount: parseFloat(courseResults.map((c) => big_js_1.Big(c.promoDiscount)).reduce(exports.sumBigArray, big_js_1.Big(0)).toFixed(2)),
    shippingDiscount: parseFloat(courseResults.map((c) => big_js_1.Big(c.shippingDiscount)).reduce(exports.sumBigArray, big_js_1.Big(0)).toFixed(2)),
    discountedCost: parseFloat(courseResults.map((c) => big_js_1.Big(c.discountedCost)).reduce(exports.sumBigArray, big_js_1.Big(0)).toFixed(2)),
    plans: {
        full: {
            discount: parseFloat(courseResults.map((c) => big_js_1.Big(c.plans.full.discount)).reduce(exports.sumBigArray, big_js_1.Big(0)).toFixed(2)),
            deposit: parseFloat(courseResults.map((c) => big_js_1.Big(c.plans.full.deposit)).reduce(exports.sumBigArray, big_js_1.Big(0)).toFixed(2)),
            installmentSize: parseFloat(courseResults.map((c) => big_js_1.Big(c.plans.full.installmentSize)).reduce(exports.sumBigArray, big_js_1.Big(0)).toFixed(2)),
            installments: 0,
            remainder: parseFloat(courseResults.map((c) => big_js_1.Big(c.plans.full.remainder)).reduce(exports.sumBigArray, big_js_1.Big(0)).toFixed(2)),
            total: parseFloat(courseResults.map((c) => big_js_1.Big(c.plans.full.total)).reduce(exports.sumBigArray, big_js_1.Big(0)).toFixed(2)),
            originalDeposit: parseFloat(courseResults.map((c) => big_js_1.Big(c.plans.full.originalDeposit)).reduce(exports.sumBigArray, big_js_1.Big(0)).toFixed(2)),
            originalInstallments: 0,
        },
        part: {
            discount: parseFloat(courseResults.map((c) => big_js_1.Big(c.plans.part.discount)).reduce(exports.sumBigArray, big_js_1.Big(0)).toFixed(2)),
            deposit: parseFloat(courseResults.map((c) => big_js_1.Big(c.plans.part.deposit)).reduce(exports.sumBigArray, big_js_1.Big(0)).toFixed(2)),
            installmentSize: parseFloat(courseResults.map((c) => big_js_1.Big(c.plans.part.installmentSize)).reduce(exports.sumBigArray, big_js_1.Big(0)).toFixed(2)),
            installments: courseResults.length ? courseResults[0].plans.part.installments : 0,
            remainder: parseFloat(courseResults.map((c) => big_js_1.Big(c.plans.part.remainder)).reduce(exports.sumBigArray, big_js_1.Big(0)).toFixed(2)),
            total: parseFloat(courseResults.map((c) => big_js_1.Big(c.plans.part.total)).reduce(exports.sumBigArray, big_js_1.Big(0)).toFixed(2)),
            originalDeposit: parseFloat(courseResults.map((c) => big_js_1.Big(c.plans.part.originalDeposit)).reduce(exports.sumBigArray, big_js_1.Big(0)).toFixed(2)),
            originalInstallments: courseResults.length ? courseResults[0].plans.part.originalInstallments : 0,
        },
    },
    shipping: parseFloat(courseResults.map((c) => big_js_1.Big(c.shipping)).reduce(exports.sumBigArray, big_js_1.Big(0)).toFixed(2)),
    disclaimers,
    notes,
    noShipping,
    noShippingMessage,
    courses: courseResults,
});
/**
 * Determines if the discount options are valid
 * @param options the options
 */
const validateDiscounts = (options) => {
    if ((options === null || options === void 0 ? void 0 : options.discount) && (options === null || options === void 0 ? void 0 : options.discountSignature)) {
        const verify = crypto_1.default.createVerify('SHA256');
        verify.update(JSON.stringify(options.discount));
        if (!verify.verify(public_key_1.default, Buffer.from(options.discountSignature, 'base64'))) {
            return false;
        }
    }
    return true;
};
const getNoShippingDisclaimer = (noShipping, courses) => {
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
const getDefaultCurrencyCode = (countryCode) => {
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
exports.getCalculatePrices = (options, noShipping, currencyCode, freeCourses) => {
    var _a, _b, _c;
    // determine the promotional discount
    let promoDiscount;
    const currencySpecificDiscount = (_a = options === null || options === void 0 ? void 0 : options.discount) === null || _a === void 0 ? void 0 : _a[currencyCode];
    if (typeof currencySpecificDiscount !== 'undefined') {
        promoDiscount = currencySpecificDiscount;
    }
    else {
        promoDiscount = (_c = (_b = options === null || options === void 0 ? void 0 : options.discount) === null || _b === void 0 ? void 0 : _b.default) !== null && _c !== void 0 ? _c : 0;
    }
    // all courses will have the same number of installments as the primary course
    let originalPartInstallments;
    let partInstallments;
    const calculatePrices = (p, i, a) => {
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
        const free = freeCourses.includes(p.courseCode);
        const multiCourseDiscount = free ? p.cost : (options === null || options === void 0 ? void 0 : options.discountAll) || i !== 0 ? parseFloat(big_js_1.Big(p.cost).times(p.multiCourseDiscountRate).toFixed(2)) : 0;
        let coursePromoDiscount = i === 0 ? promoDiscount : 0;
        if ((options === null || options === void 0 ? void 0 : options.studentDiscount) && !free) {
            coursePromoDiscount = parseFloat(big_js_1.Big(coursePromoDiscount).plus(p.currencyCode === 'GBP' ? 25 : 50).toFixed(2));
        }
        const shippingDiscount = free ? 0 : noShipping === 'APPLIED' || noShipping === 'REQUIRED' ? p.shipping : 0;
        const discountedCost = parseFloat(big_js_1.Big(p.cost).minus(multiCourseDiscount).minus(coursePromoDiscount).minus(shippingDiscount).toFixed(2));
        const fullDiscount = i === 0 && !(options === null || options === void 0 ? void 0 : options.discountAll) ? p.discount : 0; // payment plan discounts only apply to the primary course
        const partDiscount = 0; // no payment plan discounts on part plan
        const fullTotal = Math.max(0, parseFloat(big_js_1.Big(discountedCost).minus(fullDiscount).toFixed(2)));
        const partTotal = Math.max(0, parseFloat(big_js_1.Big(discountedCost).minus(partDiscount).toFixed(2)));
        const originalPartDeposit = p.deposit ? p.deposit : parseFloat(big_js_1.Big(p.cost).div(big_js_1.Big(p.installments).plus(1)).round(2, 0).toFixed(2));
        let partDeposit = originalPartDeposit;
        if (typeof ((_a = options === null || options === void 0 ? void 0 : options.depositOverrides) === null || _a === void 0 ? void 0 : _a[p.courseCode]) !== 'undefined') {
            const depositOverride = (_b = options === null || options === void 0 ? void 0 : options.depositOverrides) === null || _b === void 0 ? void 0 : _b[p.courseCode];
            // minimum deposit can't be too large
            if (depositOverride > (free ? 0 : partTotal)) {
                throw new HttpStatus.BadRequest(`invalid depositOverride for ${p.courseCode}: ${depositOverride} greater than total cost of ${free ? 0 : partTotal}`);
            }
            // minimum deposit can't be too small
            if (depositOverride < (free ? 0 : partDeposit)) {
                throw new HttpStatus.BadRequest(`invalid depositOverride for ${p.courseCode}: ${depositOverride} is less than default of ${free ? 0 : partDeposit}`);
            }
            partDeposit = depositOverride;
        }
        const partInstallmentSize = parseFloat(big_js_1.Big(partTotal).minus(partDeposit).div(partInstallments).round(2, 0).toFixed(2));
        const partRemainder = parseFloat(big_js_1.Big(partTotal).minus(partDeposit).minus(big_js_1.Big(partInstallmentSize).times(partInstallments)).toFixed());
        if (partTotal < 0 || fullTotal < 0) {
            throw new HttpStatus.InternalServerError(`Invalid price calculation`);
        }
        return {
            code: p.courseCode,
            name: p.courseName,
            primary: i === 0,
            cost: p.cost,
            multiCourseDiscount,
            promoDiscount: coursePromoDiscount,
            shippingDiscount,
            discountedCost,
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
            free,
            discountMessage: free || multiCourseDiscount === 0 ? null : `${Math.round(p.multiCourseDiscountRate * 100)}% Discount`,
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
exports.courseSort = (a, b) => {
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
exports.getDisclaimers = (courses, countryCode) => {
    const disclaimers = [];
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
exports.lookupPrice = async (connection, courseCode, countryCode, provinceCode) => {
    let result;
    if (typeof provinceCode !== 'undefined') { // look for this exact country/province combination
        result = await price_lookups_1.lookupPriceByCountryAndProvince(connection, courseCode, countryCode, provinceCode);
        if (result.length) {
            return result[0];
        }
    }
    // look for this exact country
    result = await price_lookups_1.lookupPriceByCountryAndProvince(connection, courseCode, countryCode, null);
    if (result.length) {
        return result[0];
    }
    if (helpers.audCountry(countryCode)) { // check for an Australia price
        result = await price_lookups_1.lookupPriceByCountryAndProvince(connection, courseCode, 'AU', null);
        if (result.length) {
            return result[0];
        }
    }
    else if (helpers.gbpCountry(countryCode)) { // check for a UK price
        result = await price_lookups_1.lookupPriceByCountryAndProvince(connection, courseCode, 'GB', null);
        if (result.length) {
            return result[0];
        }
    }
    else if (helpers.nzdCountry(countryCode)) { // check for a New Zealand price
        result = await price_lookups_1.lookupPriceByCountryAndProvince(connection, courseCode, 'AU', null);
        if (result.length) {
            return result[0];
        }
    }
    // check for default price
    result = await price_lookups_1.lookupPriceByCountryAndProvince(connection, courseCode, null, null);
    if (result.length) {
        return result[0];
    }
    throw new HttpStatus.BadRequest(`No pricing information found for course ${courseCode}`);
};
exports.lookupCurrency = async (connection, currencyCode) => {
    const sql = 'SELECT code, name, symbol, exchange exchangeRate FROM currencies WHERE code = ? LIMIT 1';
    const currencyResult = await connection.query(sql, currencyCode);
    if (currencyResult.length === 0) {
        throw new HttpStatus.InternalServerError('Unable to find currency');
    }
    return currencyResult[0];
};
exports.makeupCourse = (course) => {
    return ['MM', 'MA', 'MZ', 'MK', 'SF', 'HS', 'AB', 'MW', 'PW', 'GB', 'SK', 'PA', 'PF', 'VM'].includes(course);
};
exports.designCourse = (course) => {
    return ['I2', 'ST', 'PO', 'FS', 'CC', 'AP', 'DB', 'MS', 'VD'].includes(course);
};
exports.eventFoundationCourse = (course) => {
    return ['EP', 'CP', 'CE', 'WP'].includes(course);
};
exports.eventAdvancedCourse = (course) => {
    return ['ED', 'EB', 'LW', 'DW', 'FL', 'PE', 'TT', 'TG', 'VE'].includes(course);
};
exports.eventCourse = (course) => exports.eventFoundationCourse(course) || exports.eventAdvancedCourse(course);
// reduce function to sum Big numbers
exports.sumBigArray = (previous, current) => previous.plus(current);
