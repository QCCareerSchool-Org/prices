import { isDesignCourse, isEventFoundationCourse, isEventSpecialtyCourse, isMakeupAdvancedCourse, isMakeupFoundationCourse, isMakeupSpecialtyCourse } from '../../courses';
import { freeMap } from '../../lib/freeMap';
import { PromoCodeSpec, promoCodeSpecs, specApplies } from '../../promoCodes';
import { CourseResult, MapFunction, PriceQueryOptions } from '../../types';

export const getPromoCodeFreeCourseMap = (now: Date, options?: PriceQueryOptions): MapFunction<CourseResult, CourseResult> => {
  const applies = (spec?: PromoCodeSpec): boolean => typeof spec !== 'undefined' && specApplies(spec, now, options?.discountAll, options?.promoCode, options?.school);

  const foundItApplies = applies(promoCodeSpecs.find(v => v.code === 'FOUNDIT'));
  const freeProApplies = applies(promoCodeSpecs.find(v => v.code === 'FREEPRO'));
  const spring21Applies = applies(promoCodeSpecs.find(v => v.code === 'SPRING21'));
  const happyMayApplies = applies(promoCodeSpecs.find(v => v.code === 'HAPPYMAY'));
  const nathansDayApplies = applies(promoCodeSpecs.find(v => v.code === 'NATHANSDAY'));
  const mothersdayApplies = applies(promoCodeSpecs.find(v => v.code === 'MOTHERSDAY'));
  const may21Applies = applies(promoCodeSpecs.find(v => v.code === 'MAY21'));
  const levelUpApplies = applies(promoCodeSpecs.find(v => v.code === 'LEVELUP'));
  const weekendMakeupApplies = applies(promoCodeSpecs.find(v => v.code === 'WEEKEND' && v.schools?.includes('QC Makeup Academy')));
  const weekendDesignApplies = applies(promoCodeSpecs.find(v => v.code === 'WEEKEND' && v.schools?.includes('QC Design School')));
  const june21DesignApplies = applies(promoCodeSpecs.find(v => v.code === 'JUNE21' && v.schools?.includes('QC Design School')));
  const wedding21EventApplies = applies(promoCodeSpecs.find(v => v.code === 'WEDDING21' && v.schools?.includes('QC Event School')));
  const expertApplies = applies(promoCodeSpecs.find(v => v.code === 'EXPERT'));
  const bonusgiftApplies = applies(promoCodeSpecs.find(v => v.code === 'BONUSGIFT'));
  const summer21EventApplies = applies(promoCodeSpecs.find(v => v.code === 'SUMMER21' && v.schools?.includes('QC Event School')));
  const summer21MakeupApplies = applies(promoCodeSpecs.find(v => v.code === 'SUMMER21' && v.schools?.includes('QC Makeup Academy')));
  const summer21DesignApplies = applies(promoCodeSpecs.find(v => v.code === 'SUMMER21' && v.schools?.includes('QC Design School')));
  const fathersdayApplies = applies(promoCodeSpecs.find(v => v.code === 'FATHERSDAY'));
  const diveInApplies = applies(promoCodeSpecs.find(v => v.code === 'DIVEIN'));
  const deluxeApplies = applies(promoCodeSpecs.find(v => v.code === 'DELUXE'));
  const weddingsznApplies = applies(promoCodeSpecs.find(v => v.code === 'WEDDINGSZN'));
  const deluxe21Applies = applies(promoCodeSpecs.find(v => v.code === 'DELUXE21'));
  const glowupApplies = applies(promoCodeSpecs.find(v => v.code === 'GLOWUP'));
  const fastpassApplies = applies(promoCodeSpecs.find(v => v.code === 'FASTPASS'));
  const july21Applies = applies(promoCodeSpecs.find(v => v.code === 'JULY21'));
  const tripleThreatApplies = applies(promoCodeSpecs.find(v => v.code === 'TRIPLETHREAT'));
  const back2schoolEventApplies = applies(promoCodeSpecs.find(v => v.code === 'BACK2SCHOOL' && v.schools?.includes('QC Event School')));
  const back2schoolDesignApplies = applies(promoCodeSpecs.find(v => v.code === 'BACK2SCHOOL' && v.schools?.includes('QC Design School')));
  const schoolKitEventApplies = applies(promoCodeSpecs.find(v => v.code === 'SCHOOLKIT' && v.schools?.includes('QC Event School')));
  const bck2sEventApplies = applies(promoCodeSpecs.find(v => v.code === 'BCK2S' && v.schools?.includes('QC Event School')));
  const schoolKitDesignApplies = applies(promoCodeSpecs.find(v => v.code === 'SCHOOLKIT' && v.schools?.includes('QC Event School')));
  const bck2sDesignApplies = applies(promoCodeSpecs.find(v => v.code === 'BCK2S' && v.schools?.includes('QC Event School')));

  let may21Applied = false;
  let spring21Applied = false;
  let nathansDayApplied = false;
  let weekendDesignApplied = false;
  let june21DesignApplied = false;
  let expertApplied = false;
  let summer21EventApplied = false;
  let summer21MakeupApplied = false;
  let summer21DesignApplied = false;
  let fathersdayApplied = false;
  let diveInApplied = false;
  let deluxeApplied = false;
  let weddingsznApplied = false;
  let deluxe21Applied = false;
  let july21Applied = false;
  let tripleThreatAppliedCount = 0;
  let back2schoolEventApplied = false;
  let back2schoolDesignApplied = false;
  let schoolKitEventApplied = false;
  let bck2sEventApplied = false;
  let schoolKitDesignApplied = false;
  let bck2sDesignApplied = false;

  return (courseResult: CourseResult, index: number, array: CourseResult[]): CourseResult => {

    if (foundItApplies) {
      if (courseResult.code === 'VM' && array.some(c => c.code === 'MZ')) {
        return freeMap(courseResult);
      }
    }

    if (freeProApplies) {
      if (courseResult.code === 'MW' && array.some(c => c.code === 'MZ')) {
        return freeMap(courseResult);
      }
    }

    if (spring21Applies && !spring21Applied) {
      if (isMakeupAdvancedCourse(courseResult.code) && array.some(c => c.code === 'MZ')) {
        spring21Applied = true;
        return freeMap(courseResult);
      }
    }

    if (happyMayApplies) {
      if (courseResult.code === 'VM' && array.some(c => c.code === 'MZ')) {
        return freeMap(courseResult);
      }
    }

    if (nathansDayApplies && !nathansDayApplied) {
      if (isMakeupAdvancedCourse(courseResult.code) && array.some(c => c.code === 'MZ')) {
        nathansDayApplied = true;
        return freeMap(courseResult);
      }
    }

    if (mothersdayApplies) {
      if (courseResult.code === 'MW' && array.some(c => c.code === 'MZ')) {
        return freeMap(courseResult);
      }
    }

    if (may21Applies && !may21Applied) {
      if (isDesignCourse(courseResult.code) && array.filter(c => isDesignCourse(c.code)).length >= 2) {
        may21Applied = true;
        return freeMap(courseResult);
      }
    }

    if (levelUpApplies) {
      if (courseResult.code === 'VM' && array.some(c => c.code === 'MZ')) {
        return freeMap(courseResult);
      }
    }

    if (weekendMakeupApplies) {
      if (courseResult.code === 'VM' && array.some(c => c.code === 'MZ')) {
        return freeMap(courseResult);
      }
    }

    if (weekendDesignApplies && !weekendDesignApplied) {
      if (isDesignCourse(courseResult.code) && array.filter(c => isDesignCourse(c.code)).length >= 2) {
        weekendDesignApplied = true;
        return freeMap(courseResult);
      }
    }

    if (june21DesignApplies && !june21DesignApplied) {
      if (isDesignCourse(courseResult.code) && array.filter(c => isDesignCourse(c.code)).length >= 2) {
        june21DesignApplied = true;
        return freeMap(courseResult);
      }
    }

    if (wedding21EventApplies) {
      if ((courseResult.code === 'DW' || courseResult.code === 'LW') && array.some(c => c.code === 'EP')) {
        return freeMap(courseResult);
      }
    }

    if (bonusgiftApplies) {
      if ((courseResult.code === 'VE' || courseResult.code === 'LW') && array.some(c => isEventFoundationCourse(c.code))) {
        return freeMap(courseResult);
      }
    }

    if (expertApplies && !expertApplied) {
      if (isEventSpecialtyCourse(courseResult.code) && array.some(c => isEventFoundationCourse(c.code))) {
        expertApplied = true;
        return freeMap(courseResult);
      }
    }

    if (summer21EventApplies && !summer21EventApplied) {
      if (isEventSpecialtyCourse(courseResult.code) && array.some(c => isEventFoundationCourse(c.code))) {
        summer21EventApplied = true;
        return freeMap(courseResult);
      }
    }

    if (summer21MakeupApplies && !summer21MakeupApplied) {
      if (isMakeupAdvancedCourse(courseResult.code) && array.some(c => isMakeupFoundationCourse(c.code))) {
        summer21MakeupApplied = true;
        return freeMap(courseResult);
      }
    }

    if (summer21DesignApplies && !summer21DesignApplied) {
      if (isDesignCourse(courseResult.code) && array.filter(c => isDesignCourse(c.code)).length >= 2) {
        summer21DesignApplied = true;
        return freeMap(courseResult);
      }
    }

    if (fathersdayApplies && !fathersdayApplied && options?.school === 'QC Event School') {
      if (isEventSpecialtyCourse(courseResult.code) && array.some(c => isEventFoundationCourse(c.code))) {
        fathersdayApplied = true;
        return freeMap(courseResult);
      }
    }

    if (fathersdayApplies && !fathersdayApplied && options?.school === 'QC Makeup Academy') {
      if (isMakeupAdvancedCourse(courseResult.code) && array.some(c => isMakeupFoundationCourse(c.code))) {
        fathersdayApplied = true;
        return freeMap(courseResult);
      }
    }

    if (fathersdayApplies && !fathersdayApplied && options?.school === 'QC Design School') {
      if (isDesignCourse(courseResult.code) && array.filter(c => isDesignCourse(c.code)).length >= 2) {
        fathersdayApplied = true;
        return freeMap(courseResult);
      }
    }

    if (diveInApplies && !diveInApplied && options?.school === 'QC Makeup Academy') {
      if (isMakeupAdvancedCourse(courseResult.code) && array.filter(c => c.code === 'MZ')) {
        diveInApplied = true;
        return freeMap(courseResult);
      }
    }

    if (diveInApplies && !diveInApplied && options?.school === 'QC Design School') {
      if (isDesignCourse(courseResult.code) && array.filter(c => isDesignCourse(c.code)).length >= 2) {
        diveInApplied = true;
        return freeMap(courseResult);
      }
    }

    if (diveInApplies && !diveInApplied && options?.school === 'QC Event School') {
      if (isEventSpecialtyCourse(courseResult.code) && array.some(c => isEventFoundationCourse(c.code))) {
        diveInApplied = true;
        return freeMap(courseResult);
      }
    }

    if (deluxeApplies && !deluxeApplied) {
      if (isDesignCourse(courseResult.code) && array.filter(c => isDesignCourse(c.code)).length >= 2) {
        deluxeApplied = true;
        return freeMap(courseResult);
      }
    }

    if (weddingsznApplies && !weddingsznApplied) {
      if (isEventSpecialtyCourse(courseResult.code) && array.some(c => isEventFoundationCourse(c.code))) {
        weddingsznApplied = true;
        return freeMap(courseResult);
      }
    }

    if (deluxe21Applies && !deluxe21Applied) {
      if (isDesignCourse(courseResult.code) && array.filter(c => isDesignCourse(c.code)).length >= 2) {
        deluxe21Applied = true;
        return freeMap(courseResult);
      }
    }

    if (glowupApplies) {
      if (courseResult.code === 'MW' && array.some(c => c.code === 'MZ')) {
        return freeMap(courseResult);
      }
    }

    if (fastpassApplies) {
      if ((courseResult.code === 'LW' || courseResult.code === 'VE') && array.some(c => isEventFoundationCourse(c.code))) {
        return freeMap(courseResult);
      }
    }

    if (july21Applies && !july21Applied) {
      if (array.filter(c => isDesignCourse(c.code)).length >= 2) {
        july21Applied = true;
        return freeMap(courseResult);
      }
    }

    if (tripleThreatApplies && tripleThreatAppliedCount < 2) {
      if (isEventSpecialtyCourse(courseResult.code) && array.some(c => isEventFoundationCourse(c.code))) {
        tripleThreatAppliedCount++;
        return freeMap(courseResult);
      }
    }

    if (back2schoolDesignApplies && !back2schoolDesignApplied) {
      if (isDesignCourse(courseResult.code) && array.filter(c => isDesignCourse(c.code)).length >= 2) {
        back2schoolDesignApplied = true;
        return freeMap(courseResult);
      }
    }

    if (back2schoolEventApplies && !back2schoolEventApplied) {
      if (isEventSpecialtyCourse(courseResult.code) && array.some(c => c.code === 'EP')) {
        back2schoolEventApplied = true;
        return freeMap(courseResult);
      }
    }

    if (schoolKitEventApplies && !schoolKitEventApplied) {
      if (isEventSpecialtyCourse(courseResult.code) && array.some(c => c.code === 'EP')) {
        schoolKitEventApplied = true;
        return freeMap(courseResult);
      }
    }

    if (bck2sEventApplies && !bck2sEventApplied) {
      if (isEventSpecialtyCourse(courseResult.code) && array.some(c => c.code === 'EP')) {
        bck2sEventApplied = true;
        return freeMap(courseResult);
      }
    }

    if (schoolKitDesignApplies && !schoolKitDesignApplied) {
      if (isDesignCourse(courseResult.code) && array.filter(c => isDesignCourse(c.code)).length >= 2) {
        schoolKitDesignApplied = true;
        return freeMap(courseResult);
      }
    }

    if (bck2sDesignApplies && !bck2sDesignApplied) {
      if (isDesignCourse(courseResult.code) && array.filter(c => isDesignCourse(c.code)).length >= 2) {
        bck2sDesignApplied = true;
        return freeMap(courseResult);
      }
    }

    return courseResult;
  };
};
