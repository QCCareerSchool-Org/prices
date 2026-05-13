import { isEventFoundationCourse, isEventSpecialtyCourse } from './courses';
import type { NoShipping } from './domain/noShipping';
import type { PromoCodes } from './pricing/PromoCodes';

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
export const notesAndDisclaimers = (promoCodes: PromoCodes, courses: string[], countryCode: string, noShipping: NoShipping): [string[], string[], string[]] => {
  const notes: string[] = [];
  const disclaimers: string[] = [];
  const promoWarnings: string[] = [];

  const { now, options } = promoCodes;
  const applies = (code: string): boolean => promoCodes.applies(code);

  // studentDiscount option
  if (options?.studentDiscount) {
    notes.push('additional discount');
  }

  // ELITE promo code
  if (applies('ELITE')) {
    if (noShipping === 'APPLIED') {
      promoWarnings.push('You entered the <strong>ELITE</strong> promo code, but have chosen to not have any materials shipped. You will not receive any makeup kits.');
    } else if (noShipping === 'REQUIRED') {
      promoWarnings.push('You entered the <strong>ELITE</strong> promo code, but we do not ship to your country. You will not receive any makeup kits.');
    } else { // 'ALLOWED', 'FORBIDDEN'
      if (!courses.includes('MZ')) {
        promoWarnings.push('You have entered the <strong>ELITE</strong> promo code but have not selected the <strong>Master Makeup Artistry</strong> course.');
      }
    }
  }

  // FREEPRO promo code
  if (applies('FREEPRO')) {
    if (!courses.includes('MZ') && !courses.includes('MW')) {
      promoWarnings.push('You have entered the <strong>FREEPRO</strong> promo code but have not selected the <strong>Master Makeup Artistry</strong> and <strong>Pro Makeup Workshop</strong> courses.');
    } else if (!courses.includes('MZ')) {
      promoWarnings.push('You have entered the <strong>FREEPRO</strong> promo code but have not selected the <strong>Master Makeup Artistry</strong> course.');
    } else if (!courses.includes('MW')) {
      promoWarnings.push('You have entered the <strong>FREEPRO</strong> promo code but have not selected the <strong>Pro Makeup Workshop</strong> course.');
    }
  }

  // SAVE50 promo code
  if (applies('SAVE50')) {
    if (courses.length < 2) {
      promoWarnings.push('You have entered the <strong>SAVE50</strong> promo code but have not selected more than one course. Select additional courses above to take advantage of this promotion.');
    }
  }

  // EXPERT promo code
  if (applies('EXPERT')) {
    if (!courses.some(c => isEventFoundationCourse(c))) {
      promoWarnings.push('You have entered the <strong>EXPERT</strong> promo code but have not selected a Foundation course.');
    } else if (!courses.some(c => isEventSpecialtyCourse(c))) {
      promoWarnings.push('You have entered the <strong>EXPERT</strong> promo code but have not selected a Specialty course.');
    }
  }

  // QCLASHES promo code
  if (applies('QCLASHES') || applies('QCLASHES60')) {
    if (courses.some(c => [ 'MZ', 'SK', 'AB', 'SF', 'HS', 'GB' ].includes(c))) {
      disclaimers.push('You\'ll receive bonus lashes in your makeup kit');
      notes.push('bonus lashes');
    } else {
      promoWarnings.push(`Unfortunately the <strong>QCLASHES</strong> code is not valid with the course${courses.length === 1 ? '' : 's'} you have selected.`);
      promoWarnings.push('Please chose at least one course from Master Makeup Artistry, Skincare, Airbrush Makeup Workshop, Special FX Makeup, Hair Styling Essentials, or Global Beauty.');
    }
  }

  // BOGO promo code
  if (applies('BOGO')) {
    if (courses.length === 0) {
      promoWarnings.push('You have entered the <strong>BOGO</strong> promo code, but you haven\'t selected any courses.');
    } else if (courses.length < 2) {
      promoWarnings.push('You have entered the <strong>BOGO</strong> promo code, but you haven\'t selected a free second course.');
    }
  }

  // SKINCARE
  if (applies('SKINCARE')) {
    if (!courses.includes('MZ')) {
      promoWarnings.push('You have entered the <strong>SKINCARE</strong> promo code, but you haven\'t selected the <strong>Master Makeup Artistry</strong> course');
    } else {
      if (!courses.includes('SK')) {
        promoWarnings.push('You have entered the <strong>SKINCARE</strong> promo code, but you haven\'t selected the <strong>Skincare</strong> course');
      }
    }
  }

  // EVENTFREECOURSE promo code
  if (applies('EVENTFREECOURSE')) {
    if (!courses.some(c => isEventFoundationCourse(c))) {
      promoWarnings.push('You have entered the <strong>EVENTFREECOURSE</strong> promo code, but you haven\'t selected a <strong>foundation</strong> course');
    } else {
      if (courses.length < 2) {
        promoWarnings.push('You have entered the <strong>EVENTFREECOURSE</strong> promo code, but you haven\'t selected a free course');
      }
    }
  }

  // SPECIALTY promo code
  if (applies('SPECIALTY')) {
    if (!courses.some(c => isEventFoundationCourse(c))) {
      promoWarnings.push('You have entered the <strong>SPECIALTY</strong> promo code, but you haven\'t selected a <strong>Foundation</strong> course');
    } else {
      const specialtyCount = courses.filter(c => isEventSpecialtyCourse(c)).length;
      if (specialtyCount === 0) {
        promoWarnings.push('You have entered the <strong>SPECIALTY</strong> promo code, but you haven\'t selected any free <strong>Specialty</strong> courses');
      }
    }
  }

  // 2SPECIALTY and MCSPECIALTY promo codes
  [ '2SPECIALTY', 'MCSPECIALTY', 'SSMCSPECIALTY', '2SPECIALTY100' ].forEach(code => {
    if (applies(code)) {
      if (!courses.some(c => isEventFoundationCourse(c))) {
        promoWarnings.push(`You have entered the <strong>${code}</strong> promo code, but you haven't selected a <strong>Foundation</strong> course`);
      } else {
        const specialtyCount = courses.filter(c => isEventSpecialtyCourse(c)).length;
        if (specialtyCount === 0) {
          promoWarnings.push(`You have entered the <strong>${code}</strong> promo code, but you haven't selected any free <strong>Specialty</strong> courses`);
        } else if (specialtyCount === 1) {
          promoWarnings.push(`You have entered the <strong>${code}</strong> promo code, but you haven't selected a second free <strong>Specialty</strong> course`);
        }
      }
    }
  });

  // FREELUXURY promo code
  if (applies('FREELUXURY')) {
    if (!courses.some(c => isEventFoundationCourse(c))) {
      promoWarnings.push('You have entered the <strong>FREELUXURY</strong> promo code, but you haven\'t selected a <strong>Foundation</strong> course');
    } else if (!courses.includes('LW')) {
      promoWarnings.push('You have entered the <strong>FREELUXURY</strong> promo code, but you haven\'t selected the free <strong>Luxury Wedding Planning</strong> course');
    }
  }

  // PROLUMINOUS promo code
  if (applies('PROLUMINOUS')) {
    if (!courses.includes('MZ')) {
      promoWarnings.push('You have entered the <strong>PROLUMINOUS</strong> promo code, but you haven\'t selected the <strong>Master Makeup Artistry</strong> course.');
      disclaimers.push('You\'ll get the Luminous Makeup Collection');
    } else {
      if (!courses.includes('MW')) {
        promoWarnings.push('You have entered the <strong>PROLUMINOUS</strong> promo code, but you haven\'t selected your free <strong>Pro Makeup Workshop</strong>.');
      }
    }
  }

  // FREEGLOBAL promo code
  if (applies('FREEGLOBAL')) {
    if (!courses.includes('MZ')) {
      promoWarnings.push('You have entered the <strong>FREEGLOBAL</strong> promo code, but you haven\'t selected the <strong>Master Makeup Artistry</strong> course.');
    } else {
      disclaimers.push('You\'ll get the Luminous Makeup Collection');
      if (!courses.includes('GB')) {
        promoWarnings.push('You have entered the <strong>FREEGLOBAL</strong> promo code, but you haven\'t selected your free <strong>Global Beauty Workshop</strong>.');
      }
    }
  }

  // PORTFOLIO50 promo code
  if (applies('PORTFOLIO') || applies('PORTFOLIO50') || applies('PORTFOLIO60')) {
    if (courses.length > 0) {
      disclaimers.push('You\'ll get the free leather portfolio');
      notes.push('portfolio');
    }
  }

  // FANDECK promo code
  if (applies('FANDECK50')) {
    if (courses.length > 0) {
      disclaimers.push('You\'ll get the free color fan deck');
      notes.push('color fan deck');
    }
  }

  // BRUSHSET50 promo code
  if (applies('BRUSHSET50')) {
    if (courses.length > 0) {
      disclaimers.push('You\'ll get the free bonus brush set');
      notes.push('brush set');
    }
  }

  if (options?.school === 'QC Wellness Studies' && courses.length >= 1) {
    if (options.discountAll) {
      // nothing
    } else {
      // disclaimers.push('You\'ll get the leather portfolio');
      // notes.push('leather portfolio');
    }
  }

  if (options?.school === 'QC Pet Studies' && courses.length >= 1) {
    if (options.discountAll) {
      // nothing
    } else {
      // disclaimers.push('You\'ll get the pack of 20 dog bows');
      // notes.push('dog bows');
    }
  }

  if (options?.school === 'QC Makeup Academy' && courses.length >= 1) {
    if (options.discountAll) {
      if (now >= new Date('2025-01-29T03:00-0500') && now < new Date('2025-02-01T03:00-0500')) {
        disclaimers.push('You\'ll get the free leather portfolio');
        notes.push('portfolio');
      }
    } else {
      if (now >= new Date('2025-01-29T03:00-0500') && now < new Date('2025-02-01T03:00-0500')) {
        disclaimers.push('You\'ll get the free bonus lashes');
        notes.push('lashes set');
      }
    }
  }

  if (options?.school === 'QC Event School' && courses.length >= 1) {
    if (options.discountAll) {
      if (now >= new Date('2025-01-29T03:00-0500') && now < new Date('2025-02-01T03:00-0500')) {
        disclaimers.push('You\'ll get the free leather portfolio');
        notes.push('portfolio');
      }
    } else {
      // nothing
    }
  }

  if (options?.school === 'QC Design School' && courses.length >= 1) {
    if (options.discountAll) {
      if (now >= new Date('2025-01-29T03:00') && now < new Date('2025-02-01T03:00')) {
        disclaimers.push('You\'ll get the free leather portfolio');
        notes.push('portfolio');
      }
    } else {
      // nothing
    }
  }

  if (applies('DG150') || applies('DG200') || applies('DG300')) {
    if (!courses.includes('DG')) {
      promoWarnings.push('You have entered a discount promo code for <strong>Dog Grooming</strong>, but you haven\'t selected the course');
    }
  }

  if (applies('DT150') || applies('DT200') || applies('DT300')) {
    if (!courses.includes('DT')) {
      promoWarnings.push('You have entered a discount promo code for <strong>Dog Training</strong>, but you haven\'t selected the course');
    }
  }

  [ 'MASTERCLASS', 'SSMASTERCLASS' ].forEach(code => {
    if (applies(code)) {
      if (!courses.includes('I2')) {
        promoWarnings.push(`You have entered the <strong>${code}</strong> promo code, but you haven't selected the <strong>Interior Decorating</strong> course`);
      }
    }
  });

  if (applies('LUXURYWEDDING')) {
    if (!courses.includes('EP')) {
      promoWarnings.push('You have entered the <strong>LUXURYWEDDING</strong> promo code, but you haven\'t selected the <strong>Event & Wedding Planning</strong> course');
    } else {
      if (!courses.includes('LW')) {
        promoWarnings.push('You have entered the <strong>LUXURYWEDDING</strong> promo code, but you haven\'t selected your free <strong>Luxury Wedding & Event Planning</strong> course');
      }
      if (!courses.includes('DW')) {
        promoWarnings.push('You have entered the <strong>LUXURYWEDDING</strong> promo code, but you haven\'t selected your free <strong>Desination Wedding Planning</strong> course');
      }
    }
  }

  if (applies('KIT200OFF')) {
    if (!courses.includes('MZ')) {
      promoWarnings.push('You have entered the <strong>KIT200OFF</strong> promo code, but you haven\'t selected the <strong>Master Makeup Artistry</strong> course');
    }
  }

  if (applies('WOOFGANG')) {
    disclaimers.push('This promotion is only available to Woof Gang Bakery employees, managers and store owners.');
  }

  if (courses.includes('FL') && !courses.includes('AA')) {
    disclaimers.push('The Festivals &amp; Live Events Course requires corporate event training.');
  }

  if (courses.includes('PE') && !courses.includes('AA')) {
    disclaimers.push('The Promotional Event Planning Course requires corporate event training.');
  }

  if (options?.withoutTools) {
    notes.push('No tools');
  }

  if (applies('BOGOCATALYST') || applies('BOGOCATALYST100')) {
    disclaimers.push('You\'ll get the Career Catalyst Toolkit');
    notes.push('Career Catalyst Toolkit');
  }

  if (applies('COLORWHEEL') || applies('COLORWHEEL60')) {
    disclaimers.push('You\'ll get a free color wheel');
    notes.push('color wheel');
  }

  return [ notes, disclaimers, promoWarnings ];
};
