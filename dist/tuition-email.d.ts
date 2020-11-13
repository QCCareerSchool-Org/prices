import { PriceResult, PriceQuery } from './prices';
export declare type TuitionEmailBody = PriceQuery & {
    emailAddress: string;
    school: 'makeup' | 'event' | 'design' | 'pet' | 'wellness';
};
export declare function sendTuitionEmail(emailAddress: string, school: string, price: PriceResult): Promise<void>;
