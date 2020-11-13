// TODO: migrate from Joi to yup
import Joi from '@hapi/joi';
import express from 'express';
import * as HttpStatus from '@qccareerschool/http-status';

import { asyncWrapper } from './async-wrapper';
import { getPrices, PriceQuery } from './prices';
import { pool } from './pool';
import { oldGetPrices, OldPriceQuery } from './old-prices';
import { sendTuitionEmail, TuitionEmailBody } from './tuition-email';

// validate the parameters
const priceSchema = Joi.object<PriceQuery>({
  courses: Joi.array().default([]),
  countryCode: Joi.string().length(2).required(),
  provinceCode: Joi.string().max(3).allow(''),
  options: Joi.object({
    noShipping: Joi.boolean(),
    discountAll: Joi.boolean(),
    discount: Joi.object({
      default: Joi.number().required(),
      CAD: Joi.number(),
      USD: Joi.number(),
      GBP: Joi.number(),
      AUD: Joi.number(),
      NZD: Joi.number(),
    }),
    discountSignature: Joi.string(),
    MMFreeMW: Joi.boolean(),
    deluxeKit: Joi.boolean(),
    portfolio: Joi.boolean(),
    depositOverride: Joi.object().pattern(/./, Joi.number()),
    installmentsOverride: Joi.number().min(1).max(24),
    studentDiscount: Joi.boolean(),
    blackFriday2020: Joi.boolean(),
    school: Joi.string(),
  }).with('discount', 'discountSignature'),
});

const tuitionEmailSchema = (priceSchema as Joi.ObjectSchema<TuitionEmailBody>).keys({
  emailAddress: Joi.string().required(),
  school: Joi.string().required(),
});

const oldPriceSchema = Joi.object<OldPriceQuery>().keys({
  courses: Joi.array().default([]),
  countryCode: Joi.string().length(2).required(),
  provinceCode: Joi.string().max(3).allow(null).allow('').default(null),
  discountAll: Joi.number(), // the old way of calling this endpoint
  options: Joi.object().keys({
    discountAll: Joi.boolean(),
    discount: Joi.number().min(0),
    discountSignature: Joi.string(),
    MMFreeMW: Joi.boolean(),
    deluxeKit: Joi.boolean(),
    portfolio: Joi.boolean(),
    campaignId: Joi.string().allow(''),
    discountCode: Joi.string().allow(''),
    discountGBP: Joi.number().min(0),
    discountSignatureGBP: Joi.string(),
  }).with('discount', 'discountSignature').default({}),
  _: Joi.number(),
});

export const router = express.Router();

router.get('/', asyncWrapper(async (req, res) => {
  const connection = await (await pool).getConnection();
  try {
    let prices;
    if (res.locals.apiVersion === 2) {
      let query: PriceQuery;
      try {
        query = await priceSchema.validateAsync(req.query);
      } catch (err) {
        throw new HttpStatus.BadRequest(err.message);
      }
      prices = await getPrices(connection, query.courses, query.countryCode, query.provinceCode, query.options);
    } else if (res.locals.apiVersion === 1) {
      console.log('Old prices function called', req.headers.origin);
      let query: OldPriceQuery;
      try {
        query = await oldPriceSchema.validateAsync(req.query);
      } catch (err) {
        throw new HttpStatus.BadRequest(err.message);
      }
      prices = await oldGetPrices(connection, query.courses, query.countryCode, query.provinceCode, query.discountAll, query.options);
    }
    res.setHeader('Cache-Control', 'public, max-age=300'); // five minutes
    res.send(prices);
  } finally {
    connection.release();
  }
}));

router.post('/tuitionEmail', asyncWrapper(async (req, res) => {
  const connection = await (await pool).getConnection();
  try {
    let body: TuitionEmailBody;
    try {
      body = await tuitionEmailSchema.validateAsync(req.body);
    } catch (err) {
      throw new HttpStatus.BadRequest(err.message);
    }
    const prices = await getPrices(connection, body.courses, body.countryCode, body.provinceCode, body.options);
    await sendTuitionEmail(body.emailAddress, body.school, prices);
    res.end();
  } finally {
    connection.release();
  }
}));

