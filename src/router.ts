import * as HttpStatus from '@qccareerschool/http-status';
import express, { Request } from 'express';
import * as yup from 'yup';

import { asyncWrapper } from './lib/asyncWrapper';
import { objectMap } from './lib/objectMap';
import { logger } from './logger';
import { oldGetPrices, OldPriceQuery, OldPriceResult } from './oldPrices';
import { pool } from './pool';
import { prices } from './prices';
import { PriceQuery, PriceQueryOptions, PriceResult, School } from './types';

// validate the parameters
const priceSchema = yup.object<PriceQuery>({
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
    school: yup.string<School>().oneOf([ 'QC Career School', 'QC Makeup Academy', 'QC Design School', 'QC Event School', 'QC Pet Studies', 'QC Wellness Studies', 'Winghill Writing School' ]),
    promoCode: yup.string(),
    dateOverride: yup.date(),
  }),
}).required();

const oldPriceSchema = yup.object<OldPriceQuery>({ // the old way of calling this endpoint
  courses: yup.array(yup.string().required()).default([]),
  countryCode: yup.string().length(2).required(),
  provinceCode: yup.string().max(3).nullable(true).default(null).required(),
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
    return await oldGetPrices(connection, query.courses, query.countryCode, query.provinceCode, query.discountAll, query.options);
  } finally {
    connection.release();
  }
};
