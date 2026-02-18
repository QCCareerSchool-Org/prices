import type { Request } from 'express';
import express from 'express';
import * as yup from 'yup';

import { asyncWrapper } from './lib/asyncWrapper';
import * as HttpStatus from './lib/http-status';
import { objectMap } from './lib/objectMap';
import { logger } from './logger';
import type { OldPriceQuery, OldPriceResult } from './oldPrices';
import { oldGetPrices } from './oldPrices';
import { pool } from './pool';
import { prices } from './prices';
import type { PriceQuery, PriceQueryOptions, PriceResult, School } from './types';

// validate the parameters
const priceSchema: yup.ObjectSchema<PriceQuery> = yup.object({
  courses: yup.array(yup.string().required()).default([]),
  countryCode: yup.string().length(2).required(),
  provinceCode: yup.string().max(3),
  options: yup.object<PriceQueryOptions>({
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
    school: yup.string().oneOf<School>([ 'QC Career School', 'QC Makeup Academy', 'QC Design School', 'QC Event School', 'QC Pet Studies', 'QC Wellness Studies', 'Winghill Writing School', 'QC Pet Studies (EarthWise)' ]),
    promoCode: yup.string(),
    dateOverride: yup.date(),
  }),
}).required();

const oldPriceSchema: yup.ObjectSchema<OldPriceQuery> = yup.object({
  courses: yup.array(yup.string().required()).default(() => ([])).defined(),
  countryCode: yup.string().length(2).required(),
  provinceCode: yup.string().max(3).nullable().default(null).required(),
  discountAll: yup.number(),
  options: yup.object({
    discountAll: yup.boolean(),
    discount: yup.number().min(0),
    discountSignature: yup.string(),
    MMFreeMW: yup.boolean(),
    deluxeKit: yup.boolean(),
    portfolio: yup.boolean(),
    campaignId: yup.string(),
    discountCode: yup.string(),
    discountGBP: yup.number().min(0),
    discountSignatureGBP: yup.string(),
  }),
  _: yup.number(),
}).required();

export const router = express.Router();

router.get('/', asyncWrapper(async (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=300'); // five minutes
  res.send(res.locals.apiVersion === 2 ? await newPrices(req) : await oldPrices(req));
}));

const newPrices = async (req: Request): Promise<PriceResult> => {
  const connection = await (await pool).getConnection();
  try {
    let query: PriceQuery;
    try {
      query = await priceSchema.validate(req.query);
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        throw new HttpStatus.BadRequest(err.message);
      }
      throw new HttpStatus.BadRequest('unknown error');
    }
    return await prices(connection, query.courses, query.countryCode, query.provinceCode, query.options);
  } finally {
    connection.release();
  }
};

const oldPrices = async (req: Request): Promise<OldPriceResult> => {
  logger.warn('Old prices function called', req.headers.origin);
  const connection = await (await pool).getConnection();
  try {
    let query: OldPriceQuery;
    try {
      query = await oldPriceSchema.validate(req.query);
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        throw new HttpStatus.BadRequest(err.message);
      }
      throw new HttpStatus.BadRequest('unknown error');
    }
    return await oldGetPrices(connection, query.courses, query.countryCode, query.provinceCode, query.discountAll ?? 0, query.options);
  } finally {
    connection.release();
  }
};
