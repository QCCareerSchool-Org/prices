import * as HttpStatus from '@qccareerschool/http-status';
import * as yup from 'yup';
import express, { Request } from 'express';

import { asyncWrapper } from './lib/asyncWrapper';
import { getPrices, PriceQuery, PriceResult } from './prices';
import { pool } from './pool';
import { oldGetPrices, OldPriceQuery, OldPriceResult } from './old-prices';
import { objectMap } from './lib/objectMap';
import { logger } from './logger';

// validate the parameters
const priceSchema = yup.object<PriceQuery>({
  courses: yup.array(yup.string().required()).default([]).required(),
  countryCode: yup.string().length(2).required(),
  provinceCode: yup.string().max(3),
  options: yup.object({
    noShipping: yup.boolean(),
    discountAll: yup.boolean(),
    discount: yup.object({
      default: yup.number().required(),
      CAD: yup.number(),
      USD: yup.number(),
      GBP: yup.number(),
      AUD: yup.number(),
      NZD: yup.number(),
    }).default(undefined),
    discountSignature: yup.string(),
    MMFreeMW: yup.boolean(),
    deluxeKit: yup.boolean(),
    portfolio: yup.boolean(),
    depositOverride: yup.lazy(obj => yup.object(
      objectMap(obj, () => yup.number()),
    )),
    installmentsOverride: yup.number().min(1).max(24),
    studentDiscount: yup.boolean(),
    school: yup.string(),
  }),
});

const oldPriceSchema = yup.object<OldPriceQuery>({
  courses: yup.array(yup.string().required()).default([]).required(),
  countryCode: yup.string().length(2).required(),
  provinceCode: yup.string().max(3).nullable(true).default(null).required(),
  discountAll: yup.number(), // the old way of calling this endpoint
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
});

export const router = express.Router();

router.get('/', asyncWrapper(async (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=300'); // five minutes
  res.send(res.locals.apiVersion === 2 ? await newPrices(req) : await oldPrices(req));
}));

const newPrices = async (req: Request): Promise<PriceResult> => {
  const connection = await (await pool).getConnection();
  try {
    let query: PriceQuery | undefined;
    try {
      query = await priceSchema.validate(req.query);
    } catch (err) {
      throw new HttpStatus.BadRequest(err.message);
    }
    if (typeof query === 'undefined') {
      throw new HttpStatus.InternalServerError('Could not cast querystring');
    }
    return getPrices(connection, query.courses, query.countryCode, query.provinceCode, query.options);
  } finally {
    connection.release();
  }
}

const oldPrices = async (req: Request): Promise<OldPriceResult> => {
  logger.warn('Old prices function called', req.headers.origin);
  const connection = await (await pool).getConnection();
  try {
    let query: OldPriceQuery | undefined;
    try {
      query = await oldPriceSchema.validate(req.query);
    } catch (err) {
      throw new HttpStatus.BadRequest(err.message);
    }
    if (typeof query === 'undefined') {
      throw new HttpStatus.InternalServerError('Could not cast querystring');
    }
    return oldGetPrices(connection, query.courses, query.countryCode, query.provinceCode, query.discountAll, query.options);
  } finally {
    connection.release();
  }
}