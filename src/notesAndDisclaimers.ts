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
    } else if (courses.length < 2) {
      promoWarnings.push('You have entered the <strong>BOGO</strong> promo code, but you haven\'t selected a free second course.');
    }
    switch (options?.school) {
      case 'QC Design School':
        if (courses.length > 0) {
          disclaimers.push('You\'ll receive the Deluxe Design Kit');
          notes.push('deluxe design kit');
        }
        break;
      case 'QC Event School':
        if (courses.length > 0) {
          disclaimers.push('You\'ll receive The Little Book of Wedding Checklists ');
          notes.push('The Little Book of Wedding Checklists');
        }
        break;
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

  // BLACK FRIDAY promo code
  if (applies(promoCodeSpecs.find(v => v.code === 'BLACK FRIDAY'))) {
    switch (options?.school) {
      case 'QC Makeup Academy':
        if (!courses.includes('MZ')) {
          promoWarnings.push('You have entered the <strong>BLACK FRIDAY</strong> promo code, but you haven\'t selected the <strong>Master Makeup Artistry</strong> course');
        } else {
          if (courses.length === 1) {
            promoWarnings.push('You have entered the <strong>BLACK FRIDAY</strong> promo code, but you haven\'t selected your free course');
          }
          disclaimers.push('You\'ll receive the Luminous Collection');
          notes.push('luminous collection');
        }
        break;
      case 'QC Design School':
        if (!courses.includes('VD')) {
          if (courses.length < 2) {
            promoWarnings.push('You have entered the <strong>BLACK FRIDAY</strong> promo code, but you haven\'t selected your free courses');
          } else {
            promoWarnings.push('You have entered the <strong>BLACK FRIDAY</strong> promo code, but you haven\'t selected your free <strong>Virtual Design</strong> course');
          }
        } else {
          if (courses.length < 3) {
            promoWarnings.push('You have entered the <strong>BLACK FRIDAY</strong> promo code, but you haven\'t selected your second free course');
          }
        }
        disclaimers.push('You\'ll receive the Deluxe Design Kit');
        notes.push('deluxe design kit');
        break;
      case 'QC Event School':
        if (!courses.includes('EP')) {
          promoWarnings.push('You have entered the <strong>BLACK FRIDAY</strong> promo code, but you haven\'t selected the <strong>Event &amp; Wedding Planning</strong> course');
        } else {
          const specialtyCourseCount = courses.filter(c => isEventSpecialtyCourse(c)).length;
          if (specialtyCourseCount === 0) {
            promoWarnings.push('You have entered the <strong>BLACK FRIDAY</strong> promo code, but you haven\'t selected your free specialty courses');
          } else if (specialtyCourseCount === 1) {
            promoWarnings.push('You have entered the <strong>BLACK FRIDAY</strong> promo code, but you haven\'t selected your <strong>second</strong> free specialty course');
          }
          disclaimers.push('You\'ll receive the leather portfolio');
          notes.push('leather portfolio');
        }
        break;
    }
  }

  // SKINCARE
  if (applies(promoCodeSpecs.find(v => v.code === 'SKINCARE'))) {
    if (!courses.includes('MZ')) {
      promoWarnings.push('You have entered the <strong>SKINCARE</strong> promo code, but you haven\'t selected the <strong>Master Makeup Artistry</strong> course');
    } else {
      if (!courses.includes('SK')) {
        promoWarnings.push('You have entered the <strong>SKINCARE</strong> promo code, but you haven\'t selected the <strong>Skincare</strong> course');
      }
      disclaimers.push('You\'ll receive the Luminous Collection');
      notes.push('luminous collection');
    }
  }

  if (options?.school === 'QC Wellness Studies' && courses.length >= 1) {
    if (options.discountAll) {
      // nothing
    } else {
      disclaimers.push('You\'ll get the leather portfolio');
      notes.push('leather portfolio');
    }
  }

  if (options?.school === 'QC Pet Studies' && courses.length >= 1) {
    if (options.discountAll) {
      // nothing
    } else {
      disclaimers.push('You\'ll get the pack of 20 dog bows');
      notes.push('dog bows');
    }
  }

  if (options?.school === 'QC Makeup Academy' && courses.length >= 1) {
    if (options.discountAll) {
      disclaimers.push('You\'ll get the Effortless Eye Kit');
      notes.push('Effortless Eye Kit');
    } else {
      // nothing
    }
  }

  if (options?.school === 'QC Event School' && courses.length >= 1) {
    if (options.discountAll) {
      disclaimers.push('You\'ll get the free leather portfolio');
      notes.push('portfolio');
    } else {
      // nothing
    }
  }

  if (options?.school === 'QC Design School' && courses.length >= 1) {
    if (options.discountAll) {
      disclaimers.push('You\'ll get the free color fan deck');
      notes.push('fan deck');
    } else {
      // nothing
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
