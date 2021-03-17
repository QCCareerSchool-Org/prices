import { School } from './types';

type PromoCode = {
  code: string;
  schools: School[];
}

const validPromoCodes: PromoCode[] = [
  { code: 'SAVE50', schools: [ 'QC Makeup Academy' ] },
  { code: 'HEATHER50', schools: [ 'QC Makeup Academy' ] },
  { code: 'ANDREW50', schools: [ 'QC Makeup Academy' ] },
  { code: 'SHANNON50', schools: [ 'QC Makeup Academy' ] },
  { code: 'ANNIE50', schools: [ 'QC Makeup Academy' ] },
];

export const promoCodeRecognized = (school?: School, promoCode?: string): boolean | undefined => {
  if (!promoCode) {
    return;
  }
  return validPromoCodes.some(v => v.code === promoCode && school && v.schools.includes(school));
};
