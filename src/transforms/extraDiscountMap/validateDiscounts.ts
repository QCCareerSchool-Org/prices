import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

import type { PriceOptions } from '../../domain/priceOptions';

const publicKey = fs.readFileSync(path.join(__dirname, '../../../public.pem'), 'utf8');

/**
 * Determines if the discount options are valid
 * @param options the options
 */
export const validateDiscounts = (options?: PriceOptions): boolean => {
  if (options?.discount && options.discountSignature) {
    const verify = crypto.createVerify('SHA256');
    verify.update(JSON.stringify(options.discount));
    if (!verify.verify(publicKey, Buffer.from(options.discountSignature, 'base64'))) {
      return false;
    }
  }
  return true;
};
