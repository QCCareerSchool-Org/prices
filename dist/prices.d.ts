import { Big } from 'big.js';
import { PoolConnection } from 'promise-mysql';
declare type NoShipping = 'ALLOWED' | 'APPLIED' | 'REQUIRED' | 'FORBIDDEN';
declare type CurrencyCode = 'CAD' | 'USD' | 'GBP' | 'AUD' | 'NZD';
export declare type School = 'QC Career School' | 'QC Makeup Academy' | 'QC Design School' | 'QC Event School' | 'QC Pet Studies' | 'QC Style Academy' | 'QC Travel School' | 'QC Wellness Studies' | 'Winghill Writing School';
export interface PriceQueryOptions {
    noShipping?: boolean;
    discountAll?: boolean;
    discount?: {
        [d in CurrencyCode]?: number;
    } & {
        default: number;
    };
    discountSignature?: string;
    MMFreeMW?: boolean;
    deluxeKit?: boolean;
    portfolio?: boolean;
    depositOverrides?: {
        [code: string]: number;
    };
    installmentsOverride?: number;
    studentDiscount?: boolean;
    blackFriday2020?: boolean;
    school?: School;
}
export interface PriceQuery {
    courses: string[];
    countryCode: string;
    provinceCode?: string;
    options?: PriceQueryOptions;
}
interface Plan {
    /** the discount based on the payment plan */
    discount: number;
    /** the amount to be paid today */
    deposit: number;
    /** the size of the installments  */
    installmentSize: number;
    /** the number of installments */
    installments: number;
    /** any amount left over due to rounding */
    remainder: number;
    /** the final price after discounts */
    total: number;
    /** the original deposit, before overrides */
    originalDeposit: number;
    /** the original number of installments, before overrides */
    originalInstallments: number;
}
interface Price {
    /** the base price before any discounts */
    cost: number;
    /** the discount on courses after the first course */
    multiCourseDiscount: number;
    /** additional promotional discount */
    promoDiscount: number;
    /** the discount for not shipping materials */
    shippingDiscount: number;
    /** the discounted price (before payment plan discount) */
    discountedCost: number;
    /** the payment plans */
    plans: {
        full: Plan;
        part: Plan;
    };
    /** what our cost for shipping would be if we shipped */
    shipping: number;
}
export declare type PriceResult = {
    countryCode: string;
    provinceCode?: string;
    currency: Currency;
    disclaimers: string[];
    notes: string[];
    noShipping: NoShipping;
    noShippingMessage?: string;
    courses: CourseResult[];
} & Price;
export declare type CourseResult = {
    code: string;
    name: string;
    primary: boolean;
    free: boolean;
    /** the message to show next to the multi-course discount  */
    discountMessage: string | null;
} & Price;
export interface Currency {
    code: string;
    symbol: string;
    name: string;
    exchangeRate: number;
}
export interface PriceRow {
    code: string;
    currencyCode: string;
    cost: number;
    multiCourseDiscountRate: number;
    deposit: number;
    discount: number;
    installments: number;
    courseCode: string;
    courseName: string;
    shipping: number;
}
export declare function getPrices(connection: PoolConnection, courses: string[], countryCode: string, provinceCode?: string, options?: PriceQueryOptions): Promise<PriceResult>;
declare type CalulatePricesFunction = (p: PriceRow, i: number, a: PriceRow[]) => CourseResult;
/**
 * Returns a function that maps a PriceRow to a CourseResult
 * @param options
 * @param noShipping
 * @param currencyCode
 * @param freeCourses
 */
export declare const getCalculatePrices: (options: PriceQueryOptions | undefined, noShipping: NoShipping, currencyCode: CurrencyCode, freeCourses: string[]) => CalulatePricesFunction;
/**
 * Sort function for CourseResults
 *
 * Sorts by primary descending, then free ascending, then cost descending, then discounted cost descending
 * @param a the first course result
 * @param b the second course result
 */
export declare const courseSort: (a: CourseResult, b: CourseResult) => number;
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
export declare const getDisclaimers: (courses: string[], countryCode: string) => string[];
export declare const lookupPrice: (connection: PoolConnection, courseCode: string, countryCode: string, provinceCode?: string | undefined) => Promise<PriceRow>;
export declare const lookupCurrency: (connection: PoolConnection, currencyCode: string) => Promise<Currency>;
export declare const makeupCourse: (course: string) => boolean;
export declare const designCourse: (course: string) => boolean;
export declare const eventFoundationCourse: (course: string) => boolean;
export declare const eventAdvancedCourse: (course: string) => boolean;
export declare const eventCourse: (course: string) => boolean;
export declare const sumBigArray: (previous: Big, current: Big) => Big;
export {};
