import { CurrencyCode } from '../../types';

export const studentDiscountAmount = (currencyCode: CurrencyCode): number => currencyCode === 'GBP' ? 25 : 50;
