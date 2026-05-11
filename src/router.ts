import type { Request } from 'express';
import express from 'express';
import * as yup from 'yup';

import * as HttpStatus from './lib/http-status';
import { objectMap } from './lib/objectMap';
import { prices } from './prices';
import type { PriceQuery, PriceResult, School } from './types';

// validate the parameters
const priceSchema: yup.ObjectSchema<PriceQuery> = yup.object({
  courses: yup.array(yup.string().required()).default([]),
  countryCode: yup.string().length(2).required(),
  provinceCode: yup.string().max(3),
  options: yup.object({
    noShipping: yup.boolean(),
    discountAll: yup.boolean(),
    discount: yup.object({ // keys must be in opposite order because yup reverses them
      NZD: yup.number(),
      AUD: yup.number(),
      GBP: yup.number(),
      USD: yup.number(),
      CAD: yup.number(),
      default: yup.number().required(),
    }).default(undefined),
    discountSignature: yup.string(),
    depositOverrides: yup.lazy(obj => yup.object(
      objectMap(obj, () => yup.number()),
    )),
    installmentsOverride: yup.number().min(1).max(24),
    studentDiscount: yup.boolean(),
    withoutTools: yup.boolean(),
    school: yup.string().oneOf<School>([ 'QC Career School', 'QC Makeup Academy', 'QC Design School', 'QC Event School', 'QC Pet Studies', 'QC Wellness Studies', 'Winghill Writing School', 'QC Pet Studies (EarthWise)', 'Paw Parent Academy' ]),
    promoCode: yup.string(),
    dateOverride: yup.date(),
  }),
}).required();

export const router = express.Router();

router.get('/', async (req, res) => {
  console.log(req.query);
  res.setHeader('Cache-Control', 'public, max-age=300'); // five minutes
  if (res.locals.apiVersion !== 2) {
    res.sendStatus(400);
  }
  res.send(await newPrices(req));
});

const newPrices = async (req: Request): Promise<PriceResult> => {
  let query: PriceQuery;
  try {
    query = await priceSchema.validate(req.query);
  } catch (err) {
    if (err instanceof yup.ValidationError) {
      throw new HttpStatus.BadRequest(err.message);
    }
    throw new HttpStatus.BadRequest('unknown error');
  }
  return await prices(query.courses, query.countryCode, query.provinceCode, query.options);
};
