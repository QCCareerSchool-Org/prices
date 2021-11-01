import { isDesignCourse, isEventFoundationCourse, isEventSpecialtyCourse, isMakeupAdvancedCourse, isMakeupFoundationCourse } from './courses';
import { PromoCodeSpec, promoCodeSpecs, specApplies } from './promoCodes';
import { NoShipping, PriceQueryOptions } from './types';

/**
 * Returns a tuple of string arrays [ notes, disclaimers, promoWarnings ]
 *
 * Note: These strings may be inserted as raw HTML by the front end application
 * Do not include any unescaped user input in them (preferably do not include
 * any user input at all). Also ensure that they are valid HTML with proper
 * closing tags.
 * @param courses the courses
 * @param countryCode the country code
 */
export const notesAndDisclaimers = (now: Date, courses: string[], countryCode: string, noShipping: NoShipping, options?: PriceQueryOptions): [string[], string[], string[]] => {
  const notes: string[] = [];
  const disclaimers: string[] = [];
  const promoWarnings: string[] = [];

  const applies = (spec?: PromoCodeSpec): boolean => typeof spec !== 'undefined' && specApplies(spec, now, options?.discountAll, options?.promoCode, options?.school);

  // studentDiscount option
  if (options?.studentDiscount) {
    notes.push('additional discount');
  }

  // deluxeKit option
  if (options?.deluxeKit === true && (noShipping === 'ALLOWED' || noShipping === 'FORBIDDEN')) {
    if (courses.includes('MZ')) {
      notes.push('deluxe/elite/better kit');
    }
  }

  // MMFreeMW option
  if (options?.MMFreeMW === true) {
    if (courses.includes('MM') || courses.includes('MZ')) {
      notes.push('free MW course');
    }
  }

  // portfolio option
  if (options?.portfolio === true) {
    notes.push('portfolio');
  }

  // ELITE promo code
  if (applies(promoCodeSpecs.find(p => p.code === 'ELITE'))) {
    if (noShipping === 'APPLIED') {
      promoWarnings.push('You entered the <strong>ELITE</strong> promo code, but have chosen to not have any materials shipped. You will not receive any makeup kits.');
    } else if (noShipping === 'REQUIRED') {
      promoWarnings.push('You entered the <strong>ELITE</strong> promo code, but we do not ship to your country. You will not receive any makeup kits.');
    } else if (noShipping === 'ALLOWED' || noShipping === 'FORBIDDEN') {
      if (!courses.includes('MZ')) {
        promoWarnings.push('You have entered the <strong>ELITE</strong> promo code but have not selected the <strong>Master Makeup Artistry</strong> course.');
      } else {
        notes.push('elite makeup kit');
        disclaimers.push('You will receive the <strong>elite makeup kit upgrade</strong> (includes a highlight palette, contour palette, eyebrow palette, 4-pack of false lashes, a makeup travel bag, and a stainless steel palette with spatula).');
      }
    }
  }

  // FREEPRO promo code
  if (applies(promoCodeSpecs.find(p => p.code === 'FREEPRO'))) {
    if (!courses.includes('MZ') && !courses.includes('MW')) {
      promoWarnings.push('You have entered the <strong>FREEPRO</strong> promo code but have not selected the <strong>Master Makeup Artistry</strong> and <strong>Pro Makeup Workshop</strong> courses.');
    } else if (!courses.includes('MZ')) {
      promoWarnings.push('You have entered the <strong>FREEPRO</strong> promo code but have not selected the <strong>Master Makeup Artistry</strong> course.');
    } else if (!courses.includes('MW')) {
      promoWarnings.push('You have entered the <strong>FREEPRO</strong> promo code but have not selected the <strong>Pro Makeup Workshop</strong> course.');
    }
  }

  // SAVE50 promo code
  if (applies(promoCodeSpecs.find(p => p.code === 'SAVE50'))) {
    if (courses.length < 2) {
      promoWarnings.push('You have entered the <strong>SAVE50</strong> promo code but have not selected more than one course. Select additional courses above to take advantage of this promotion.');
    }
  }

  // EXPERT promo code
  if (applies(promoCodeSpecs.find(v => v.code === 'EXPERT'))) {
    if (!courses.some(c => isEventFoundationCourse(c))) {
      promoWarnings.push('You have entered the <strong>EXPERT</strong> promo code but have not selected a Foundation course.');
    } else if (!courses.some(c => isEventSpecialtyCourse(c))) {
      promoWarnings.push('You have entered the <strong>EXPERT</strong> promo code but have not selected a Specialty course.');
    }
  }

  // QCLASHES promo code
  if (applies(promoCodeSpecs.find(v => v.code === 'QCLASHES'))) {
    if (courses.some(c => [ 'MZ', 'SK', 'AB', 'SF', 'HS', 'GB' ].includes(c))) {
      disclaimers.push('You\'ll receive bonus lashes in your makeup kit');
      notes.push('bonus lashes');
    } else {
      promoWarnings.push(`Unfortunately the <strong>QCLASHES</strong> code is not valid with the course${courses.length === 1 ? '' : 's'} you have selected.`);
      promoWarnings.push('Please chose at least one course from Master Makeup Artistry, Skincare, Airbrush Makeup Workshop, Special FX Makeup, Hair Styling Essentials, or Global Beauty.');
    }
  }

  // BOGO promo code
  if (applies(promoCodeSpecs.find(v => v.code === 'BOGO'))) {
    if (courses.length === 0) {
      promoWarnings.push('You have entered the <strong>BOGO</strong> promo code, but you haven\'t selected any courses.');
    } else if (courses.length === 1) {
      promoWarnings.push('You have entered the <strong>BOGO</strong> promo code, but you haven\'t selected a free second course.');
    }
  }

  // LUMINOUS promo code
  if (applies(promoCodeSpecs.find(v => v.code === 'LUMINOUS'))) {
    if (!courses.includes('MZ')) {
      promoWarnings.push('You have entered the <strong>LUMINOUS</strong> promo code, but you haven\'t selected the <strong>Master Makeup Artistry</strong> course.');
    } else {
      disclaimers.push('You\'ll receive the Luminous Collection');
      notes.push('luminous collection');
    }
  }

  if (courses.includes('EB')) {
    disclaimers.push('The Accelerate Your Business Workshop includes electronic course material only.');
  }

  if (courses.includes('FC')) {
    disclaimers.push('The Professional Caregiving Course includes electronic course material only.');
  }

  if (courses.includes('FL')) {
    disclaimers.push('The Festivals &amp; Live Events Course requires corporate event training.');
  }

  if (courses.includes('PE')) {
    disclaimers.push('The Promotional Event Planning Course requires corporate event training.');
  }

  if (courses.includes('PW')) {
    disclaimers.push('The Portfolio Development Workshop includes electronic course material only.');
  }

  if (courses.includes('MW')) {
    disclaimers.push('The Pro Makeup Workshop includes electronic course material only.');
  }

  if (courses.includes('PF')) {
    disclaimers.push('The Fashion Styling Course includes electronic course material only.');
  }

  return [ notes, disclaimers, promoWarnings ];
};
