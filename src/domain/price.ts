import type { Currency } from './currency';
import { isCurrency } from './currency';

export type Price = {
  countryCode: string;
  provinceCode?: string | undefined;
  currency: Currency;
  disclaimers: string[];
  notes: string[];
  promoWarnings: string[];
  noShipping: boolean;
  promoCodeRecognized?: boolean | undefined;
  promoCode?: string | undefined;
  courses: CoursePrice[];
} & PriceDetails;

export interface Plan {
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

export interface PriceDetails {
  /** the base price before any discounts */
  cost: number;
  /** the actual multi-course discount given for this course */
  multiCourseDiscount: number;
  /** additional promotional discount */
  promoDiscount: number;
  /** the discount for not shipping materials */
  discountedCost: number;
  /** the payment plans */
  plans: { full: Plan; part: Plan };
}

export type CoursePrice = {
  code: string;
  name: string;
  primary: boolean;
  free: boolean;
  /** the message to show next to the multi-course discount  */
  discountMessage: string | null;
  /** the discount on courses after the first course */
  multiCourseDiscountRate: number;
  order: number;
} & PriceDetails;

export const isPrice = (obj: unknown): obj is Price => {
  return obj !== null && typeof obj === 'object' &&
    'countryCode' in obj && typeof obj.countryCode === 'string' &&
    (('provinceCode' in obj && (typeof obj.provinceCode === 'string' || typeof obj.provinceCode === 'undefined')) || !('provinceCode' in obj)) &&
    'currency' in obj && isCurrency(obj.currency) &&
    'disclaimers' in obj && Array.isArray(obj.disclaimers) && obj.disclaimers.every(d => typeof d === 'string') &&
    'notes' in obj && Array.isArray(obj.notes) && obj.notes.every(d => typeof d === 'string') &&
    'promoWarnings' in obj && Array.isArray(obj.promoWarnings) && obj.promoWarnings.every(d => typeof d === 'string') &&
    'noShipping' in obj && typeof obj.noShipping === 'boolean' &&
    (('promoCodeRecognized' in obj && (typeof obj.promoCodeRecognized === 'boolean' || typeof obj.promoCodeRecognized === 'undefined')) || !('promoCodeRecognized' in obj)) &&
    (('promoCode' in obj && (typeof obj.promoCode === 'string' || typeof obj.promoCode === 'undefined')) || !('promoCode' in obj)) &&
    'courses' in obj && Array.isArray(obj.courses) && obj.courses.every(isCoursePrice) &&
    isPriceDetails(obj);
};

const isCoursePrice = (obj: unknown): obj is CoursePrice => {
  return obj !== null && typeof obj === 'object' &&
    'code' in obj && typeof obj.code === 'string' &&
    'name' in obj && typeof obj.name === 'string' &&
    'primary' in obj && typeof obj.primary === 'boolean' &&
    'free' in obj && typeof obj.free === 'boolean' &&
    'discountMessage' in obj && (typeof obj.discountMessage === 'string' || obj.discountMessage === null) &&
    isPriceDetails(obj);
};

const isPriceDetails = (obj: unknown): obj is PriceDetails => {
  return obj !== null && typeof obj === 'object' &&
    'cost' in obj && typeof obj.cost === 'number' &&
    'multiCourseDiscount' in obj && typeof obj.multiCourseDiscount === 'number' &&
    'promoDiscount' in obj && typeof obj.promoDiscount === 'number' &&
    'discountedCost' in obj && typeof obj.discountedCost === 'number' &&
    'plans' in obj && isPlans(obj.plans);
};

const isPlans = (obj: unknown): obj is { full: Plan; part: Plan } => {
  return obj !== null && typeof obj === 'object' &&
    (('full' in obj && isPlan(obj.full)) || !('full' in obj)) &&
    (('part' in obj && isPlan(obj.part)) || !('part' in obj));
};

const isPlan = (obj: unknown): obj is Plan => {
  return obj !== null && typeof obj === 'object' &&
    'discount' in obj && typeof obj.discount === 'number' &&
    'deposit' in obj && typeof obj.deposit === 'number' &&
    'installmentSize' in obj && typeof obj.installmentSize === 'number' &&
    'installments' in obj && typeof obj.installments === 'number' &&
    'remainder' in obj && typeof obj.remainder === 'number' &&
    'total' in obj && typeof obj.total === 'number' &&
    'originalDeposit' in obj && typeof obj.originalDeposit === 'number' &&
    'originalInstallments' in obj && typeof obj.originalInstallments === 'number';
};
