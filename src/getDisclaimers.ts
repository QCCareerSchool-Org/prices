import { audCountry, gbpCountry, nzdCountry } from '@qccareerschool/helper-functions';

/**
 * Returns an array of disclaimer strings based on the courses selected and the country code
 *
 * Note: These strings may be inserted as raw HTML by the front end application
 * Do not include any unescaped user input in them (preferably do not include
 * any user input at all). Also ensure that they are valid HTML with proper
 * closing tags.
 * @param courses the courses
 * @param countryCode the country code
 */
 export const getDisclaimers = (courses: string[], countryCode: string): string[] => {
  const disclaimers = [];

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

  return disclaimers;
};
