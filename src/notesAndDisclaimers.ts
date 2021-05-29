import { audCountry, gbpCountry, nzdCountry } from '@qccareerschool/helper-functions';
import { isDesignCourse, isMakeupAdvancedCourse } from './courses';
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

  // fan deck
  if (options?.school === 'QC Design School' && (now.getTime() >= Date.UTC(2021, 4, 15, 12) && now.getTime() < Date.UTC(2021, 4, 17, 13))) {
    if (courses.length >= 1) {
      notes.push('fan deck');
      disclaimers.push('You\'ll receive the FREE Benjamin Moore color fan deck');
    }
  }

  // Aisle Planner software
  if (options?.school === 'QC Event School' && (now.getTime() >= Date.UTC(2021, 4, 17, 13) && now.getTime() < Date.UTC(2021, 5, 1, 13))) {
    if (courses.length >= 1) {
      notes.push('Aisle Planner software');
      disclaimers.push('You\'ll receive a FREE 6-month subscription to Aisle Planner, an all-in-one event planning software');
    }
  }

  // ELITE promo code
  if (applies(promoCodeSpecs.find(p => p.code === 'ELITE'))) {
    if (noShipping === 'ALLOWED' || noShipping === 'FORBIDDEN') {
      notes.push('elite makeup kit');
      disclaimers.push('You will receive the <strong>elite makeup kit upgrade</strong> (includes a highlight palette, contour palette, eyebrow palette, 4-pack of false lashes, a makeup travel bag, and a stainless steel palette with spatula).');
    } else if (noShipping === 'APPLIED') {
      promoWarnings.push('You entered the <strong>ELITE</strong> promo code, but have chosen to not have any materials shipped. You will not receive any makeup kits.');
    } else if (noShipping === 'REQUIRED') {
      promoWarnings.push('You entered the <strong>ELITE</strong> promo code, but we do not ship to your country. You will not receive any makeup kits.');
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

  // FOUNDIT promo code
  if (applies(promoCodeSpecs.find(p => p.code === 'FOUNDIT'))) {
    if (!courses.includes('MZ') && !courses.includes('VM')) {
      promoWarnings.push('You have entered the <strong>FOUNDIT</strong> promo code but have not selected the <strong>Master Makeup Artistry</strong> and <strong>Virtual Makeup</strong> courses.');
    } else if (!courses.includes('MZ')) {
      promoWarnings.push('You have entered the <strong>FOUNDIT</strong> promo code but have not selected the <strong>Master Makeup Artistry</strong> course.');
    } else if (!courses.includes('VM')) {
      promoWarnings.push('You have entered the <strong>FOUNDIT</strong> promo code but have not selected the <strong>Virtual Makeup</strong> course.');
    }
  }

  // SAVE50 promo code
  if (applies(promoCodeSpecs.find(p => p.code === 'SAVE50'))) {
    if (courses.length < 2) {
      promoWarnings.push('You have entered the <strong>SAVE50</strong> promo code but have not selected more than one course. Select additional courses above to take advantage of this promotion.');
    }
  }

  // ADVANCED100 promo code
  if (applies(promoCodeSpecs.find(p => p.code === 'ADVANCED100'))) {
    if (!courses.some(c => isMakeupAdvancedCourse(c))) {
      promoWarnings.push('You have entered the <strong>ADVANCED100</strong> promo code but have not selected any advanced makeup courses.');
    }
  }

  // SPRING21 promo code
  if (applies(promoCodeSpecs.find(p => p.code === 'SPRING21'))) {
    if (!courses.includes('MZ') && !courses.some(c => isMakeupAdvancedCourse(c))) {
      promoWarnings.push('You have entered the <strong>SPRING21</strong> promo code but have not selected the <strong>Master Makeup Artistry</strong> course and an Advanced makeup course.');
    } else if (!courses.includes('MZ')) {
      promoWarnings.push('You have entered the <strong>SPRING21</strong> promo code but have not selected the <strong>Master Makeup Artistry</strong> course.');
    } else if (!courses.some(c => isMakeupAdvancedCourse(c))) {
      promoWarnings.push('You have entered the <strong>SPRING21</strong> promo code but have not selected an Advanced makeup course.');
    }
  }

  // HAPPYMAY promo code
  if (applies(promoCodeSpecs.find(p => p.code === 'HAPPYMAY'))) {
    if (!courses.includes('MZ') && !courses.includes('VM')) {
      promoWarnings.push('You have entered the <strong>HAPPYMAY</strong> promo code but have not selected the <strong>Master Makeup Artistry</strong> course or the <strong>Virtual Makeup</strong> course.');
    } else if (!courses.includes('MZ')) {
      promoWarnings.push('You have entered the <strong>HAPPYMAY</strong> promo code but have not selected the <strong>Master Makeup Artistry</strong> course.');
    } else if (!courses.includes('VM')) {
      promoWarnings.push('You have entered the <strong>HAPPYMAY</strong> promo code but have not selected the <strong>Virtual Makeup</strong> course.');
    } else {
      if (noShipping === 'ALLOWED' || noShipping === 'FORBIDDEN') {
        notes.push('elite makeup kit');
        disclaimers.push('You will receive the <strong>elite makeup kit upgrade</strong> (includes a highlight palette, contour palette, eyebrow palette, 4-pack of false lashes, a makeup travel bag, and a stainless steel palette with spatula).');
      } else if (noShipping === 'APPLIED') {
        promoWarnings.push('You entered the <strong>ELITE</strong> promo code, but have chosen to not have any materials shipped. You will not receive any makeup kits.');
      } else if (noShipping === 'REQUIRED') {
        promoWarnings.push('You entered the <strong>ELITE</strong> promo code, but we do not ship to your country. You will not receive any makeup kits.');
      }
    }
  }

  // SKINCARE60 promo code
  if (applies(promoCodeSpecs.find(p => p.code === 'SKINCARE60'))) {
    if (!courses.includes('MZ') && !courses.includes('SK')) {
      promoWarnings.push('You have entered the <strong>SKINCARE60</strong> promo code but have not selected the <strong>Master Makeup Artistry</strong> course or the <strong>Skincare</strong> course.');
    } else if (!courses.includes('MZ')) {
      promoWarnings.push('You have entered the <strong>SKINCARE60</strong> promo code but have not selected the <strong>Master Makeup Artistry</strong> course.');
    } else if (!courses.includes('SK')) {
      promoWarnings.push('You have entered the <strong>SKINCARE60</strong> promo code but have not selected the <strong>Skincare</strong> course.');
    }
  }

  if (applies(promoCodeSpecs.find(p => p.code === 'NATHANSDAY'))) {
    if (noShipping === 'ALLOWED' || noShipping === 'FORBIDDEN') {
      notes.push('elite makeup kit');
      disclaimers.push('You will receive the <strong>elite makeup kit upgrade</strong> (includes a highlight palette, contour palette, eyebrow palette, 4-pack of false lashes, a makeup travel bag, and a stainless steel palette with spatula).');
    } else if (noShipping === 'APPLIED') {
      promoWarnings.push('You entered the <strong>ELITE</strong> promo code, but have chosen to not have any materials shipped. You will not receive any makeup kits.');
    } else if (noShipping === 'REQUIRED') {
      promoWarnings.push('You entered the <strong>ELITE</strong> promo code, but we do not ship to your country. You will not receive any makeup kits.');
    }
  }

  // MOTHERSDAY promo code
  if (applies(promoCodeSpecs.find(p => p.code === 'MOTHERSDAY'))) {
    if (!courses.includes('MZ') && !courses.includes('MW')) {
      promoWarnings.push('You have entered the <strong>MOTHERSDAY</strong> promo code but have not selected the <strong>Master Makeup Artistry</strong> course or the <strong>Pro Makeup Workshop</strong>.');
    } else if (!courses.includes('MZ')) {
      promoWarnings.push('You have entered the <strong>MOTHERSDAY</strong> promo code but have not selected the <strong>Master Makeup Artistry</strong> course.');
    } else if (!courses.includes('MW')) {
      promoWarnings.push('You have entered the <strong>SKINCAMOTHERSDAYRE60</strong> promo code but have not selected the <strong>Pro Makeup Workshop</strong>.');
    }
  }

  // LEVELUP promo code
  if (applies(promoCodeSpecs.find(p => p.code === 'LEVELUP'))) {
    if (!courses.includes('MZ') && !courses.includes('VM')) {
      promoWarnings.push('You have entered the <strong>LEVELUP</strong> promo code but have not selected the <strong>Master Makeup Artistry</strong> and <strong>Virtual Makeup</strong> courses.');
    } else if (!courses.includes('MZ')) {
      promoWarnings.push('You have entered the <strong>LEVELUP</strong> promo code but have not selected the <strong>Master Makeup Artistry</strong> course.');
    } else if (!courses.includes('VM')) {
      promoWarnings.push('You have entered the <strong>LEVELUP</strong> promo code but have not selected the <strong>Virtual Makeup</strong> course.');
    }
  }

  // WEEKEND promo (Makeup)
  if (applies(promoCodeSpecs.find(v => v.code === 'WEEKEND' && v.schools?.includes('QC Makeup Academy')))) {
    if (!courses.includes('MZ') && !courses.includes('VM')) {
      promoWarnings.push('You entered the <strong>WEEKEND</strong> promo code, but you did not select the Master Makeup Artistry or Virtual Makeup courses');
    } else if (!courses.includes('MZ')) {
      promoWarnings.push('You entered the <strong>WEEKEND</strong> promo code, but you did not select the Master Makeup Artistry course');
    } else if (!courses.includes('VM')) {
      promoWarnings.push('You entered the <strong>WEEKEND</strong> promo code, but you did not select the Virtual Makeup course');
    }
    if (noShipping === 'ALLOWED' || noShipping === 'FORBIDDEN') {
      notes.push('elite makeup kit');
      disclaimers.push('You will receive the <strong>elite makeup kit upgrade</strong> (includes a highlight palette, contour palette, eyebrow palette, 4-pack of false lashes, a makeup travel bag, and a stainless steel palette with spatula).');
    } else if (noShipping === 'APPLIED') {
      promoWarnings.push('You entered the <strong>WEEKEND</strong> promo code, but have chosen to not have any materials shipped. You will not receive any makeup kits.');
    } else if (noShipping === 'REQUIRED') {
      promoWarnings.push('You entered the <strong>WEEKEND</strong> promo code, but we do not ship to your country. You will not receive any makeup kits.');
    }
  }

  // WEEKEND promo (Design)
  if (applies(promoCodeSpecs.find(v => v.code === 'WEEKEND' && v.schools?.includes('QC Design School')))) {
    if (courses.filter(c => isDesignCourse(c)).length < 2) {
      promoWarnings.push('You have entered the <strong>WEEKEND</strong> promo code but have not selected more than one design course. Select additional courses above to take advantage of this promotion.');
    }
    notes.push('fan deck');
    disclaimers.push('You\'ll receive the FREE Sherwin-Williams color fan deck');
  }

  // JUNE21 promo (Design)
  if (applies(promoCodeSpecs.find(v => v.code === 'JUNE21' && v.schools?.includes('QC Design School')))) {
    if (courses.filter(c => isDesignCourse(c)).length < 2) {
      promoWarnings.push('You have entered the <strong>WEEKEND</strong> promo code but have not selected more than one design course. Select additional courses above to take advantage of this promotion.');
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
