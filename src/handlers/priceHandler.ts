import type { Handler } from 'express';
import { failure, type Result, success } from 'generic-result-type';
import type { ParsedQs } from 'qs';
import * as yup from 'yup';

import { getPrices } from '../getPrices';
import type { PriceQuery } from '@/domain/priceQuery';
import type { School } from '@/domain/school';
import { objectMap } from '@/lib/objectMap';

export const priceHandler: Handler = async (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=300'); // five minutes

  const validationResult = await validate(req.query);
  if (!validationResult.success) {
    res.status(400).send(validationResult.error.message);
    return;
  }

  const priceQuery = validationResult.value;

  const price = await getPrices(priceQuery.courses ?? [], priceQuery.countryCode, priceQuery.provinceCode, priceQuery.options);

  res.send(price);
};

const validate = async (query: ParsedQs): Promise<Result<PriceQuery>> => {
  try {
    const priceQuery = await schema.validate(query);
    return success(priceQuery);
  } catch (err: unknown) {
    return failure(err instanceof Error ? err : Error(String(err)));
  }
};

const schema: yup.ObjectSchema<PriceQuery> = yup.object({
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
    depositOverrides: yup.lazy(obj => yup.object<Record<string, number>>(
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
