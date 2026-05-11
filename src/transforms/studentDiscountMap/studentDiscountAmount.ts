import type { CurrencyCode } from '../../domain/currencyCode';

const gbpDiscount = 25;
const otherDiscount = 50;

export const studentDiscountAmount = (currencyCode: CurrencyCode): number => (currencyCode === 'GBP' ? gbpDiscount : otherDiscount);
