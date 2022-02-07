import { telephoneNumber } from '@qccareerschool/helper-functions';

import { isDesignCourse, isMakeupCourse } from './courses';
import { NoShipping } from './types';

export const noShippingMessage = (noShipping: NoShipping, courses: string[], countryCode: string): string | undefined => {
  if (noShipping === 'REQUIRED') {
    const tel = telephoneNumber(countryCode);
    return 'Due to international shipping restrictions, <strong>we do not ship</strong> kits or or bonus items' +
      'to your country. The cost of your course' + (courses.length > 1 ? 's have ' : ' has ') +
      'been reduced accordingly. You will have access to electronic course materials through the Online Student Center.' +
      (courses.some(c => isDesignCourse(c)) ? ' You will need to source your own design tools to complete your assignments. Please refer to your welcome email for more information.' : '') +
      (courses.some(c => isMakeupCourse(c)) ? ' You will have to source your own makeup and tools. Please refer to your course guide for the materials required for each assignment.' : '') +
      ` For more information please contact the School at <a style="color:inherit;white-space:nowrap;" href="tel:${tel}">${tel}.`;
  } else if (noShipping === 'APPLIED') {
    return 'You have selected to not receive physical kits or bonus items. ' +
      'The cost of your course' + (courses.length > 1 ? 's have ' : ' has ') +
      'been reduced accordingly. You will have access to electronic course materials through the Online Student Center.' +
      (courses.some(c => isDesignCourse(c)) ? ' You will need to source your own design tools to complete your assignments. Please refer to your welcome email for more information.' : '') +
      (courses.some(c => isMakeupCourse(c)) ? ' You will have to source your own makeup and tools. Please refer to your course guide for the materials required for each assignment.' : '');
  }
};
