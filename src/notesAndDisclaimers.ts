import { audCountry, gbpCountry, nzdCountry } from '@qccareerschool/helper-functions';
import e from 'express';
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
      promoWarnings.push('You have entered the <strong>JUNE21</strong> promo code but have not selected more than one design course. Select additional courses above to take advantage of this promotion.');
    }
  }

  // WEDDING21 promo (Event)
  if (applies(promoCodeSpecs.find(v => v.code === 'WEDDING21' && v.schools?.includes('QC Event School')))) {
    if (!courses.includes('EP')) {
      promoWarnings.push('You have entered the <strong>WEDDING21</strong> promo code but have not selected the <strong>Event & Wedding Planning Course</strong> course.');
    } else if (!courses.includes('LW') || !courses.includes('DW')) {
      promoWarnings.push('You have entered the <strong>WEDDING21</strong> promo code but have not selected both the <strong>Luxury Wedding Planning</strong> and <strong>Destination Wedding Plannin</strong> courses.');
    }
  }

  // BONUSGIFT promo
  if (applies(promoCodeSpecs.find(v => v.code === 'BONUSGIFT'))) {
    if (!courses.some(c => isEventFoundationCourse(c))) {
      promoWarnings.push('You have entered the <strong>BONUSGIFT</strong> promo code but have not selected a <strong>Foundation course</strong>.');
    } else {
      notes.push('leather portfolio');
      disclaimers.push('You\'ll receive the FREE leather protfolio');
      if (!courses.includes('LW') || !courses.includes('VE')) {
        promoWarnings.push('You have entered the <strong>BONUSGIFT</strong> promo code but have not selected both the <strong>Luxury Wedding & Event Planning</strong> course and the <strong>Virtual Event Training</strong> program.');
      }
    }
  }

  // EXPERT promo (Event)
  if (applies(promoCodeSpecs.find(v => v.code === 'EXPERT'))) {
    if (!courses.some(c => isEventFoundationCourse(c))) {
      promoWarnings.push('You have entered the <strong>EXPERT</strong> promo code but have not selected a Foundation course.');
    } else if (!courses.some(c => isEventSpecialtyCourse(c))) {
      promoWarnings.push('You have entered the <strong>EXPERT</strong> promo code but have not selected a Specialty course.');
    }
  }

  // SUMMER21 promo (Event)
  if (applies(promoCodeSpecs.find(v => v.code === 'SUMMER21' && v.schools?.includes('QC Event School')))) {
    if (!courses.some(c => isEventFoundationCourse(c))) {
      promoWarnings.push('You have entered the <strong>SUMMER21</strong> promo code but have not selected a Foundation course.');
    } else {
      disclaimers.push('You\'ll recieve the FREE leather portfolio');
      notes.push('leather portfolio');
      if (!courses.some(c => isEventSpecialtyCourse(c))) {
        promoWarnings.push('You have entered the <strong>SUMMER21</strong> promo code but have not selected a Specialty course.');
      }
    }
  }

  // SUMMER21 promo (Makeup)
  if (applies(promoCodeSpecs.find(v => v.code === 'SUMMER21' && v.schools?.includes('QC Makeup Academy')))) {
    if (!courses.some(c => isMakeupFoundationCourse(c))) {
      promoWarnings.push('You have entered the <strong>SUMMER21</strong> promo code but have not selected a Foundation course.');
    } else if (!courses.some(c => isMakeupAdvancedCourse(c))) {
      promoWarnings.push('You have entered the <strong>SUMMER21</strong> promo code but have not selected an Advanced course.');
    }
  }

  // SUMMER21 promo (Design)
  if (applies(promoCodeSpecs.find(v => v.code === 'SUMMER21' && v.schools?.includes('QC Design School')))) {
    notes.push('leather portfolio');
    disclaimers.push('You\'ll receive the FREE leather protfolio');
    if (courses.length < 2) {
      promoWarnings.push('You have entered the <strong>SUMMER21</strong> promo code but have not selected more than one course.');
    }
  }

  // FATHERSDAY promo (Design)
  if (applies(promoCodeSpecs.find(v => v.code === 'FATHERSDAY')) && options?.school === 'QC Design School') {
    disclaimers.push('You\'ll receive the deluxe design kit');
    notes.push('deluxe design kit');
  }

  // DIVEIN promo (Makeup)
  if (applies(promoCodeSpecs.find(v => v.code === 'DIVEIN')) && options?.school === 'QC Makeup Academy') {
    disclaimers.push('You\'ll receive the free leather portfolio');
    notes.push('leather portfolio');
    if (!courses.includes('MZ')) {
      promoWarnings.push('You have entered the <strong>DIVEIN</strong> promo code but have not selected Master Makeup Artistry.');
    } else if (!courses.some(c => isMakeupAdvancedCourse(c))) {
      promoWarnings.push('You have entered the <strong>DIVEIN</strong> promo code but have not selected an Advanced course.');
    }
  }

  // DIVEIN promo (Design)
  if (applies(promoCodeSpecs.find(v => v.code === 'DIVEIN')) && options?.school === 'QC Design School') {
    disclaimers.push('You\'ll receive the free color fan deck and free leather portfolio');
    notes.push('fan deck');
    notes.push('leather portfolio');
    if (courses.length < 2) {
      promoWarnings.push('You have entered the <strong>DIVEIN</strong> promo code but but have not selected more than one course.');
    }
  }

  // DIVEIN promo (Event)
  if (applies(promoCodeSpecs.find(v => v.code === 'DIVEIN')) && options?.school === 'QC Event School') {
    disclaimers.push('You\'ll receive the free leather portfolio');
    notes.push('leather portfolio');
    if (!courses.some(c => isEventFoundationCourse(c))) {
      promoWarnings.push('You have entered the <strong>DIVEIN</strong> promo code but have not selected a Foundation course.');
    } else if (!courses.some(c => isEventSpecialtyCourse(c))) {
      promoWarnings.push('You have entered the <strong>DIVEIN</strong> promo code but have not selected a Specialty course.');
    }
  }

  // WEDDING21 promo (Makeup)
  if (applies(promoCodeSpecs.find(v => v.code === 'WEDDING21' && v.schools?.includes('QC Makeup Academy')))) {
    if (options?.discountAll) {
      disclaimers.push('You\'ll receive the six-piece makeup kit');
      notes.push('6-piece kit');
    } else {
      if (!courses.includes('MZ')) {
        promoWarnings.push('You have entered the <strong>WEDDING21</strong> promo code but have not selected the <strong>Master Makeup Artistry</strong> course.');
      } else {
        disclaimers.push('You\'ll receive the five-piece bridal makeup kit and hair styling wand');
        notes.push('5-piece kit');
        notes.push('hair styling wand');
        if (!courses.includes('HS')) {
          promoWarnings.push('<p>Promo code applied: <strong>WEDDING21</strong></p><p class="mb-0">Did you know you can also enroll in the <strong>Hair Styling Essentials</strong> course at 50% off?</p>');
        }
      }
    }
  }

  // DELUXE promo
  if (applies(promoCodeSpecs.find(v => v.code === 'DELUXE'))) {
    disclaimers.push('You\'ll receive the free deluxe design kit');
    notes.push('deluxe design kit');
    if (courses.length < 2) {
      promoWarnings.push('You have entered the <strong>DELUXE</strong> promo code but but have not selected more than one course.');
    }
  }

  // WEDDINGSZN promo
  if (applies(promoCodeSpecs.find(v => v.code === 'WEDDINGSZN'))) {
    disclaimers.push('You\'ll receive the free leather portfolio');
    notes.push('leather portfolio');
    if (!courses.some(c => isEventFoundationCourse(c))) {
      promoWarnings.push('You have entered the <strong>WEDDINGSZN</strong> promo code but have not selected a Foundation course.');
    } else if (!courses.some(c => isEventSpecialtyCourse(c))) {
      promoWarnings.push('You have entered the <strong>WEDDINGSZN</strong> promo code but have not selected a Specialty course.');
    }
  }

  // QCLASHES promo
  if (applies(promoCodeSpecs.find(v => v.code === 'QCLASHES'))) {
    if (courses.some(c => [ 'MZ', 'SK', 'AB', 'SF', 'HS', 'GB' ].includes(c))) {
      disclaimers.push('You\'ll receive bonus lashes in your makeup kit');
      notes.push('bonus lashes');
    } else {
      promoWarnings.push(`Unfortunately the <strong>QCLASHES</strong> code is not valid with the course${courses.length === 1 ? '' : 's'} you have selected.`);
      promoWarnings.push('Please chose at least one course from Master Makeup Artistry, Skincare, Airbrush Makeup Workshop, Special FX Makeup, Hair Styling Essentials, or Global Beauty.');
    }
  }

  // DELUXE21 promo
  if (applies(promoCodeSpecs.find(v => v.code === 'DELUXE21'))) {
    disclaimers.push('You\'ll recieve the FREE color fan deck');
    notes.push('fan deck');
  }

  // GLOWUP promo
  if (applies(promoCodeSpecs.find(v => v.code === 'GLOWUP'))) {
    if (!courses.includes('MZ')) {
      promoWarnings.push('You have entered the <strong>GLOWUP</strong> promo code but have not selected the <strong>Master Makeup Artistry</strong> course.');
    } else {
      if (!courses.includes('MW')) {
        promoWarnings.push('You have entered the <strong>GLOWUP</strong> promo code but have not selected the <strong>Pro Makeup Workshop</strong>.');
      }
      disclaimers.push('You\'ll recieve the FREE elite makeup kit upgrade');
      notes.push('elite kit');
    }
  }

  // FASTPASS promo
  if (applies(promoCodeSpecs.find(v => v.code === 'FASTPASS'))) {
    if (!courses.some(c => isEventFoundationCourse(c))) {
      promoWarnings.push('You have entered the <strong>FASTPASS</strong> promo code but have not selected a foundation course.');
    } else {
      if (!courses.includes('LW') && !courses.includes('VE')) {
        promoWarnings.push('You have entered the <strong>FASTPASS</strong> promo code but have not selected the <strong>Luxury Wedding Planning</strong> course or <strong>Virtual Event Training</strong> program.');
      } else if (!courses.includes('LW')) {
        promoWarnings.push('You have entered the <strong>FASTPASS</strong> promo code but have not selected the <strong>Luxury Wedding Planning</strong> course.');
      } else if (!courses.includes('VE')) {
        promoWarnings.push('You have entered the <strong>FASTPASS</strong> promo code but have not selected the <strong>Virtual Event Training</strong> program.');
      }
    }
  }

  // JULY21 promo
  if (applies(promoCodeSpecs.find(v => v.code === 'JULY21'))) {
    const designCourseCount = courses.filter(c => isDesignCourse(c)).length;
    if (designCourseCount === 0) {
      promoWarnings.push('You have entered the <strong>JULY21</strong> promo code but have not selected any courses.');
    } else if (designCourseCount === 1) {
      promoWarnings.push('You have entered the <strong>JULY21</strong> promo code but have not selected a second course.');
    }
  }

  // VIP2021
  if (applies(promoCodeSpecs.find(v => v.code === 'VIP2021'))) {
    if (!courses.includes('MZ')) {
      promoWarnings.push('You have entered the <strong>VIP2021</strong> promo code but have not selected the <strong>Master Makeup Artistry</strong> course.');
    } else {
      disclaimers.push('You will receive the FREE VIP Career Catalyst Workshop');
      notes.push('career catalyst workshop');
    }
  }

  // TRIPLETHREAT
  if (applies(promoCodeSpecs.find(v => v.code === 'TRIPLETHREAT'))) {
    if (!courses.some(c => isEventFoundationCourse(c))) {
      promoWarnings.push('You have entered the <strong>TRIPLETHREAT</strong> promo code but have not selected a <strong>Foundation</strong> course.');
    } else {
      const specialtyCount = courses.filter(c => isEventSpecialtyCourse(c)).length;
      if (specialtyCount === 0) {
        promoWarnings.push('You have entered the <strong>TRIPLETHREAT</strong> promo code but have not selected any FREE <strong>Specialty</strong> courses.');
      } else if (specialtyCount === 1) {
        promoWarnings.push('Promo code <strong>TRIPLETHREAT</strong> applied.');
        promoWarnings.push('Remember you can select another FREE <strong>Specialty</strong> course.');
      }
    }
  }

  // DELUXE200
  if (applies(promoCodeSpecs.find(v => v.code === 'DELUXE200'))) {
    if (!courses.some(c => isDesignCourse(c))) {
      promoWarnings.push('You have entered the <strong>DELUXE200</strong> promo code but have not selected any design courses.');
    } else if (noShipping === 'APPLIED') {
      promoWarnings.push('Promo code <strong>DELUXE200</strong> applied.');
      promoWarnings.push('Because you have elected to not receive physical materials, the <strong>deluxe kit</strong> will not be shipped.');
    } else if (noShipping === 'REQUIRED') {
      promoWarnings.push('Promo code <strong>DELUXE200</strong> applied.');
      promoWarnings.push('Because we do not ship physical materials to your location, the <strong>deluxe kit</strong> will not be shipped.');
    } else {
      disclaimers.push('You\'ll receive the free deluxe design kit');
      notes.push('deluxe design kit');
    }
  }

  // ELITEVIP
  if (applies(promoCodeSpecs.find(v => v.code === 'ELITEVIP'))) {
    if (!courses.includes('MZ')) {
      promoWarnings.push('You have entered the <strong>ELITEVIP</strong> promo code but have not selected the <strong>Master Makeup Artistry</strong> course.');
    } else {
      disclaimers.push('You will receive the FREE VIP Career Catalyst session');
      disclaimers.push('You will receive the elite makeup kit upgrade');
      notes.push('career catalyst workshop');
      notes.push('elite kit');
    }
  }

  // Design built-in student offer: laser tape measure
  if (options?.school === 'QC Design School' && options.discountAll && (now >= new Date(2021, 6, 19, 9, 30) && now < new Date(2021, 6, 31))) {
    if (courses.length >= 1) {
      notes.push('laser tape measure');
      disclaimers.push('You\'ll receive the FREE laser tape measure');
    }
  }

  // Event built-in student offer: leather portfolio
  if (options?.school === 'QC Event School' && options.discountAll && (now >= new Date(2021, 6, 19, 9, 30) && now < new Date(2021, 6, 31))) {
    if (courses.length >= 1) {
      notes.push('leather portfolio');
      disclaimers.push('You\'ll receive the FREE leather portfolio');
    }
  }

  // Makeup built-in student offer: six-piece kit
  if (options?.school === 'QC Makeup Academy' && options.discountAll && (now >= new Date(2021, 6, 19, 9, 30) && now < new Date(2021, 6, 31))) {
    if (courses.length >= 1) {
      notes.push('6-piece makeup kit');
      disclaimers.push('You\'ll receive the six-piece makeup kit');
    }
  }

  // DESIGN21 promo
  if (applies(promoCodeSpecs.find(v => v.code === 'DESIGN21'))) {
    notes.push('deluxe kit');
    notes.push('leather portfolio');
    disclaimers.push('You\'ll get the free deluxe kit and leather portfolio');
  }

  // BACK2SCHOOL promo
  if (applies(promoCodeSpecs.find(v => v.code === 'BACK2SCHOOL'))) {
    switch (options?.school) {
      case 'QC Makeup Academy':
        if (!courses.includes('MZ')) {
          promoWarnings.push('You have entered the <strong>BACK2SCHOOL</strong> promo code but have not selected the <strong>Master Makeup Artistry</strong> course.');
        } else {
          notes.push('back-to-school kit');
          disclaimers.push('You\'ll get the free back-to-school kit');
        }
        break;
      case 'QC Event School':
        if (!courses.includes('EP')) {
          promoWarnings.push('You have entered the <strong>BACK2SCHOOL</strong> promo code but have not selected the <strong>Event &amp; Wedding Planning</strong> course.');
        } else {
          notes.push('back-to-school kit');
          disclaimers.push('You\'ll get the free back-to-school kit');
          if (!courses.some(c => isEventSpecialtyCourse(c))) {
            promoWarnings.push('Promo code <strong>BACK2SCHOOL</strong> applied.');
            promoWarnings.push('You have not yet selected a FREE <strong>Specialty</strong> course.');
          }
        }
        break;
      case 'QC Design School':
        if (courses.length === 0) {
          promoWarnings.push('You have entered the <strong>BACK2SCHOOL</strong> promo code but have not selected any course.');
        } else {
          notes.push('back-to-school kit');
          disclaimers.push('You\'ll get the free back-to-school kit');
          if (courses.length < 2) {
            promoWarnings.push('Promo code <strong>BACK2SCHOOL</strong> applied.');
            promoWarnings.push('You have not yet selected a FREE second course.');
          }
        }
        break;
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
