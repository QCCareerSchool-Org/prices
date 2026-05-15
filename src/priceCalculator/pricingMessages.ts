import type { PriceOptions } from '../domain/priceQuery';
import { isEventFoundationCourse, isEventSpecialtyCourse } from '@/courses';

export class PricingMessages {
  public disclaimers: string[] = [];

  public notes: string[] = [];

  public promoWarnings: string[] = [];

  public constructor(
    private readonly courseCodes: string[],
    private readonly promoCode: string | undefined,
    private readonly options: PriceOptions,
    private readonly noShipping: boolean,
    private readonly now: Date,
  ) { /* empty */ }

  /**
   * Note: These strings may be inserted as raw HTML by the front end application
   * Do not include any unescaped user input in them (preferably do not include
   * any user input at all). Also ensure that they are valid HTML with proper
   * closing tags.
   */
  public calculate(): void {
    this.notes = [];
    this.disclaimers = [];
    this.promoWarnings = [];

    // studentDiscount option
    if (this.options.studentDiscount) {
      this.notes.push('additional discount');
    }

    // ELITE promo code
    if (this.promoCode === 'ELITE') {
      if (this.noShipping) {
        this.promoWarnings.push('You entered the <strong>ELITE</strong> promo code, but we do not ship to your country. You will not receive any makeup kits.');
      } else {
        if (!this.courseCodes.includes('MZ')) {
          this.promoWarnings.push('You have entered the <strong>ELITE</strong> promo code but have not selected the <strong>Master Makeup Artistry</strong> course.');
        }
      }
    }

    // FREEPRO promo code
    if (this.promoCode === 'FREEPRO') {
      if (!this.courseCodes.includes('MZ') && !this.courseCodes.includes('MW')) {
        this.promoWarnings.push('You have entered the <strong>FREEPRO</strong> promo code but have not selected the <strong>Master Makeup Artistry</strong> and <strong>Pro Makeup Workshop</strong> courses.');
      } else if (!this.courseCodes.includes('MZ')) {
        this.promoWarnings.push('You have entered the <strong>FREEPRO</strong> promo code but have not selected the <strong>Master Makeup Artistry</strong> course.');
      } else if (!this.courseCodes.includes('MW')) {
        this.promoWarnings.push('You have entered the <strong>FREEPRO</strong> promo code but have not selected the <strong>Pro Makeup Workshop</strong> course.');
      }
    }

    // SAVE50 promo code
    if (this.promoCode === 'SAVE50') {
      if (this.courseCodes.length < 2) {
        this.promoWarnings.push('You have entered the <strong>SAVE50</strong> promo code but have not selected more than one course. Select additional courses above to take advantage of this promotion.');
      }
    }

    // EXPERT promo code
    if (this.promoCode === 'EXPERT') {
      if (!this.courseCodes.some(c => isEventFoundationCourse(c))) {
        this.promoWarnings.push('You have entered the <strong>EXPERT</strong> promo code but have not selected a Foundation course.');
      } else if (!this.courseCodes.some(c => isEventSpecialtyCourse(c))) {
        this.promoWarnings.push('You have entered the <strong>EXPERT</strong> promo code but have not selected a Specialty course.');
      }
    }

    // QCLASHES promo code
    if (this.promoCode === 'QCLASHES' || this.promoCode === 'QCLASHES60') {
      if (this.courseCodes.some(c => [ 'MZ', 'SK', 'AB', 'SF', 'HS', 'GB' ].includes(c))) {
        this.disclaimers.push('You\'ll receive bonus lashes in your makeup kit');
        this.notes.push('bonus lashes');
      } else {
        this.promoWarnings.push(`Unfortunately the <strong>QCLASHES</strong> code is not valid with the course${this.courseCodes.length === 1 ? '' : 's'} you have selected.`);
        this.promoWarnings.push('Please chose at least one course from Master Makeup Artistry, Skincare, Airbrush Makeup Workshop, Special FX Makeup, Hair Styling Essentials, or Global Beauty.');
      }
    }

    // BOGO promo code
    if (this.promoCode === 'BOGO') {
      if (this.courseCodes.length === 0) {
        this.promoWarnings.push('You have entered the <strong>BOGO</strong> promo code, but you haven\'t selected any courses.');
      } else if (this.courseCodes.length < 2) {
        this.promoWarnings.push('You have entered the <strong>BOGO</strong> promo code, but you haven\'t selected a free second course.');
      }
    }

    // SKINCARE
    if (this.promoCode === 'SKINCARE') {
      if (!this.courseCodes.includes('MZ')) {
        this.promoWarnings.push('You have entered the <strong>SKINCARE</strong> promo code, but you haven\'t selected the <strong>Master Makeup Artistry</strong> course');
      } else {
        if (!this.courseCodes.includes('SK')) {
          this.promoWarnings.push('You have entered the <strong>SKINCARE</strong> promo code, but you haven\'t selected the <strong>Skincare</strong> course');
        }
      }
    }

    // EVENTFREECOURSE promo code
    if (this.promoCode === 'EVENTFREECOURSE') {
      if (!this.courseCodes.some(c => isEventFoundationCourse(c))) {
        this.promoWarnings.push('You have entered the <strong>EVENTFREECOURSE</strong> promo code, but you haven\'t selected a <strong>foundation</strong> course');
      } else {
        if (this.courseCodes.length < 2) {
          this.promoWarnings.push('You have entered the <strong>EVENTFREECOURSE</strong> promo code, but you haven\'t selected a free course');
        }
      }
    }

    // SPECIALTY promo code
    if (this.promoCode === 'SPECIALTY') {
      if (!this.courseCodes.some(c => isEventFoundationCourse(c))) {
        this.promoWarnings.push('You have entered the <strong>SPECIALTY</strong> promo code, but you haven\'t selected a <strong>Foundation</strong> course');
      } else {
        const specialtyCount = this.courseCodes.filter(c => isEventSpecialtyCourse(c)).length;
        if (specialtyCount === 0) {
          this.promoWarnings.push('You have entered the <strong>SPECIALTY</strong> promo code, but you haven\'t selected any free <strong>Specialty</strong> courses');
        }
      }
    }

    // 2SPECIALTY and MCSPECIALTY promo codes
    [ '2SPECIALTY', 'MCSPECIALTY', 'SSMCSPECIALTY', '2SPECIALTY100' ].forEach(code => {
      if (this.promoCode === code) {
        if (!this.courseCodes.some(c => isEventFoundationCourse(c))) {
          this.promoWarnings.push(`You have entered the <strong>${code}</strong> promo code, but you haven't selected a <strong>Foundation</strong> course`);
        } else {
          const specialtyCount = this.courseCodes.filter(c => isEventSpecialtyCourse(c)).length;
          if (specialtyCount === 0) {
            this.promoWarnings.push(`You have entered the <strong>${code}</strong> promo code, but you haven't selected any free <strong>Specialty</strong> courses`);
          } else if (specialtyCount === 1) {
            this.promoWarnings.push(`You have entered the <strong>${code}</strong> promo code, but you haven't selected a second free <strong>Specialty</strong> course`);
          }
        }
      }
    });

    // FREELUXURY promo code
    if (this.promoCode === 'FREELUXURY') {
      if (!this.courseCodes.some(c => isEventFoundationCourse(c))) {
        this.promoWarnings.push('You have entered the <strong>FREELUXURY</strong> promo code, but you haven\'t selected a <strong>Foundation</strong> course');
      } else if (!this.courseCodes.includes('LW')) {
        this.promoWarnings.push('You have entered the <strong>FREELUXURY</strong> promo code, but you haven\'t selected the free <strong>Luxury Wedding Planning</strong> course');
      }
    }

    // PROLUMINOUS promo code
    if (this.promoCode === 'PROLUMINOUS') {
      if (!this.courseCodes.includes('MZ')) {
        this.promoWarnings.push('You have entered the <strong>PROLUMINOUS</strong> promo code, but you haven\'t selected the <strong>Master Makeup Artistry</strong> course.');
        this.disclaimers.push('You\'ll get the Luminous Makeup Collection');
      } else {
        if (!this.courseCodes.includes('MW')) {
          this.promoWarnings.push('You have entered the <strong>PROLUMINOUS</strong> promo code, but you haven\'t selected your free <strong>Pro Makeup Workshop</strong>.');
        }
      }
    }

    // FREEGLOBAL promo code
    if (this.promoCode === 'FREEGLOBAL') {
      if (!this.courseCodes.includes('MZ')) {
        this.promoWarnings.push('You have entered the <strong>FREEGLOBAL</strong> promo code, but you haven\'t selected the <strong>Master Makeup Artistry</strong> course.');
      } else {
        this.disclaimers.push('You\'ll get the Luminous Makeup Collection');
        if (!this.courseCodes.includes('GB')) {
          this.promoWarnings.push('You have entered the <strong>FREEGLOBAL</strong> promo code, but you haven\'t selected your free <strong>Global Beauty Workshop</strong>.');
        }
      }
    }

    // PORTFOLIO50 promo code
    if (this.promoCode === 'PORTFOLIO' || this.promoCode === 'PORTFOLIO50' || this.promoCode === 'PORTFOLIO60') {
      if (this.courseCodes.length > 0) {
        this.disclaimers.push('You\'ll get the free leather portfolio');
        this.notes.push('portfolio');
      }
    }

    // FANDECK promo code
    if (this.promoCode === 'FANDECK50') {
      if (this.courseCodes.length > 0) {
        this.disclaimers.push('You\'ll get the free color fan deck');
        this.notes.push('color fan deck');
      }
    }

    // BRUSHSET50 promo code
    if (this.promoCode === 'BRUSHSET50') {
      if (this.courseCodes.length > 0) {
        this.disclaimers.push('You\'ll get the free bonus brush set');
        this.notes.push('brush set');
      }
    }

    if (this.options.school === 'QC Wellness Studies' && this.courseCodes.length >= 1) {
      if (this.options.discountAll) {
        // nothing
      } else {
        // this.disclaimers.push('You\'ll get the leather portfolio');
        // this.notes.push('leather portfolio');
      }
    }

    if (this.options.school === 'QC Pet Studies' && this.courseCodes.length >= 1) {
      if (this.options.discountAll) {
        // nothing
      } else {
        // this.disclaimers.push('You\'ll get the pack of 20 dog bows');
        // this.notes.push('dog bows');
      }
    }

    if (this.options.school === 'QC Makeup Academy' && this.courseCodes.length >= 1) {
      if (this.options.discountAll) {
        if (this.now >= new Date('2025-01-29T03:00-0500') && this.now < new Date('2025-02-01T03:00-0500')) {
          this.disclaimers.push('You\'ll get the free leather portfolio');
          this.notes.push('portfolio');
        }
      } else {
        if (this.now >= new Date('2025-01-29T03:00-0500') && this.now < new Date('2025-02-01T03:00-0500')) {
          this.disclaimers.push('You\'ll get the free bonus lashes');
          this.notes.push('lashes set');
        }
      }
    }

    if (this.options.school === 'QC Event School' && this.courseCodes.length >= 1) {
      if (this.options.discountAll) {
        if (this.now >= new Date('2025-01-29T03:00-0500') && this.now < new Date('2025-02-01T03:00-0500')) {
          this.disclaimers.push('You\'ll get the free leather portfolio');
          this.notes.push('portfolio');
        }
      } else {
        // nothing
      }
    }

    if (this.options.school === 'QC Design School' && this.courseCodes.length >= 1) {
      if (this.options.discountAll) {
        if (this.now >= new Date('2025-01-29T03:00') && this.now < new Date('2025-02-01T03:00')) {
          this.disclaimers.push('You\'ll get the free leather portfolio');
          this.notes.push('portfolio');
        }
      } else {
        // nothing
      }
    }

    if (this.promoCode === 'DG150' || this.promoCode === 'DG200' || this.promoCode === 'DG300') {
      if (!this.courseCodes.includes('DG')) {
        this.promoWarnings.push('You have entered a discount promo code for <strong>Dog Grooming</strong>, but you haven\'t selected the course');
      }
    }

    if (this.promoCode === 'DT150' || this.promoCode === 'DT200' || this.promoCode === 'DT300') {
      if (!this.courseCodes.includes('DT')) {
        this.promoWarnings.push('You have entered a discount promo code for <strong>Dog Training</strong>, but you haven\'t selected the course');
      }
    }

    [ 'MASTERCLASS', 'SSMASTERCLASS' ].forEach(code => {
      if (this.promoCode === code) {
        if (!this.courseCodes.includes('I2')) {
          this.promoWarnings.push(`You have entered the <strong>${code}</strong> promo code, but you haven't selected the <strong>Interior Decorating</strong> course`);
        }
      }
    });

    if (this.promoCode === 'LUXURYWEDDING') {
      if (!this.courseCodes.includes('EP')) {
        this.promoWarnings.push('You have entered the <strong>LUXURYWEDDING</strong> promo code, but you haven\'t selected the <strong>Event & Wedding Planning</strong> course');
      } else {
        if (!this.courseCodes.includes('LW')) {
          this.promoWarnings.push('You have entered the <strong>LUXURYWEDDING</strong> promo code, but you haven\'t selected your free <strong>Luxury Wedding & Event Planning</strong> course');
        }
        if (!this.courseCodes.includes('DW')) {
          this.promoWarnings.push('You have entered the <strong>LUXURYWEDDING</strong> promo code, but you haven\'t selected your free <strong>Desination Wedding Planning</strong> course');
        }
      }
    }

    if (this.promoCode === 'KIT200OFF') {
      if (!this.courseCodes.includes('MZ')) {
        this.promoWarnings.push('You have entered the <strong>KIT200OFF</strong> promo code, but you haven\'t selected the <strong>Master Makeup Artistry</strong> course');
      }
    }

    if (this.promoCode === 'WOOFGANG') {
      this.disclaimers.push('This promotion is only available to Woof Gang Bakery employees, managers and store owners.');
    }

    if (this.courseCodes.includes('FL') && !this.courseCodes.includes('AA')) {
      this.disclaimers.push('The Festivals &amp; Live Events Course requires corporate event training.');
    }

    if (this.courseCodes.includes('PE') && !this.courseCodes.includes('AA')) {
      this.disclaimers.push('The Promotional Event Planning Course requires corporate event training.');
    }

    if (this.options.withoutTools) {
      this.notes.push('No tools');
    }

    if (this.promoCode === 'BOGOCATALYST' || this.promoCode === 'BOGOCATALYST100') {
      this.disclaimers.push('You\'ll get the Career Catalyst Toolkit');
      this.notes.push('Career Catalyst Toolkit');
    }

    if (this.promoCode === 'COLORWHEEL' || this.promoCode === 'COLORWHEEL60') {
      this.disclaimers.push('You\'ll get a free color wheel');
      this.notes.push('color wheel');
    }
  }
}
