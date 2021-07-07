import { CurrencyCode } from '../../types';

const gbpDiscount = 50;
const otherDiscount = 50;

export const studentDiscountAmount = (currencyCode: CurrencyCode): number => (currencyCode === 'GBP' ? gbpDiscount : otherDiscount);
