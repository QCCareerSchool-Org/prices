import { audCountry, gbpCountry, nzdCountry } from '@qccareerschool/helper-functions';
import { isMakeupAdvancedCourse } from './courses';
import { promoCodeApplies, PromoCodeSpec, promoCodeSpecs } from './promoCodes';
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

  const applies = (spec?: PromoCodeSpec) => spec && promoCodeApplies(spec, now, student, options?.promoCode, options?.school);

  const student = options?.discountAll ?? false;

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
    if (noShipping === 'ALLOWED' || noShipping === 'FORBIDDEN') {
      notes.push('elite makeup kit');
      disclaimers.push('You will receive a free elite makeup kit (includes a highlight palette, contour palette, eyebrow palette, 4-pack of false lashes, a makeup travel bag, and a stainless steel palette with spatula).');
    } else if (noShipping === 'APPLIED') {
      promoWarnings.push('You entered the <strong>ELITE promo code</strong>, but have chosen to not have any materials shipped. You will not receive any makeup kits.');
    } else if (noShipping === 'REQUIRED') {
      promoWarnings.push('You entered the <strong>ELITE promo code</strong>, but we do not ship to your country. You will not receive any makeup kits.');
    }
  }

  // FREEPRO promo code
  if (applies(promoCodeSpecs.find(p => p.code === 'FREEPRO'))) {
    if (!courses.includes('MZ') && !courses.includes('MW')) {
      promoWarnings.push('You have entered the <strong>FREEPRO promo code</strong> but have not selected the <strong>Master Makeup Aristry</strong> and <strong>Pro Makeup Workshop</strong> courses.');
    } else if (!courses.includes('MZ')) {
      promoWarnings.push('You have entered the <strong>FREEPRO promo code</strong> but have not selected the <strong>Master Makeup Aristry</strong> course.');
    } else if (!courses.includes('MW')) {
      promoWarnings.push('You have entered the <strong>FREEPRO promo code</strong> but have not selected the <strong>Pro Makeup Workshop</strong> course.');
    }
  }

  // FOUNDIT promo code
  if (applies(promoCodeSpecs.find(p => p.code === 'FOUNDIT'))) {
    if (!courses.includes('MZ') && !courses.includes('VM')) {
      promoWarnings.push('You have entered the <strong>FOUNDIT promo code</strong> but have not selected the <strong>Master Makeup Aristry</strong> and <strong>Virtual Makeup</strong> courses.');
    } else if (!courses.includes('MZ')) {
      promoWarnings.push('You have entered the <strong>FOUNDIT promo code</strong> but have not selected the <strong>Master Makeup Aristry</strong> course.');
    } else if (!courses.includes('VM')) {
      promoWarnings.push('You have entered the <strong>FOUNDIT promo code</strong> but have not selected the <strong>Virtual Makeup</strong> course.');
    }
  }

  // SAVE50 promo code
  if (applies(promoCodeSpecs.find(p => p.code === 'SAVE50'))) {
    if (courses.length < 2) {
      promoWarnings.push('You have entered the <strong>SAVE50 promo code</strong> but have not selected more than one course. Select additional courses above to take advantage of this promotion.');
    }
  }

  // ADVANCED100 promo code
  if (applies(promoCodeSpecs.find(p => p.code === 'ADVANCED100'))) {
    if (!courses.some(c => isMakeupAdvancedCourse(c))) {
      promoWarnings.push('You have entered the <strong>ADVANCED100 promo code</strong> but have not selected any advanced makeup courses.');
    }
  }

  // SPRING21 promo code
  if (applies(promoCodeSpecs.find(p => p.code === 'SPRING21'))) {
    if (!courses.includes('MZ') && !courses.some(c => isMakeupAdvancedCourse(c))) {
      promoWarnings.push('You have entered the <strong>SPRING21 promo code</strong> but have not selected the <strong>Master Makeup Aristry</strong> and an Advanced makeup course.');
    } else if (!courses.includes('MZ')) {
      promoWarnings.push('You have entered the <strong>SPRING21 promo code</strong> but have not selected the <strong>Master Makeup Aristry</strong> course.');
    } else if (!courses.some(c => isMakeupAdvancedCourse(c))) {
      promoWarnings.push('You have entered the <strong>SPRING21 promo code</strong> but have not selected an Advanced makeup course.');
    }
  }

  if (courses.includes('DG') && audCountry(countryCode)) {
    disclaimers.push('The WAHL clippers and attachment combs will not be provided with your course. ' +
      'QC only supplies the North American version, which is not compatible with power outlets in your country. ' +
      'Your course has therefore been discounted by $280 so that you may purchase your own clippers and combs.');
  }

  if (courses.includes('DG') && gbpCountry(countryCode)) {
    disclaimers.push('The WAHL clippers and attachment combs will not be provided with your course. ' +
      'QC only supplies the North American version, which is not compatible with power outlets in your country. ' +
      'Your course has therefore been discounted by £150 so that you may purchase your own clippers and combs.');
  }

  if (courses.includes('DG') && nzdCountry(countryCode)) {
    disclaimers.push('The WAHL clippers and attachment combs will not be provided with your course. ' +
      'QC only supplies the North American version, which is not compatible with power outlets in your country. ' +
      'Your course has therefore been discounted by $300 so that you may purchase your own clippers and combs.');
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
