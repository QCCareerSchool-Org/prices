import { PoolConnection } from 'promise-mysql';
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
    courses: string[];
    countryCode: string;
    provinceCode: string | null;
    discountAll: number;
    options?: OldPriceQueryOptions;
    _: number;
}
export declare const oldGetPrices: (connection: PoolConnection, courses: string[], countryCode: string, provinceCode: string | null, discountAll: number, options?: OldPriceQueryOptions | undefined) => Promise<OldPriceResult>;
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
    courses: {
        [course: string]: OldCourse;
    };
    discountAll: boolean;
    complete: boolean;
    noShipCountry: boolean;
}
export {};
