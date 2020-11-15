import { PoolConnection } from 'promise-mysql';
import { PriceRow } from './prices';
export declare function lookupPriceByCountryAndProvince(connection: PoolConnection, courseCode: string, countryCode: string | null, provinceCode: string | null): Promise<PriceRow[]>;
