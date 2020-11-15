import { PriceRow, PriceQueryOptions } from './prices';
/**
 * Determines which courses should be free
 * @param courses the selected courses
 * @param options the price query options
 */
export declare const getFreeCourses: (priceRows: PriceRow[], options?: PriceQueryOptions | undefined) => string[];
